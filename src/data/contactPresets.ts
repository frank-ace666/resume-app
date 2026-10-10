import type { ContactKind } from '@/types/resume'

/**
 * 常用联系项预设。
 *
 * 目的是把「加一个自定义字段」的成本降到一次点击，同时**带上正确的校验类型** ——
 * 让用户自己选类型是把校验责任推给用户，多数人会直接选「文本」，
 * 于是自定义字段等于没有校验。
 *
 * 用户仍可完全自定义名称与类型，预设只是把常见情况铺好路。
 */
export interface ContactPreset {
  label: string
  kind: ContactKind
  placeholder: string
  /** 分组，仅用于界面归类 */
  group: '国内常用' | '社区' | '作品集'
}

export const CONTACT_PRESETS: ContactPreset[] = [
  // —— 国内求职最常见的两个 ——
  { label: 'QQ', kind: 'number', placeholder: 'QQ 号', group: '国内常用' },
  { label: '微信', kind: 'account', placeholder: '微信号', group: '国内常用' },
  { label: '手机', kind: 'phone', placeholder: '手机号码', group: '国内常用' },
  { label: '备用邮箱', kind: 'email', placeholder: 'backup@example.com', group: '国内常用' },

  // —— 技术/内容社区 ——
  { label: '掘金', kind: 'account', placeholder: '掘金用户名', group: '社区' },
  { label: '知乎', kind: 'account', placeholder: '知乎用户名', group: '社区' },
  { label: '微博', kind: 'account', placeholder: '微博用户名', group: '社区' },
  { label: 'Bilibili', kind: 'account', placeholder: 'B 站 UID 或昵称', group: '社区' },
  { label: '豆瓣', kind: 'account', placeholder: '豆瓣 ID', group: '社区' },
  { label: '小红书', kind: 'account', placeholder: '小红书号', group: '社区' },
  { label: '微信公众号', kind: 'account', placeholder: '公众号名称', group: '社区' },

  // —— 作品集（设计/前端常用）——
  { label: '作品集', kind: 'url', placeholder: 'https://your-portfolio.dev', group: '作品集' },
  { label: '个人博客', kind: 'url', placeholder: 'https://blog.example.dev', group: '作品集' },
  { label: 'Dribbble', kind: 'url', placeholder: 'https://dribbble.com/username', group: '作品集' },
  { label: 'Behance', kind: 'url', placeholder: 'https://behance.net/username', group: '作品集' },
  { label: '站酷', kind: 'url', placeholder: 'https://www.zcool.com.cn/u/xxxxx', group: '作品集' }
]

/** 按名称精确匹配预设（用于「自定义」时自动带出合适的类型） */
export function presetByLabel(label: string): ContactPreset | undefined {
  const t = label.trim().toLowerCase()
  return CONTACT_PRESETS.find((p) => p.label.toLowerCase() === t)
}

/**
 * 根据用户输入的字段名猜一个类型。
 *
 * 只在**明显**的情况下猜（名称里含「网址/博客/作品集」等），
 * 猜不准就返回 `text`（不校验）——**宁可漏校验，也不要误报**：
 * 把用户正确的输入判成错误，比少校验一次更让人恼火。
 */
export function inferContactKind(label: string): ContactKind {
  const exact = presetByLabel(label)
  if (exact) return exact.kind

  const t = label.trim()
  if (/网址|主页|博客|作品集|链接|portfolio|site|url/i.test(t)) return 'url'
  if (/邮箱|邮件|mail/i.test(t)) return 'email'
  if (/电话|手机|座机|tel|phone/i.test(t)) return 'phone'
  if (/号$|号码|qq/i.test(t)) return 'number'
  return 'text'
}
