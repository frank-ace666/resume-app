import { useEffect, useRef, useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { getRelease } from '@/data/releases'

/**
 * 判断要不要弹「本版更新」。
 *
 * 首次运行**不弹** —— 新用户没有可对比的旧版本，弹「更新了什么」很突兀，
 * 直接静默记下当前版本即可。只有检测到版本变化才提示一次。
 *
 * 版本号存在 localStorage 里，读取是同步的，因此不需要等待水合。
 */
export function useWhatsNew() {
  const lastSeenVersion = useUIStore((s) => s.lastSeenVersion)
  const setLastSeenVersion = useUIStore((s) => s.setLastSeenVersion)

  const [isOpen, setIsOpen] = useState(false)
  const decided = useRef(false)

  const release = getRelease(__APP_VERSION__)

  useEffect(() => {
    // 只在首次挂载时判断一次；之后 lastSeenVersion 会被我们改写，
    // 不锁住的话会重复触发
    if (decided.current) return
    decided.current = true

    if (lastSeenVersion === __APP_VERSION__) return
    if (!lastSeenVersion) {
      setLastSeenVersion(__APP_VERSION__)
      return
    }
    if (release) setIsOpen(true)
  }, [lastSeenVersion, setLastSeenVersion, release])

  const dismiss = () => {
    setIsOpen(false)
    setLastSeenVersion(__APP_VERSION__)
  }

  return { isOpen, release, dismiss }
}
