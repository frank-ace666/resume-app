import { useEffect, useRef, useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { getRelease } from '@/data/releases'

/**
 * 判断要不要弹「本版更新」。
 *
 * 首次运行**不弹** —— 新用户没有可对比的旧版本，弹「更新了什么」很突兀，
 * 直接静默记下当前版本即可。只有检测到版本变化才提示一次。
 */
export function useWhatsNew() {
  const lastSeenVersion = useUIStore((s) => s.lastSeenVersion)
  const setLastSeenVersion = useUIStore((s) => s.setLastSeenVersion)

  const [isOpen, setIsOpen] = useState(false)
  const checked = useRef(false)

  const release = getRelease(__APP_VERSION__)

  useEffect(() => {
    if (checked.current) return
    // 等 persist 水合完成（zustand 的 localStorage 存储是同步的，
    // 但首帧仍可能是初始值，这里用一个 tick 的余量）
    if (lastSeenVersion === undefined) return
    checked.current = true

    if (!lastSeenVersion) {
      setLastSeenVersion(__APP_VERSION__)
      return
    }
    if (lastSeenVersion !== __APP_VERSION__ && release) {
      setIsOpen(true)
    }
  }, [lastSeenVersion, setLastSeenVersion, release])

  const dismiss = () => {
    setIsOpen(false)
    setLastSeenVersion(__APP_VERSION__)
  }

  return { isOpen, release, dismiss }
}
