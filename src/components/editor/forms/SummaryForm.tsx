import { useResumeStore } from '@/store/resumeStore'

export default function SummaryForm() {
  const summary = useResumeStore((s) => s.data.summary)
  const updateSummary = useResumeStore((s) => s.updateSummary)

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">自我评价</h2>
      <p className="text-sm text-slate-500 mb-5">
        用 2-3 句话总结你的优势、职业目标和个人特质。这是 HR 最先看到的段落之一。
      </p>

      <textarea
        value={summary}
        onChange={(e) => updateSummary(e.target.value)}
        placeholder={`示例：\n拥有 3 年前端开发经验，擅长 React 和 TypeScript。对用户体验有深刻理解，能独立完成从前端架构到部署的全流程。正在寻找一个能发挥技术专长、持续成长的团队。`}
        rows={8}
        className="w-full px-3 py-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
      />

      <div className="mt-2 text-xs text-slate-400">
        字数建议：100-200 字，简洁有亮点。
      </div>
    </div>
  )
}
