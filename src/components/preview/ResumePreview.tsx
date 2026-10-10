import { useEffect, useMemo, useRef, useState } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import { getTemplate } from '@/utils/templateRegistry'
import { useUIStore } from '@/store/uiStore'

const CSS_PX_PER_MM = 96 / 25.4
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const A4_WIDTH_PX = A4_WIDTH_MM * CSS_PX_PER_MM // 793.7
const A4_HEIGHT_PX = A4_HEIGHT_MM * CSS_PX_PER_MM // 1122.5

export default function ResumePreview() {
  const data = useResumeStore((s) => s.data)
  const scale = useUIStore((s) => s.previewScale)
  const fitToWidth = useUIStore((s) => s.fitToWidth)

  const measureRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [availablePx, setAvailablePx] = useState(0)
  const [contentHeightPx, setContentHeightPx] = useState(A4_HEIGHT_PX)

  const TemplateComponent = useMemo(
    () => getTemplate(data.meta.templateId).component,
    [data.meta.templateId]
  )

  // 适应宽度：跟随容器宽度
  useEffect(() => {
    const el = measureRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setAvailablePx(entry.contentRect.width)
    })
    ro.observe(el)
    setAvailablePx(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // 内容实际高度 → 页数（用于分页参考线）
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setContentHeightPx(el.scrollHeight))
    ro.observe(el)
    setContentHeightPx(el.scrollHeight)
    return () => ro.disconnect()
  }, [])

  const fitScale = availablePx > 0 ? (availablePx / A4_WIDTH_PX) * 100 : 100
  const effectiveScale = fitToWidth ? Math.min(fitScale, 200) : scale
  const factor = effectiveScale / 100

  const pageCount = Math.max(1, Math.ceil((contentHeightPx - 1) / A4_HEIGHT_PX))

  return (
    <div ref={measureRef} className="mx-auto w-full max-w-full">
      {/* 外层负责占位，尺寸随缩放变化 */}
      <div
        className="zoom-surface relative mx-auto overflow-hidden rounded-xs bg-white"
        style={{
          width: `${A4_WIDTH_MM * factor}mm`,
          height: `${A4_HEIGHT_MM * factor}mm`,
          // 用显式 rgba 而不是 ring-black/5 —— 透明度修饰符会编译成 color-mix()，
          // 而这正是被捕获节点的直接父级，尽量避免给 html2canvas 制造解析风险
          boxShadow: '0 1px 3px rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15)'
        }}
      >
        {/* 缩放只作用在这一层 —— 被 PDF 捕获的节点必须保持 1:1 */}
        <div
          style={{
            width: `${A4_WIDTH_MM}mm`,
            minHeight: `${A4_HEIGHT_MM}mm`,
            transform: `scale(${factor})`,
            transformOrigin: 'top left'
          }}
        >
          <div
            id="resume-preview-content"
            ref={contentRef}
            className="bg-white"
            style={{ width: `${A4_WIDTH_MM}mm`, minHeight: `${A4_HEIGHT_MM}mm` }}
            data-page-count={pageCount}
          >
            <TemplateComponent data={data} />
          </div>
        </div>

        {/* 分页参考线：标出 A4 的每一页边界 */}
        {pageCount > 1 &&
          Array.from({ length: pageCount - 1 }, (_, i) => (
            <div
              key={i}
              className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-danger/50"
              style={{ top: `${A4_HEIGHT_MM * (i + 1) * factor}mm` }}
            >
              <span className="absolute right-1 -top-2 rounded-xs bg-danger/85 px-1 py-0.5 text-[9px] font-medium text-white">
                第 {i + 2} 页
              </span>
            </div>
          ))}
      </div>

      {pageCount > 1 && (
        <p className="mt-3 text-center text-xs text-ink-2">
          共 {pageCount} 页 · 导出 PDF 时将按此分页
        </p>
      )}
    </div>
  )
}
