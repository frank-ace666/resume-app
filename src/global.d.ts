export {}

declare global {
  interface Window {
    electronAPI: {
      saveFile: (data: string) => Promise<{ success: boolean; filePath?: string }>
      openFile: () => Promise<{ success: boolean; data?: string; filePath?: string }>
      exportPDFDialog: () => Promise<{ success: boolean; filePath?: string }>
      writePDF: (filePath: string, buffer: ArrayBuffer) => Promise<{ success: boolean }>
    }
  }
}
