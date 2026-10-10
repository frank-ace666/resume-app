export {}

declare global {
  /** 由 electron.vite.config.ts 的 define 注入，值来自 package.json */
  const __APP_VERSION__: string

  interface Window {
    electronAPI: {
      saveFile: (data: string) => Promise<{ success: boolean; filePath?: string }>
      openFile: () => Promise<{ success: boolean; data?: string; filePath?: string }>
      exportPDFDialog: () => Promise<{ success: boolean; filePath?: string }>
      writePDF: (filePath: string, buffer: ArrayBuffer) => Promise<{ success: boolean }>
      openExternal: (url: string) => Promise<{ success: boolean; error?: string }>
    }
  }
}
