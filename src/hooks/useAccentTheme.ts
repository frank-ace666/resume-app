import { useEffect } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import { buildBrandScale } from '@/utils/color'

/**
 * 把简历强调色同步到应用外壳的 --color-brand* 令牌上。
 * Tailwind 的 bg-brand / text-brand 等都编译成 var(--color-brand)，
 * 所以覆盖这几个变量即可整站换色，无需重编译。
 */
export function useAccentTheme() {
  const accent = useResumeStore((s) => s.data.meta.accentColor)

  useEffect(() => {
    const scale = buildBrandScale(accent)
    const root = document.documentElement
    root.style.setProperty('--color-brand', scale.brand)
    root.style.setProperty('--color-brand-hover', scale.brandHover)
    root.style.setProperty('--color-brand-active', scale.brandActive)
    root.style.setProperty('--color-brand-soft', scale.brandSoft)
    root.style.setProperty('--color-brand-soft-hover', scale.brandSoftHover)
  }, [accent])
}
