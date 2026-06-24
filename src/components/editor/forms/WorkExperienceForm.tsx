import { useResumeStore } from '@/store/resumeStore'

export default function WorkExperienceForm() {
  const workList = useResumeStore((s) => s.data.workExperience)
  const add = useResumeStore((s) => s.addWorkExperience)
  const update = useResumeStore((s) => s.updateWorkExperience)
  const remove = useResumeStore((s) => s.removeWorkExperience)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">工作经历</h2>
          <p className="text-sm text-slate-500 mt-1">添加你的工作经验，突出亮点。</p>
        </div>
        <button
          onClick={add}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
        >
          + 添加
        </button>
      </div>

      {workList.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">暂无工作经历，点击"添加"开始</p>
      )}

      <div className="space-y-5">
        {workList.map((work, i) => (
          <div key={work.id} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">工作经历 {i + 1}</span>
              <button
                onClick={() => remove(work.id)}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                删除
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">公司</label>
                <input
                  type="text"
                  value={work.company}
                  onChange={(e) => update(work.id, { company: e.target.value })}
                  placeholder="公司名称"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">职位</label>
                <input
                  type="text"
                  value={work.position}
                  onChange={(e) => update(work.id, { position: e.target.value })}
                  placeholder="职位名称"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">开始时间</label>
                <input
                  type="month"
                  value={work.startDate}
                  onChange={(e) => update(work.id, { startDate: e.target.value })}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">结束时间</label>
                <div className="flex items-center gap-2">
                  <input
                    type="month"
                    value={work.endDate}
                    onChange={(e) => update(work.id, { endDate: e.target.value })}
                    disabled={work.isCurrent}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <label className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={work.isCurrent}
                      onChange={(e) =>
                        update(work.id, {
                          isCurrent: e.target.checked,
                          endDate: e.target.checked ? '' : work.endDate
                        })
                      }
                      className="rounded"
                    />
                    至今
                  </label>
                </div>
              </div>
            </div>

            {/* 工作描述 */}
            <div className="mb-3">
              <label className="block text-xs text-slate-500 mb-1">工作概述</label>
              <textarea
                value={work.description}
                onChange={(e) => update(work.id, { description: e.target.value })}
                placeholder="简要描述你的工作职责和成果"
                rows={2}
                className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* 工作亮点 */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">工作亮点</label>
              {work.achievements.map((ach, j) => (
                <div key={j} className="flex items-center gap-1 mb-1">
                  <input
                    type="text"
                    value={ach}
                    onChange={(e) => {
                      const updated = [...work.achievements]
                      updated[j] = e.target.value
                      update(work.id, { achievements: updated })
                    }}
                    placeholder={`亮点 ${j + 1}（如：提升性能 30%）`}
                    className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const updated = work.achievements.filter((_, idx) => idx !== j)
                      update(work.id, { achievements: updated })
                    }}
                    className="text-xs text-slate-400 hover:text-red-500 px-1"
                    title="删除"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  update(work.id, { achievements: [...work.achievements, ''] })
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
