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
import { createEmptyResume, normalizeResumeData } from '@/types/resume'

interface ResumeStore {
  data: ResumeData
  fileName: string
  isDirty: boolean

  updatePersonalInfo: (info: Partial<PersonalInfo>) => void
  updateSummary: (summary: string) => void
  setTemplate: (templateId: string) => void
  setAccentColor: (color: string) => void

  addEducation: () => void
  updateEducation: (id: string, edu: Partial<Education>) => void
  removeEducation: (id: string) => void

  addWorkExperience: () => void
  updateWorkExperience: (id: string, work: Partial<WorkExperience>) => void
  removeWorkExperience: (id: string) => void

  addSkill: () => void
  updateSkill: (id: string, skill: Partial<Skill>) => void
  removeSkill: (id: string) => void

  addProject: () => void
  updateProject: (id: string, proj: Partial<Project>) => void
  removeProject: (id: string) => void

  loadData: (data: ResumeData, fileName?: string) => void
  resetData: () => void
  setFileName: (name: string) => void
  setDirty: (dirty: boolean) => void
}

const uuid = () => crypto.randomUUID()

/**
 * 修改简历内容时的**唯一出口**。
 *
 * 以前每个 action 都自己拼一遍 `meta: { ...s.data.meta, updatedAt: … }` 并置 isDirty ——
 * 同一件事写了十几遍，漏一处时间戳就不会更新。现在只在这里做一次。
 */
function edited(
  state: Pick<ResumeStore, 'data'>,
  next: Partial<ResumeData>
): Pick<ResumeStore, 'data' | 'isDirty'> {
  return {
    data: {
      ...state.data,
      ...next,
      meta: { ...state.data.meta, updatedAt: new Date().toISOString() }
    },
    isDirty: true
  }
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      data: createEmptyResume(),
      fileName: '',
      isDirty: false,

      updatePersonalInfo: (info) =>
        set((s) => edited(s, { personalInfo: { ...s.data.personalInfo, ...info } })),

      updateSummary: (summary) => set((s) => edited(s, { summary })),

      setTemplate: (templateId) =>
        set((s) => edited(s, { meta: { ...s.data.meta, templateId } })),

      setAccentColor: (accentColor) =>
        set((s) => edited(s, { meta: { ...s.data.meta, accentColor } })),

      // ===== 教育经历 =====
      addEducation: () =>
        set((s) =>
          edited(s, {
            education: [
              ...s.data.education,
              { id: uuid(), school: '', degree: '', major: '', startDate: '', endDate: '' }
            ]
          })
        ),
      updateEducation: (id, edu) =>
        set((s) =>
          edited(s, {
            education: s.data.education.map((e) => (e.id === id ? { ...e, ...edu } : e))
          })
        ),
      removeEducation: (id) =>
        set((s) => edited(s, { education: s.data.education.filter((e) => e.id !== id) })),

      // ===== 工作经历 =====
      addWorkExperience: () =>
        set((s) =>
          edited(s, {
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
            ]
          })
        ),
      updateWorkExperience: (id, work) =>
        set((s) =>
          edited(s, {
            workExperience: s.data.workExperience.map((w) =>
              w.id === id ? { ...w, ...work } : w
            )
          })
        ),
      removeWorkExperience: (id) =>
        set((s) =>
          edited(s, { workExperience: s.data.workExperience.filter((w) => w.id !== id) })
        ),

      // ===== 技能 =====
      addSkill: () =>
        set((s) =>
          edited(s, {
            skills: [...s.data.skills, { id: uuid(), name: '', level: 'intermediate', category: '' }]
          })
        ),
      updateSkill: (id, skill) =>
        set((s) =>
          edited(s, { skills: s.data.skills.map((k) => (k.id === id ? { ...k, ...skill } : k)) })
        ),
      removeSkill: (id) =>
        set((s) => edited(s, { skills: s.data.skills.filter((k) => k.id !== id) })),

      // ===== 项目经历 =====
      addProject: () =>
        set((s) =>
          edited(s, {
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
            ]
          })
        ),
      updateProject: (id, proj) =>
        set((s) =>
          edited(s, { projects: s.data.projects.map((p) => (p.id === id ? { ...p, ...proj } : p)) })
        ),
      removeProject: (id) =>
        set((s) => edited(s, { projects: s.data.projects.filter((p) => p.id !== id) })),

      // ===== 文件操作（不改内容，因此不走 edited）=====
      loadData: (data, fileName) =>
        set({
          // 旧版本存档或手改过的 JSON 可能缺字段，统一补齐后再入库
          data: normalizeResumeData(data),
          fileName: fileName || '',
          isDirty: false
        }),

      resetData: () => set({ data: createEmptyResume(), fileName: '', isDirty: false }),

      setFileName: (fileName) => set({ fileName }),
      setDirty: (isDirty) => set({ isDirty })
    }),
    {
      name: 'resume-craft-data',
      partialize: (state) => ({ data: state.data, fileName: state.fileName }),
      // localStorage 里的旧结构同样是「缺字段」来源，合并时一并补齐
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ResumeStore>
        return { ...current, ...p, data: normalizeResumeData(p.data) }
      }
    }
  )
)
