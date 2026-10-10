import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 步骤表。
 *
 * `kind` 是刻意放进数据里的，而不是在各处写「不等于某几个 key」的黑名单 ——
 * 每多一个工具步骤就要多改一处判断，早晚漏掉。现在只需读这一列：
 * - `content`：简历内容，计入填写进度
 * - `tool`：工具与帮助，不计入
 *
 * 注意：key 与顺序被 OptimizationForm 的「跳转到分区」依赖，
 * 必须与 types/optimization.ts 的 SectionKey 一致。
 */
export const FORM_STEPS = [
  { index: 0, label: '个人信息', key: 'personalInfo', kind: 'content' },
  { index: 1, label: '教育经历', key: 'education', kind: 'content' },
  { index: 2, label: '工作经历', key: 'workExperience', kind: 'content' },
  { index: 3, label: '技能特长', key: 'skills', kind: 'content' },
  { index: 4, label: '项目经历', key: 'projects', kind: 'content' },
  { index: 5, label: '自我评价', key: 'summary', kind: 'content' },
  { index: 6, label: '简历检查', key: 'optimization', kind: 'tool' },
  { index: 7, label: '帮助与反馈', key: 'support', kind: 'tool' }
] as const

export type StepKey = (typeof FORM_STEPS)[number]['key']
export type FormStepKey = StepKey

export const stepIndex = (key: StepKey): number => FORM_STEPS.findIndex((s) => s.key === key)

interface UIStore {
  currentStep: number
  previewScale: number // 25 - 200
  isAutoSaved: boolean
  lastSavedAt: string | null

  /** 左侧导航是否折叠为图标栏 */
  navCollapsed: boolean
  /** 编辑器占内容区的宽度百分比 */
  editorWidthPct: number
  /** 专注预览：折叠编辑器，预览占满 */
  isFocusMode: boolean
  /** 预览是否跟随容器宽度自适应 */
  fitToWidth: boolean
  /** 上次启动时见过的版本号 —— 用于判断要不要弹「本次更新」 */
  lastSeenVersion: string
  /** 帮助与反馈模块当前选中的分段（不持久化，仅用于跨组件跳转） */
  helpView: string

  setCurrentStep: (step: number) => void
  setPreviewScale: (scale: number) => void
  setIsAutoSaved: (saved: boolean) => void
  setLastSavedAt: (time: string | null) => void
  toggleNav: () => void
  setEditorWidthPct: (pct: number) => void
  toggleFocusMode: () => void
  setFitToWidth: (fit: boolean) => void
  setLastSeenVersion: (version: string) => void
  setHelpView: (view: string) => void
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      currentStep: 0,
      previewScale: 100,
      isAutoSaved: true,
      lastSavedAt: null,
      navCollapsed: false,
      editorWidthPct: 52,
      isFocusMode: false,
      // 默认适应宽度：100% 缩放时 A4（794px）通常比预览区宽，
      // 会让简历右侧被裁掉。先自适应，用户主动缩放时再切回固定比例。
      fitToWidth: true,
      lastSeenVersion: '',
      helpView: 'faq',

      setCurrentStep: (step) => set({ currentStep: step }),
      setPreviewScale: (scale) => set({ previewScale: clamp(scale, 25, 200), fitToWidth: false }),
      setIsAutoSaved: (saved) => set({ isAutoSaved: saved }),
      setLastSavedAt: (time) => set({ lastSavedAt: time }),
      toggleNav: () => set((s) => ({ navCollapsed: !s.navCollapsed })),
      setEditorWidthPct: (pct) => set({ editorWidthPct: clamp(pct, 25, 75) }),
      toggleFocusMode: () => set((s) => ({ isFocusMode: !s.isFocusMode })),
      setFitToWidth: (fit) => set({ fitToWidth: fit }),
      setLastSeenVersion: (version) => set({ lastSeenVersion: version }),
      setHelpView: (view) => set({ helpView: view })
    }),
    {
      name: 'resume-craft-ui',
      // 只持久化布局偏好，不持久化瞬时状态
      partialize: (s) => ({
        navCollapsed: s.navCollapsed,
        editorWidthPct: s.editorWidthPct,
        previewScale: s.previewScale,
        fitToWidth: s.fitToWidth,
        lastSeenVersion: s.lastSeenVersion
      })
    }
  )
)
