import { create } from 'zustand'

export type ToastTone = 'info' | 'success' | 'error'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
  /** 可选的操作按钮（如「撤销」） */
  actionLabel?: string
  onAction?: () => void
  duration: number
}

interface ToastStore {
  toasts: Toast[]
  push: (message: string, opts?: Partial<Omit<Toast, 'id' | 'message'>>) => string
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastStore>()((set) => ({
  toasts: [],

  push: (message, opts = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const toast: Toast = {
      id,
      message,
      tone: opts.tone ?? 'info',
      actionLabel: opts.actionLabel,
      onAction: opts.onAction,
      duration: opts.duration ?? 3200
    }
    set((s) => ({ toasts: [...s.toasts, toast] }))
    return id
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}))

/** 便捷调用：在组件外也能弹提示 */
export const toast = {
  info: (msg: string, opts?: Partial<Omit<Toast, 'id' | 'message'>>) =>
    useToastStore.getState().push(msg, { ...opts, tone: 'info' }),
  success: (msg: string, opts?: Partial<Omit<Toast, 'id' | 'message'>>) =>
    useToastStore.getState().push(msg, { ...opts, tone: 'success' }),
  error: (msg: string, opts?: Partial<Omit<Toast, 'id' | 'message'>>) =>
    useToastStore.getState().push(msg, { ...opts, tone: 'error' })
}
