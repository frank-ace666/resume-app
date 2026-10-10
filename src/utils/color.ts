/**
 * 极小的颜色工具集。
 *
 * 用途：用户选了强调色后，应用外壳与简历标题都要用它。
 * 但用户可能选一个很浅的颜色 —— 白底上会读不清。所以这里提供
 * 「按对比度自动压暗」，保证正文级文字始终达到 WCAG AA 4.5:1。
 */

function clamp255(v: number) {
  return Math.max(0, Math.min(255, Math.round(v)))
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => clamp255(v).toString(16).padStart(2, '0')).join('')}`
}

/** WCAG 相对亮度 */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** 按比例线性压暗（0–1） */
export function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const f = 1 - Math.max(0, Math.min(1, amount))
  return rgbToHex(rgb.r * f, rgb.g * f, rgb.b * f)
}

/** 把 color 按 weight 比例混入 onto（weight=0 全为 onto，1 全为 color） */
export function mix(color: string, onto: string, weight: number): string {
  const a = hexToRgb(color)
  const b = hexToRgb(onto)
  if (!a || !b) return color
  const w = Math.max(0, Math.min(1, weight))
  return rgbToHex(
    a.r * w + b.r * (1 - w),
    a.g * w + b.g * (1 - w),
    a.b * w + b.b * (1 - w)
  )
}

/**
 * 确保颜色在白色背景上达到目标对比度；不够就逐步压暗。
 * 已经达标的颜色原样返回（不会擅自改用户的选色）。
 */
export function ensureContrastOnWhite(hex: string, minRatio = 4.5): string {
  if (!hexToRgb(hex)) return hex
  if (contrastRatio(hex, '#ffffff') >= minRatio) return hex

  let current = hex
  for (let i = 0; i < 40; i++) {
    current = darken(current, 0.06)
    if (contrastRatio(current, '#ffffff') >= minRatio) return current
  }
  return current
}

/**
 * 根据强调色推导出成套的界面色板。
 * 用于把用户选的颜色同步到应用外壳的 --color-* 令牌上。
 */
export function buildBrandScale(accent: string) {
  const safe = hexToRgb(accent) ? accent : '#1a73e8'
  return {
    brand: ensureContrastOnWhite(safe, 4.5),
    brandHover: darken(ensureContrastOnWhite(safe, 4.5), 0.1),
    brandActive: darken(ensureContrastOnWhite(safe, 4.5), 0.2),
    brandSoft: mix(safe, '#ffffff', 0.12),
    brandSoftHover: mix(safe, '#ffffff', 0.22)
  }
}
