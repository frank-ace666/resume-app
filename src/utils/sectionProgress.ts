import type { ResumeData } from '@/types/resume'
import { FORM_STEPS } from '@/store/uiStore'

/**
 * 各分区的「是否已填写」判断 —— 用于左侧导航的完成状态与整体进度条。
 * 判定刻意宽松：只区分「空」与「有内容」，不做质量判断（质量交给简历检查模块）。
 */
export function getSectionCompletion(data: ResumeData): Record<string, boolean> {
  const { personalInfo, education, workExperience, skills, projects, summary } = data

  const has = (s: string | undefined) => Boolean(s && s.trim())

  return {
    personalInfo: has(personalInfo.fullName) && (has(personalInfo.email) || has(personalInfo.phone)),
    education: education.some((e) => has(e.school)),
    workExperience: workExperience.some((w) => has(w.company)),
    skills: skills.some((s) => has(s.name)),
    projects: projects.some((p) => has(p.name)),
    summary: has(summary),
    optimization: false // 由 NavDrawer 依据检查结果单独处理
  }
}

/** 已完成的分区数 / 需要填写的分区总数（不含「简历检查」与「帮助与反馈」） */
export function getOverallProgress(data: ResumeData): { done: number; total: number; pct: number } {
  const completion = getSectionCompletion(data)
  const editableKeys = FORM_STEPS.filter(
    (s) => s.key !== 'optimization' && s.key !== 'support'
  ).map((s) => s.key as string)
  const done = editableKeys.filter((k) => completion[k]).length
  const total = editableKeys.length
  return { done, total, pct: Math.round((done / total) * 100) }
}
