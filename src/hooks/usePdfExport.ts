import { useCallback, useState } from 'react'
import { exportPDF } from '@/utils/pdfExport'
import { useResumeStore } from '@/store/resumeStore'
import { toast } from '@/store/toastStore'
import { collectResumeIssues, type ResumeValidationIssue } from '@/utils/validators'

/**
 * PDF 导出。
 *
 * 交互反馈一律走 toast（这里不再自己维护一份 error state ——
 * 曾经同时存在 toast 和 error 两套提示，是重复的表达，且 `error` 无人读取）。
 * 唯一保留在本 hook 里的状态是需要参与渲染的 `blockedIssues`。
 */
export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [blockedIssues, setBlockedIssues] = useState<ResumeValidationIssue[]>([])
  const fileName = useResumeStore((s) => s.fileName)

  const runExport = useCallback(async () => {
    const element = document.getElementById('resume-preview-content')
    if (!element) {
      toast.error('未找到简历预览内容，请刷新后重试')
      return
    }

    setIsExporting(true)
    toast.info('正在生成 PDF…', { duration: 1600 })

    try {
      const { data } = useResumeStore.getState()
      const baseName = fileName
        ? fileName.replace(/\.[^.]+$/, '')
        : data.personalInfo.fullName.trim()
          ? `${data.personalInfo.fullName.trim()}-简历`
          : '我的简历'

      const success = await exportPDF(element, baseName)
      // 失败多半是用户在弹出的保存对话框里点了取消，不算错误
      toast[success ? 'success' : 'info'](success ? 'PDF 已导出' : '已取消导出')
    } catch {
      toast.error('PDF 导出时发生错误，请重试')
    } finally {
      setIsExporting(false)
    }
  }, [fileName])

  /** 导出前的闸门：用与表单同一套谓词扫一遍，有问题先列出来 */
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
    handleExportPDF,
    exportAnyway,
    blockedIssues,
    clearBlocked: () => setBlockedIssues([])
  }
}
