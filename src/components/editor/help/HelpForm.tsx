import { useUIStore } from '@/store/uiStore'
import { FEEDBACK_EMAIL, openExternal } from '@/utils/mailto'
import Button from '@/components/ui/Button'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { IconExternal, IconHelp, IconHistory, IconLightbulb, IconSend } from '@/components/ui/Icons'
import FaqView from './FaqView'
import ReleasesView from './ReleasesView'
import FeedbackView from './FeedbackView'
import ContributeView from './ContributeView'

/**
 * 帮助与反馈 —— 只负责「选哪一栏」，各栏内容在各自文件里。
 *
 * 分段选择放在 store 里，这样「本版更新」弹窗的「查看全部更新」
 * 可以直接把用户送到「更新日志」。
 */
const SEGMENTS = [
  { key: 'faq', label: '常见问题', icon: <IconHelp size={15} /> },
  { key: 'releases', label: '更新日志', icon: <IconHistory size={15} /> },
  { key: 'feedback', label: '建议', icon: <IconLightbulb size={15} /> },
  { key: 'contribute', label: '投稿', icon: <IconSend size={15} /> }
]

export default function HelpForm() {
  const view = useUIStore((s) => s.helpView)
  const setView = useUIStore((s) => s.setHelpView)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-medium text-ink">帮助与反馈</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-2">
          常见问题、更新日志、反馈渠道与投稿方式。找不到答案可以直接发邮件。
        </p>
      </div>

      <SegmentedControl segments={SEGMENTS} value={view} onChange={setView} />

      <div key={view} className="anim-fade-slide-in">
        {view === 'faq' && <FaqView />}
        {view === 'releases' && <ReleasesView />}
        {view === 'feedback' && <FeedbackView />}
        {view === 'contribute' && <ContributeView />}
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
