import { useResumeStore } from '@/store/resumeStore'

export default function ProjectsForm() {
  const projects = useResumeStore((s) => s.data.projects)
  const add = useResumeStore((s) => s.addProject)
  const update = useResumeStore((s) => s.updateProject)
  const remove = useResumeStore((s) => s.removeProject)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">项目经历</h2>
          <p className="text-sm text-slate-500 mt-1">展示你的项目经验，突出技术栈和成果。</p>
        </div>
        <button
          onClick={add}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
        >
          + 添加
        </button>
      </div>

      {projects.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">暂无项目经历，点击"添加"开始</p>
      )}

      <div className="space-y-5">
        {projects.map((proj, i) => (
          <div key={proj.id} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">项目经历 {i + 1}</span>
              <button
                onClick={() => remove(proj.id)}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                删除
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">项目名称</label>
                <input
                  type="text"
                  value={proj.name}
                  onChange={(e) => update(proj.id, { name: e.target.value })}
                  placeholder="项目名称"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">角色（选填）</label>
                <input
                  type="text"
                  value={proj.role || ''}
                  onChange={(e) => update(proj.id, { role: e.target.value })}
                  placeholder="如：前端负责人"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">开始时间</label>
                <input
                  type="month"
                  value={proj.startDate}
                  onChange={(e) => update(proj.id, { startDate: e.target.value })}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">结束时间（选填）</label>
                <input
                  type="month"
                  value={proj.endDate || ''}
                  onChange={(e) => update(proj.id, { endDate: e.target.value })}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 项目描述 */}
            <div className="mb-3">
              <label className="block text-xs text-slate-500 mb-1">项目描述</label>
              <textarea
                value={proj.description}
                onChange={(e) => update(proj.id, { description: e.target.value })}
                placeholder="简要描述项目内容和你的贡献"
                rows={2}
                className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* 技术栈 */}
            <div className="mb-3">
              <label className="block text-xs text-slate-500 mb-1">技术栈</label>
              <div className="flex flex-wrap items-center gap-1">
                {proj.technologies.map((tech, j) => (
                  <span
                    key={j}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-xs"
                  >
                    <input
                      type="text"
                      value={tech}
                      onChange={(e) => {
                        const updated = [...proj.technologies]
                        updated[j] = e.target.value
                        update(proj.id, { technologies: updated })
                      }}
                      placeholder="技术"
                      className="w-20 bg-transparent text-xs focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const updated = proj.technologies.filter((_, idx) => idx !== j)
                        update(proj.id, { technologies: updated })
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  onClick={() =>
                    update(proj.id, { technologies: [...proj.technologies, ''] })
                  }
                  className="text-xs text-blue-500 hover:text-blue-700 px-1"
                >
                  + 技术
                </button>
              </div>
            </div>

            {/* 项目亮点 */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">项目亮点</label>
              {proj.highlights.map((hl, j) => (
                <div key={j} className="flex items-center gap-1 mb-1">
                  <input
                    type="text"
                    value={hl}
                    onChange={(e) => {
                      const updated = [...proj.highlights]
                      updated[j] = e.target.value
                      update(proj.id, { highlights: updated })
                    }}
                    placeholder={`亮点 ${j + 1}`}
                    className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const updated = proj.highlights.filter((_, idx) => idx !== j)
                      update(proj.id, { highlights: updated })
                    }}
                    className="text-xs text-slate-400 hover:text-red-500 px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  update(proj.id, { highlights: [...proj.highlights, ''] })
                }
                className="text-xs text-blue-500 hover:text-blue-700 mt-1"
              >
                + 添加亮点
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
