import { app, ipcMain, safeStorage, session, shell } from 'electron'
import { join } from 'path'
import { promises as fsp } from 'fs'
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'fs'

/**
 * 本机简历数据的加密存储。
 *
 * 设计目标：
 * - 简历是敏感个人信息，不再以明文存放在 Chromium localStorage；
 * - 使用 Electron safeStorage（Windows 上为 DPAPI），只有当前 Windows 账号能解密；
 * - 主文件写入前保留最近 5 份加密备份，迁移旧 localStorage 时额外留一份 legacy 备份；
 * - 支持用户主动清空本机数据、恢复最近备份。
 *
 * 文件布局（userData 目录内）：
 * - resume-data.enc      主数据（safeStorage 加密；系统不支持加密时退化为 resume-data.json）
 * - backups/*.enc        自动备份 / legacy 备份 / pre-restore 备份
 *
 * 渲染进程只通过 IPC 收发明文 JSON 字符串；加密与文件 I/O 全部在主进程完成。
 */

const PRIMARY_ENC = 'resume-data.enc'
const PRIMARY_PLAIN = 'resume-data.json'
const BACKUP_DIR = 'backups'
const MAX_BACKUPS = 5
const MAX_PAYLOAD = 50 * 1024 * 1024

export interface SecureLoadResult {
  success: boolean
  data?: string | null
  encrypted?: boolean
  error?: string
}

export interface SecureResult {
  success: boolean
  error?: string
}

export interface SecureInfo {
  userDataPath: string
  encryptionAvailable: boolean
  storage: 'encrypted' | 'plaintext' | 'none'
  backupCount: number
  backupDir: string
}

const userDataDir = () => app.getPath('userData')
const primaryEncPath = () => join(userDataDir(), PRIMARY_ENC)
const primaryPlainPath = () => join(userDataDir(), PRIMARY_PLAIN)
const backupDirPath = () => join(userDataDir(), BACKUP_DIR)

function encryptionAvailable(): boolean {
  try {
    return safeStorage.isEncryptionAvailable()
  } catch {
    return false
  }
}

function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

function isValidPayload(value: unknown): value is string {
  return typeof value === 'string' && value.length <= MAX_PAYLOAD
}

async function ensureDirs(): Promise<void> {
  await fsp.mkdir(userDataDir(), { recursive: true })
  await fsp.mkdir(backupDirPath(), { recursive: true })
}

function ensureDirsSync(): void {
  mkdirSync(userDataDir(), { recursive: true })
  mkdirSync(backupDirPath(), { recursive: true })
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await fsp.access(path)
    return true
  } catch {
    return false
  }
}

async function atomicWrite(path: string, data: Buffer | string): Promise<void> {
  const tmp = `${path}.tmp`
  await fsp.writeFile(tmp, data)
  try {
    await fsp.rename(tmp, path)
  } catch {
    // Windows 上目标文件被短暂占用时 rename 可能失败；先删再改名。
    await fsp.rm(path, { force: true })
    await fsp.rename(tmp, path)
  }
}

function atomicWriteSync(path: string, data: Buffer | string): void {
  const tmp = `${path}.tmp`
  writeFileSync(tmp, data)
  try {
    renameSync(tmp, path)
  } catch {
    rmSync(path, { force: true })
    renameSync(tmp, path)
  }
}

interface BackupFile {
  path: string
  name: string
  mtime: number
}

async function listBackups(): Promise<BackupFile[]> {
  await fsp.mkdir(backupDirPath(), { recursive: true })
  const entries = await fsp.readdir(backupDirPath(), { withFileTypes: true })
  const files = await Promise.all(
    entries
      .filter((e) => e.isFile() && /\.(enc|json)$/.test(e.name))
      .map(async (e) => {
        const path = join(backupDirPath(), e.name)
        const stat = await fsp.stat(path)
        return { path, name: e.name, mtime: stat.mtimeMs }
      })
  )
  return files.sort((a, b) => b.mtime - a.mtime)
}

