import type { ReactNode } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { IconPlus, IconTrash } from '@/components/ui/Icons'

/** 分区标题 + 说明 + 主行动按钮 */
export function FormHeader({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-base font-medium text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-2">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button
          variant="tonal"
          size="sm"
          icon={<IconPlus size={16} />}
          onClick={onAction}
          className="shrink-0"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

/** 可重复条目的卡片外壳 */
export function EntryCard({
  index,
  label,
  onRemove,
  children
}: {
  index: number
  label: string
  onRemove: () => void
  children: ReactNode
}) {
  return (
    <Card className="anim-pop-in p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">
            {index + 1}
          </span>
          {label}
        </span>
        <Button
          variant="icon"
          size="sm"
          onClick={onRemove}
          title="删除这一项"
          aria-label={`删除${label}`}
          className="hover:bg-danger-soft hover:text-danger"
        >
          <IconTrash size={16} />
        </Button>
      </div>
      {children}
    </Card>
  )
}
