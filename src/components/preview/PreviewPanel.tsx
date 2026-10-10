import { useEffect, useRef } from 'react'
import PreviewToolbar from './PreviewToolbar'
import ResumePreview from './ResumePreview'
import { useUIStore } from '@/store/uiStore'

interface PreviewPanelProps {
  onExportPDF: () => void
  isExporting: boolean
}

export default function PreviewPanel({ onExportPDF, isExporting }: PreviewPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const setScale = useUIStore((s) => s.setPreviewScale)
  const previewScale = useUIStore((s) => s.previewScale)
  const setFitToWidth = useUIStore((s) => s.setFitToWidth)

  // Ctrl + 滚轮缩放。必须用非 passive 监听，才能 preventDefault 阻止页面缩放。
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      setFitToWidth(false)
      const delta = e.deltaY > 0 ? -10 : 10
      setScale(previewScale + delta)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [previewScale, setScale, setFitToWidth])

  return (
    <section className="flex h-full flex-col bg-canvas">
      <PreviewToolbar onExportPDF={onExportPDF} isExporting={isExporting} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        style={{
          // 淡淡的网格背景，让 A4 纸张从画布上"浮"起来
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(60,64,67,0.09) 1px, transparent 0)',
          backgroundSize: '22px 22px'
        }}
      >
        <div className="px-8 py-8">
          <ResumePreview />
        </div>
      </div>
    </section>
  )
}
