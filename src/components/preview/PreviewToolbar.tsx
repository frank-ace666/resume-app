import { useUIStore } from '@/store/uiStore'

interface PreviewToolbarProps {
  onExportPDF?: () => void
  isExporting?: boolean
}

export default function PreviewToolbar({ onExportPDF, isExporting }: PreviewToolbarProps) {
  const scale = useUIStore((s) => s.previewScale)
  const setScale = useUIStore((s) => s.setPreviewScale)

  return (
    <div className="flex items-center justify-between mb-4 px-1">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setScale(scale - 10)}
          className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-100 transition-colors"
          title="缩小"
        >
          −
        </button>
        <span className="text-xs text-slate-500 w-12 text-center">{scale}%</span>
        <button
          onClick={() => setScale(scale + 10)}
          className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-100 transition-colors"
          title="放大"
        >
          +
        </button>
        <button
          onClick={() => setScale(100)}
          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          title="重置缩放"
        >
          重置
        </button>
      </div>

      <button
        onClick={onExportPDF}
        disabled={isExporting}
        className={`px-3 py-1 text-xs font-medium text-white rounded-md transition-colors ${
          isExporting
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isExporting ? '导出中...' : '导出 PDF'}
      </button>
    </div>
  )
}
