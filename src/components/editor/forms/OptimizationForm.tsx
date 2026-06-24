import { useResumeStore } from '@/store/resumeStore'
import { useUIStore, FORM_STEPS } from '@/store/uiStore'
import { useOptimizationStore } from '@/store/optimizationStore'
import type { ResumeIssue, SectionKey } from '@/types/optimization'

// ====== 辅助 ======

const SEVERITY_CONFIG = {
  critical: {
    label: '必填项',
    icon: '🔴',
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700'
  },
  warning: {
    label: '建议',
    icon: '🟡',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700'
  },
  info: {
    label: '参考',
    icon: '🔵',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700'
  }
} as const

const CATEGORY_LABELS: Record<string, string> = {
  completeness: '完整性',
  format: '格式规范',
  quality: '表达质量',
  consistency: '一致性'
}

// ====== 计分环 ======

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-green-500 stroke-green-500' :
    score >= 60 ? 'text-amber-500 stroke-amber-500' :
    'text-red-500 stroke-red-500'

  const circumference = 2 * Math.PI * 40
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="40" fill="none" stroke="currentColor"
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          className={color}
        />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
          className="text-lg font-bold fill-slate-800">
          {score}
        </text>
      </svg>
      <div>
        <p className="text-sm text-slate-500">简历完整度评分</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {score >= 80 ? '👍 简历质量良好' :
           score >= 60 ? '📝 还有改进空间' :
           '⚠ 需要大幅完善'}
        </p>
      </div>
    </div>
  )
}

// ====== 统计条 ======

function StatBadge({ count, label, colorClass }: { count: number; label: string; colorClass: string }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {label} {count}
    </span>
  )
}

// ====== 问题卡片 ======

function IssueCard({ issue }: { issue: ResumeIssue }) {
  const setCurrentStep = useUIStore((s) => s.setCurrentStep)
  const config = SEVERITY_CONFIG[issue.severity]

  const handleJump = () => {
    const stepIndex = FORM_STEPS.findIndex((s) => s.key === issue.section)
    if (stepIndex >= 0) {
      setCurrentStep(stepIndex)
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${config.bg}`}>
      {/* 标题行 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium uppercase tracking-wide opacity-70">
              {CATEGORY_LABELS[issue.category]}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${config.badge}`}>
              {config.label}
            </span>
          </div>
          <h4 className={`text-sm font-semibold mt-1 ${config.text}`}>
            {config.icon} {issue.title}
          </h4>
        </div>
        <button
          onClick={handleJump}
          className="shrink-0 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white/80 border border-slate-200 rounded-md hover:bg-white hover:border-slate-300 transition-colors"
        >
          跳转到{FORM_STEPS.find((s) => s.key === issue.section)?.label || '编辑'}
        </button>
      </div>

      {/* 详情 */}
      <div className="mt-2 space-y-1.5">
        <p className="text-xs text-slate-600">{issue.description}</p>

        {/* 当前值 */}
        {issue.currentValue && (
          <div className="text-xs">
            <span className="text-slate-400">当前：</span>
            <code className="px-1 py-0.5 bg-white/60 rounded text-slate-600 text-xs">
              {issue.currentValue.length > 80
                ? issue.currentValue.substring(0, 80) + '...'
                : issue.currentValue}
            </code>
          </div>
        )}

        {/* 建议 */}
        <div className="text-xs">
          <span className="text-green-600 font-medium">→ 建议：</span>
          <span className="text-slate-600">{issue.suggestion}</span>
        </div>
      </div>
    </div>
  )
}

// ====== 主组件 ======

