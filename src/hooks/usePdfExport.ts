import { useCallback, useState } from 'react'
import { exportPDF } from '@/utils/pdfExport'
import { useResumeStore } from '@/store/resumeStore'
import { toast } from '@/store/toastStore'
import { collectResumeIssues, type ResumeValidationIssue } from '@/utils/validators'

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [blockedIssues, setBlockedIssues] = useState<ResumeValidationIssue[]>([])
  const fileName = useResumeStore((s) => s.fileName)

  /** 真正执行导出。只应由 handleExportPDF 或「仍然导出」调用。 */
  const runExport = useCallback(async () => {
    const element = document.getElementById('resume-preview-content')
    if (!element) {
      setError('未找到简历预览内容')
      toast.error('未找到简历预览内容，请刷新后重试')
      return
    }

    setIsExporting(true)
    setError(null)
    toast.info('正在生成 PDF…', { duration: 1600 })

    try {
      // 用文件名（去掉扩展名）作为 PDF 默认名，否则回退到姓名
      const fallback = useResumeStore.getState().data.personalInfo.fullName
      const baseName = fileName
        ? fileName.replace(/\.[^.]+$/, '')
        : fallback
          ? `${fallback}-简历`
          : '我的简历'

      const success = await exportPDF(element, baseName)
      if (success) {
        toast.success('PDF 已导出')
      } else {
        // 用户在弹出的保存对话框里点了取消，不算失败
        toast.info('已取消导出')
      }
    } catch {
      setError('PDF 导出时发生错误')
      toast.error('PDF 导出时发生错误，请重试')
    } finally {
      setIsExporting(false)
    }
  }, [fileName])

  /**
   * 导出前的闸门：先用与表单同一套谓词扫一遍，
   * 有问题就拦下并列出，而不是导出一份带错格式的简历出去。
   */
  const handleExportPDF = useCallback(() => {
    const issues = collectResumeIssues(useResumeStore.getState().data)
    if (issues.length > 0) {
      setBlockedIssues(issues)
      return
    }
    void runExport()
  }, [runExport])

  /** 用户选择「仍然导出」：放行一次 */
  const exportAnyway = useCallback(() => {
    setBlockedIssues([])
    void runExport()
  }, [runExport])

  return {
    isExporting,
    error,
    handleExportPDF,
    exportAnyway,
    blockedIssues,
    clearBlocked: () => setBlockedIssues([]),
    clearError: () => setError(null)
  }
}
