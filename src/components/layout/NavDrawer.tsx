import type { ReactNode } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import { useUIStore, FORM_STEPS } from '@/store/uiStore'
import { useOptimizationStore } from '@/store/optimizationStore'
import { getSectionCompletion, getOverallProgress } from '@/utils/sectionProgress'
import {
  IconBriefcase,
  IconChat,
  IconCheck,
  IconClipboardCheck,
  IconFolder,
  IconGraduationCap,
  IconUser,
  IconWrench
} from '@/components/ui/Icons'

const SECTION_ICON: Record<string, ReactNode> = {
  personalInfo: <IconUser size={20} />,
  education: <IconGraduationCap size={20} />,
  workExperience: <IconBriefcase size={20} />,
  skills: <IconWrench size={20} />,
  projects: <IconFolder size={20} />,
  summary: <IconChat size={20} />,
  optimization: <IconClipboardCheck size={20} />
}

export default function NavDrawer() {
  const currentStep = useUIStore((s) => s.currentStep)
  const setCurrentStep = useUIStore((s) => s.setCurrentStep)
  const navCollapsed = useUIStore((s) => s.navCollapsed)
  const data = useResumeStore((s) => s.data)

  const lastResult = useOptimizationStore((s) => s.lastResult)

  const completion = getSectionCompletion(data)
  const progress = getOverallProgress(data)
  const issueCount = lastResult?.summary.totalIssues ?? 0

  return (
    <nav
      aria-label="简历分区导航"
      className={`flex shrink-0 flex-col border-r border-outline bg-surface py-3 transition-[width] duration-[var(--duration-base)] ease-[var(--ease-standard)] ${
        navCollapsed ? 'w-[72px] px-2' : 'w-[248px] px-3'
      }`}
    >
      <ul className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        {FORM_STEPS.map((step) => {
          const isActive = currentStep === step.index
          const isDone = completion[step.key]
          const showBadge = step.key === 'optimization' && issueCount > 0

          return (
            <li key={step.key}>
              <button
                onClick={() => setCurrentStep(step.index)}
                title={navCollapsed ? step.label : undefined}
                aria-current={isActive ? 'step' : undefined}
                className={`group relative flex w-full items-center rounded-full text-sm transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]
                  ${navCollapsed ? 'h-11 justify-center' : 'h-11 gap-4 px-4'}
                  ${
                    isActive
                      ? 'bg-brand-soft font-medium text-brand'
                      : 'text-ink-2 hover:bg-hover hover:text-ink'
                  }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-brand' : 'text-ink-3 group-hover:text-ink-2'}`}>
                  {SECTION_ICON[step.key]}
                </span>

                {!navCollapsed && <span className="flex-1 truncate text-left">{step.label}</span>}

                {!navCollapsed && showBadge && (
                  <span className="shrink-0 rounded-full bg-danger-soft px-1.5 py-0.5 text-[11px] font-medium text-danger">
                    {issueCount}
                  </span>
                )}

                {!navCollapsed && isDone && !showBadge && (
                  <span className="shrink-0 text-success" title="已完成">
                    <IconCheck size={16} />
                  </span>
                )}

                {/* 折叠态：用右上角小圆点提示完成 / 问题数 */}
                {navCollapsed && (isDone || showBadge) && (
                  <span
                    className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full ${
                      showBadge ? 'bg-danger' : 'bg-success'
                    }`}
                  />
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {/* 底部：整体完成度 */}
      <div className={`mt-3 border-t border-outline pt-3 ${navCollapsed ? 'px-1' : 'px-1'}`}>
        {navCollapsed ? (
          <div className="flex flex-col items-center gap-1.5" title={`已完成 ${progress.done}/${progress.total}`}>
            <div className="relative h-1.5 w-9 overflow-hidden rounded-full bg-outline">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-decelerate)]"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
            <span className="text-[10px] text-ink-3">{progress.pct}%</span>
          </div>
        ) : (
          <>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-xs text-ink-2">填写进度</span>
              <span className="text-xs text-ink-3">
                {progress.done}/{progress.total}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-outline">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-decelerate)]"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
