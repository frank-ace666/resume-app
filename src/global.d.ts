export {}

declare global {
  /** 由 electron.vite.config.ts 的 define 注入，值来自 package.json */
  const __APP_VERSION__: string

  interface SecureLoadResult {
    success: boolean
    data?: string | null
    encrypted?: boolean
    error?: string
  }

  interface SecureResult {
    success: boolean
    error?: string
  }

  interface SecureInfo {
    userDataPath: string
    encryptionAvailable: boolean
    storage: 'encrypted' | 'plaintext' | 'none'
    backupCount: number
    backupDir: string
  }

  interface Window {
    electronAPI: {
      saveFile: (data: string) => Promise<{ success: boolean; filePath?: string }>
      openFile: () => Promise<{ success: boolean; data?: string; filePath?: string }>
      exportPDFDialog: () => Promise<{ success: boolean; filePath?: string }>
      writePDF: (filePath: string, buffer: ArrayBuffer) => Promise<{ success: boolean }>
      openExternal: (url: string) => Promise<{ success: boolean; error?: string }>
      secureStore: {
        load: () => Promise<SecureLoadResult>
        save: (value: string) => Promise<SecureResult>
        saveSync: (value: string) => SecureResult
        migrate: (value: string) => Promise<SecureResult>
        clear: () => Promise<SecureResult>
        restoreLatest: () => Promise<SecureResult>
        info: () => Promise<SecureInfo>
      }
      openUserDataFolder: () => Promise<SecureResult>
    }
  }
}
