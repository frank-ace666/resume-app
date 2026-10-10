import { useEffect } from 'react'
import Button from './Button'
import { IconAlert } from './Icons'
import { useUIStore, FORM_STEPS } from '@/store/uiStore'
import type { ResumeValidationIssue } from '@/utils/validators'

interface Props {
  issues: ResumeValidationIssue[]
  onClose: () => void
  onExportAnyway: () => void
}

const MAX_SHOWN = 5

/**
 * 导出前的校验闸门。
 *
 * 为什么用对话框而不是 toast：导出被拦下是一件需要用户**做出决定**的事，
 * 3 秒就消失的提示很容易被错过，用户只会觉得「点了没反应」。
 */
export default function ValidationBlockDialog({ issues, onClose, onExportAnyway }: Props) {
  const setCurrentStep = useUIStore((s) => s.setCurrentStep)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (issues.length === 0) return null

  const shown = issues.slice(0, MAX_SHOWN)
  const rest = issues.length - shown.length

  const goFix = () => {
    const first = issues[0]
    const idx = FORM_STEPS.findIndex((s) => s.key === first.section)
    if (idx >= 0) setCurrentStep(idx)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="导出前需要先修正"
        onClick={(e) => e.stopPropagation()}
        className="anim-pop-in w-full max-w-md rounded-xl bg-surface p-6 shadow-e4"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-danger">
            <IconAlert size={22} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-medium text-ink">导出前需要先修正内容</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
              有 {issues.length} 处内容格式不正确。这类问题会让 HR 觉得不够细致，建议先改完再导出。
            </p>
            <p className="mt-1.5 text-xs text-ink-3">
              已填内容不会丢失，随时可以「保存」为草稿。
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5 rounded-sm border border-outline bg-canvas p-3">
          {shown.map((it, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed">
              <span className="shrink-0 font-medium text-ink-2">{it.where}</span>
              <span className="text-ink-2">·</span>
              <span className="min-w-0 flex-1 text-ink-2">{it.message}</span>
            </li>
          ))}
          {rest > 0 && <li className="pl-1 text-xs text-ink-3">还有 {rest} 处…</li>}
        </ul>

        <div className="mt-5 flex items-center justify-end gap-2">
          {/* 保留出口：校验规则难免有误报（例如境外手机号），
              拦死会让这类用户永远导不出。闸门应当是警示，不是牢笼。 */}
          <Button variant="text" onClick={onExportAnyway} className="mr-auto text-ink-3">
            仍然导出
          </Button>
          <Button variant="text" onClick={onClose}>
            稍后再说
          </Button>
          <Button variant="filled" onClick={goFix}>
            去修正
          </Button>
        </div>
      </div>
    </div>
  )
}
