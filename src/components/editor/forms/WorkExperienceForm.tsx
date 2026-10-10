import { useResumeStore } from '@/store/resumeStore'
import { TextField, TextArea } from '@/components/ui/TextField'
import { checkDateRange, errorOf } from '@/utils/validators'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { FormHeader, EntryCard } from '../FormScaffold'
import { IconBriefcase, IconPlus, IconX } from '@/components/ui/Icons'

export default function WorkExperienceForm() {
  const list = useResumeStore((s) => s.data.workExperience)
  const add = useResumeStore((s) => s.addWorkExperience)
  const update = useResumeStore((s) => s.updateWorkExperience)
  const remove = useResumeStore((s) => s.removeWorkExperience)

  return (
    <div className="space-y-5">
      <FormHeader
        title="工作经历"
        description="按时间倒序填写。每条经历用 3–5 条亮点说明你做出了什么结果。"
        actionLabel="添加"
        onAction={add}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<IconBriefcase size={26} />}
          title="还没有工作经历"
          description="实习、兼职、校内项目都可以写在这里；没有的话先跳过，用项目经历来撑。"
          actionLabel="添加工作经历"
          onAction={add}
        />
      ) : (
        <div className="space-y-4">
          {list.map((work, i) => {
            // 起止时间跨两个字段，错误同时标在两处；勾了「至今」则不校验结束时间
            const rangeError = errorOf(
              checkDateRange(work.startDate, work.endDate, { isCurrent: work.isCurrent })
            )

            return (
            <EntryCard key={work.id} index={i} label="工作经历" onRemove={() => remove(work.id)}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="公司"
                  placeholder="公司名称"
                  value={work.company}
                  onChange={(e) => update(work.id, { company: e.target.value })}
                />
                <TextField
                  label="职位"
                  placeholder="职位名称"
                  value={work.position}
                  onChange={(e) => update(work.id, { position: e.target.value })}
                />
                <TextField
                  label="开始时间"
                  type="month"
                  value={work.startDate}
                  onChange={(e) => update(work.id, { startDate: e.target.value })}
                  error={rangeError}
                />
                <TextField
                  label="结束时间（选填）"
                  type="month"
                  value={work.endDate}
                  disabled={work.isCurrent}
                  onChange={(e) => update(work.id, { endDate: e.target.value })}
                  error={rangeError}
                  addon={
                    <>
                      <input
                        type="checkbox"
                        id={`current-${work.id}`}
                        checked={work.isCurrent}
                        onChange={(e) =>
                          update(work.id, {
                            isCurrent: e.target.checked,
                            endDate: e.target.checked ? '' : work.endDate
                          })
                        }
                        className="h-3.5 w-3.5 accent-[var(--color-brand)]"
                      />
                      <label
                        htmlFor={`current-${work.id}`}
                        className="cursor-pointer select-none whitespace-nowrap text-xs text-ink-2"
                      >
                        至今
                      </label>
                    </>
                  }
                />
                <TextField
                  label="工作地点（选填）"
                  placeholder="如：北京"
                  value={work.location ?? ''}
                  onChange={(e) => update(work.id, { location: e.target.value })}
                  className="sm:col-span-2"
                />
              </div>

              <TextArea
                label="工作概述（选填）"
                placeholder="一句话说明你的职责范围"
                value={work.description}
                onChange={(e) => update(work.id, { description: e.target.value })}
                rows={2}
                className="mt-4"
              />

              {/* 亮点 */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-2">工作亮点</label>
                  <span className="text-[11px] text-ink-3">建议带具体数字</span>
                </div>

                <div className="space-y-2">
                  {work.achievements.map((ach, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span className="flex-1">
                        <TextField
                          label={`亮点 ${j + 1}`}
                          placeholder="如：首屏加载时间从 3.2s 降到 1.1s"
                          value={ach}
                          onChange={(e) => {
                            const next = [...work.achievements]
                            next[j] = e.target.value
                            update(work.id, { achievements: next })
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
                          update(work.id, {
                            achievements: work.achievements.filter((_, idx) => idx !== j)
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
                  onClick={() => update(work.id, { achievements: [...work.achievements, ''] })}
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
