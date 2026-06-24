import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ResumeData,
  PersonalInfo,
  Education,
  WorkExperience,
  Skill,
  Project
} from '@/types/resume'
import { createEmptyResume } from '@/types/resume'

interface ResumeStore {
  // 数据
  data: ResumeData
  fileName: string
  isDirty: boolean

  // 个人信息
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void

  // 教育经历
  addEducation: () => void
  updateEducation: (id: string, edu: Partial<Education>) => void
  removeEducation: (id: string) => void

  // 工作经历
  addWorkExperience: () => void
  updateWorkExperience: (id: string, work: Partial<WorkExperience>) => void
  removeWorkExperience: (id: string) => void

  // 技能
  addSkill: () => void
  updateSkill: (id: string, skill: Partial<Skill>) => void
  removeSkill: (id: string) => void

  // 项目经历
  addProject: () => void
  updateProject: (id: string, proj: Partial<Project>) => void
  removeProject: (id: string) => void

  // 自我评价
  updateSummary: (summary: string) => void

  // 模板
  setTemplate: (templateId: string) => void

  // 文件操作
  loadData: (data: ResumeData, fileName?: string) => void
  resetData: () => void
  setFileName: (name: string) => void
  setDirty: (dirty: boolean) => void
}

function uuid(): string {
  return crypto.randomUUID()
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      data: createEmptyResume(),
      fileName: '',
      isDirty: false,

      // ===== 个人信息 =====
      updatePersonalInfo: (info) =>
        set((s) => ({
          data: {
            ...s.data,
            personalInfo: { ...s.data.personalInfo, ...info },
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      // ===== 教育经历 =====
      addEducation: () =>
        set((s) => ({
          data: {
            ...s.data,
            education: [
              ...s.data.education,
              {
                id: uuid(),
                school: '',
                degree: '',
                major: '',
                startDate: '',
                endDate: ''
              }
            ],
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      updateEducation: (id, edu) =>
        set((s) => ({
          data: {
            ...s.data,
            education: s.data.education.map((e) =>
              e.id === id ? { ...e, ...edu } : e
            ),
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      removeEducation: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            education: s.data.education.filter((e) => e.id !== id),
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      // ===== 工作经历 =====
      addWorkExperience: () =>
        set((s) => ({
          data: {
            ...s.data,
            workExperience: [
              ...s.data.workExperience,
              {
                id: uuid(),
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
                description: '',
                achievements: ['']
              }
            ],
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      updateWorkExperience: (id, work) =>
        set((s) => ({
          data: {
            ...s.data,
            workExperience: s.data.workExperience.map((w) =>
              w.id === id ? { ...w, ...work } : w
            ),
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      removeWorkExperience: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            workExperience: s.data.workExperience.filter((w) => w.id !== id),
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      // ===== 技能 =====
      addSkill: () =>
        set((s) => ({
          data: {
            ...s.data,
            skills: [
              ...s.data.skills,
              {
                id: uuid(),
                name: '',
                level: 'intermediate',
                category: ''
              }
            ],
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      updateSkill: (id, skill) =>
        set((s) => ({
          data: {
            ...s.data,
            skills: s.data.skills.map((sk) =>
              sk.id === id ? { ...sk, ...skill } : sk
            ),
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      removeSkill: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            skills: s.data.skills.filter((sk) => sk.id !== id),
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      // ===== 项目经历 =====
      addProject: () =>
        set((s) => ({
          data: {
            ...s.data,
            projects: [
              ...s.data.projects,
              {
                id: uuid(),
                name: '',
                startDate: '',
                description: '',
                technologies: [],
                highlights: ['']
              }
            ],
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      updateProject: (id, proj) =>
        set((s) => ({
          data: {
            ...s.data,
            projects: s.data.projects.map((p) =>
              p.id === id ? { ...p, ...proj } : p
            ),
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      removeProject: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            projects: s.data.projects.filter((p) => p.id !== id),
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      // ===== 自我评价 =====
      updateSummary: (summary) =>
        set((s) => ({
          data: {
            ...s.data,
            summary,
            meta: { ...s.data.meta, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      // ===== 模板 =====
      setTemplate: (templateId) =>
        set((s) => ({
          data: {
            ...s.data,
            meta: { ...s.data.meta, templateId, updatedAt: new Date().toISOString() }
          },
          isDirty: true
        })),

      // ===== 文件操作 =====
      loadData: (data, fileName) =>
        set({
          data,
          fileName: fileName || '',
          isDirty: false
        }),

      resetData: () =>
        set({
          data: createEmptyResume(),
          fileName: '',
          isDirty: false
        }),

      setFileName: (name) => set({ fileName: name }),
      setDirty: (dirty) => set({ isDirty: dirty })
    }),
    {
      name: 'resume-craft-data',
      partialize: (state) => ({
        data: state.data,
        fileName: state.fileName
      })
    }
  )
)
