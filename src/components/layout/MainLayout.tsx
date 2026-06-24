import EditorPanel from '@/components/editor/EditorPanel'
import PreviewPanel from '@/components/preview/PreviewPanel'

interface MainLayoutProps {
  onExportPDF: () => void
  isExporting: boolean
}

export default function MainLayout({ onExportPDF, isExporting }: MainLayoutProps) {
  return (
    <main className="flex flex-1 overflow-hidden">
      <EditorPanel />
      <PreviewPanel onExportPDF={onExportPDF} isExporting={isExporting} />
    </main>
  )
}
