import { useCallback, useState } from 'react'
import { exportPDF } from '@/utils/pdfExport'

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExportPDF = useCallback(async () => {
    const element = document.getElementById('resume-preview-content')
    if (!element) {
      setError('未找到简历预览内容')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      const success = await exportPDF(element)
      if (success) {
        // 导出成功
      } else {
        setError('PDF 导出失败，请重试')
      }
    } catch {
      setError('PDF 导出时发生错误')
    } finally {
      setIsExporting(false)
    }
  }, [])

  return {
    isExporting,
    error,
    handleExportPDF,
    clearError: () => setError(null)
  }
}
