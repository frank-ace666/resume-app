import { useResumeStore } from '@/store/resumeStore'
import { TextArea } from '@/components/ui/TextField'
import { IconInfo } from '@/components/ui/Icons'

const PLACEHOLDER = `用 3–4 句话说明：你是谁、擅长什么、有过什么可量化的成果。

例：2 年前端开发经验，主导过日活 10 万的电商小程序重构，首屏加载从 3.2s 降到 1.1s。熟悉 React 与 TypeScript，习惯用数据驱动性能优化。`

export default function SummaryForm() {
  const summary = useResumeStore((s) => s.data.summary)
  const updateSummary = useResumeStore((s) => s.updateSummary)

  const charCount = summary.trim().length
  const isTooLong = charCount > 300

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-medium text-ink">自我评价</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-2">
          可选模块。写不出具体成果时，宁可不写 —— 空泛的形容词反而减分。
        </p>
      </div>

      <TextArea
        label="自我评价"
        placeholder={PLACEHOLDER}
        value={summary}
        onChange={(e) => updateSummary(e.target.value)}
        rows={8}
        hint={
          isTooLong
            ? `已 ${charCount} 字，建议控制在 300 字以内`
            : `已 ${charCount} 字 · 建议 100–300 字`
        }
      />

      <div className="flex gap-3 rounded-sm border border-outline bg-brand-soft/50 p-3.5">
        <span className="mt-0.5 shrink-0 text-brand">
          <IconInfo size={18} />
        </span>
        <div className="text-xs leading-relaxed text-ink-2">
          <p className="font-medium text-ink">写法建议</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>用具体数字替代「很多」「大幅」这类模糊描述</li>
            <li>避免「性格开朗」「吃苦耐劳」等无法验证的形容词</li>
            <li>针对目标岗位写，一份简历只对一个求职意向</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
