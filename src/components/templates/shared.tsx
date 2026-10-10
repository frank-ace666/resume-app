import type { ResumeData, Skill, SkillLevel } from '@/types/resume'
import { ensureContrastOnWhite } from '@/utils/color'

/* ============================================================
   简历文档排版尺度
   ------------------------------------------------------------
   调研共性：姓名 18–22pt / 分区标题 14–16pt / 正文 10–12pt，
   行高 1.4–1.5，分区间距 > 条目间距，页边距约 1 inch。
   这里统一用 px（A4 下 1pt ≈ 1.333px），三套模板共用，避免各写各的。
   ============================================================ */
export const TYPE = {
  name: 'text-[22px] font-bold leading-[1.2]',
  jobTitle: 'text-[13px] leading-snug',
  contact: 'text-[11.5px] leading-snug',
  sectionTitle: 'text-[13px] font-bold leading-snug',
  entryTitle: 'text-[14px] font-semibold leading-snug',
  entryMeta: 'text-[12.5px] leading-snug',
  body: 'text-[13px] leading-[1.55]',
  meta: 'text-[11.5px] leading-snug'
} as const

/** 页边距：约 1 inch = 25.4mm，取 16mm 兼顾中文简历的信息密度 */
export const PAGE_PADDING = '16mm'

/* ============================================================
   打印安全色板 —— 模板内所有颜色必须取自这里
   ------------------------------------------------------------
   两条硬性约束，违反任何一条都会让 PDF 导出直接抛错：

   1. 不能用 Tailwind 调色板类（text-slate-700、border-slate-200 …）。
      Tailwind v4 的默认调色板全部编译成 oklch()，而 html2canvas 1.4
      不认识 oklch，解析颜色时会抛错。实测捕获子树里出现过 448 处。
   2. 不能用透明度修饰符（text-white/90、bg-black/5）。
      它们会编译成 color-mix(in oklab, …)，同样不被支持。
      需要半透明就写 rgba()。

   颜色一律走 inline style 而不是 Tailwind 任意值类，是因为调色板要集中
   在这里维护 —— Tailwind 的扫描器读不到由常量拼出来的类名。
   ============================================================ */
export const PRINT = {
  /** 姓名、分区标题 */
  strong: '#111111',
  /** 正文 */
  body: '#222222',
  /** 次要说明（职位、专业） */
  muted: '#555555',
  /** 最弱一级（日期、地点） */
  faint: '#777777',
  /** 分隔线 */
  line: '#cccccc',
  lineSoft: '#e5e5e5',
  /** 侧栏底色 */
  sidebar: '#f5f6f7',
  white: '#ffffff',
  /** 强调色块上的文字 */
  onAccent: 'rgba(255, 255, 255, 0.92)',
  onAccentFaint: 'rgba(255, 255, 255, 0.78)'
} as const

export const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  beginner: '入门',
  intermediate: '熟练',
  advanced: '精通',
  expert: '专家'
}

export interface AccentColors {
  /** 用于文字/实心块，已保证白底对比度 ≥ 4.5:1 */
  text: string
  /** 原始强调色，用于细线、标签底色等装饰 */
  raw: string
}

export function getAccentColors(data: ResumeData): AccentColors {
  const raw = data.meta.accentColor || '#1a73e8'
  return { raw, text: ensureContrastOnWhite(raw, 4.5) }
}

/** 日期区间：中文简历惯例，统一 `2023.09 – 2024.06` 格式 */
export function formatRange(start: string, end: string, isCurrent = false): string {
  const fmt = (v: string) => (v ? v.replace(/-/g, '.') : '')
  const s = fmt(start)
  const e = isCurrent ? '至今' : fmt(end)
  if (!s && !e) return ''
  if (!s) return e
  if (!e) return s
  return `${s} – ${e}`
}

/** 按分类聚合技能；无分类的归入「其他」 */
export function groupSkills(skills: Skill[]): { category: string; items: Skill[] }[] {
  const map = new Map<string, Skill[]>()
  for (const s of skills) {
    if (!s.name?.trim()) continue
    const key = s.category?.trim() || '其他'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  }
  return Array.from(map, ([category, items]) => ({ category, items }))
}

/** 联系方式条目（不含任何图标 —— 图标会被 ATS 解析成乱码） */
export function contactItems(data: ResumeData): string[] {
  const p = data.personalInfo
  return [
    p.phone,
    p.email,
    p.location,
    p.website,
    p.github ? `github.com/${p.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}` : '',
    p.linkedin
  ]
    .map((v) => (v ?? '').trim())
    .filter(Boolean)
}

/** 过滤掉空条目，避免渲染出空的分区或空行 */
export function nonEmpty(items: string[] | undefined): string[] {
  return (items ?? []).map((v) => v?.trim()).filter((v): v is string => Boolean(v))
}

export function hasAnySection(data: ResumeData): boolean {
  return Boolean(
    data.summary?.trim() ||
      data.education.length ||
      data.workExperience.length ||
      data.skills.length ||
      data.projects.length
  )
}
