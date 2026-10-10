import { useMemo, useState } from 'react'
import { FAQ_ITEMS, FAQ_CATEGORIES, type FaqCategory } from '@/data/faq'
import { PRODUCT, hasLink } from '@/data/product'
import { buildMailto, openExternal } from '@/utils/mailto'
import Accordion from '@/components/ui/Accordion'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { IconSearch, IconSend, IconThumbsDown, IconThumbsUp, IconUsers } from '@/components/ui/Icons'
import { AnswerBody } from './richText'
import EmailActions from './EmailActions'

/** 常见问题：搜索 + 分类筛选 + 折叠 + 逐条反馈 + 未解决兜底。 */
/* ============ 视图 1：Q&A ============ */

export default function FaqView() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FaqCategory | 'all'>('all')
  /** 逐条反馈：本地记录，不上传（本应用没有后端） */
  const [voted, setVoted] = useState<Record<string, 'up' | 'down'>>({})

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FAQ_ITEMS.filter((it) => {
      if (category !== 'all' && it.category !== category) return false
      if (!q) return true
      return (it.question + it.answer).toLowerCase().includes(q)
    })
  }, [query, category])

  return (
    <div className="space-y-4">
      {/* 搜索 */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3">
          <IconSearch size={18} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索问题，例如「几页」「照片」「转行」"
          aria-label="搜索常见问题"
          className="h-11 w-full rounded-full border border-outline bg-surface pl-11 pr-4 text-sm text-ink transition-colors duration-[var(--duration-fast)] placeholder:text-ink-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {/* 分类 */}
      <div className="flex flex-wrap gap-2">
        {[{ key: 'all' as const, label: '全部' }, ...FAQ_CATEGORIES].map((c) => {
          const active = category === c.key
          return (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              aria-pressed={active}
              className={`rounded-full px-3 py-1 text-xs transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1
                ${
                  active
                    ? 'bg-brand text-white'
                    : 'border border-outline text-ink-2 hover:border-brand hover:bg-brand-soft hover:text-brand'
                }`}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      {/* 结果 */}
      {results.length === 0 ? (
        <EmptyState
          icon={<IconSearch size={26} />}
          title="没有找到相关问题"
          description="换个关键词试试，或者直接把问题发给我，我会补进这里。"
        />
      ) : (
        <Accordion
          items={results.map((it) => ({
            id: it.id,
            header: it.question,
            badge: it.tag ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  it.tag === '高频'
                    ? 'bg-brand-soft text-brand'
                    : 'bg-warning-soft text-[#b06000]'
                }`}
              >
                {it.tag}
              </span>
            ) : undefined,
            content: (
              <div className="space-y-3">
                <AnswerBody text={it.answer} />

                {/* 逐条反馈 —— 社区问答的标准配置 */}
                <div className="flex flex-wrap items-center gap-3 border-t border-outline pt-3">
                  {voted[it.id] ? (
                    <span className="text-xs text-ink-3">
                      {voted[it.id] === 'up'
                        ? '谢谢反馈，很高兴有帮助'
                        : '抱歉没解决——要不要把问题发我？'}
                    </span>
                  ) : (
                    <>
                      <span className="text-xs text-ink-3">这条有帮助吗？</span>
                      <button
                        onClick={() => setVoted((v) => ({ ...v, [it.id]: 'up' }))}
                        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-ink-2 transition-colors hover:bg-success-soft hover:text-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        <IconThumbsUp size={14} /> 有帮助
                      </button>
                      <button
                        onClick={() => setVoted((v) => ({ ...v, [it.id]: 'down' }))}
                        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-ink-2 transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        <IconThumbsDown size={14} /> 没解决
                      </button>
                    </>
                  )}

                  {voted[it.id] === 'down' && (
                    <Button
                      variant="text"
                      size="sm"
                      icon={<IconSend size={14} />}
                      onClick={() =>
                        openExternal(
                          buildMailto({
                            subject: `[问题] ${it.question}`,
                            body: '这条说明没能解决我的问题，补充说明：\n\n'
                          })
                        )
                      }
                    >
                      发邮件问我
                    </Button>
                  )}
                </div>
              </div>
            )
          }))}
        />
      )}

      {/* 未解决兜底。讨论区未配置时不出现 —— 不宣传尚不存在的渠道 */}
      <Card className="bg-canvas p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">没找到你的问题？</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-2">
              直接发邮件，我会补进这个列表。
            </p>
            {hasLink(PRODUCT.communityUrl) && (
              <button
                onClick={() => openExternal(PRODUCT.communityUrl)}
                className="mt-1.5 inline-flex items-center gap-1 text-xs text-brand transition-opacity hover:opacity-80"
              >
                <IconUsers size={13} />
                也可以去讨论区问问
              </button>
            )}
          </div>
          <EmailActions subject="[提问]" primaryLabel="提问" />
        </div>
      </Card>
    </div>
  )
}
