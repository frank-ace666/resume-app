import { useResumeStore } from '@/store/resumeStore'
import type { SkillLevel } from '@/types/resume'
import { TextField } from '@/components/ui/TextField'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { FormHeader } from '../FormScaffold'
import { IconPlus, IconTrash, IconWrench } from '@/components/ui/Icons'
import { groupSkills } from '@/components/templates/model'

const LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: '入门' },
  { value: 'intermediate', label: '熟练' },
  { value: 'advanced', label: '精通' },
  { value: 'expert', label: '专家' }
]

/** 常见技能快捷添加，降低新手的空白页焦虑 */
const QUICK_ADD: { name: string; category: string }[] = [
  { name: 'JavaScript', category: '编程语言' },
  { name: 'TypeScript', category: '编程语言' },
  { name: 'Python', category: '编程语言' },
  { name: 'React', category: '前端框架' },
  { name: 'Vue', category: '前端框架' },
  { name: 'Node.js', category: '后端' },
  { name: 'MySQL', category: '数据库' },
  { name: 'Git', category: '工具' },
  { name: 'Figma', category: '设计' },
  { name: 'Excel', category: '办公' }
]

export default function SkillsForm() {
  const skills = useResumeStore((s) => s.data.skills)
  const add = useResumeStore((s) => s.addSkill)
  const update = useResumeStore((s) => s.updateSkill)
  const remove = useResumeStore((s) => s.removeSkill)

  const groups = groupSkills(skills)
  const existingNames = new Set(skills.map((s) => s.name.trim().toLowerCase()))

  const addQuick = (preset: { name: string; category: string }) => {
    add()
    // addSkill 会追加一个空技能，这里把最后一条填上预设值
    const list = useResumeStore.getState().data.skills
    const last = list[list.length - 1]
    if (last) {
      update(last.id, { name: preset.name, category: preset.category, level: 'intermediate' })
    }
  }

  return (
    <div className="space-y-5">
      <FormHeader
        title="技能特长"
        description="按分类列出技能，熟练度用文字标注即可 —— 进度条和星级反而会被招聘方扣分。"
        actionLabel="添加"
        onAction={add}
      />

      {/* 快捷添加 */}
      <Card className="p-4">
        <p className="mb-3 text-xs font-medium text-ink-2">快捷添加常用技能</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD.filter((q) => !existingNames.has(q.name.toLowerCase())).map((q) => (
            <button
              key={q.name}
              onClick={() => addQuick(q)}
              className="rounded-full border border-outline px-3 py-1 text-xs text-ink-2 transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft hover:text-brand"
            >
              + {q.name}
            </button>
          ))}
        </div>
      </Card>

      {skills.length === 0 ? (
        <EmptyState
          icon={<IconWrench size={26} />}
          title="还没有技能"
          description="从上面的常用技能里点几个，或者手动添加你自己的技能。"
          actionLabel="手动添加技能"
          onAction={add}
        />
      ) : (
        <>
          <div className="space-y-3">
            {skills.map((skill) => (
              <Card key={skill.id} className="anim-pop-in p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px_1fr_auto] sm:items-center">
                  <TextField
                    label="技能名称"
                    placeholder="如 React"
                    value={skill.name}
                    onChange={(e) => update(skill.id, { name: e.target.value })}
                  />

                  {/* Material 风格下拉 */}
                  <div className="relative">
                    <select
                      value={skill.level}
                      onChange={(e) => update(skill.id, { level: e.target.value as SkillLevel })}
                      aria-label="熟练程度"
                      className="peer h-12 w-full appearance-none rounded-xs border border-outline bg-transparent px-3.5 pr-9 text-sm text-ink transition-colors duration-[var(--duration-fast)] focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    >
                      {LEVELS.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                    <span className="pointer-events-none absolute left-2.5 top-0 z-10 -translate-y-1/2 bg-surface px-1 text-[11px] text-ink-3">
                      熟练度
                    </span>
                  </div>

                  <TextField
                    label="分类"
                    placeholder="如 前端框架"
                    value={skill.category}
                    onChange={(e) => update(skill.id, { category: e.target.value })}
                  />

                  <Button
                    variant="icon"
                    size="sm"
                    title="删除技能"
                    aria-label="删除技能"
                    className="justify-self-end hover:bg-danger-soft hover:text-danger"
                    onClick={() => remove(skill.id)}
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* 简历上的呈现预览：按分类分组 */}
          {groups.length > 0 && (
            <Card className="bg-canvas p-4">
              <p className="mb-2 text-xs font-medium text-ink-2">简历上的呈现效果</p>
              <div className="space-y-1.5">
                {groups.map((g) => (
                  <div key={g.category} className="flex gap-2 text-xs">
                    <span className="w-20 shrink-0 text-ink-3">{g.category}</span>
                    <span className="text-ink-2">
                      {g.items.map((s) => s.name).join('、')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Button variant="outlined" size="sm" icon={<IconPlus size={15} />} onClick={add}>
            添加技能
          </Button>
        </>
      )}
    </div>
  )
}
