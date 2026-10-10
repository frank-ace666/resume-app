import type { ReactNode } from 'react'

/**
 * Material 表面容器。默认描边式 ——
 * 大量卡片同屏时描边比阴影更安静，符合 Gmail / YouTube 的表面处理。
 *
 * 刻意保持单薄：只接受 children 与 className。
 * 曾有过 `interactive`（悬停抬升）与 `as`（换标签）两个 prop，无人使用 ——
 * 可配置但从不配置的接口，只是需要维护的负债。
 */
export default function Card({
  children,
  className = ''
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-md border border-outline bg-surface ${className}`}>{children}</div>
  )
}
