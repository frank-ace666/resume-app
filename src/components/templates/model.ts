import type { ResumeData, Skill } from '@/types/resume'
import { ensureContrastOnWhite } from '@/utils/color'

/**
 * 简历渲染模型。
 *
 * 为什么要有这一层：模板此前各自判断「这条经历是不是空的」「日期怎么拼」
 * 「联系方式怎么拼」—— 同一个决定做了七遍，改一处忘六处是迟早的事。
 *
 * 这里把**归一化**（剔除空值、拼好日期、给联系方式加标签、技能分组）做一次，
 * 模板退化为纯摆放。注意边界：**归一化进模型，排版留在模板** ——
 * 各模板怎么摆是刻意的差异，不该被统一。
 *
 * 于是模板里的 `if (!x) return null`、`nonEmpty()`、`?.trim()` 全部消失：
 * 拿到的数组里没有空条目，字段都是可渲染的字符串。
 */

export interface AccentColors {
  /** 用于文字/实心块，已保证白底对比度 ≥ 4.5:1 */
  text: string
  /** 原始强调色，用于细线、标签底色等装饰 */
  raw: string
}

export interface WorkEntry {
  id: string
  company: string
  position: string
  location: string
  /** 已拼好的时间区间，如 `2021.07 – 至今`；两侧都没值时为空串 */
  range: string
  description: string
  bullets: string[]
  /** 职位 · 地点 的合并行，供把职位放在公司下方一行的版式使用（不含时间，时间另有 range） */
  roleLine: string
}

export interface ProjectEntry {
  id: string
  name: string
  role: string
  range: string
  link: string
  description: string
  bullets: string[]
  /** 已用「、」拼好的技术栈；空数组时为空串 */
  tech: string
}

export interface EducationEntry {
  id: string
  school: string
  /** 学历 · 专业 */
  detail: string
  /** 时间区间，已含 GPA（三者排版一致，故合为一处） */
  meta: string
  description: string
}

export interface SkillGroup {
  category: string
  items: { id: string; name: string }[]
}

/**
 * 联系方式条目。
 *
 * 模板不再直接渲染裸值 —— 只写「13800138000」的话，招聘方无法判断这是电话、
 * 微信还是传真。标签由模型统一给出，模板只负责摆放。
 */
export interface ContactItem {
  id: string
  label: string
  value: string
}

export interface ResumeModel {
  name: string
  jobTitle: string
  avatar: string
  contacts: ContactItem[]
  summary: string
  accent: AccentColors
  work: WorkEntry[]
  projects: ProjectEntry[]
  education: EducationEntry[]
  skillGroups: SkillGroup[]
  /** 除个人信息外完全没有内容 —— 用于模板显示占位提示 */
  isBlank: boolean
}

/** 中文简历惯例：统一 `2023.09 – 2024.06`，在职显示「至今」 */
function formatRange(start: string, end: string, isCurrent = false): string {
  const s = start.trim().replace(/-/g, '.')
  const e = isCurrent ? '至今' : end.trim().replace(/-/g, '.')
  if (s && e) return `${s} – ${e}`
  return s || e
}

/** 剔除空串，杜绝模板里出现空行 */
function clean(items: (string | undefined)[]): string[] {
  return items.map((v) => (v ?? '').trim()).filter(Boolean)
}

/**
 * 按分类聚合；空技能名跳过，无分类归入「其他」。
 * 只依赖技能数组本身（而非整份 ResumeData），编辑器侧也能直接复用。
 */
export function groupSkills(skills: Skill[]): SkillGroup[] {
  const map = new Map<string, SkillGroup['items']>()
  for (const s of skills) {
    const name = s.name?.trim()
    if (!name) continue
    const category = s.category?.trim() || '其他'
    if (!map.has(category)) map.set(category, [])
    map.get(category)!.push({ id: s.id, name })
  }
  return Array.from(map, ([category, items]) => ({ category, items }))
}

