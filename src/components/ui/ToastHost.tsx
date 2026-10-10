import { useEffect } from 'react'
import { useToastStore, type Toast } from '@/store/toastStore'
import { IconAlert, IconCheckCircle, IconInfo, IconX } from './Icons'

const TONE_STYLE = {
  info: { bg: 'bg-ink', icon: <IconInfo size={18} /> },
  success: { bg: 'bg-[#1e8e3e]', icon: <IconCheckCircle size={18} /> },
  error: { bg: 'bg-danger', icon: <IconAlert size={18} /> }
} as const

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss)
  const style = TONE_STYLE[toast.tone]

  useEffect(() => {
    if (toast.duration <= 0) return
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration)
    return () => window.clearTimeout(timer)
  }, [toast.id, toast.duration, dismiss])

  return (
    <div
      role="status"
      className={`anim-pop-in pointer-events-auto flex items-center gap-3 rounded-sm px-4 py-3 text-sm text-white shadow-e3 ${style.bg}`}
    >
      <span className="shrink-0 opacity-90">{style.icon}</span>
      <span className="flex-1 leading-snug">{toast.message}</span>
      {toast.actionLabel && (
        <button
          onClick={() => {
            toast.onAction?.()
            dismiss(toast.id)
          }}
          className="shrink-0 rounded-xs px-2 py-1 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/15"
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        onClick={() => dismiss(toast.id)}
        aria-label="关闭提示"
        className="shrink-0 rounded-full p-1 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
      >
        <IconX size={14} />
      </button>
    </div>
  )
}

/** Gmail 式底部 snackbar 队列 */
export default function ToastHost() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
