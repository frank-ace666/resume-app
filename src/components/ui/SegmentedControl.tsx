import type { ReactNode } from 'react'

export interface Segment {
  key: string
  label: string
  icon?: ReactNode
}

/**
 * Material 分段控件。
 * 用于在同一位置切换少量互斥视图 —— 比一排并列按钮更清楚地表达「这是同一件事的几种看法」。
 */
export default function SegmentedControl({
  segments,
  value,
  onChange,
  className = ''
}: {
  segments: Segment[]
  value: string
  onChange: (key: string) => void
  className?: string
}) {
  return (
    <div
      role="tablist"
      aria-label="帮助与反馈分类"
      className={`flex gap-1 overflow-x-auto rounded-full bg-hover p-1 ${className}`}
    >
      {segments.map((s) => {
        const active = s.key === value
        return (
          <button
            key={s.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(s.key)}
            className={`flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-all duration-[var(--duration-base)] ease-[var(--ease-standard)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1
              ${
                active
                  ? 'bg-surface text-brand shadow-e1'
                  : 'text-ink-2 hover:bg-surface/60 hover:text-ink'
              }`}
          >
            {s.icon}
            {s.label}
          </button>
        )
      })}
    </div>
  )
}