function buildContacts(data: ResumeData): ContactItem[] {
  const p = data.personalInfo
  const items: ContactItem[] = []

  const push = (id: string, label: string, raw?: string) => {
    const value = raw?.trim()
    if (value) items.push({ id, label, value })
  }

  // 国内求职顺序：电话、邮箱、微信、所在地
  push('builtin-phone', '电话', p.phone)
  push('builtin-email', '邮箱', p.email)
  push('builtin-wechat', '微信', p.wechat)
  push('builtin-location', '所在地', p.location)

  // 自定义项（QQ、作品集…）放在国内常用信息之后、国际平台之前
  const hasWechat = Boolean(p.wechat?.trim())
  const isWechatLabel = (label: string) => /^(微信|微信号|wechat)$/i.test(label.trim())

  for (const f of p.customFields ?? []) {
    const value = f.value?.trim()
    if (!value) continue
    // normalize 已把旧自定义微信提升为主字段；这里再防一次瞬时重复
    if (hasWechat && isWechatLabel(f.label)) continue
    // 去掉用户手写的尾部冒号，避免渲染成「微信：：abc」
    const label = f.label?.trim().replace(/[：:]+$/, '') || '其他'
    items.push({ id: f.id, label, value })
  }

  push('builtin-website', '个人网站', p.website)
  // GitHub 既接受用户名也接受完整链接
  push(
    'builtin-github',
    'GitHub',
    p.github
      ? `github.com/${p.github
          .trim()
          .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
          .replace(/\/+$/, '')}`
      : ''
  )

  // 完全相同的「标签 + 值」只保留一条（例如旧数据里重复导入）
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.label}\u0000${item.value}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function buildResumeModel(data: ResumeData): ResumeModel {
  const p = data.personalInfo

  const work: WorkEntry[] = data.workExperience
    .filter((w) => w.company?.trim())
    .map((w) => {
      const position = w.position?.trim() ?? ''
      const location = w.location?.trim() ?? ''
      const range = formatRange(w.startDate, w.endDate, w.isCurrent)
      return {
        id: w.id,
        company: w.company.trim(),
        position,
        location,
        range,
        description: w.description?.trim() ?? '',
        bullets: clean(w.achievements),
        roleLine: clean([position, location]).join(' · ')
      }
    })

  const projects: ProjectEntry[] = data.projects
    .filter((x) => x.name?.trim())
    .map((x) => {
      const tech = clean(x.technologies)
      return {
        id: x.id,
        name: x.name.trim(),
        role: x.role?.trim() ?? '',
        range: formatRange(x.startDate, x.endDate ?? ''),
        link: x.link?.trim() ?? '',
        description: x.description?.trim() ?? '',
        bullets: clean(x.highlights),
        tech: tech.join('、')
      }
    })

  const education: EducationEntry[] = data.education
    .filter((e) => e.school?.trim())
    .map((e) => {
      const range = formatRange(e.startDate, e.endDate)
      const gpa = e.gpa?.trim()
      return {
        id: e.id,
        school: e.school.trim(),
        detail: clean([e.degree, e.major]).join(' · '),
        meta: gpa ? `${range}  ·  GPA ${gpa}` : range,
        description: e.description?.trim() ?? ''
      }
    })

  const accentRaw = data.meta.accentColor || '#1a73e8'

  return {
    name: p.fullName?.trim() || '你的姓名',
    jobTitle: p.title?.trim() ?? '',
    avatar: p.avatar?.trim() ?? '',
    contacts: buildContacts(data),
    summary: data.summary?.trim() ?? '',
    accent: { raw: accentRaw, text: ensureContrastOnWhite(accentRaw, 4.5) },
    work,
    projects,
    education,
    skillGroups: groupSkills(data.skills),
    isBlank:
      !data.summary?.trim() &&
      work.length === 0 &&
      projects.length === 0 &&
      education.length === 0 &&
      data.skills.length === 0
  }
}
