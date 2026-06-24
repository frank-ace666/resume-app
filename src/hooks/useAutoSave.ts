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

  // 自动保存：数据变化 2 秒后写入 localStorage（Zustand persist 中间件已处理）
  useEffect(() => {
    if (!isDirty) return

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      // Zustand persist 中间件会自动将数据写入 localStorage
      // 这里标记为已保存
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
