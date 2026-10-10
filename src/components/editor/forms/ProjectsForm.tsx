import { useState } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import { TextField, TextArea, ValidatedTextField } from '@/components/ui/TextField'
import { checkDateRange, checkLink, errorOf } from '@/utils/validators'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { FormHeader, EntryCard } from '../FormScaffold'
import { IconFolder, IconPlus, IconX } from '@/components/ui/Icons'

function TechInput({ onAdd }: { onAdd: (value: string) => void }) {
  const [value, setValue] = useState('')

  const commit = () => {
    const v = value.trim()
    if (!v) return
    onAdd(v)
    setValue('')
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex-1">
        <TextField
          label="添加技术标签"
          placeholder="如 React，回车确认"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            }
          }}
        />
      </span>
      <Button variant="outlined" size="sm" className="mt-0.5 shrink-0" onClick={commit}>
        添加
      </Button>
    </div>
  )
}

export default function ProjectsForm() {
  const list = useResumeStore((s) => s.data.projects)
  const add = useResumeStore((s) => s.addProject)
  const update = useResumeStore((s) => s.updateProject)
  const remove = useResumeStore((s) => s.removeProject)

  return (
    <div className="space-y-5">
      <FormHeader
        title="项目经历"
        description="没有工作经历时，这部分最重要。写清你负责什么、用了什么技术、结果如何。"
        actionLabel="添加"
        onAction={add}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<IconFolder size={26} />}
          title="还没有项目经历"
          description="课程设计、个人作品、开源贡献、比赛作品都可以写。"
          actionLabel="添加项目经历"
          onAction={add}
        />
      ) : (
        <div className="space-y-4">
          {list.map((proj, i) => {
            // 起止时间跨两个字段，错误同时标在两处
            const rangeError = errorOf(checkDateRange(proj.startDate, proj.endDate ?? ''))

            return (
            <EntryCard key={proj.id} index={i} label="项目经历" onRemove={() => remove(proj.id)}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="项目名称"
                  placeholder="如：电商小程序重构"
                  value={proj.name}
                  onChange={(e) => update(proj.id, { name: e.target.value })}
                />
                <TextField
                  label="担任角色（选填）"
                  placeholder="如：前端负责人"
                  value={proj.role ?? ''}
                  onChange={(e) => update(proj.id, { role: e.target.value })}
                />
                <TextField
                  label="开始时间"
                  type="month"
                  value={proj.startDate}
                  onChange={(e) => update(proj.id, { startDate: e.target.value })}
                  error={rangeError}
                />
                <TextField
                  label="结束时间（选填）"
                  type="month"
                  value={proj.endDate ?? ''}
                  onChange={(e) => update(proj.id, { endDate: e.target.value })}
                  error={rangeError}
                />
                <ValidatedTextField
                  label="项目链接（选填）"
                  placeholder="https:// 或 github.com/user/repo"
                  value={proj.link ?? ''}
                  onChange={(e) => update(proj.id, { link: e.target.value })}
                  validate={(v) => checkLink(v, '项目链接')}
                  className="sm:col-span-2"
                />
              </div>

              <TextArea
                label="项目简介"
                placeholder="一句话说清这个项目解决了什么问题"
                value={proj.description}
                onChange={(e) => update(proj.id, { description: e.target.value })}
                rows={2}
                className="mt-4"
              />

              {/* 技术标签 */}
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-ink-2">技术标签</label>
                {proj.technologies.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {proj.technologies.map((tech, j) => (
                      <span
                        key={`${tech}-${j}`}
                        className="anim-pop-in inline-flex items-center gap-1 rounded-full bg-brand-soft py-1 pl-2.5 pr-1 text-xs text-brand"
                      >
                        {tech}
                        <button
                          onClick={() =>
                            update(proj.id, {
                              technologies: proj.technologies.filter((_, idx) => idx !== j)
                            })
                          }
                          aria-label={`移除 ${tech}`}
                          className="rounded-full p-0.5 transition-colors hover:bg-brand/15"
                        >
                          <IconX size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <TechInput
                  onAdd={(v) => update(proj.id, { technologies: [...proj.technologies, v] })}
                />
              </div>

              {/* 项目亮点 */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-2">项目亮点</label>
                  <span className="text-[11px] text-ink-3">写结果，不写过程</span>
                </div>

                <div className="space-y-2">
                  {proj.highlights.map((hl, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span className="flex-1">
                        <TextField
                          label={`亮点 ${j + 1}`}
                          placeholder="如：首屏加载从 3.2s 降到 1.1s"
                          value={hl}
                          onChange={(e) => {
                            const next = [...proj.highlights]
                            next[j] = e.target.value
                            update(proj.id, { highlights: next })
                          }}
                        />
                      </span>
                      <Button
                        variant="icon"
                        size="sm"
                        title="删除这条亮点"
                        aria-label="删除这条亮点"
                        className="mt-0.5 shrink-0 hover:bg-danger-soft hover:text-danger"
                        onClick={() =>
                          update(proj.id, {
                            highlights: proj.highlights.filter((_, idx) => idx !== j)
                          })
                        }
                      >
                        <IconX size={16} />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="text"
                  size="sm"
                  icon={<IconPlus size={15} />}
                  className="mt-2"
                  onClick={() => update(proj.id, { highlights: [...proj.highlights, ''] })}
                >
                  添加亮点
                </Button>
              </div>
            </EntryCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
