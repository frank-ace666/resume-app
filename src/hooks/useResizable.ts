import { useCallback, useEffect, useRef, useState } from 'react'

interface Options {
  /** 分栏容器的几何信息（不含左侧导航） */
  getContainerRect: () => DOMRect | null
  /** 拖拽中的实时回调；应避免写持久化状态 */
  onResize: (pct: number) => void
  /** 松开鼠标 / 取消时提交最终值 */
  onResizeEnd: (pct: number) => void
}

/**
 * 编辑区 / 预览区之间的拖拽分栏。
 *
 * 关键点：
 * - 用 `clientX - 容器 left`，而不是 `clientX / 容器宽度` ——
 *   后者把左侧导航的宽度也算进了百分比，第一次拖动会直接跳到右边界
 *   （实测 1280 窗口、导航展开时从 52% 跳到 75% 上限）。
 * - 记录按下点相对分隔条中心的偏移，避免点在加宽的命中区边缘时跳动。
 * - 拖拽中只调用 onResize（通常直接写 CSS 变量），松手才 onResizeEnd 写 store，
 *   避免每帧写 localStorage 造成卡顿。
 * - 用指针事件而不是鼠标事件，避免拖出窗口时丢事件。
 */
export function useResizable({ getContainerRect, onResize, onResizeEnd }: Options) {
  const [isDragging, setIsDragging] = useState(false)
  const frame = useRef<number | null>(null)
  const grabOffset = useRef(0)
  const lastPct = useRef<number | null>(null)

  const computePct = useCallback(
    (clientX: number) => {
      const rect = getContainerRect()
      if (!rect || rect.width <= 0) return null
      return ((clientX - grabOffset.current - rect.left) / rect.width) * 100
    },
    [getContainerRect]
  )

  const emit = useCallback(
    (pct: number) => {
      lastPct.current = pct
      onResize(pct)
    },
    [onResize]
  )

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    // 保持「按住的分隔条位置」与指针的相对关系，点击命中区边缘也不会跳
    const rect = e.currentTarget.getBoundingClientRect()
    grabOffset.current = e.clientX - (rect.left + rect.width / 2)
    lastPct.current = null
    setIsDragging(true)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // 少数指针状态不允许 capture，窗口监听仍可兜底
    }
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const onMove = (e: PointerEvent) => {
      if (frame.current !== null) return
      frame.current = window.requestAnimationFrame(() => {
        frame.current = null
        const pct = computePct(e.clientX)
        if (pct !== null) emit(pct)
      })
    }

    const finish = (clientX: number | null) => {
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current)
        frame.current = null
      }
      const pct = clientX === null ? lastPct.current : (computePct(clientX) ?? lastPct.current)
      if (pct !== null) onResizeEnd(pct)
      setIsDragging(false)
    }

    const onUp = (e: PointerEvent) => finish(e.clientX)
    const onCancel = () => finish(null)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current)
        frame.current = null
      }
    }
  }, [isDragging, computePct, emit, onResizeEnd])

  // 拖拽期间禁用文本选中、指针样式抖动，并通知预览区暂停尺寸过渡
  useEffect(() => {
    if (!isDragging) return
    const root = document.documentElement
    const prevCursor = document.body.style.cursor
    const prevUserSelect = document.body.style.userSelect
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    root.dataset.resizing = 'true'
    return () => {
      document.body.style.cursor = prevCursor
      document.body.style.userSelect = prevUserSelect
      delete root.dataset.resizing
    }
  }, [isDragging])

  return { isDragging, handlePointerDown }
}
