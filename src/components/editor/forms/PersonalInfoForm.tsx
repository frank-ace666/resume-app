import { useResumeStore } from '@/store/resumeStore'

export default function PersonalInfoForm() {
  const info = useResumeStore((s) => s.data.personalInfo)
  const update = useResumeStore((s) => s.updatePersonalInfo)

  const fields: { key: keyof typeof info; label: string; placeholder: string }[] = [
    { key: 'fullName', label: '姓名', placeholder: '你的全名' },
    { key: 'title', label: '求职意向', placeholder: '如：前端开发工程师' },
    { key: 'email', label: '邮箱', placeholder: 'example@email.com' },
    { key: 'phone', label: '电话', placeholder: '手机号码' },
    { key: 'location', label: '所在地', placeholder: '如：北京' },
    { key: 'website', label: '个人网站', placeholder: 'https://（选填）' },
    { key: 'github', label: 'GitHub', placeholder: 'GitHub 用户名（选填）' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'LinkedIn 链接（选填）' }
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">个人信息</h2>
      <p className="text-sm text-slate-500 mb-5">
        填写你的基本信息，让 HR 一眼了解你。
      </p>

      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              {f.label}
            </label>
            <input
              type="text"
              value={String(info[f.key] || '')}
              onChange={(e) => update({ [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
