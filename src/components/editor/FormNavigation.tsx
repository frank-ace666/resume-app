import { useUIStore, FORM_STEPS } from '@/store/uiStore'

export default function FormNavigation() {
  const currentStep = useUIStore((s) => s.currentStep)
  const setCurrentStep = useUIStore((s) => s.setCurrentStep)

  return (
    <nav className="flex gap-1 mb-6 border-b border-slate-200">
      {FORM_STEPS.map((step) => (
        <button
          key={step.index}
          onClick={() => setCurrentStep(step.index)}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            currentStep === step.index
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          {step.label}
        </button>
      ))}
    </nav>
  )
}
