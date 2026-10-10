/**
 * 简历文档的**排版尺度**（纯展示令牌，不含任何数据处理）。
 *
 * 数据归一化在 `model.ts` —— 那边回答「有哪些内容、空不空」，
 * 这里只回答「长什么样」。分开是为了让模板只关心摆放。
 *
 * 调研共性：姓名 18–22pt / 分区标题 14–16pt / 正文 10–12pt，
 * 行高 1.4–1.5，分区间距 > 条目间距。三套模板共用同一套尺度。
 */
export const TYPE = {
  name: 'text-[22px] font-bold leading-[1.2]',
  jobTitle: 'text-[13px] leading-snug',
  contact: 'text-[11.5px] leading-snug',
  sectionTitle: 'text-[13px] font-bold leading-snug',
  entryTitle: 'text-[14px] font-semibold leading-snug',
  entryMeta: 'text-[12.5px] leading-snug',
  body: 'text-[13px] leading-[1.55]',
  meta: 'text-[11.5px] leading-snug'
} as const

/** 页边距：约 1 inch = 25.4mm，取 16mm 兼顾中文简历的信息密度 */
export const PAGE_PADDING = '16mm'

/* ============================================================
   打印安全色板 —— 模板内所有颜色必须取自这里
   ------------------------------------------------------------
   两条硬性约束，违反任何一条都会让 PDF 导出直接抛错：

   1. 不能用 Tailwind 调色板类（text-slate-700、border-slate-200 …）。
      Tailwind v4 的默认调色板全部编译成 oklch()，而 html2canvas 1.4
      不认识 oklch，解析颜色时会抛错。实测捕获子树里出现过 448 处。
   2. 不能用透明度修饰符（text-white/90、bg-black/5）。
      它们会编译成 color-mix(in oklab, …)，同样不被支持。
      需要半透明就写 rgba()。

   颜色一律走 inline style 而不是 Tailwind 任意值类，是因为调色板要集中
   在这里维护 —— Tailwind 的扫描器读不到由常量拼出来的类名。
   ============================================================ */
export const PRINT = {
  /** 姓名、分区标题 */
  strong: '#111111',
  /** 正文 */
  body: '#222222',
  /** 次要说明（职位、专业） */
  muted: '#555555',
  /** 最弱一级（日期、地点） */
  faint: '#777777',
  /** 分隔线 */
  line: '#cccccc',
  lineSoft: '#e5e5e5',
  /** 侧栏底色 */
  sidebar: '#f5f6f7',
  white: '#ffffff',
  /** 强调色块上的文字 */
  onAccent: 'rgba(255, 255, 255, 0.92)',
  onAccentFaint: 'rgba(255, 255, 255, 0.78)'
} as const
