import { useEffect } from 'react'
import Button from './Button'
import { IconAlert } from './Icons'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Material 确认对话框，替代 window.confirm */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '确定',
  cancelLabel = '取消',
  danger = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="anim-pop-in w-full max-w-sm rounded-xl bg-surface p-6 shadow-e4"
      >
        <div className="flex items-start gap-3">
          {danger && (
            <span className="mt-0.5 shrink-0 text-danger">
              <IconAlert size={22} />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-base font-medium text-ink">{title}</h2>
            {description && <p className="mt-2 text-sm leading-relaxed text-ink-2">{description}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="text" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant="filled"
            onClick={onConfirm}
            className={danger ? 'bg-danger hover:bg-[#b3261e] active:bg-[#b3261e]' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
