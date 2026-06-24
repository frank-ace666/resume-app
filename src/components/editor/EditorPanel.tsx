import TemplateSelector from './TemplateSelector'
import FormNavigation from './FormNavigation'
import PersonalInfoForm from './forms/PersonalInfoForm'
import EducationForm from './forms/EducationForm'
import WorkExperienceForm from './forms/WorkExperienceForm'
import SkillsForm from './forms/SkillsForm'
import ProjectsForm from './forms/ProjectsForm'
import SummaryForm from './forms/SummaryForm'
import OptimizationForm from './forms/OptimizationForm'
import { useUIStore } from '@/store/uiStore'

export default function EditorPanel() {
  const currentStep = useUIStore((s) => s.currentStep)

  return (
    <section className="w-[58%] min-w-[400px] overflow-y-auto bg-white border-r border-slate-200 p-6">
      {/* 步骤 6（简历检查）不显示模板选择器和导航 */}
      {currentStep !== 6 && (
        <>
          <TemplateSelector />
          <FormNavigation />
        </>
      )}

      {/* 当前步骤表单 */}
      <div className={currentStep !== 6 ? 'mt-2' : ''}>
        {currentStep === 0 && <PersonalInfoForm />}
        {currentStep === 1 && <EducationForm />}
        {currentStep === 2 && <WorkExperienceForm />}
        {currentStep === 3 && <SkillsForm />}
        {currentStep === 4 && <ProjectsForm />}
        {currentStep === 5 && <SummaryForm />}
        {currentStep === 6 && <OptimizationForm />}
      </div>
    </section>
  )
}
