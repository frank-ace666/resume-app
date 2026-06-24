import { useResumeStore } from '@/store/resumeStore'

interface HeaderProps {
  onCreateNew: () => void
  onOpenFile: () => void
  onSaveFile: () => void
  onExportPDF: () => void
  isExporting: boolean
  pdfError: string | null
}

export default function Header({
  onCreateNew,
  onOpenFile,
  onSaveFile,
  onExportPDF,
  isExporting,
  pdfError
}: HeaderProps) {
  const fileName = useResumeStore((s) => s.fileName)

  return (
    <header className="flex items-center justify-between h-12 px-4 bg-white border-b border-slate-200 shrink-0">
      {/* 左侧：应用名 + 文件操作 */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">
          📄 简历工坊
        </h1>
        <span className="text-xs text-slate-400 hidden sm:inline">Resume Craft</span>
        <div className="h-5 w-px bg-slate-200 mx-2" />
        <div className="flex items-center gap-1">
          <button
            onClick={onCreateNew}
            className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="新建简历"
          >
            新建
          </button>
          <button
            onClick={onOpenFile}
            className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="打开简历文件"
          >
            打开
          </button>
          <button
            onClick={onSaveFile}
            className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="保存简历"
          >
            保存
          </button>
        </div>
        {fileName && (
          <span className="text-xs text-slate-400 ml-2 truncate max-w-40">{fileName}</span>
        )}
        {pdfError && (
          <span className="text-xs text-red-500 ml-2">{pdfError}</span>
        )}
      </div>

      {/* 右侧：导出按钮 */}
      <div>
        <button
          onClick={onExportPDF}
          disabled={isExporting}
          className={`px-4 py-1.5 text-sm font-medium text-white rounded-md transition-colors shadow-sm ${
            isExporting
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isExporting ? '导出中...' : '导出 PDF'}
        </button>
      </div>
    </header>
  )
}
