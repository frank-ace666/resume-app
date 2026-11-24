import { useEffect, useRef } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import { useUIStore } from '@/store/uiStore'

export function useAutoSave() {
  const data = useResumeStore((s) => s.data)
  const isDirty = useResumeStore((s) => s.isDirty)
  const setDirty = useResumeStore((s) => s.setDirty)
  const setIsAutoSaved = useUIStore((s) => s.setIsAutoSaved)
  const setLastSavedAt = useUIStore((s) => s.setLastSavedAt)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 实际写入由 secureStorage 防抖完成（约 300ms 后写加密文件）；
  // 这里的 2 秒只负责把状态栏从「正在保存」切到「已自动保存」。
  useEffect(() => {
    if (!isDirty) return

    setIsAutoSaved(false)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setDirty(false)
      setIsAutoSaved(true)
      setLastSavedAt(new Date().toLocaleTimeString('zh-CN'))
    }, 2000)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [data, isDirty, setDirty, setIsAutoSaved, setLastSavedAt])
}
