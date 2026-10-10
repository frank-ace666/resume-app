import Card from '@/components/ui/Card'
import { IconLightbulb } from '@/components/ui/Icons'
import EmailActions from './EmailActions'

/** 投稿：说明欢迎投什么，一键发信。 */
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

export default function ContributeView() {
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
