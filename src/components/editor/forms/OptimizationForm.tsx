import { useEffect, useState, type ReactNode } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import { useUIStore, FORM_STEPS } from '@/store/uiStore'
import { useOptimizationStore } from '@/store/optimizationStore'
import type { ResumeIssue, IssueSeverity } from '@/types/optimization'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import { IconAlert, IconCheckCircle, IconClipboardCheck, IconInfo, IconSparkles } from '@/components/ui/Icons'

// ====== 配置 ======

const SEVERITY_CONFIG: Record<
  IssueSeverity,
  { label: string; tone: string; soft: string; icon: ReactNode }
> = {
  critical: {
    label: '必填项',
    tone: 'text-danger',
    soft: 'bg-danger-soft',
    icon: <IconAlert size={16} />
  },
  warning: {
    label: '建议',
    tone: 'text-[#b06000]',
    soft: 'bg-warning-soft',
    icon: <IconAlert size={16} />
  },
  info: {
    label: '参考',
    tone: 'text-brand',
    soft: 'bg-brand-soft',
    icon: <IconInfo size={16} />
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  completeness: '完整性',
  format: '格式规范',
  quality: '表达质量',
  consistency: '一致性'
}

// ====== 计分环 ======

function ScoreRing({ score }: { score: number }) {
  const [progress, setProgress] = useState(0)

  // 挂载后再推进，让描边有一个可见的动画过程
  useEffect(() => {
    const raf = requestAnimationFrame(() => setProgress(score))
    return () => cancelAnimationFrame(raf)
  }, [score])

  const color = score >= 80 ? '#1e8e3e' : score >= 60 ? '#f9ab00' : '#d93025'
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (progress / 100) * circumference

  const verdict =
    score >= 80 ? '简历质量良好' : score >= 60 ? '还有改进空间' : '需要大幅完善'

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[104px] w-[104px] shrink-0">
        <svg width="104" height="104" viewBox="0 0 104 104">
          <circle cx="52" cy="52" r="42" fill="none" stroke="#e8eaed" strokeWidth="9" />
          <circle
            cx="52"
            cy="52"
            r="42"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 52 52)"
            className="ring-progress"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none text-ink">{score}</span>
          <span className="mt-0.5 text-[10px] text-ink-3">分</span>
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{verdict}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-2">
          评分只反映完整性与表达规范，不代表录用概率。
        </p>
      </div>
    </div>
  )
}

function StatBadge({ count, label, tone, soft }: { count: number; label: string; tone: string; soft: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${soft} ${tone}`}>
      {label}
      <span className="font-semibold">{count}</span>
    </span>
  )
}

// ====== 问题卡片 ======

function IssueCard({ issue }: { issue: ResumeIssue }) {
  const setCurrentStep = useUIStore((s) => s.setCurrentStep)
  const config = SEVERITY_CONFIG[issue.severity]
  const stepLabel = FORM_STEPS.find((s) => s.key === issue.section)?.label

  return (
    <Card className="p-4 transition-shadow duration-[var(--duration-base)] hover:shadow-e1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${config.soft} ${config.tone}`}>
              {config.icon}
              {config.label}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-ink-3">
              {CATEGORY_LABELS[issue.category]}
            </span>
          </div>

          <h4 className="mt-2 text-sm font-medium text-ink">{issue.title}</h4>
          <p className="mt-1 text-xs leading-relaxed text-ink-2">{issue.description}</p>

          {issue.currentValue && (
            <p className="mt-2 text-xs text-ink-2">
              <span className="text-ink-3">当前：</span>
              <code className="rounded-xs bg-hover px-1.5 py-0.5 text-[11px] text-ink-2">
                {issue.currentValue.length > 80
                  ? `${issue.currentValue.slice(0, 80)}…`
                  : issue.currentValue}
              </code>
            </p>
          )}

          <p className="mt-2 text-xs leading-relaxed text-ink-2">
            <span className="font-medium text-success">建议：</span>
            {issue.suggestion}
          </p>
        </div>

        {stepLabel && (
          <Button
            variant="outlined"
            size="sm"
            className="shrink-0"
            onClick={() => {
              const idx = FORM_STEPS.findIndex((s) => s.key === issue.section)
              if (idx >= 0) setCurrentStep(idx)
            }}
          >
            {stepLabel}
          </Button>
        )}
      </div>
    </Card>
  )
}

// ====== 检查中的骨架屏 ======

