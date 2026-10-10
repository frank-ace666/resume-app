import { KIND_LABEL, type Release } from '@/data/releases'
import { IconAlert, IconSparkles, IconWrench } from './Icons'

const KIND_STYLE = {
  new: { cls: 'bg-brand-soft text-brand', icon: <IconSparkles size={12} /> },
  fix: { cls: 'bg-danger-soft text-danger', icon: <IconAlert size={12} /> },
  improve: { cls: 'bg-success-soft text-success', icon: <IconWrench size={12} /> }
} as const

/** 单个版本的要点列表 */
export function ReleaseHighlights({ release }: { release: Release }) {
  return (
    <div className="space-y-3">
      {release.highlights.map((h, i) => {
        const style = KIND_STYLE[h.kind]
        return (
          <div key={i} className="flex gap-3">
            <span
              className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${style.cls}`}
            >
              {style.icon}
              {KIND_LABEL[h.kind]}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-ink">{h.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{h.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** 版本头部：版本号 + 日期 + 一句话主题 */
export function ReleaseHeader({ release }: { release: Release }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm font-semibold text-ink">v{release.version}</span>
        <span className="text-xs text-ink-3">{release.date}</span>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{release.headline}</p>
    </div>
  )
}
