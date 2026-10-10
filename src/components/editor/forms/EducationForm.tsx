import { useResumeStore } from '@/store/resumeStore'
import { TextField, TextArea } from '@/components/ui/TextField'
import EmptyState from '@/components/ui/EmptyState'
import { FormHeader, EntryCard } from '../FormScaffold'
import { IconGraduationCap } from '@/components/ui/Icons'

export default function EducationForm() {
  const list = useResumeStore((s) => s.data.education)
  const add = useResumeStore((s) => s.addEducation)
  const update = useResumeStore((s) => s.updateEducation)
  const remove = useResumeStore((s) => s.removeEducation)

  return (
    <div className="space-y-5">
      <FormHeader
        title="教育经历"
        description="按时间倒序填写，最近的学历放在最前面。"
        actionLabel="添加"
        onAction={add}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<IconGraduationCap size={26} />}
          title="还没有教育经历"
          description="填上学校、专业与在读时间，这是应届生简历里最重要的一段。"
          actionLabel="添加教育经历"
          onAction={add}
        />
      ) : (
        <div className="space-y-4">
          {list.map((edu, i) => (
            <EntryCard key={edu.id} index={i} label="教育经历" onRemove={() => remove(edu.id)}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="学校"
                  placeholder="学校名称"
                  value={edu.school}
                  onChange={(e) => update(edu.id, { school: e.target.value })}
                  className="sm:col-span-2"
                />
                <TextField
                  label="学历"
                  placeholder="如：本科 / 硕士"
                  value={edu.degree}
                  onChange={(e) => update(edu.id, { degree: e.target.value })}
                />
                <TextField
                  label="专业"
                  placeholder="专业名称"
                  value={edu.major}
                  onChange={(e) => update(edu.id, { major: e.target.value })}
                />
                <TextField
                  label="入学时间"
                  type="month"
                  value={edu.startDate}
                  onChange={(e) => update(edu.id, { startDate: e.target.value })}
                />
                <TextField
                  label="毕业时间"
                  type="month"
                  value={edu.endDate}
                  onChange={(e) => update(edu.id, { endDate: e.target.value })}
                />
                <TextField
                  label="GPA / 成绩"
                  placeholder="如：3.8/4.0（选填）"
                  value={edu.gpa ?? ''}
                  onChange={(e) => update(edu.id, { gpa: e.target.value })}
                />
              </div>

              <TextArea
                label="在校经历 / 主修课程（选填）"
                placeholder="如：主修课程：数据结构、操作系统；获一等奖学金"
                value={edu.description ?? ''}
                onChange={(e) => update(edu.id, { description: e.target.value })}
                rows={2}
                className="mt-4"
              />
            </EntryCard>
          ))}
        </div>
      )}
    </div>
  )
}
