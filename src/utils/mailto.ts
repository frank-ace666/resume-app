/**
 * 反馈邮箱与外链打开。
 *
 * 本应用是离线的，没有后端，所以「建议 / 投稿」都走邮件。
 * Electron 里 **不能** 用裸 `<a href="mailto:...">` —— 那会触发导航，
 * 让渲染进程加载失败变白屏。所有外链都必须经 `electronAPI.openExternal`，
 * 由主进程做协议白名单校验后交给系统默认程序。
 */

/** 反馈邮箱（唯一出口） */
export const FEEDBACK_EMAIL = 'aceg5166@gmail.com'

interface MailOptions {
  subject: string
  body?: string
}

/** 生成 mailto: 链接。对主题与正文做编码，避免换行/中文出错。 */
export function buildMailto({ subject, body = '' }: MailOptions): string {
  const params = new URLSearchParams()
  params.set('subject', subject)
  if (body) params.set('body', body)
  return `mailto:${FEEDBACK_EMAIL}?${params.toString()}`
}

/**
 * 打开一个外链。浏览器回退环境下退化为直接跳转，
 * 这样开发时用 `npm run dev` 在浏览器里也能点。
 */
export async function openExternal(url: string): Promise<boolean> {
  if (window.electronAPI?.openExternal) {
    const res = await window.electronAPI.openExternal(url)
    return Boolean(res?.success)
  }
  window.open(url, '_blank', 'noopener')
  return true
}

/** 复制文本到剪贴板，返回是否成功 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