async function pruneBackups(): Promise<void> {
  const files = await listBackups()
  await Promise.all(files.slice(MAX_BACKUPS).map((f) => fsp.rm(f.path, { force: true })))
}

async function copyPrimaryToBackup(prefix: string): Promise<boolean> {
  if (await fileExists(primaryEncPath())) {
    await fsp.copyFile(primaryEncPath(), join(backupDirPath(), `${prefix}-${stamp()}.enc`))
    return true
  }
  if (await fileExists(primaryPlainPath())) {
    await fsp.copyFile(primaryPlainPath(), join(backupDirPath(), `${prefix}-${stamp()}.json`))
    return true
  }
  return false
}

async function writePrimary(value: string): Promise<void> {
  await ensureDirs()
  if (encryptionAvailable()) {
    await atomicWrite(primaryEncPath(), safeStorage.encryptString(value))
    await fsp.rm(primaryPlainPath(), { force: true })
    return
  }
  // 已经存在加密文件时绝不静默改写成明文；宁可报错让用户看到提示。
  if (await fileExists(primaryEncPath())) {
    throw new Error('系统加密不可用，无法覆写已有加密数据。请使用同一 Windows 账号或恢复备份。')
  }
  await atomicWrite(primaryPlainPath(), Buffer.from(value, 'utf8'))
}

function writePrimarySync(value: string): void {
  ensureDirsSync()
  if (encryptionAvailable()) {
    atomicWriteSync(primaryEncPath(), safeStorage.encryptString(value))
    try {
      rmSync(primaryPlainPath(), { force: true })
    } catch {
      // 明文回退文件删不掉不影响加密主文件
    }
    return
  }
  if (existsSync(primaryEncPath())) {
    throw new Error('系统加密不可用，无法覆写已有加密数据。请使用同一 Windows 账号或恢复备份。')
  }
  atomicWriteSync(primaryPlainPath(), Buffer.from(value, 'utf8'))
}

let backedUpThisSession = false

/** 每次启动第一次读到主文件时，留一份“上次会话”的加密备份 */
async function backupOnce(): Promise<void> {
  if (backedUpThisSession) return
  const copied = await copyPrimaryToBackup('resume')
  if (copied) {
    backedUpThisSession = true
    await pruneBackups()
  }
}

async function load(): Promise<SecureLoadResult> {
  await ensureDirs()
  try {
    if (await fileExists(primaryEncPath())) {
      if (!encryptionAvailable()) {
        return {
          success: false,
          error: '系统加密不可用，无法读取已有加密数据。请使用同一 Windows 账号，或从备份恢复。'
        }
      }
      try {
        const data = safeStorage.decryptString(await fsp.readFile(primaryEncPath()))
        await backupOnce()
        return { success: true, data, encrypted: true }
      } catch {
        return {
          success: false,
          error: '无法解密本机数据：可能使用了不同的 Windows 账号，或数据文件已损坏。'
        }
      }
    }

    if (await fileExists(primaryPlainPath())) {
      const data = await fsp.readFile(primaryPlainPath(), 'utf8')
      await backupOnce()
      return { success: true, data, encrypted: false }
    }

    return { success: true, data: null, encrypted: false }
  } catch (e) {
    return { success: false, error: `无法读取本机数据：${errorMessage(e)}` }
  }
}

async function save(value: unknown): Promise<SecureResult> {
  if (!isValidPayload(value)) return { success: false, error: '数据格式无效或过大' }
  try {
    await backupOnce()
    await writePrimary(value)
    return { success: true }
  } catch (e) {
    return { success: false, error: `保存失败：${errorMessage(e)}` }
  }
}

function saveSync(value: unknown): SecureResult {
  if (!isValidPayload(value)) return { success: false, error: '数据格式无效或过大' }
  try {
    writePrimarySync(value)
    return { success: true }
  } catch (e) {
    return { success: false, error: `保存失败：${errorMessage(e)}` }
  }
}

