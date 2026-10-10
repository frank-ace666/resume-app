import { useState } from 'react'
import { toast } from '@/store/toastStore'
import { buildMailto, openExternal } from '@/utils/mailto'
import Card from '@/components/ui/Card'
import { TextArea } from '@/components/ui/TextField'
import EmailActions from './EmailActions'

/** 建议：选类型 + 填内容，生成预填好的邮件。 */
/* ============ 视图 2：建议 ============ */

const FEEDBACK_KINDS = ['问题反馈', '功能建议', '内容纠错', '其他'] as const

export default function FeedbackView() {
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
