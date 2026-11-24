import { contextBridge, ipcRenderer } from 'electron'

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

export interface ElectronAPI {
  saveFile: (data: string) => Promise<{ success: boolean; filePath?: string }>
  openFile: () => Promise<{ success: boolean; data?: string; filePath?: string }>
  exportPDFDialog: () => Promise<{ success: boolean; filePath?: string }>
  writePDF: (filePath: string, buffer: ArrayBuffer) => Promise<{ success: boolean }>
  /** 用系统默认程序打开外链（mailto: / https:）。协议白名单在主进程校验。 */
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>
  /** 加密的简历数据存储（safeStorage + userData 文件） */
  secureStore: {
    load: () => Promise<SecureLoadResult>
    save: (value: string) => Promise<SecureResult>
    /** 窗口关闭时的同步兜底写入 */
    saveSync: (value: string) => SecureResult
    migrate: (value: string) => Promise<SecureResult>
    clear: () => Promise<SecureResult>
    restoreLatest: () => Promise<SecureResult>
    info: () => Promise<SecureInfo>
  }
  openUserDataFolder: () => Promise<SecureResult>
}

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (data: string) => ipcRenderer.invoke('save-file', data),
  openFile: () => ipcRenderer.invoke('open-file'),
  exportPDFDialog: () => ipcRenderer.invoke('export-pdf-dialog'),
  writePDF: (filePath: string, buffer: ArrayBuffer) =>
    ipcRenderer.invoke('write-pdf', filePath, buffer),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  secureStore: {
    load: () => ipcRenderer.invoke('secure-store-load'),
    save: (value: string) => ipcRenderer.invoke('secure-store-save', value),
    saveSync: (value: string) => ipcRenderer.sendSync('secure-store-save-sync', value),
    migrate: (value: string) => ipcRenderer.invoke('secure-store-migrate', value),
    clear: () => ipcRenderer.invoke('secure-store-clear'),
    restoreLatest: () => ipcRenderer.invoke('secure-store-restore-latest'),
    info: () => ipcRenderer.invoke('secure-store-info')
  },
  openUserDataFolder: () => ipcRenderer.invoke('open-user-data-folder')
} as ElectronAPI)
