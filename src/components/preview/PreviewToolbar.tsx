import { useUIStore } from '@/store/uiStore'
import Button from '@/components/ui/Button'
import {
  IconDownload,
  IconEye,
  IconFitWidth,
  IconPencil,
  IconZoomIn,
  IconZoomOut
} from '@/components/ui/Icons'

interface PreviewToolbarProps {
  onExportPDF?: () => void
  isExporting?: boolean
}

export default function PreviewToolbar({ onExportPDF, isExporting }: PreviewToolbarProps) {
  const scale = useUIStore((s) => s.previewScale)
  const setScale = useUIStore((s) => s.setPreviewScale)
  const fitToWidth = useUIStore((s) => s.fitToWidth)
  const setFitToWidth = useUIStore((s) => s.setFitToWidth)
  const isFocusMode = useUIStore((s) => s.isFocusMode)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)

  const iconBtn =
    'flex h-8 w-8 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-hover disabled:opacity-40'

  return (
    <div className="flex h-12 shrink-0 items-center gap-1 border-b border-outline bg-surface px-3">
      {/* 缩放组 */}
      <div className="flex items-center gap-0.5 rounded-full bg-hover p-0.5">
        <button
          onClick={() => setScale(scale - 10)}
          disabled={!fitToWidth && scale <= 25}
          className={iconBtn}
          title="缩小"
          aria-label="缩小"
        >
          <IconZoomOut size={18} />
        </button>

        <button
          onClick={() => setFitToWidth(true)}
          className={`min-w-[68px] rounded-full px-2 py-1 text-xs font-medium transition-colors ${
            fitToWidth ? 'bg-surface text-brand shadow-e1' : 'text-ink-2 hover:text-ink'
          }`}
          title="适应宽度"
        >
          {fitToWidth ? '适应宽度' : `${scale}%`}
        </button>

        <button
          onClick={() => setScale(scale + 10)}
          disabled={!fitToWidth && scale >= 200}
          className={iconBtn}
          title="放大"
          aria-label="放大"
        >
          <IconZoomIn size={18} />
        </button>
      </div>

      <Button
        variant="icon"
        size="sm"
        onClick={() => {
          setFitToWidth(false)
          setScale(100)
        }}
        title="重置为 100%"
        aria-label="重置缩放"
      >
        <IconFitWidth size={18} />
      </Button>

      <span className="ml-2 hidden text-xs text-ink-3 lg:inline">Ctrl + 滚轮缩放</span>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="text"
          size="sm"
          icon={isFocusMode ? <IconPencil size={16} /> : <IconEye size={16} />}
          onClick={toggleFocusMode}
          title={isFocusMode ? '返回编辑' : '专注预览（隐藏编辑区）'}
        >
          <span className="hidden sm:inline">{isFocusMode ? '返回编辑' : '专注预览'}</span>
        </Button>

        <Button
          variant="tonal"
          size="sm"
          loading={isExporting}
          icon={isExporting ? undefined : <IconDownload size={16} />}
          onClick={onExportPDF}
        >
          {isExporting ? '导出中…' : '导出 PDF'}
        </Button>
      </div>
    </div>
  )
}
