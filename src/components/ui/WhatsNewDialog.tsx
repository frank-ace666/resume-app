import { useEffect } from 'react'
import Button from './Button'
import { ReleaseHeader, ReleaseHighlights } from './ReleaseNotes'
import type { Release } from '@/data/releases'

interface Props {
  release: Release
  onClose: () => void
  onSeeAll: () => void
}

/**
 * 「本版更新」弹窗 —— 仅在检测到版本变化时出现一次。
 *
 * 判断依据是本地记录的 lastSeenVersion，**不联网**：
 * 本应用没有后端，拿不到"最新版本"是什么，只能告诉用户
 * 手上这一版带来了什么变化。
 */
export default function WhatsNewDialog({ release, onClose, onSeeAll }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`版本 ${release.version} 更新内容`}
        onClick={(e) => e.stopPropagation()}
        className="anim-pop-in max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-surface p-6 shadow-e4"
      >
        <p className="text-[11px] font-medium uppercase tracking-wider text-brand">本版更新</p>

        <div className="mt-2">
          <ReleaseHeader release={release} />
        </div>

        <div className="mt-5 border-t border-outline pt-4">
          <ReleaseHighlights release={release} />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="text" onClick={onSeeAll} className="mr-auto">
            查看全部更新
          </Button>
          <Button variant="filled" onClick={onClose}>
            知道了
          </Button>
        </div>
      </div>
    </div>
  )
}
