// ===== 个人信息 =====
export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  title: string // 求职意向/头衔
  website?: string
  linkedin?: string
  github?: string
  avatar?: string // base64 头像
}

// ===== 教育经历 =====
export interface Education {
  id: string
  school: string
  degree: string // 学士/硕士/博士
  major: string
  startDate: string // "YYYY-MM"
  endDate: string
  gpa?: string
  description?: string
}

// ===== 工作经历 =====
export interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  isCurrent: boolean
  location?: string
  description: string
  achievements: string[]
}

// ===== 技能特长 =====
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Skill {
  id: string
  name: string
  level: SkillLevel
  category: string
}

// ===== 项目经历 =====
export interface Project {
  id: string
  name: string
  role?: string
  startDate: string
  endDate?: string
  description: string
  technologies: string[]
  link?: string
  highlights: string[]
}

// ===== 简历顶层结构 =====
export interface ResumeData {
  meta: {
    templateId: string // 'classic' | 'modern' | 'minimal'
    updatedAt: string
    version: number
    /** 简历强调色（hex）。应用 UI 与简历模板共用同一个值。 */
    accentColor: string
  }
  personalInfo: PersonalInfo
  summary: string
  education: Education[]
  workExperience: WorkExperience[]
  skills: Skill[]
  projects: Project[]
}

/** 默认强调色：深蓝，金融/互联网通用且灰度打印可读 */
export const DEFAULT_ACCENT = '#1a73e8'

/** 当前数据结构版本。新增字段时递增，并在 normalizeResumeData 中补默认值。 */
export const DATA_VERSION = 2

// ===== 空简历工厂函数 =====
export function createEmptyResume(): ResumeData {
  return {
    meta: {
      templateId: 'classic',
      updatedAt: new Date().toISOString(),
      version: DATA_VERSION,
      accentColor: DEFAULT_ACCENT
    },
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      title: ''
    },
    summary: '',
    education: [],
    workExperience: [],
    skills: [],
    projects: []
  }
}

/**
 * 把任意来源（旧版本存档 / 用户手改的 JSON）补齐为完整的 ResumeData。
 * 旧文件缺少 meta.accentColor 等新字段时必须回退到默认值，而不是让模板拿到 undefined。
 */
export function normalizeResumeData(raw: unknown): ResumeData {
  const base = createEmptyResume()
  if (!raw || typeof raw !== 'object') return base

  const input = raw as Partial<ResumeData>
  const meta = (input.meta ?? {}) as Partial<ResumeData['meta']>
  const info = (input.personalInfo ?? {}) as Partial<PersonalInfo>

  const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

  return {
    meta: {
      templateId: typeof meta.templateId === 'string' ? meta.templateId : base.meta.templateId,
      updatedAt: typeof meta.updatedAt === 'string' ? meta.updatedAt : base.meta.updatedAt,
      version: DATA_VERSION,
      accentColor: typeof meta.accentColor === 'string' ? meta.accentColor : DEFAULT_ACCENT
    },
    personalInfo: {
      fullName: info.fullName ?? '',
      email: info.email ?? '',
      phone: info.phone ?? '',
      location: info.location ?? '',
      title: info.title ?? '',
      website: info.website,
      linkedin: info.linkedin,
      github: info.github,
      avatar: info.avatar
    },
    summary: typeof input.summary === 'string' ? input.summary : '',
    education: arr<Education>(input.education).map((e) => ({
      id: e.id || crypto.randomUUID(),
      school: e.school ?? '',
      degree: e.degree ?? '',
      major: e.major ?? '',
      startDate: e.startDate ?? '',
      endDate: e.endDate ?? '',
      gpa: e.gpa,
      description: e.description
    })),
    workExperience: arr<WorkExperience>(input.workExperience).map((w) => ({
      id: w.id || crypto.randomUUID(),
      company: w.company ?? '',
      position: w.position ?? '',
      startDate: w.startDate ?? '',
      endDate: w.endDate ?? '',
      isCurrent: Boolean(w.isCurrent),
      location: w.location,
      description: w.description ?? '',
      achievements: Array.isArray(w.achievements) ? w.achievements : []
    })),
    skills: arr<Skill>(input.skills).map((s) => ({
      id: s.id || crypto.randomUUID(),
      name: s.name ?? '',
      level: s.level ?? 'intermediate',
      category: s.category ?? ''
    })),
    projects: arr<Project>(input.projects).map((p) => ({
      id: p.id || crypto.randomUUID(),
      name: p.name ?? '',
      role: p.role,
      startDate: p.startDate ?? '',
      endDate: p.endDate,
      description: p.description ?? '',
      technologies: Array.isArray(p.technologies) ? p.technologies : [],
      link: p.link,
      highlights: Array.isArray(p.highlights) ? p.highlights : []
    }))
  }
}
