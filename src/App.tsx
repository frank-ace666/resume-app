import { useCallback } from 'react'
import Header from './components/layout/Header'
import MainLayout from './components/layout/MainLayout'
import StatusBar from './components/layout/StatusBar'
import { useResumeStore } from './store/resumeStore'
import { useUIStore } from './store/uiStore'
import { useAutoSave } from './hooks/useAutoSave'
import { usePdfExport } from './hooks/usePdfExport'
import { saveToFile, loadFromFile } from './utils/fileIO'

export default function App() {
  const resetData = useResumeStore((s) => s.resetData)
  const loadData = useResumeStore((s) => s.loadData)
  const setFileName = useResumeStore((s) => s.setFileName)
  const data = useResumeStore((s) => s.data)
  const isAutoSaved = useUIStore((s) => s.isAutoSaved)
  const lastSavedAt = useUIStore((s) => s.lastSavedAt)

  // 自动保存
  useAutoSave()

  // PDF 导出
  const { isExporting, error: pdfError, handleExportPDF, clearError } = usePdfExport()

  // 新建简历
  const handleCreateNew = useCallback(() => {
    if (data.personalInfo.fullName || data.summary) {
      // 简单判断是否有内容
      const confirmed = window.confirm('确定要新建简历吗？当前内容将被清除。')
      if (!confirmed) return
    }
    resetData()
    clearError()
  }, [data, resetData, clearError])

  // 打开文件
  const handleOpenFile = useCallback(async () => {
    const result = await loadFromFile()
    if (result.success && result.data) {
      loadData(result.data, result.filePath)
    } else if (result.success === false && window.electronAPI) {
      // 用户取消了操作
    }
  }, [loadData])

  // 保存文件
  const handleSaveFile = useCallback(async () => {
    const result = await saveToFile(data)
    if (result.success) {
      setFileName(result.filePath || '')
    }
  }, [data, setFileName])

  return (
    <>
      <Header
        onCreateNew={handleCreateNew}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
        pdfError={pdfError}
      />
      <MainLayout
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
      />
      <StatusBar
        isAutoSaved={isAutoSaved}
        lastSavedAt={lastSavedAt}
      />
    </>
  )
}
