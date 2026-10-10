import { useMemo, useState, Fragment, type ReactNode } from 'react'
import { toast } from '@/store/toastStore'
import { FAQ_ITEMS, FAQ_CATEGORIES, type FaqCategory } from '@/data/faq'
import { buildMailto, copyText, openExternal, FEEDBACK_EMAIL } from '@/utils/mailto'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Accordion from '@/components/ui/Accordion'
import SegmentedControl from '@/components/ui/SegmentedControl'
import EmptyState from '@/components/ui/EmptyState'
import { TextArea } from '@/components/ui/TextField'
import {
  IconCopy,
  IconExternal,
  IconHeart,
  IconHelp,
  IconLightbulb,
  IconSearch,
  IconSend,
  IconThumbsDown,
  IconThumbsUp
} from '@/components/ui/Icons'

/* ============ 富文本：支持 **粗体** 与 `- ` 列表 ============ */

function renderInline(text: string): ReactNode {
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

function AnswerBody({ text }: { text: string }) {
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

/* ============ 通用：邮箱操作条 ============ */

function EmailActions({
  subject,
  body = '',
  primaryLabel = '用邮件发送'
}: {
  subject: string
  body?: string
  primaryLabel?: string
}) {
  const [copied, setCopied] = useState(false)

  const send = async () => {
    const ok = await openExternal(buildMailto({ subject, body }))
    if (!ok) toast.error('未能打开邮件客户端，可手动复制邮箱')
  }

  const copy = async () => {
    const ok = await copyText(FEEDBACK_EMAIL)
    if (ok) {
      setCopied(true)
      toast.success('邮箱已复制')
      window.setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error('复制失败，请手动选择邮箱地址')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="filled" size="sm" icon={<IconSend size={16} />} onClick={send}>
        {primaryLabel}
      </Button>
      <Button
        variant="outlined"
        size="sm"
        icon={<IconCopy size={16} />}
        onClick={copy}
        disabled={copied}
      >
        {copied ? '已复制' : '复制邮箱'}
      </Button>
      <span className="selectable text-xs text-ink-3">{FEEDBACK_EMAIL}</span>
    </div>
  )
}

/* ============ 视图 1：Q&A ============ */

function FaqView() {
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

      {/* 未解决兜底 */}
      <Card className="flex flex-wrap items-center justify-between gap-3 bg-canvas p-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">没找到你的问题？</p>
          <p className="mt-0.5 text-xs text-ink-2">直接发邮件，我会补进这个列表。</p>
        </div>
        <EmailActions subject="[提问]" primaryLabel="提问" />
      </Card>
    </div>
  )
}

/* ============ 视图 2：建议 ============ */

const FEEDBACK_KINDS = ['问题反馈', '功能建议', '内容纠错', '其他'] as const

function FeedbackView() {
  const [kind, setKind] = useState<(typeof FEEDBACK_KINDS)[number]>('问题反馈')
  const [content, setContent] = useState('')

  const send = async () => {
    const ok = await openExternal(
      buildMailto({
        subject: `[${kind}] 简历工坊反馈`,
        body: `${content.trim()}\n\n---\n（可选）我的使用环境：Windows ${navigator.userAgent.includes('Windows') ? '' : '非 '}· 版本 v${__APP_VERSION__}`
      })
    )
    if (!ok) toast.error('未能打开邮件客户端，可手动复制邮箱')
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-ink-2">反馈类型</label>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_KINDS.map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={`rounded-full px-3 py-1 text-xs transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1
                  ${
                    kind === k
                      ? 'bg-brand text-white'
                      : 'border border-outline text-ink-2 hover:border-brand hover:bg-brand-soft hover:text-brand'
                  }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <TextArea
          label="想说的内容"
          placeholder="遇到什么问题？希望加什么功能？或者哪里写错了？&#10;描述得越具体越好，比如「在 XX 情况下点了 XX 会出现 XX」。"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <EmailActions
            subject={`[${kind}] 简历工坊反馈`}
            body={content.trim()}
            primaryLabel={content.trim() ? '用邮件发送' : '直接发空白邮件'}
          />
        </div>

        <p className="text-[11px] leading-relaxed text-ink-3">
          本应用没有后端服务器，反馈通过你的邮件客户端发送。点按钮后会打开邮件应用，
          内容已预填好，确认后发送即可。
        </p>
      </Card>
    </div>
  )
}

/* ============ 视图 3：投稿 ============ */

const CONTRIBUTE_KINDS = [
  {
    title: '简历模板',
    desc: '有想实现的版式？附上截图或草图说明，我来做成模板。'
  },
  {
    title: '常见问题',
    desc: '你踩过的坑、被 HR 提醒过的点，都可以补进问答区。'
  },
  {
    title: '措辞建议',
    desc: '觉得「简历检查」的某条规则不准或表述不好，欢迎指正。'
  },
  {
    title: '错别字与文案',
    desc: '界面文案、问答内容里的错误，直接指出即可。'
  }
]

function ContributeView() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-sm leading-relaxed text-ink-2">
          这个项目是一个人维护的，欢迎投稿。以下内容都很有用：
        </p>
        <div className="mt-3 space-y-2.5">
          {CONTRIBUTE_KINDS.map((c) => (
            <div key={c.title} className="flex gap-3">
              <span className="mt-0.5 shrink-0 text-brand">
                <IconLightbulb size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink">{c.title}</p>
                <p className="text-xs leading-relaxed text-ink-2">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <p className="text-xs leading-relaxed text-ink-3">
          邮件标题会预填 <code className="rounded-xs bg-hover px-1">[投稿]</code>，
          方便我在收件箱里筛出来。附件直接加在邮件里即可。
        </p>
        <EmailActions subject="[投稿] 简历工坊" primaryLabel="投稿" />
      </Card>
    </div>
  )
}

/* ============ 视图 4：支持我 ============ */

const SUPPORT_WAYS = [
  {
    title: '把问题发给我',
    desc: '最实际的帮助。你遇到的 bug 和困惑，往往也是别人的，修掉一个就少一批人踩坑。'
  },
  {
    title: '分享给正在找工作的同学',
    desc: '这个应用完全免费、离线可用，没有账号也没有广告。'
  },
  {
    title: '投稿内容',
    desc: '模板、问答、措辞建议都算，见「投稿」一栏。'
  },
  {
    title: '一句反馈',
    desc: '哪怕只是说一句「用着还行」，对一个人维护的项目也是很大的鼓励。'
  }
]

function SupportView() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-danger">
            <IconHeart size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">这个项目没有收费计划</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
              没有账号体系、没有广告、也没有会员功能，全部功能免费且完全离线。
              所以不需要花钱支持 —— 下面这些反而更有用：
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {SUPPORT_WAYS.map((s, i) => (
            <div key={s.title} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink">{s.title}</p>
                <p className="text-xs leading-relaxed text-ink-2">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <EmailActions subject="[反馈] 简历工坊" primaryLabel="说点什么" />
      </Card>
    </div>
  )
}

/* ============ 主组件 ============ */

const SEGMENTS = [
  { key: 'faq', label: '常见问题', icon: <IconHelp size={15} /> },
  { key: 'feedback', label: '建议', icon: <IconLightbulb size={15} /> },
  { key: 'contribute', label: '投稿', icon: <IconSend size={15} /> },
  { key: 'support', label: '支持我', icon: <IconHeart size={15} /> }
]

export default function HelpForm() {
  const [view, setView] = useState('faq')

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-medium text-ink">帮助与反馈</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-2">
          常见问题、反馈渠道与投稿方式。找不到答案可以直接发邮件。
        </p>
      </div>

      <SegmentedControl segments={SEGMENTS} value={view} onChange={setView} />

      <div key={view} className="anim-fade-slide-in">
        {view === 'faq' && <FaqView />}
        {view === 'feedback' && <FeedbackView />}
        {view === 'contribute' && <ContributeView />}
        {view === 'support' && <SupportView />}
      </div>

      {/* 页脚：邮箱常驻，任何视图下都能直接看到 */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline pt-4">
        <span className="text-xs text-ink-3">
          反馈邮箱 <span className="selectable text-ink-2">{FEEDBACK_EMAIL}</span>
        </span>
        <Button
          variant="text"
          size="sm"
          icon={<IconExternal size={14} />}
          onClick={() => openExternal(`mailto:${FEEDBACK_EMAIL}`)}
        >
          打开邮件应用
        </Button>
      </div>
    </div>
  )
}
