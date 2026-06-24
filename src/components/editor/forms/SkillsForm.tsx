import { useResumeStore } from '@/store/resumeStore'
import type { SkillLevel } from '@/types/resume'

const LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: '入门',
  intermediate: '熟练',
  advanced: '精通',
  expert: '专家'
}

export default function SkillsForm() {
  const skills = useResumeStore((s) => s.data.skills)
  const add = useResumeStore((s) => s.addSkill)
  const update = useResumeStore((s) => s.updateSkill)
  const remove = useResumeStore((s) => s.removeSkill)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">技能特长</h2>
          <p className="text-sm text-slate-500 mt-1">列出你的专业技能和熟练程度。</p>
        </div>
        <button
          onClick={add}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
        >
          + 添加
        </button>
      </div>

      {skills.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">暂无技能，点击"添加"开始</p>
      )}

      <div className="space-y-2">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="flex items-center gap-2 border border-slate-200 rounded-lg p-3"
          >
            <input
              type="text"
              value={skill.name}
              onChange={(e) => update(skill.id, { name: e.target.value })}
              placeholder="技能名（如 React）"
              className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={skill.level}
              onChange={(e) => update(skill.id, { level: e.target.value as SkillLevel })}
              className="w-24 px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {Object.entries(LEVEL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={skill.category}
              onChange={(e) => update(skill.id, { category: e.target.value })}
              placeholder="分类（如 前端框架）"
              className="w-32 px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => remove(skill.id)}
              className="text-xs text-slate-400 hover:text-red-500 px-1 shrink-0"
              title="删除"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
