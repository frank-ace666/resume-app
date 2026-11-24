import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { registerSecureStoreIpc } from './secureStore'

/**
 * 固定打包后的 userData 路径。
 *
 * 当前实际路径是 %APPDATA%\resume-app。显式固定它，避免未来改
 * productName / name 后 Electron 换到新目录，让用户看起来像“数据丢了”。
 * 必须在 requestSingleInstanceLock 之前设置，锁与数据才指向同一目录。
 */
if (app.isPackaged) {
  app.setPath('userData', join(app.getPath('appData'), 'resume-app'))
}

let mainWindow: BrowserWindow | null = null

/**
 * 单实例锁。
 *
 * 不加的话，双击两次快捷方式会开出两个窗口，而它们**共享同一份 localStorage** ——
 * 简历数据存在那里，两个实例各自持有内存副本、又都往同一处写，
 * 后写的会覆盖先写的，用户会莫名其妙丢掉刚填的内容。
 *
 * （实测两个实例同时启动还会争抢同一个磁盘缓存目录，日志里刷
 *  `Unable to move the cache: 拒绝访问`。）
 *
 * 拿不到锁说明已有实例在跑：直接退出，并把已有窗口唤到前台。
 */
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  })
}

// 简历数据的加密文件存储、备份、清除与恢复
registerSecureStoreIpc()

/**
 * 允许通过系统默认程序打开的外链协议白名单。
 *
 * 必须白名单：`shell.openExternal` 若接受任意协议，是一个已知的
 * 命令执行面（例如 `file:` / 自定义协议可能被注册的程序当作参数执行）。
 */
const ALLOWED_PROTOCOLS = ['mailto:', 'https:', 'http:']

function openExternalSafely(rawUrl: string): { success: boolean; error?: string } {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { success: false, error: '无效的链接' }
  }
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return { success: false, error: `不允许打开 ${parsed.protocol} 链接` }
  }
  void shell.openExternal(rawUrl)
  return { success: true }
}

function createWindow(): void {
  // 仅用于自动化测试：不显示窗口、不占任务栏，避免在开发者桌面上弹出第二个实例。
  // 用法：RESUME_TEST_HIDDEN=1 npx electron . --remote-debugging-port=...
  const isTestHidden = process.env.RESUME_TEST_HIDDEN === '1'

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    // 分栏最小值（见 src/store/uiStore.ts）：导航 248 + 编辑区 360 + 分隔条 1 + 预览区 380 ≈ 989。
    // 留出余量取 1100，避免窗口缩到 1024 时编辑区/预览区被压到不可用。
    minWidth: 1100,
    minHeight: 700,
    title: '简历工坊 - Resume Craft',
    show: !isTestHidden,
    skipTaskbar: isTestHidden,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: !isTestHidden
    }
  })

  // 开发模式加载 dev server，生产模式加载打包文件
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 站内不应发生任何导航。若渲染进程里出现 <a href> 或 window.open，
  // 一律拦下并改由系统默认程序打开 —— 否则 mailto: 会让整个应用变成白屏。
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternalSafely(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow?.webContents.getURL()) {
      event.preventDefault()
      openExternalSafely(url)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.handle('open-external', (_event, url: string) => openExternalSafely(url))

// ====== IPC 处理：文件保存/打开 ======

ipcMain.handle('save-file', async (_event, data: string) => {
  if (!mainWindow) return { success: false }
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '保存简历',
    defaultPath: '我的简历.json',
    filters: [
      { name: '简历文件', extensions: ['json'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  })
  if (!result.canceled && result.filePath) {
    await writeFile(result.filePath, data, 'utf-8')
    return { success: true, filePath: result.filePath }
  }
  return { success: false }
})

ipcMain.handle('open-file', async () => {
  if (!mainWindow) return { success: false }
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '打开简历',
    filters: [
      { name: '简历文件', extensions: ['json'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    properties: ['openFile']
  })
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0]
    const data = await readFile(filePath, 'utf-8')
    return { success: true, data, filePath }
  }
  return { success: false }
})

ipcMain.handle('export-pdf-dialog', async () => {
  if (!mainWindow) return { success: false }
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '导出 PDF',
    defaultPath: '我的简历.pdf',
    filters: [
      { name: 'PDF 文件', extensions: ['pdf'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  })
  if (!result.canceled && result.filePath) {
    return { success: true, filePath: result.filePath }
  }
  return { success: false }
})

ipcMain.handle('write-pdf', async (_event, filePath: string, buffer: ArrayBuffer) => {
  try {
    await writeFile(filePath, Buffer.from(buffer))
    return { success: true }
  } catch {
    return { success: false }
  }
})

// ====== 应用生命周期 ======

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
