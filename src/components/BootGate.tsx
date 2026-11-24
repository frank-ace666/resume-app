import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import { consumeSecureStorageError } from '@/store/secureStorage'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { IconAlert, IconFile, IconFolderOpen, IconHistory } from '@/components/ui/Icons'

type Phase = 'loading' | 'ready' | 'error'

let hydration: Promise<void> | null = null

async function doHydrate(): Promise<void> {
  await Promise.resolve(useResumeStore.persist.rehydrate())
  // persist 会吞掉 getItem 的异常并照常标记已水合，所以单独检查读取错误
  const error = consumeSecureStorageError()
  if (error) throw error
}

function startHydration(): Promise<void> {
  if (!hydration) hydration = doHydrate()
  return hydration
}

/**
 * 在异步读取加密数据完成前不渲染 App。
 *
 * 以前 persist 用同步 localStorage，store 创建时数据就绪；现在主数据在
 * userData 的加密文件里，读取是异步的。若直接渲染编辑器，空状态可能在
 * 读盘完成前写入，覆盖真实存档。这里把整个 App 挡在 hydration 之后。
 */
export default function BootGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [message, setMessage] = useState('')
  const [info, setInfo] = useState<SecureInfo | null>(null)
  const [restoring, setRestoring] = useState(false)

  const loadInfo = useCallback(async () => {
    try {
      if (window.electronAPI?.secureStore) {
        setInfo(await window.electronAPI.secureStore.info())
      }
    } catch {
      // 错误页仍可显示兜底路径
    }
  }, [])

  const run = useCallback(() => {
    setPhase('loading')
    setMessage('')
    startHydration()
      .then(() => setPhase('ready'))
      .catch((e) => {
        setMessage(e instanceof Error ? e.message : String(e))
        setPhase('error')
        void loadInfo()
      })
  }, [loadInfo])

  useEffect(() => {
    run()
  }, [run])

  const retry = () => {
    hydration = null
    run()
  }

  const openFolder = async () => {
    try {
      const result = await window.electronAPI?.openUserDataFolder()
      if (result && !result.success) setMessage(result.error || '无法打开数据文件夹')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e))
    }
  }

  const restoreLatest = async () => {
    if (!window.electronAPI?.secureStore) return
    setRestoring(true)
    setMessage('')
    try {
      const result = await window.electronAPI.secureStore.restoreLatest()
      if (result.success) {
        window.location.reload()
      } else {
        setMessage(result.error || '恢复备份失败')
        setRestoring(false)
        void loadInfo()
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e))
      setRestoring(false)
    }
  }

  if (phase === 'loading') {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-canvas">
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-brand text-white shadow-e2">
          <IconFile size={24} />
        </span>
        <p className="text-sm text-ink-2">正在加载本机简历…</p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="flex h-screen w-screen items-center justify-center overflow-auto bg-canvas p-6">
        <Card className="w-full max-w-lg p-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-danger">
              <IconAlert size={24} />
            </span>
            <div className="min-w-0">
              <h1 className="text-base font-medium text-ink">无法加载本机数据</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                可能使用了不同的 Windows 账号、数据文件被占用，或者本地文件已损坏。
                可以先尝试恢复最近备份；如果仍然失败，请打开数据文件夹手动处理。
              </p>
              {message && (
                <pre className="selectable mt-3 max-h-36 overflow-auto whitespace-pre-wrap break-words rounded-sm bg-canvas p-3 text-xs leading-relaxed text-danger">
                  {message}
                </pre>
              )}
              <p className="mt-3 text-xs leading-relaxed text-ink-3">
                数据目录：<span className="selectable text-ink-2">{info?.userDataPath ?? '%APPDATA%\\resume-app'}</span>
                <br />
                可用备份：{info ? `${info.backupCount} 份` : '读取中…'}
                {info && !info.encryptionAvailable && (
                  <>
                    <br />
                    <span className="text-warning">当前系统未提供加密能力，数据以明文文件保存。</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button variant="text" onClick={retry}>
              重试
            </Button>
            <Button
              variant="outlined"
              icon={<IconFolderOpen size={16} />}
              onClick={openFolder}
            >
              打开数据文件夹
            </Button>
            <Button
              variant="tonal"
              loading={restoring}
              disabled={!info || info.backupCount === 0}
              icon={restoring ? undefined : <IconHistory size={16} />}
              onClick={restoreLatest}
            >
              恢复最近备份
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
