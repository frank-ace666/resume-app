import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  /** 悬停时抬升（用于可点击的卡片） */
  interactive?: boolean
  as?: 'div' | 'section'
}

/**
 * Material 表面容器。默认描边式（outlined）——
 * 大量卡片同屏时描边比阴影更安静，符合 Gmail / YouTube 的表面处理。
 */
export default function Card({
  children,
  className = '',
  interactive = false,
  as: Tag = 'div'
}: CardProps) {
  return (
    <Tag
      className={`rounded-md border border-outline bg-surface transition-all duration-[var(--duration-base)] ease-[var(--ease-standard)]
        ${interactive ? 'hover:shadow-e2 hover:border-outline-strong hover:-translate-y-0.5 cursor-pointer' : ''}
        ${className}`}
    >
      {children}
    </Tag>
  )
}
