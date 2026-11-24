import type { StateStorage } from 'zustand/middleware'
import { toast } from './toastStore'

/**
 * Zustand persist 的加密文件存储适配器。
 *
 * - 主数据由主进程用 safeStorage 加密后写入 userData/resume-data.enc；
 * - 渲染进程只负责把持久化 JSON 字符串交给 IPC，不直接写盘；
 * - 写入做 300ms 防抖，避免每次按键都触发加密 + 文件 I/O；
 * - 窗口关闭时用 sendSync 做一次同步兜底，尽量不丢最后一小段输入；
 * - 旧版 localStorage 里的明文数据在第一次加载时迁移并删除。
 */

const LEGACY_KEY = 'resume-craft-data'
const SAVE_DEBOUNCE_MS = 300

let pending: string | null = null
let timer: ReturnType<typeof setTimeout> | null = null
let inFlight: Promise<void> = Promise.resolve()
/**
 * Zustand persist 的 hydrate 会 catch 掉 storage.getItem 抛出的错误并继续
 * 标记为已水合，所以 BootGate 不能只看 rehydrate 的 Promise。
 * 这里把读取错误单独记下来，由 BootGate 在水合后消费并展示错误页。
 */
let loadError: Error | null = null

function secureApi() {
  return window.electronAPI?.secureStore ?? null
}

function recordLoadError(error: unknown): Error {
  const err = error instanceof Error ? error : new Error(String(error))
  loadError = err
  return err
}

/** 水合完成后取走一次读取错误；有值说明不能进入编辑器 */
export function consumeSecureStorageError(): Error | null {
  const error = loadError
  loadError = null
  return error
}

function assertJson(value: string, message: string): void {
  try {
    JSON.parse(value)
  } catch {
    throw recordLoadError(new Error(message))
  }
}

async function flush(): Promise<void> {
  if (pending === null) return
  const value = pending
  pending = null

  const api = secureApi()
  if (!api) {
    localStorage.setItem(LEGACY_KEY, value)
    return
  }

  inFlight = inFlight
    .then(async () => {
      const result = await api.save(value)
      if (!result.success) {
        toast.error(`自动保存失败：${result.error ?? '未知错误'}`)
      }
    })
    .catch((e) => {
      toast.error(`自动保存失败：${e instanceof Error ? e.message : String(e)}`)
    })

  await inFlight
}

/** 手动等待待写入数据落盘（清除 / 恢复备份前调用） */
export async function flushSecureStore(): Promise<void> {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
  await flush()
  await inFlight
}

/** 放弃尚未写入的内容（正常关闭走 flushSync，不应调用这个） */
export function cancelPendingSave(): void {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
  pending = null
}

function flushSync(): void {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
  if (pending === null) return
  const value = pending
  pending = null

  const api = secureApi()
  if (!api) {
    localStorage.setItem(LEGACY_KEY, value)
    return
  }
  const result = api.saveSync(value)
  if (!result.success) {
    // beforeunload 中无法再稳定地弹 UI，只能记录
    console.error('[secure-storage] 同步保存失败', result.error)
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushSync)
}

export const secureStateStorage: StateStorage = {
  getItem: async () => {
    const api = secureApi()
    if (!api) return localStorage.getItem(LEGACY_KEY)

    const loaded = await api.load()
    if (!loaded.success) {
      throw recordLoadError(loaded.error || '无法读取本机数据')
    }

    if (loaded.data) {
      assertJson(loaded.data, '本机数据格式损坏，无法读取')
      // 加密文件是权威来源；旧版明文键如果还在，清掉
      localStorage.removeItem(LEGACY_KEY)
      return loaded.data
    }

    // 首次升级：把旧版 localStorage 明文迁移到加密文件
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      assertJson(legacy, '旧版本地数据格式损坏，未执行迁移')
      const migrated = await api.migrate(legacy)
      if (!migrated.success) {
        throw recordLoadError(migrated.error || '旧数据迁移失败')
      }
      localStorage.removeItem(LEGACY_KEY)
      return legacy
    }

    return null
  },

  setItem: (_name, value) => {
    const api = secureApi()
    if (!api) {
      localStorage.setItem(LEGACY_KEY, value)
      return
    }

    pending = value
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      void flush()
    }, SAVE_DEBOUNCE_MS)
  },

  removeItem: async () => {
    cancelPendingSave()
    const api = secureApi()
    if (api) {
      const result = await api.clear()
      if (!result.success) throw new Error(result.error || '清除本机数据失败')
    }
    localStorage.removeItem(LEGACY_KEY)
  }
}
