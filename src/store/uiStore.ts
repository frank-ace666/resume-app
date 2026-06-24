import { create } from 'zustand'

export const FORM_STEPS = [
  { index: 0, label: '个人信息', key: 'personalInfo' },
  { index: 1, label: '教育经历', key: 'education' },
  { index: 2, label: '工作经历', key: 'workExperience' },
  { index: 3, label: '技能特长', key: 'skills' },
  { index: 4, label: '项目经历', key: 'projects' },
  { index: 5, label: '自我评价', key: 'summary' },
  { index: 6, label: '简历检查', key: 'optimization' }
] as const

export type FormStepKey = (typeof FORM_STEPS)[number]['key']

interface UIStore {
  currentStep: number
  previewScale: number // 25 - 200
  isAutoSaved: boolean
  lastSavedAt: string | null

  setCurrentStep: (step: number) => void
  setPreviewScale: (scale: number) => void
  setIsAutoSaved: (saved: boolean) => void
  setLastSavedAt: (time: string | null) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  currentStep: 0,
  previewScale: 100,
  isAutoSaved: true,
  lastSavedAt: null,

  setCurrentStep: (step) => set({ currentStep: step }),
  setPreviewScale: (scale) => set({ previewScale: Math.min(200, Math.max(25, scale)) }),
  setIsAutoSaved: (saved) => set({ isAutoSaved: saved }),
  setLastSavedAt: (time) => set({ lastSavedAt: time })
}))
