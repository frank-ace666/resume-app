import type { ResumeData } from '@/types/resume'
import { FORM_STEPS, type StepKey } from '@/store/uiStore'

/**
 * 各内容分区是否已填写 —— 供左侧导航的完成状态与整体进度条使用。
 * 判定刻意宽松：只区分「空」与「有内容」，质量判断交给简历检查模块。
 *
 * 只返回 `kind === 'content'` 的分区。「简历检查」「帮助与反馈」这类工具步骤
 * 没有「填完」的概念，**不出现在结果里**，调用方用 `undefined` 自然落到「未完成」，
 * 不需要在这里塞一个假的 false 再让调用方特判。
 */
export function getSectionCompletion(data: ResumeData): Partial<Record<StepKey, boolean>> {
  const has = (s: string | undefined) => Boolean(s?.trim())
  const { personalInfo, education, workExperience, skills, projects, summary } = data

  return {
    personalInfo:
      has(personalInfo.fullName) && (has(personalInfo.email) || has(personalInfo.phone)),
    education: education.some((e) => has(e.school)),
    workExperience: workExperience.some((w) => has(w.company)),
    skills: skills.some((s) => has(s.name)),
    projects: projects.some((p) => has(p.name)),
    summary: has(summary)
  }
}

const CONTENT_STEPS = FORM_STEPS.filter((s) => s.kind === 'content')

/** 已完成的内容分区数 / 内容分区总数 */
export function getOverallProgress(data: ResumeData): { done: number; total: number; pct: number } {
  const completion = getSectionCompletion(data)
  const done = CONTENT_STEPS.filter((s) => completion[s.key]).length
  const total = CONTENT_STEPS.length
  return { done, total, pct: Math.round((done / total) * 100) }
}