function CheckingSkeleton() {
  return (
    <div className="space-y-3">
      <Card className="flex items-center gap-5 p-5">
        <div className="anim-shimmer h-[104px] w-[104px] shrink-0 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="anim-shimmer h-3 w-1/3 rounded-full" />
          <div className="anim-shimmer h-3 w-2/3 rounded-full" />
        </div>
      </Card>
      {[0, 1, 2].map((i) => (
        <Card key={i} className="space-y-2 p-4">
          <div className="anim-shimmer h-3 w-24 rounded-full" />
          <div className="anim-shimmer h-3 w-4/5 rounded-full" />
          <div className="anim-shimmer h-3 w-3/5 rounded-full" />
        </Card>
      ))}
    </div>
  )
}

// ====== 主组件 ======

export default function OptimizationForm() {
  const data = useResumeStore((s) => s.data)
  const isDirty = useResumeStore((s) => s.isDirty)
  const { lastResult, history, isChecking, runCheck } = useOptimizationStore()

  const lastCheckTime = lastResult ? new Date(lastResult.checkedAt).toLocaleTimeString('zh-CN') : null

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-medium text-ink">简历检查</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-2">
          检查完整性、格式规范与表达质量 —— 本地规则引擎，不会上传任何内容，也不会编造经历。
        </p>
      </div>

      {/* 操作区 */}
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <Button
          variant="filled"
          icon={<IconSparkles size={17} />}
          loading={isChecking}
          onClick={() => runCheck(data)}
        >
          {isChecking ? '检查中…' : lastResult ? '重新检查' : '开始检查'}
        </Button>

        {lastCheckTime && !isChecking && (
          <span className="text-xs text-ink-3">上次检查：{lastCheckTime}</span>
        )}

        {isDirty && lastResult && !isChecking && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-medium text-[#b06000]">
            <IconAlert size={14} />
            简历已修改，建议重新检查
          </span>
        )}
      </Card>

      {/* 未检查 */}
      {!lastResult && !isChecking && (
        <EmptyState
          icon={<IconClipboardCheck size={26} />}
          title="还没有检查结果"
          description="点击「开始检查」，用 27 条规则分析你的简历，并按严重程度给出修改建议。"
          actionLabel="开始检查"
          onAction={() => runCheck(data)}
        />
      )}

      {/* 检查中 */}
      {isChecking && <CheckingSkeleton />}

      {/* 结果 */}
      {lastResult && !isChecking && (
        <div className="anim-fade-slide-in space-y-5">
          <Card className="p-5">
            <ScoreRing score={lastResult.summary.score} />

            <div className="mt-4 flex flex-wrap gap-2 border-t border-outline pt-4">
              <StatBadge
                count={lastResult.summary.critical}
                label="必填项缺失"
                tone={SEVERITY_CONFIG.critical.tone}
                soft={SEVERITY_CONFIG.critical.soft}
              />
              <StatBadge
                count={lastResult.summary.warning}
                label="改进建议"
                tone={SEVERITY_CONFIG.warning.tone}
                soft={SEVERITY_CONFIG.warning.soft}
              />
              <StatBadge
                count={lastResult.summary.info}
                label="参考信息"
                tone={SEVERITY_CONFIG.info.tone}
                soft={SEVERITY_CONFIG.info.soft}
              />
            </div>

            {lastResult.summary.totalIssues === 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-sm bg-success-soft px-3.5 py-2.5 text-sm font-medium text-success">
                <IconCheckCircle size={18} />
                简历没有发现问题
              </div>
            )}
          </Card>

          {/* 按严重程度分组 */}
          {(['critical', 'warning', 'info'] as const).map((severity) => {
            const group = lastResult.issues.filter((i) => i.severity === severity)
            if (group.length === 0) return null
            const config = SEVERITY_CONFIG[severity]

            return (
              <section key={severity}>
                <h3 className={`mb-2.5 flex items-center gap-2 text-sm font-medium ${config.tone}`}>
                  {config.icon}
                  {config.label}
                  <span className="text-ink-3">（{group.length}）</span>
                </h3>
                <div className="space-y-2.5">
                  {group.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              </section>
            )
          })}

          {/* 历史趋势 */}
          {history.length > 1 && (
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-medium text-ink">检查历史</h3>
              <div className="flex items-end gap-3">
                {[...history].reverse().map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span className="text-xs font-medium text-ink-2">{h.summary.score}</span>
                    <div
                      className="w-7 rounded-t-sm transition-all duration-[var(--duration-slow)] ease-[var(--ease-decelerate)]"
                      style={{
                        height: `${Math.max(10, h.summary.score * 0.6)}px`,
                        backgroundColor:
                          h.summary.score >= 80 ? '#1e8e3e' : h.summary.score >= 60 ? '#f9ab00' : '#d93025'
                      }}
                      title={`${h.summary.score} 分 · ${new Date(h.checkedAt).toLocaleTimeString('zh-CN')}`}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
