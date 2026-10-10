import { useState, type ReactNode } from 'react'
import { IconChevronDown } from './Icons'

export interface AccordionItemData {
  id: string
  header: ReactNode
  content: ReactNode
  /** 头部右侧的标记，如「高频」「常见误区」 */
  badge?: ReactNode
}

/**
 * 折叠列表 —— 技术社区问答区最常见的形态。
 *
 * 展开动画走 `grid-template-rows: 0fr → 1fr`（见 index.css 的 .accordion-panel），
 * 不需要测量内容高度，长答案也不会在展开瞬间跳一下。
 */
export default function Accordion({
  items,
  defaultOpenId,
  allowMultiple = false
}: {
  items: AccordionItemData[]
  defaultOpenId?: string
  allowMultiple?: boolean
}) {
  const [open, setOpen] = useState<string[]>(defaultOpenId ? [defaultOpenId] : [])

  const toggle = (id: string) => {
    setOpen((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      return allowMultiple ? [...prev, id] : [id]
    })
  }

  return (
    <ul className="divide-y divide-outline overflow-hidden rounded-md border border-outline bg-surface">
      {items.map((item) => {
        const isOpen = open.includes(item.id)
        return (
          <li key={item.id}>
            <button
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              aria-controls={`acc-${item.id}`}
              className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-[var(--duration-fast)]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand
                ${isOpen ? 'bg-brand-soft/40' : 'hover:bg-hover'}`}
            >
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className={`text-sm ${isOpen ? 'font-medium text-brand' : 'text-ink'}`}>
                    {item.header}
                  </span>
                  {item.badge}
                </span>
              </span>
              <span
                className={`mt-0.5 shrink-0 text-ink-3 transition-transform duration-[var(--duration-base)] ease-[var(--ease-standard)] ${
                  isOpen ? 'rotate-180' : ''
                }`}
              >
                <IconChevronDown size={18} />
              </span>
            </button>

            {/* 收起时内容仍在 DOM 里（做高度动画），因此必须显式 inert ——
                否则 Tab 会聚焦到看不见的按钮上，屏幕阅读器也会念出折叠内容 */}
            <div
              className="accordion-panel"
              data-open={isOpen}
              id={`acc-${item.id}`}
              aria-hidden={!isOpen}
              inert={!isOpen}
            >
              <div>
                <div className="px-4 pb-4 pt-1">{item.content}</div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
