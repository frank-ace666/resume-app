import { useResumeStore } from '@/store/resumeStore'
import { useOptimizationStore } from '@/store/optimizationStore'
import { getOverallProgress } from '@/utils/sectionProgress'

interface StatusBarProps {
  isAutoSaved: boolean
  lastSavedAt: string | null
}

export default function StatusBar({ isAutoSaved, lastSavedAt }: StatusBarProps) {
  const data = useResumeStore((s) => s.data)
  const lastResult = useOptimizationStore((s) => s.lastResult)

  const progress = getOverallProgress(data)
  const issueCount = lastResult?.summary.totalIssues ?? 0

  const saveText = isAutoSaved
    ? lastSavedAt
      ? `已自动保存 · ${lastSavedAt}`
      : '已保存'
    : '正在保存…'

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-outline bg-surface px-4 text-[11px] text-ink-2">
      <div className="flex items-center gap-3">
        <span className="text-ink-3">简历工坊 v{__APP_VERSION__}</span>
        <span className="text-outline-strong">|</span>
        <span>
          填写进度 {progress.done}/{progress.total}
        </span>
        {lastResult && (
          <>
            <span className="text-outline-strong">|</span>
            <span className={issueCount === 0 ? 'text-success' : 'text-ink-2'}>
              {issueCount === 0 ? '检查通过' : `${issueCount} 项待改进`}
            </span>
          </>
        )}
      </div>

      <span className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${isAutoSaved ? 'bg-success' : 'anim-breathe bg-warning'}`}
        />
        {saveText}
      </span>
    </footer>
  )
}
