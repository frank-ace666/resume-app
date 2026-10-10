/**
 * 产品级配置 —— 需要你填的都集中在这里。
 *
 * 留空的项会在界面上自动隐藏或降级为说明文案，**不会出现点了没反应的死链**。
 * 填上之后帮助模块里对应的入口会自动变成可点击的链接，无需改组件代码。
 */
export const PRODUCT = {
  name: '简历工坊',
  email: 'aceg5166@gmail.com',

  /**
   * 代码仓库地址。同时被「检查更新」用来定位版本清单。
   * 例：'https://github.com/your-name/resume-craft'
   */
  repoUrl: 'https://github.com/frank-ace666/resume-app',

  /**
   * 社区 / 讨论区地址。目前建议用 GitHub Discussions（免费、零维护、可被搜索收录）。
   * 留空时「支持我」里会显示为「尚未开放」，并引导走邮件。
   * 例：'https://github.com/your-name/resume-craft/discussions'
   */
  communityUrl: '',

  /**
   * 新版本下载页。留空时由仓库地址推导（指向 Releases 页）。
   */
  downloadUrl: '',

  /**
   * 打赏入口。
   *
   * 目前**刻意没有实现**「支持我」栏：仓库根目录的 support.jpg 是微信收款码，
   * 但暂不放进应用（作者决定稍后再上）。
   *
   * 恢复时注意：不要写「本应用没有收费计划」这类文案（与收款码矛盾），
   * 且打赏应当是可选的，不能与「免费使用全部功能」的表述冲突。
   */
  donationImage: 'support.jpg'
} as const

export const hasLink = (v: string): boolean => v.trim().length > 0

/* ============================================================
   从仓库地址推导出的地址
   ------------------------------------------------------------
   只用 repoUrl 一个来源，避免多处配置各自漂移。
   ============================================================ */

const REPO_PATH = PRODUCT.repoUrl.replace(/^https?:\/\/github\.com\//, '').replace(/\/+$/, '')

export const REPO = REPO_PATH.includes('/')
  ? { owner: REPO_PATH.split('/')[0], name: REPO_PATH.split('/')[1] }
  : null

/**
 * 版本清单地址。
 *
 * **刻意用 raw.githubusercontent 而不是 GitHub API**：实测匿名 API 是
 * 每 IP 每小时 60 次，走 VPN 或公司出口的用户很容易撞上
 * `API rate limit exceeded`（本次开发机的代理出口就被限流了）。
 * raw 走 CDN、不占该配额，且读的就是仓库里已存在的 package.json ——
 * 不额外维护一个容易忘记同步的版本文件。
 */
export const VERSION_MANIFEST_URL = REPO
  ? `https://raw.githubusercontent.com/${REPO.owner}/${REPO.name}/main/package.json`
  : ''

/** 新版本下载页：优先用显式配置，否则指向 Releases */
export const DOWNLOAD_URL = hasLink(PRODUCT.downloadUrl)
  ? PRODUCT.downloadUrl
  : REPO
    ? `https://github.com/${REPO.owner}/${REPO.name}/releases/latest`
    : ''
