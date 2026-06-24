import { useResumeStore } from '@/store/resumeStore'

export default function EducationForm() {
  const education = useResumeStore((s) => s.data.education)
  const add = useResumeStore((s) => s.addEducation)
  const update = useResumeStore((s) => s.updateEducation)
  const remove = useResumeStore((s) => s.removeEducation)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">教育经历</h2>
          <p className="text-sm text-slate-500 mt-1">添加你的学历背景。</p>
        </div>
        <button
          onClick={add}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
        >
          + 添加
        </button>
      </div>

      {education.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">暂无教育经历，点击"添加"开始</p>
      )}

      <div className="space-y-5">
        {education.map((edu, i) => (
          <div key={edu.id} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">教育经历 {i + 1}</span>
              <button
                onClick={() => remove(edu.id)}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                删除
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">学校</label>
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => update(edu.id, { school: e.target.value })}
                  placeholder="学校名称"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">学位</label>
                <select
                  value={edu.degree}
                  onChange={(e) => update(edu.id, { degree: e.target.value })}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">请选择</option>
                  <option value="大专">大专</option>
                  <option value="学士">学士</option>
                  <option value="硕士">硕士</option>
                  <option value="博士">博士</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">专业</label>
                <input
                  type="text"
                  value={edu.major}
                  onChange={(e) => update(edu.id, { major: e.target.value })}
                  placeholder="专业名称"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">GPA（选填）</label>
                <input
                  type="text"
                  value={edu.gpa || ''}
                  onChange={(e) => update(edu.id, { gpa: e.target.value })}
                  placeholder="如 3.8/4.0"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">开始时间</label>
                <input
                  type="month"
                  value={edu.startDate}
                  onChange={(e) => update(edu.id, { startDate: e.target.value })}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">结束时间</label>
                <input
                  type="month"
                  value={edu.endDate}
                  onChange={(e) => update(edu.id, { endDate: e.target.value })}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
