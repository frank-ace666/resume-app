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
import { useUIStore, FORM_STEPS } from '@/store/uiStore'

export default function EditorPanel() {
  const currentStep = useUIStore((s) => s.currentStep)
  const stepLabel = FORM_STEPS[currentStep]?.label ?? ''

  return (
    <section className="flex h-full flex-col bg-canvas">
      {/* 吸顶分区标题 */}
      <div className="sticky top-0 z-20 flex h-12 shrink-0 items-center border-b border-outline bg-surface px-6">
        <h2 className="text-sm font-medium text-ink">{stepLabel}</h2>
        <span className="ml-2 text-xs text-ink-3">
          {currentStep + 1} / {FORM_STEPS.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* 简历检查分区不显示外观设置 */}
        {currentStep !== 6 && (
          <Card className="mb-6 space-y-4 p-4">
            <TemplateSelector />
            <div className="h-px bg-outline" />
            <AccentPicker />
          </Card>
        )}

        {/* key 触发分区切换的进入动画 */}
        <div key={currentStep} className="anim-fade-slide-in">
          {currentStep === 0 && <PersonalInfoForm />}
          {currentStep === 1 && <EducationForm />}
          {currentStep === 2 && <WorkExperienceForm />}
          {currentStep === 3 && <SkillsForm />}
          {currentStep === 4 && <ProjectsForm />}
          {currentStep === 5 && <SummaryForm />}
          {currentStep === 6 && <OptimizationForm />}
        </div>
      </div>
    </section>
  )
}
