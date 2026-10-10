/**
 * 简历强调色预设。
 *
 * 调研结论：简历全篇只用 1 个强调色，且只出现在分区标题、分隔线、姓名上，
 * 每页 2–3 处；正文保持纯黑/深灰，保证灰度打印与 ATS 解析都不受影响。
 * 因此这里给的是低饱和、可灰度区分的专业色，而不是高饱和的鲜艳色。
 */
export interface AccentPreset {
  name: string
  value: string
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { name: '藏青', value: '#1a73e8' },
  { name: '墨蓝', value: '#1f4e79' },
  { name: '石墨', value: '#3c4043' },
  { name: '松绿', value: '#1e6b52' },
  { name: '酒红', value: '#9c2b2b' },
  { name: '绛紫', value: '#5b3a8e' },
  { name: '赭石', value: '#8a5a2b' },
  { name: '青灰', value: '#37667d' }
]

export const DEFAULT_ACCENT_VALUE = ACCENT_PRESETS[0].value
