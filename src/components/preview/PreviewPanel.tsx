import PreviewToolbar from './PreviewToolbar'
import ResumePreview from './ResumePreview'

interface PreviewPanelProps {
  onExportPDF: () => void
  isExporting: boolean
}

export default function PreviewPanel({ onExportPDF, isExporting }: PreviewPanelProps) {
  return (
    <section className="flex-1 overflow-auto bg-slate-100 p-6">
      <PreviewToolbar onExportPDF={onExportPDF} isExporting={isExporting} />
      <ResumePreview />
    </section>
  )
}
