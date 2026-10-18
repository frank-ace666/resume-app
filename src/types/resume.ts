import { isTemplateId, type TemplateId } from './templateIds'

// ===== 个人信息 =====

/**
 * 自定义联系项的类型。用户自己决定字段叫什么，但**类型由程序提供** ——
 * 校验规则跟着类型走，否则"用户随便加字段"就等于"没有任何校验"。
 */
export type ContactKind = 'text' | 'number' | 'phone' | 'email' | 'url' | 'account'

/** 运行时校验用（normalizeResumeData 需要判断 kind 是否合法） */
export const CONTACT_KINDS: ContactKind[] = [
  'text',
  'number',
  'phone',
  'email',
  'url',
  'account'
]

export interface CustomField {
  id: string
  /** 用户可见的名称，如「QQ」「微信」「作品集」 */
  label: string
  value: string
  kind: ContactKind
}

export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  /** 微信号。国内求职通常与手机号并列，作为主要联系方式。 */
  wechat?: string
  location: string
  title: string // 求职意向/头衔
  website?: string
  github?: string
  avatar?: string // base64 头像
  /** 用户自定义的联系项（QQ、作品集…）。旧版可能还存有「微信」，normalize 会归位。 */
  customFields?: CustomField[]
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
/**
 * 技能只记录名称与分类。熟练度（入门/熟练/精通/专家）没有客观标准，
 * 也容易被招聘方视为套话，因此不再作为数据字段。
 */
export interface Skill {
  id: string
  name: string
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
    templateId: TemplateId
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
export const DATA_VERSION = 3

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
      wechat: '',
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
 *
 * v3 迁移：
 * - 技能删除 level（旧值直接丢弃，技能名称保留）。
 * - linkedin 字段删除，非空值转成「LinkedIn」自定义联系项。
 * - 旧版通过自定义字段添加的「微信」提升为 personalInfo.wechat，并去掉重复项。
 */
export function normalizeResumeData(raw: unknown): ResumeData {
  const base = createEmptyResume()
  if (!raw || typeof raw !== 'object') return base

  const input = raw as Partial<ResumeData>
  const meta = (input.meta ?? {}) as Partial<ResumeData['meta']>
  // linkedin 已从 PersonalInfo 移除，但旧存档里仍可能存在
  const info = (input.personalInfo ?? {}) as Partial<PersonalInfo> & { linkedin?: unknown }

  const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

  const rawCustomFields: CustomField[] = arr<CustomField>(info.customFields)
    .filter((f) => f && typeof f.label === 'string')
    .map((f) => ({
      id: f.id || crypto.randomUUID(),
      label: f.label ?? '',
      value: f.value ?? '',
      // 手改过的 JSON 里 kind 也可能是非法值
      kind: CONTACT_KINDS.includes(f.kind) ? f.kind : 'text'
    }))

  // 旧版把微信放在自定义字段里；提升为主字段，避免与新的微信输入框重复
  const isWechatLabel = (label: string) => /^(微信|微信号|wechat)$/i.test(label.trim())
  const legacyWechat = rawCustomFields.find((f) => isWechatLabel(f.label) && f.value.trim())
  const wechat =
    (typeof info.wechat === 'string' ? info.wechat.trim() : '') ||
    legacyWechat?.value.trim() ||
    ''
  const customFields = rawCustomFields.filter((f) => !isWechatLabel(f.label))

  // 旧版 LinkedIn：降级为自定义联系项，值本身不丢
  const legacyLinkedin = typeof info.linkedin === 'string' ? info.linkedin.trim() : ''
  if (legacyLinkedin) {
    const alreadyImported = customFields.some(
      (f) => f.label.trim().toLowerCase() === 'linkedin' && f.value.trim() === legacyLinkedin
    )
    if (!alreadyImported) {
      customFields.push({
        id: crypto.randomUUID(),
        label: 'LinkedIn',
        value: legacyLinkedin,
        kind: /^https?:\/\//i.test(legacyLinkedin) ? 'url' : 'text'
      })
    }
  }

  return {
    meta: {
      templateId: isTemplateId(meta.templateId) ? meta.templateId : base.meta.templateId,
      updatedAt: typeof meta.updatedAt === 'string' ? meta.updatedAt : base.meta.updatedAt,
      version: DATA_VERSION,
      accentColor: typeof meta.accentColor === 'string' ? meta.accentColor : DEFAULT_ACCENT
    },
    personalInfo: {
      fullName: info.fullName ?? '',
      email: info.email ?? '',
      phone: info.phone ?? '',
      wechat,
      location: info.location ?? '',
      title: info.title ?? '',
      website: info.website,
      github: info.github,
      avatar: info.avatar,
      customFields
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
    skills: arr<Skill & { level?: unknown }>(input.skills).map((s) => ({
      id: s.id || crypto.randomUUID(),
      name: s.name ?? '',
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
