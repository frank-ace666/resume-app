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
   * 代码仓库地址。填上后「支持我」里会出现「给项目点个 star」。
   * 例：'https://github.com/your-name/resume-craft'
   */
  repoUrl: '',

  /**
   * 社区 / 讨论区地址。目前建议用 GitHub Discussions（免费、零维护、可被搜索收录）。
   * 留空时「支持我」里会显示为「尚未开放」，并引导走邮件。
   * 例：'https://github.com/your-name/resume-craft/discussions'
   */
  communityUrl: '',

  /**
   * 新版本下载页。用于「检查更新」与更新提示里的按钮。
   * 留空时更新日志会说明本应用离线运行、需手动获取新版本。
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