/** 首次从旧版 localStorage 迁移：先留一份 legacy 备份，再写加密主文件 */
async function migrate(value: unknown): Promise<SecureResult> {
  if (!isValidPayload(value)) return { success: false, error: '数据格式无效或过大' }
  try {
    await ensureDirs()
    if ((await fileExists(primaryEncPath())) || (await fileExists(primaryPlainPath()))) {
      return { success: false, error: '已经存在本机数据，拒绝用旧数据覆盖' }
    }

    const available = encryptionAvailable()
    const backupName = `legacy-${stamp()}.${available ? 'enc' : 'json'}`
    if (available) {
      await fsp.writeFile(join(backupDirPath(), backupName), safeStorage.encryptString(value))
    } else {
      await fsp.writeFile(join(backupDirPath(), backupName), value, 'utf8')
    }
    await pruneBackups()
    await writePrimary(value)
    return { success: true }
  } catch (e) {
    return { success: false, error: `迁移旧数据失败：${errorMessage(e)}` }
  }
}

async function clear(): Promise<SecureResult> {
  try {
    await fsp.rm(primaryEncPath(), { force: true })
    await fsp.rm(primaryPlainPath(), { force: true })
    await fsp.rm(backupDirPath(), { recursive: true, force: true })
    backedUpThisSession = false
    // 一并清掉旧版 localStorage（可能残留明文简历和布局设置）
    try {
      await session.defaultSession.clearStorageData({ storages: ['localstorage'] })
    } catch {
      // 清除失败不阻塞主数据删除；渲染进程还会 removeItem 一次
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: `清除本机数据失败：${errorMessage(e)}` }
  }
}

async function restoreLatest(): Promise<SecureResult> {
  try {
    await ensureDirs()
    const backups = await listBackups()
    if (backups.length === 0) return { success: false, error: '没有可恢复的备份' }

    const latest = backups[0]
    let data: string
    if (latest.name.endsWith('.enc')) {
      if (!encryptionAvailable()) {
        return { success: false, error: '系统加密不可用，无法解密备份' }
      }
      try {
        data = safeStorage.decryptString(await fsp.readFile(latest.path))
      } catch {
        return {
          success: false,
          error: '无法解密备份：可能来自不同的 Windows 账号，或备份文件已损坏。'
        }
      }
    } else {
      data = await fsp.readFile(latest.path, 'utf8')
    }

    // 先备份当前状态，再覆盖；这样恢复错了还能找回当前数据
    await copyPrimaryToBackup('pre-restore')
    await writePrimary(data)
    await pruneBackups()
    return { success: true }
  } catch (e) {
    return { success: false, error: `恢复备份失败：${errorMessage(e)}` }
  }
}

async function info(): Promise<SecureInfo> {
  const encrypted = await fileExists(primaryEncPath())
  const plaintext = await fileExists(primaryPlainPath())
  const backups = await listBackups().catch(() => [])
  return {
    userDataPath: userDataDir(),
    encryptionAvailable: encryptionAvailable(),
    storage: encrypted ? 'encrypted' : plaintext ? 'plaintext' : 'none',
    backupCount: backups.length,
    backupDir: backupDirPath()
  }
}

let registered = false

export function registerSecureStoreIpc(): void {
  if (registered) return
  registered = true

  ipcMain.handle('secure-store-load', () => load())
  ipcMain.handle('secure-store-save', (_event, value: unknown) => save(value))
  ipcMain.on('secure-store-save-sync', (event, value: unknown) => {
    event.returnValue = saveSync(value)
  })
  ipcMain.handle('secure-store-migrate', (_event, value: unknown) => migrate(value))
  ipcMain.handle('secure-store-clear', () => clear())
  ipcMain.handle('secure-store-restore-latest', () => restoreLatest())
  ipcMain.handle('secure-store-info', () => info())
  ipcMain.handle('open-user-data-folder', async () => {
    const error = await shell.openPath(userDataDir())
    return error ? { success: false, error } : { success: true }
  })
}
