import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  saveFile: (data: string) => Promise<{ success: boolean; filePath?: string }>
  openFile: () => Promise<{ success: boolean; data?: string; filePath?: string }>
  exportPDFDialog: () => Promise<{ success: boolean; filePath?: string }>
  writePDF: (filePath: string, buffer: ArrayBuffer) => Promise<{ success: boolean }>
  /** 用系统默认程序打开外链（mailto: / https:）。协议白名单在主进程校验。 */
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>
}

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (data: string) => ipcRenderer.invoke('save-file', data),
  openFile: () => ipcRenderer.invoke('open-file'),
  exportPDFDialog: () => ipcRenderer.invoke('export-pdf-dialog'),
  writePDF: (filePath: string, buffer: ArrayBuffer) =>
    ipcRenderer.invoke('write-pdf', filePath, buffer),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url)
} as ElectronAPI)
