import { Fragment, type ReactNode } from 'react'

/* ============ 富文本：支持 **粗体** 与 `- ` 列表 ============ */

export function renderInline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-medium text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  )
}

export function AnswerBody({ text }: { text: string }) {
  const lines = text.split('\n')

  return (
    <div className="space-y-2 text-[13px] leading-relaxed text-ink-2">
      {lines.map((line, i) => {
        const isBullet = line.startsWith('- ')
        const content = isBullet ? line.slice(2) : line
        if (!line.trim()) return null

        if (isBullet) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="shrink-0 text-ink-3">·</span>
              <span className="min-w-0 flex-1">{renderInline(content)}</span>
            </div>
          )
        }
        return <p key={i}>{renderInline(content)}</p>
      })}
    </div>
  )
}
