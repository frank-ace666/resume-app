import { useMemo } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import { getTemplate } from '@/utils/templateRegistry'
import { useUIStore } from '@/store/uiStore'

export default function ResumePreview() {
  const data = useResumeStore((s) => s.data)
  const scale = useUIStore((s) => s.previewScale)

  const TemplateComponent = useMemo(
    () => getTemplate(data.meta.templateId).component,
    [data.meta.templateId]
  )

  const scaleFactor = scale / 100

  return (
    <div
      className="mx-auto"
      style={{
        width: `${210 * scaleFactor}mm`,
        height: `${297 * scaleFactor}mm`,
        overflow: 'hidden'
      }}
    >
      <div
        id="resume-preview-content"
        className="bg-white shadow-lg"
        style={{
          width: '210mm',
          minHeight: '297mm',
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'top left'
        }}
      >
        <TemplateComponent data={data} />
      </div>
    </div>
  )
}
