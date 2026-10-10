import { useCallback, useEffect, useRef, useState } from 'react'

interface Options {
  /** 拖动开始时的容器可用宽度（不含导航栏） */
  getContainerWidth: () => number
  onResize: (pct: number) => void
}

/**
 * 编辑区 / 预览区之间的拖拽分栏。
 * 用指针事件而不是鼠标事件，避免拖到 iframe 或移出窗口时丢事件。
 */
export function useResizable({ getContainerWidth, onResize }: Options) {
  const [isDragging, setIsDragging] = useState(false)
  const frame = useRef<number | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const onMove = (e: PointerEvent) => {
      if (frame.current !== null) return
      frame.current = window.requestAnimationFrame(() => {
        frame.current = null
        const containerWidth = getContainerWidth()
        if (containerWidth <= 0) return
        onResize((e.clientX / containerWidth) * 100)
      })
    }

    const stop = () => {
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current)
        frame.current = null
      }
      setIsDragging(false)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [isDragging, getContainerWidth, onResize])

  // 拖拽期间禁用文本选中与指针样式抖动
  useEffect(() => {
    if (!isDragging) return
    const prev = document.body.style.cursor
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      document.body.style.cursor = prev
      document.body.style.userSelect = ''
    }
  }, [isDragging])

  return { isDragging, handlePointerDown }
}
