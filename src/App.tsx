import { useCallback, useState } from 'react'
import AppBar from './components/layout/AppBar'
import MainLayout from './components/layout/MainLayout'
import StatusBar from './components/layout/StatusBar'
import ConfirmDialog from './components/ui/ConfirmDialog'
import ValidationBlockDialog from './components/ui/ValidationBlockDialog'
import ToastHost from './components/ui/ToastHost'
import { useResumeStore } from './store/resumeStore'
import { useUIStore } from './store/uiStore'
import { useAutoSave } from './hooks/useAutoSave'
import { usePdfExport } from './hooks/usePdfExport'
import { useAccentTheme } from './hooks/useAccentTheme'
import { saveToFile, loadFromFile } from './utils/fileIO'
import { toast } from './store/toastStore'

export default function App() {
  const resetData = useResumeStore((s) => s.resetData)
  const loadData = useResumeStore((s) => s.loadData)
  const setFileName = useResumeStore((s) => s.setFileName)
  const data = useResumeStore((s) => s.data)
  const isAutoSaved = useUIStore((s) => s.isAutoSaved)
  const lastSavedAt = useUIStore((s) => s.lastSavedAt)

  const [confirmNewOpen, setConfirmNewOpen] = useState(false)

  // 自动保存（必须挂在顶层：移入面板会因 unmount 清理定时器而失效）
  useAutoSave()

  // 简历强调色 → 应用外壳主题
  useAccentTheme()

  // PDF 导出（含导出前的格式校验闸门）
  const { isExporting, handleExportPDF, exportAnyway, blockedIssues, clearBlocked } =
    usePdfExport()

  const hasContent = Boolean(data.personalInfo.fullName || data.summary)

  const doCreateNew = useCallback(() => {
    resetData()
    toast.info('已新建空白简历')
  }, [resetData])

  const handleCreateNew = useCallback(() => {
    if (hasContent) {
      setConfirmNewOpen(true)
      return
    }
    doCreateNew()
  }, [hasContent, doCreateNew])

  const handleOpenFile = useCallback(async () => {
    const result = await loadFromFile()
    if (result.success && result.data) {
      loadData(result.data, result.filePath)
      toast.success('简历已打开')
    } else if (result.success === false && !window.electronAPI) {
      toast.error('当前环境不支持打开本地文件')
    }
  }, [loadData])

  const handleSaveFile = useCallback(async () => {
    const result = await saveToFile(data)
    if (result.success) {
      setFileName(result.filePath || '')

    
      
      toast.success('简历已保存到文件')
    } else {
      toast.error('保存失败，请重试')
    }
  }, [data, setFileName])

  return (
    <>
      <AppBar
        onCreateNew={handleCreateNew}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
      />

      <MainLayout onExportPDF={handleExportPDF} isExporting={isExporting} />

      <StatusBar isAutoSaved={isAutoSaved} lastSavedAt={lastSavedAt} />

      <ConfirmDialog
        open={confirmNewOpen}
        danger
        title="新建简历？"
        description="当前简历的内容将被清除，且此操作无法撤销。建议先保存到文件。"
        confirmLabel="清除并新建"
        onCancel={() => setConfirmNewOpen(false)}
        onConfirm={() => {
          setConfirmNewOpen(false)
          doCreateNew()
        }}
      />

      <ValidationBlockDialog
        issues={blockedIssues}
        onClose={clearBlocked}
        onExportAnyway={exportAnyway}
      />

      <ToastHost />
    </>
  )
}
