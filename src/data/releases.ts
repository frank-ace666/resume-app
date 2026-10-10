/**
 * 版本更新日志（随包内置）。
 *
 * 本应用完全离线、没有后端，拿不到"服务器上的最新版本"，
 * 所以这里记录的是**当前这一版包含什么**，而不是"有没有新版本可下"。
 * 新增版本时在数组头部追加一项即可，界面会自动渲染。
 *
 * 文案面向使用者，不是 commit log —— 说清"我能得到什么"，
 * 而不是"改了哪些文件"。技术细节留给 docs/CHANGELOG.md。
 */

export interface Release {
  version: string
  date: string
  /** 一句话概括这一版的主题 */
  headline: string
  highlights: { title: string; desc: string; kind: 'new' | 'fix' | 'improve' }[]
}

export const KIND_LABEL: Record<Release['highlights'][number]['kind'], string> = {
  new: '新增',
  fix: '修复',
  improve: '优化'
}

export const RELEASES: Release[] = [
  {
    version: '1.3.0',
    date: '2026-10-10',
    headline: '可以检查更新了，并修好了「换不了模板」',
    highlights: [
      {
        kind: 'new',
        title: '检查更新',
        desc: '「帮助与反馈 → 更新日志」里新增检查更新。只在你自己点击时联网，不会自动下载或安装，发现新版本会给出下载页链接。'
      },
      {
        kind: 'new',
        title: '自定义联系方式',
        desc: '个人信息里可以自行添加 QQ、微信、作品集等联系项，内置 16 个常用预设，也可完全自定义名称与校验类型。'
      },
      {
        kind: 'fix',
        title: '修好了换模板、换主题色没反应',
        desc: '此前点击模板缩略图或主题色会静默失效，界面没有任何反馈（该问题在 1.2.0 中引入）。'
      },
      {
        kind: 'fix',
        title: '加了单实例锁',
        desc: '此前双击两次快捷方式会开出两个窗口，它们共享同一份本地数据，可能互相覆盖导致简历内容丢失。'
      },
      {
        kind: 'improve',
        title: '选填项标注清楚',
        desc: '「选填」改为写在字段名上（此前写在占位提示里，一开始输入就看不见了）。'
      }
    ]
  },
  {
    version: '1.2.0',
    date: '2026-10-10',
    headline: '界面重做 + 修复了「导出 PDF」完全不可用的问题',
    highlights: [
      {
        kind: 'fix',
        title: '导出的 PDF 之前是坏的',
        desc: '旧版本导出的 PDF 只会显示简历左上角，且模糊；超过一页的内容会被直接截断。两个独立的原因叠加，现已修复并支持自动分页。'
      },
      {
        kind: 'new',
        title: '导出前会检查格式',
        desc: '邮箱、电话、网址、日期先后、GPA 等填错时会当场提示；导出前若仍有问题会拦下来并列出，也可以选择「仍然导出」。'
      },
      {
        kind: 'new',
        title: '主题色 + 可调布局',
        desc: '8 个专业预设色或自定义，同时应用到界面与简历标题。编辑区与预览区之间的分隔条可以拖动，也可以折叠编辑区专注看预览。'
      },
      {
        kind: 'new',
        title: '支持头像上传',
        desc: '此前头像字段存在但没有入口。现在点击或拖入图片即可，会自动裁成正方形并压缩。'
      },
      {
        kind: 'fix',
        title: '补上「填了却不显示」的内容',
        desc: '技能分类、项目链接、教育描述、工作地点这四项此前可以填写但简历上不会出现。另外修复了没有技能时姓名和联系方式整个丢失的问题。'
      },
      {
        kind: 'improve',
        title: '间距终于正常了',
        desc: '一条全局样式规则一直在压制所有内外边距，导致界面处处偏紧。这类问题在本次一并修正。'
      }
    ]
  },
  {
    version: '1.1.0',
    date: '2026-06-24',
    headline: '加入简历检查',
    highlights: [
      {
        kind: 'new',
        title: '27 条规则检查简历',
        desc: '从完整性、格式规范、表达质量、一致性四个维度打分，并按严重程度给出修改建议，可一键跳到对应分区。'
      },
      {
        kind: 'new',
        title: '完全本地运行',
        desc: '检查全部在本机完成，不上传任何内容，也不会为你编造经历——只做规则性检查和措辞建议。'
      }
    ]
  },
  {
    version: '1.0.0',
    date: '2026-06-24',
    headline: '第一个版本',
    highlights: [
      {
        kind: 'new',
        title: '3 套简历模板',
        desc: '经典（双栏）、现代（色块）、简约（纯单栏，最利于机器筛选）。'
      },
      {
        kind: 'new',
        title: '边写边看',
        desc: '左侧填写、右侧实时预览 A4 效果，支持缩放与适应宽度。'
      },
      {
        kind: 'new',
        title: '离线可用',
        desc: '无需注册、没有广告、不做任何网络请求。内容只存在你自己的电脑上。'
      }
    ]
  }
]

/** 当前版本对应的更新条目（用于「本次更新」弹窗） */
export function getRelease(version: string): Release | undefined {
  return RELEASES.find((r) => r.version === version)
}
