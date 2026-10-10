import { useCallback, useRef } from 'react'
import EditorPanel from '@/components/editor/EditorPanel'
import PreviewPanel from '@/components/preview/PreviewPanel'
import NavDrawer from './NavDrawer'
import { useUIStore } from '@/store/uiStore'
import { useResizable } from '@/hooks/useResizable'

interface MainLayoutProps {
  onExportPDF: () => void
  isExporting: boolean
}

/** Gmail / YouTube 三段式：左侧导航 + 内容区（编辑 | 预览，可拖拽分栏） */
export default function MainLayout({ onExportPDF, isExporting }: MainLayoutProps) {
  const splitRef = useRef<HTMLDivElement>(null)
  const editorWidthPct = useUIStore((s) => s.editorWidthPct)
  const setEditorWidthPct = useUIStore((s) => s.setEditorWidthPct)
  const isFocusMode = useUIStore((s) => s.isFocusMode)

  const getContainerWidth = useCallback(() => splitRef.current?.clientWidth ?? 0, [])
  const { isDragging, handlePointerDown } = useResizable({
    getContainerWidth,
    onResize: setEditorWidthPct
  })

  return (
    <main className="flex flex-1 overflow-hidden">
      <NavDrawer />

      <div ref={splitRef} className="relative flex flex-1 overflow-hidden">
        {!isFocusMode && (
          <>
            <div
              style={{ width: `${editorWidthPct}%` }}
              className="min-w-0 shrink-0 overflow-hidden bg-surface"
            >
              <EditorPanel />
            </div>

            {/* 拖拽分隔条 */}
            <div
              onPointerDown={handlePointerDown}
              role="separator"
              aria-orientation="vertical"
              aria-label="拖动调整编辑区宽度"
              className={`group relative z-10 w-px shrink-0 cursor-col-resize bg-outline transition-colors duration-[var(--duration-fast)] ${
                isDragging ? 'bg-brand' : 'hover:bg-brand'
              }`}
            >
              {/* 加宽的命中区域，避免只有 1px 难以拖动 */}
              <span className="absolute inset-y-0 -left-1.5 -right-1.5" />
              <span
                className={`absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-[var(--duration-base)] ${
                  isDragging ? 'bg-brand opacity-100' : 'bg-outline-strong opacity-0 group-hover:opacity-100'
                }`}
              />
            </div>
          </>
        )}

        <div className="min-w-0 flex-1 overflow-hidden">
          <PreviewPanel onExportPDF={onExportPDF} isExporting={isExporting} />
        </div>
      </div>
    </main>
  )
}
