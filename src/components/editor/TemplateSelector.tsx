import { useResumeStore } from '@/store/resumeStore'

const TEMPLATES = [
  { id: 'classic', name: '经典', desc: '传统两栏布局，稳重专业' },
  { id: 'modern', name: '现代', desc: '顶部卡片+时间线，醒目' },
  { id: 'minimal', name: '简约', desc: '单栏极简，注重留白' }
]

export default function TemplateSelector() {
  const templateId = useResumeStore((s) => s.data.meta.templateId)
  const setTemplate = useResumeStore((s) => s.setTemplate)

  return (
    <div className="mb-5">
      <h3 className="text-sm font-medium text-slate-700 mb-2">选择模板</h3>
      <div className="flex gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${
              templateId === t.id
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                templateId === t.id ? 'text-blue-700' : 'text-slate-700'
              }`}
            >
              {t.name}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
