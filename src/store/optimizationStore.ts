import { create } from 'zustand'
import type { ResumeData } from '@/types/resume'
import type { ResumeCheckResult } from '@/types/optimization'
import { checkResume } from '@/utils/resumeChecker'

interface OptimizationStore {
  lastResult: ResumeCheckResult | null
  history: ResumeCheckResult[]
  isChecking: boolean

  runCheck: (data: ResumeData) => void
  clearResult: () => void
}

export const useOptimizationStore = create<OptimizationStore>((set) => ({
  lastResult: null,
  history: [],
  isChecking: false,

  runCheck: (data) => {
    set({ isChecking: true })
    // 使用 setTimeout 避免同步执行阻塞 UI
    setTimeout(() => {
      const result = checkResume(data)
      set((s) => ({
        lastResult: result,
        history: [result, ...s.history].slice(0, 5),
        isChecking: false
      }))
    }, 50)
  },

  clearResult: () => set({ lastResult: null })
}))
