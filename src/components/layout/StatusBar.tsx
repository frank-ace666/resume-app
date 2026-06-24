interface StatusBarProps {
  isAutoSaved: boolean
  lastSavedAt: string | null
}

export default function StatusBar({ isAutoSaved, lastSavedAt }: StatusBarProps) {
  return (
    <footer className="flex items-center justify-between h-7 px-4 bg-slate-800 text-slate-400 text-xs shrink-0">
      <span>简历工坊 v1.0.0</span>
      <span>
        {isAutoSaved
          ? lastSavedAt
            ? `已自动保存 · ${lastSavedAt}`
            : '已保存'
          : '正在保存...'}
      </span>
    </footer>
  )
}
