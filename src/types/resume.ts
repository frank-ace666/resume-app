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
  }
  personalInfo: PersonalInfo
  summary: string
  education: Education[]
  workExperience: WorkExperience[]
  skills: Skill[]
  projects: Project[]
}

// ===== 空简历工厂函数 =====
export function createEmptyResume(): ResumeData {
  return {
    meta: {
      templateId: 'classic',
      updatedAt: new Date().toISOString(),
      version: 1
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
