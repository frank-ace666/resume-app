import type { FC } from 'react'
import TemplateSelector from './TemplateSelector'
import AccentPicker from './AccentPicker'
import Card from '@/components/ui/Card'
import PersonalInfoForm from './forms/PersonalInfoForm'
import EducationForm from './forms/EducationForm'
import WorkExperienceForm from './forms/WorkExperienceForm'
import SkillsForm from './forms/SkillsForm'
import ProjectsForm from './forms/ProjectsForm'
import SummaryForm from './forms/SummaryForm'
import OptimizationForm from './forms/OptimizationForm'
import HelpForm from './help/HelpForm'
import { useUIStore, FORM_STEPS, type StepKey } from '@/store/uiStore'

/**
 * 步骤 → 表单。用查表代替一串 `currentStep === N && <Form/>`：
 * 加一个步骤只需加一行数据，不用再补一个分支、也不会漏改判断。
 */
const STEP_FORM: Record<StepKey, FC> = {
  personalInfo: PersonalInfoForm,
  education: EducationForm,
  workExperience: WorkExperienceForm,
  skills: SkillsForm,
  projects: ProjectsForm,
  summary: SummaryForm,
  optimization: OptimizationForm,
  support: HelpForm
}

export default function EditorPanel() {
  const currentStep = useUIStore((s) => s.currentStep)
  const step = FORM_STEPS[currentStep] ?? FORM_STEPS[0]
  const Form = STEP_FORM[step.key]

  return (
    <section className="flex h-full flex-col bg-canvas">
      {/* 吸顶分区标题 */}
      <div className="sticky top-0 z-20 flex h-12 shrink-0 items-center border-b border-outline bg-surface px-6">
        <h2 className="text-sm font-medium text-ink">{step.label}</h2>
        <span className="ml-2 text-xs text-ink-3">
          {currentStep + 1} / {FORM_STEPS.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* 外观设置只属于简历内容步骤 */}
        {step.kind === 'content' && (
          <Card className="mb-6 space-y-4 p-4">
            <TemplateSelector />
            <div className="h-px bg-outline" />
            <AccentPicker />
          </Card>
        )}

        {/* key 触发分区切换的进入动画 */}
        <div key={currentStep} className="anim-fade-slide-in">
          <Form />
        </div>
      </div>
    </section>
  )
}
