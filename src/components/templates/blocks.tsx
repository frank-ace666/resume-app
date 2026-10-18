import type { ContactItem } from './model'
import { TYPE, PRINT } from './shared'

/**
 * 模板共享的文本原语。
 *
 * 只抽「每个模板都必须一模一样」的两件事：联系方式必须带标签、
 * 条目头部的标题/副标题/日期对齐。分区标题、间距、配色仍留在各模板里 ——
 * 那些是刻意的视觉差异，统一掉模板就不需要存在了。
 */

type ContactLayout = 'inline' | 'stacked' | 'grid'

interface ContactListProps {
  contacts: ContactItem[]
  layout?: ContactLayout
  labelColor: string
  valueColor: string
  /** inline 布局的分隔符颜色，默认与标签同色 */
  separatorColor?: string
  className?: string
}

/**
 * 联系方式列表。
 *
 * **始终输出 `标签：值`** —— 这是「电话」等标签在简历上可见的唯一保证。
 * 模板只选择横排、竖排或两列，不自行拼接字符串。
 */
export function ContactList({
  contacts,
  layout = 'stacked',
  labelColor,
  valueColor,
  separatorColor,
  className = ''
}: ContactListProps) {
  if (contacts.length === 0) return null

  const labelOf = (c: ContactItem) => (c.label ? `${c.label}：` : '')

  if (layout === 'inline') {
    return (
      <p className={`${TYPE.contact} break-words ${className}`}>
        {contacts.map((c, i) => (
          <span key={c.id}>
            {/* 标签本身不拆行：避免「个人网站」被断成「个人网 / 站：…」 */}
            <span style={{ color: labelColor, whiteSpace: 'nowrap' }}>{labelOf(c)}</span>
            <span style={{ color: valueColor }}>{c.value}</span>
            {i < contacts.length - 1 && (
              <span style={{ color: separatorColor ?? labelColor }}>{'  ·  '}</span>
            )}
          </span>
        ))}
      </p>
    )
  }

  if (layout === 'grid') {
    return (
      <div className={`grid grid-cols-2 gap-x-5 gap-y-1 ${TYPE.contact} ${className}`}>
        {contacts.map((c) => (
          <p key={c.id} className="break-all">
            <span style={{ color: labelColor }}>{labelOf(c)}</span>
            <span style={{ color: valueColor }}>{c.value}</span>
          </p>
        ))}
      </div>
    )
  }

  return (
    <ul className={`${TYPE.contact} space-y-1 ${className}`}>
      {contacts.map((c) => (
        <li key={c.id} className="break-all">
          <span style={{ color: labelColor }}>{labelOf(c)}</span>
          <span style={{ color: valueColor }}>{c.value}</span>
        </li>
      ))}
    </ul>
  )
}

interface EntryHeadProps {
  title: string
  subtitle?: string
  range?: string
  titleColor?: string
  subtitleColor?: string
  rangeColor?: string
  className?: string
}

/** 条目头部：左侧「标题 + 副标题」，右侧日期。日期不抢标题的视觉重量。 */
export function EntryHead({
  title,
  subtitle,
  range,
  titleColor = PRINT.strong,
  subtitleColor = PRINT.muted,
  rangeColor = PRINT.faint,
  className = ''
}: EntryHeadProps) {
  return (
    <div className={`flex flex-wrap items-baseline justify-between gap-x-3 ${className}`}>
      <h3 className={TYPE.entryTitle} style={{ color: titleColor }}>
        {title}
        {subtitle && (
          <span className="ml-2 font-normal" style={{ color: subtitleColor }}>
            {subtitle}
          </span>
        )}
      </h3>
      {range && (
        <span className={`${TYPE.meta} shrink-0`} style={{ color: rangeColor }}>
          {range}
        </span>
      )}
    </div>
  )
}
