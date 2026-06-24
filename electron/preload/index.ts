import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  saveFile: (data: string) => Promise<{ success: boolean; filePath?: string }>
  openFile: () => Promise<{ success: boolean; data?: string; filePath?: string }>
  exportPDFDialog: () => Promise<{ success: boolean; filePath?: string }>
  writePDF: (filePath: string, buffer: ArrayBuffer) => Promise<{ success: boolean }>
}

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (data: string) => ipcRenderer.invoke('save-file', data),
  openFile: () => ipcRenderer.invoke('open-file'),
  exportPDFDialog: () => ipcRenderer.invoke('export-pdf-dialog'),
  writePDF: (filePath: string, buffer: ArrayBuffer) =>
    ipcRenderer.invoke('write-pdf', filePath, buffer)
} as ElectronAPI)
