import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'

let mainWindow: BrowserWindow | null = null

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
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: '简历工坊 - Resume Craft',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
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
