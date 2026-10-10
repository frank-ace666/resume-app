import type { ReactNode } from 'react'
import Button from './Button'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

/**
 * 空状态：说明「现在是什么状态」+ 一个明确的主行动。
 * 替代原先的「暂无…」灰字提示。
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="anim-pop-in flex flex-col items-center justify-center rounded-md border border-dashed border-outline bg-canvas px-6 py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
        {icon}
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink-2">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="tonal" size="sm" icon={<span className="text-base leading-none">+</span>} className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