export default function OptimizationForm() {
  const data = useResumeStore((s) => s.data)
  const isDirty = useResumeStore((s) => s.isDirty)
  const { lastResult, history, isChecking, runCheck } = useOptimizationStore()

  const handleStartCheck = () => {
    runCheck(data)
  }

  const lastCheckTime = lastResult
    ? new Date(lastResult.checkedAt).toLocaleTimeString('zh-CN')
    : history.length > 0
      ? new Date(history[0].checkedAt).toLocaleTimeString('zh-CN')
      : null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">简历检查</h2>
          <p className="text-sm text-slate-500 mt-1">
            检查简历的完整性、格式规范和表达质量。
          </p>
        </div>
      </div>

      {/* 检查按钮区域 */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <button
          onClick={handleStartCheck}
          disabled={isChecking}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors shadow-sm ${
            isChecking
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isChecking ? '检查中...' : '🔄 开始检查'}
        </button>

        {lastCheckTime && !isChecking && (
          <span className="text-xs text-slate-400">
            上次检查：{lastCheckTime}
            {history.length > 1 && ` · 共 ${history.length} 次记录`}
          </span>
        )}

        {isDirty && lastResult && !isChecking && (
          <span className="text-xs text-amber-600 font-medium">
            ⚠ 简历已修改，建议重新检查
          </span>
        )}
      </div>

      {/* 无结果时的引导 */}
      {!lastResult && !isChecking && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-5xl mb-3">🔍</p>
          <p className="text-sm font-medium">还没有检查结果</p>
          <p className="text-xs mt-1">点击"开始检查"对你的简历进行全面分析</p>
        </div>
      )}

      {/* 检查中 */}
      {isChecking && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-3xl mb-3 animate-pulse">⏳</p>
          <p className="text-sm font-medium">正在分析简历...</p>
          <p className="text-xs mt-1">检查完整性、格式、表达质量和一致性</p>
        </div>
      )}

      {/* 检查结果 */}
      {lastResult && !isChecking && (
        <div className="space-y-5">
          {/* 评分 + 统计 */}
          <div className="flex items-center gap-6 p-5 bg-white border border-slate-200 rounded-lg">
            <ScoreRing score={lastResult.summary.score} />
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-semibold text-slate-700">问题统计</h3>
              <div className="flex flex-wrap gap-2">
                <StatBadge count={lastResult.summary.critical} label="必填项缺失" colorClass={SEVERITY_CONFIG.critical.badge} />
                <StatBadge count={lastResult.summary.warning} label="改进建议" colorClass={SEVERITY_CONFIG.warning.badge} />
                <StatBadge count={lastResult.summary.info} label="参考信息" colorClass={SEVERITY_CONFIG.info.badge} />
              </div>
              {lastResult.summary.totalIssues === 0 && (
                <p className="text-sm text-green-600 font-medium">🎉 简历没有发现问题！</p>
              )}
            </div>
          </div>

          {/* 问题列表（按 severity 分组） */}
          {lastResult.summary.totalIssues > 0 && (
            <div className="space-y-4">
              {(['critical', 'warning', 'info'] as const).map((severity) => {
                const config = SEVERITY_CONFIG[severity]
                const groupIssues = lastResult.issues.filter((i) => i.severity === severity)
                if (groupIssues.length === 0) return null

                return (
                  <div key={severity}>
                    <h3 className={`text-sm font-semibold mb-2 ${config.text}`}>
                      {config.icon} {config.label}（{groupIssues.length}）
                    </h3>
                    <div className="space-y-2">
                      {groupIssues.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 历史趋势 */}
          {history.length > 1 && (
            <div className="p-4 bg-white border border-slate-200 rounded-lg">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">检查历史</h3>
              <div className="flex items-end gap-2">
                {[...history].reverse().map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 rounded-t-sm transition-all"
                      style={{
                        height: `${Math.max(8, h.summary.score * 0.5)}px`,
                        backgroundColor:
                          h.summary.score >= 80 ? '#22c55e' :
                          h.summary.score >= 60 ? '#f59e0b' : '#ef4444'
                      }}
                      title={`${h.summary.score}分 - ${new Date(h.checkedAt).toLocaleTimeString('zh-CN')}`}
                    />
                    <span className="text-xs text-slate-400">{h.summary.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
