import { useState } from 'react'
import { toast } from '@/store/toastStore'
import { buildMailto, copyText, openExternal, FEEDBACK_EMAIL } from '@/utils/mailto'
import Button from '@/components/ui/Button'
import { IconCopy, IconSend } from '@/components/ui/Icons'

/** 邮箱操作条：一封预填好的邮件 + 复制地址兜底。帮助模块各视图共用。 */
/* ============ 通用：邮箱操作条 ============ */

export default function EmailActions({
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
