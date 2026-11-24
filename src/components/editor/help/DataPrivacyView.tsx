import { useCallback, useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import {
  IconAlert,
  IconFolderOpen,
  IconHistory,
  IconSave,
  IconTrash
} from '@/components/ui/Icons'
import { useResumeStore } from '@/store/resumeStore'
import { flushSecureStore } from '@/store/secureStorage'
import { saveToFile } from '@/utils/fileIO'
import { toast } from '@/store/toastStore'

/**
 * 数据与隐私：展示真实存储位置、加密与备份状态，
 * 提供导出 JSON、恢复最近备份、双重确认清除本机数据。
 */
export default function DataPrivacyView() {
  const [info, setInfo] = useState<SecureInfo | null>(null)
  const [loadError, setLoadError] = useState('')
  const [clearStep, setClearStep] = useState<0 | 1 | 2>(0)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const refreshInfo = useCallback(async () => {
    try {
      if (window.electronAPI?.secureStore) {
        setInfo(await window.electronAPI.secureStore.info())
        setLoadError('')
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  useEffect(() => {
    void refreshInfo()
  }, [refreshInfo])

  const handleExport = async () => {
    try {
      const result = await saveToFile(useResumeStore.getState().data)
      if (result.success) toast.success('已导出 JSON 备份')
      else toast.error('导出失败，请重试')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '导出失败，请重试')
    }
  }

  const handleRestore = async () => {
    if (busy) return
    if (!window.electronAPI?.secureStore) {
      toast.error('当前环境不支持本机数据恢复')
      return
    }
    setBusy(true)
    setRestoreOpen(false)
    try {
      await flushSecureStore()
      const result = await window.electronAPI.secureStore.restoreLatest()
      if (result.success) {
        window.location.reload()
        return
      }
      toast.error(result.error || '恢复备份失败')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '恢复备份失败')
    } finally {
      setBusy(false)
      void refreshInfo()
    }
  }

  const handleClear = async () => {
    if (busy) return
    if (!window.electronAPI?.secureStore) {
      toast.error('当前环境不支持清除本机数据')
      return
    }
    setBusy(true)
    try {
      // 先把手头尚未落盘的内容写下去，再整体删除，避免 pending 在清除后“复活”
      await flushSecureStore()
      const result = await window.electronAPI.secureStore.clear()
      if (!result.success) {
        toast.error(result.error || '清除本机数据失败')
        return
      }
      localStorage.removeItem('resume-craft-data')
      localStorage.removeItem('resume-craft-ui')
      window.location.reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '清除本机数据失败')
    } finally {
      setBusy(false)
      setClearStep(0)
      void refreshInfo()
    }
  }

  const encryptionText = info
    ? info.encryptionAvailable
      ? 'Windows 系统加密（DPAPI）'
      : '明文（系统加密不可用）'
    : '读取中…'

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-medium text-ink">数据与隐私</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-2">
          简历默认使用 Windows 系统加密保存在本机，只有当前 Windows 账号能解密。
          应用不联网上传简历内容。
        </p>
      </div>

      {loadError && (
        <Card className="border-danger/40 bg-danger-soft/40 p-4">
          <p className="flex items-start gap-2 text-sm text-danger">
            <IconAlert size={16} />
            <span className="min-w-0 break-words">{loadError}</span>
          </p>
        </Card>
      )}

      {info && !info.encryptionAvailable && (
        <Card className="border-warning/40 bg-warning-soft/50 p-4">
          <p className="flex items-start gap-2 text-sm text-ink-2">
            <IconAlert size={16} className="mt-0.5 shrink-0 text-warning" />
            <span>
              当前系统未提供加密能力，数据会以明文文件保存。请使用受信任的 Windows
              账号，并考虑开启 BitLocker 等磁盘加密。
            </span>
          </p>
        </Card>
      )}

      <Card className="p-4">
        <div className="space-y-2.5 text-sm">
          <div className="flex items-start justify-between gap-4">
            <span className="shrink-0 text-ink-3">存放位置</span>
            <span className="selectable break-all text-right text-ink-2">
              {info?.userDataPath ?? '%APPDATA%\\resume-app'}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="shrink-0 text-ink-3">加密状态</span>
            <span className="text-right text-ink-2">{encryptionText}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="shrink-0 text-ink-3">自动备份</span>
            <span className="text-right text-ink-2">
              {info ? `${info.backupCount} 份（每次启动自动保留，最多 5 份）` : '读取中…'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-outline pt-4">
          <Button
            variant="outlined"
            size="sm"
            icon={<IconFolderOpen size={15} />}
            onClick={async () => {
              const result = await window.electronAPI?.openUserDataFolder()
              if (result && !result.success) toast.error(result.error || '无法打开数据文件夹')
            }}
          >
            打开数据文件夹
          </Button>
          <Button
            variant="tonal"
            size="sm"
            icon={<IconSave size={15} />}
            onClick={handleExport}
          >
            导出 JSON 备份
          </Button>
          <Button
            variant="outlined"
            size="sm"
            icon={<IconHistory size={15} />}
            disabled={!info || info.backupCount === 0 || busy}
            onClick={() => setRestoreOpen(true)}
          >
            恢复最近备份
          </Button>
          <Button
            variant="text"
            size="sm"
            icon={<IconTrash size={15} />}
            className="text-danger hover:bg-danger-soft"
            disabled={busy}
            onClick={() => setClearStep(1)}
          >
            清除本机数据
          </Button>
        </div>
      </Card>

      <Card className="bg-canvas p-4">
        <p className="text-sm font-medium text-ink">换电脑 / 长期保存</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-2">
          加密文件绑定当前 Windows 账号，直接复制
          <span className="selectable"> %APPDATA%\resume-app </span>
          到另一台设备通常无法解密。换电脑请先用「导出 JSON 备份」，在新设备用工具栏的「打开」载入。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-2">
          「清除本机数据」会删除加密主文件、最近备份和布局设置，且无法撤销。建议先导出 JSON 备份。
        </p>
      </Card>

      <ConfirmDialog
        open={restoreOpen}
        title="恢复最近备份？"
        description="将用最近一份自动备份覆盖当前简历。当前数据会先另存为 pre-restore 备份。"
        confirmLabel="恢复"
        onCancel={() => setRestoreOpen(false)}
        onConfirm={() => void handleRestore()}
      />

      <ConfirmDialog
        open={clearStep === 1}
        title="清除本机数据？"
        description="将删除本机保存的简历、自动备份和布局设置。此操作无法撤销，建议先导出 JSON 备份。"
        confirmLabel="继续"
        danger
        onCancel={() => setClearStep(0)}
        onConfirm={() => setClearStep(2)}
      />

      <ConfirmDialog
        open={clearStep === 2}
        title="最后确认"
        description="请确认已经导出 JSON 备份。清除后无法恢复。"
        confirmLabel={busy ? '清除中…' : '清除并重启'}
        danger
        onCancel={() => setClearStep(0)}
        onConfirm={() => void handleClear()}
      />
    </div>
  )
}
