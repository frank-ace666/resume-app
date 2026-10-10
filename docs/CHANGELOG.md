# 更新日志

> 记录每个版本的功能变更、修复和优化建议。
>
> 🤖 **本项目由 AI（Claude Code + deepseek-v4-pro）辅助开发完成。**
> 人类提供需求与设计决策，AI 负责架构设计、代码编写与文档生成。

---

## v1.2.0 — Material 风格 UI 重塑 + PDF 导出修复 (2026-10-10)

### 背景

v1.0.0 起「导出 PDF」一直是坏的，且坏得不明显：界面上只弹一句「导出失败，请重试」。这次先做了完整归因，再动手改造界面。

### 🐞 PDF 导出：两个独立的致命 bug

**1. 尺寸溢出 3.78 倍（只导出左上角）**

`html2pdf-browser` 内部把图片按元素的 `offsetWidth/offsetHeight` 放进页面，单位跟随 jsPDF 的 `unit`：

```js
b = el.offsetWidth; w = el.offsetHeight
pdf.addImage(dataURL, 'JPEG', 0, 0, b, w)
```

210mm 宽的元素在 CSS 里是 793.7px，而 jsPDF 没有任何一种 unit 等于 1 CSS px
（实测 A4 宽度：`pt`=595.28 / `mm`=210 / `px`=446.46）。原实现传 `unit: 'mm'`，
图片被按 794mm 画到 210mm 的页面上 —— 实测溢出 3.78 倍，只剩左上角 26%，有效约 51dpi。

**2. oklch 颜色导致 html2canvas 直接抛错**

html2canvas 1.4.1 不认识 `oklch()` 与 `color-mix()`，而 Tailwind v4 的默认调色板
全部编译成 oklch。模板里的 `text-slate-700` 这类类名让捕获子树里出现了 **448 处** oklch，
html2canvas 解析颜色时抛错 → 导出彻底失败。而原先的 PDF 冒烟验证用的是纯 hex 内联样式，
因此从未覆盖到这条路径。

**修复方式**：保留该库真正有价值的 `html2canvas`（带中文文字重叠与 SVG 渲染修复），页面尺寸与分页自己控制：

- `pxPerMm` 由元素布局宽度反推 → 导出结果与预览缩放级别无关
- 缩放 `transform` 从被捕获节点移到父层，使捕获节点始终 1:1
- 新增 **多页分页**：按 A4 页高切 canvas 逐页输出，不再截断
- 模板颜色改为 `PRINT` 显式 sRGB 色板（inline style），禁用调色板类与透明度修饰符
- `jspdf` 提为显式依赖（此前只是传递依赖）

**实测（12 段工作经历 + 8 个项目）**：3 页，页面均为 A4 595.28×841.89pt，
宽度始终 100%，末页按剩余高度绘制（595.3×135.8pt）。

### 🎨 界面：Material 风格（Gmail / YouTube 系）

- **三段式布局**：左侧 `NavDrawer`（248px 展开 / 72px 折叠） + 编辑区 + 预览区，中间可**拖拽分栏**（比例持久化），另有「专注预览」模式
- **设计令牌**：`@theme` 中定义 Google 系配色、四级 elevation、统一缓动与时长（120/200/300ms），并支持 `prefers-reduced-motion`
- **原子组件** `components/ui/`：Button（5 变体 + 涟漪 + loading）、Card、TextField/TextArea（浮动标签）、ToastHost（Gmail 式 snackbar）、ConfirmDialog（取代 `window.confirm`）、EmptyState、内联 SVG 图标集（**全站移除 emoji**）
- **原子组件同时偿还技术债**：CHANGELOG 里记录的「表单 label/input 重复代码可抽 FormField」由 `TextField` + `FormScaffold` 落地
- **导航即进度**：7 个分区带图标、完成对勾、检查问题数徽标，底部整体填写进度条
- **主题色**：8 个专业预设 + 自定义，写入 `meta.accentColor`，经对比度压暗后同时驱动简历标题与整个应用外壳
- **模板选择器**：改为可视化缩略图（用 CSS 微缩还原三种版式结构）
- **预览区**：适应宽度、Ctrl+滚轮缩放、网格背景、**分页参考线**（多页时标出每页边界）

### 🐞 修复：换模板、换主题色静默失效

**用户反馈的现象**：「外观锁定经典，无法更改」。

**根因**：`resumeStore` 的统一出口 `edited()` 写成

```js
data: { ...state.data, ...next, meta: { ...state.data.meta, updatedAt } }
```

最后一行用的是 `state.data.meta`（**旧值**），把 `next.meta`（新值）整个盖掉。
而 `setTemplate` / `setAccentColor` 恰恰是通过 `next.meta` 传值的 ——
于是这两处**点了没反应，且没有任何报错**。

**为何没被测出来**：该缺陷由「消除重复判断、特例分支与死接口」那次重构引入。
当时的验证是**直接改载入 JSON 的 `meta.templateId`** 去看三种模板的排版，
**没有走 UI 的切换路径**，正好绕开了这条代码。教训：验证渲染结果不等于验证交互路径。

现在 `edited()` 改为合并 `meta`（`...(next.meta ?? {})`），
并补了走真实点击的回归验证：点现代 → `modern` 且侧栏消失；点简约 → `minimal`；
点经典 → `classic` 且侧栏恢复；点色板 → `accentColor` 与 `--color-brand` 同步变化。

### ✅ 新增：检查更新

此前只有更新日志，用户无法得知有没有新版本。

- 「更新日志」栏顶部新增**当前版本 + 检查更新按钮**与状态反馈
- 四种状态都有明确文案：已是最新 / **发现新版本**（附下载按钮）/ HTTP 错误 / 网络不可达
- **不自动下载、不自动安装**，只给出下载页链接，由用户决定
- **只在用户点击时发起**，不做启动自动检查

**为什么用 `raw.githubusercontent.com` 而不是 GitHub API**：
开发中实测匿名 API 是**每 IP 每小时 60 次**，本次开发机的代理出口已被限流
（`API rate limit exceeded`）。走 VPN 或公司出口的用户很容易同样撞上。
raw 走 CDN、不占该配额，且读的就是仓库里已有的 `package.json` ——
**不额外维护一个容易忘记同步的版本文件**。

**连带修正一处自相矛盾**：FAQ 原本写着「没有任何网络请求」，
而检查更新就是一次网络请求。已改为如实说明：
除用户主动点「检查更新」外不联网，且该请求不含版本号、设备信息或简历内容。

新增文件：`src/utils/updateChecker.ts`

### ✅ 新增：自定义联系方式（QQ / 微信 / 作品集…）

「个人信息」里新增可自定义的联系项。用户决定字段叫什么，**但类型由程序提供、校验跟着类型走** ——
若让用户自己挑校验方式，多数人会直接选「文本」，自定义字段就等于没有校验。

- **16 个预设**一次点击添加：QQ、微信、手机、备用邮箱、掘金、知乎、微博、Bilibili、
  豆瓣、小红书、公众号、作品集、个人博客、Dribbble、Behance、站酷
- **完全自定义**：名称与类型都可改，类型下拉直接写在字段旁边（不是藏在设置里）
- **按名称自动推断类型**：输入「个人主页」自动定为「网址」，包含「博客 / 作品集」同理。
  推断**只在明显时进行**，猜不准一律回退到「文本（不校验）」——
  把用户正确的输入判成错误，比少校验一次更让人恼火
- **六种类型**：文本 / 数字 / 电话 / 邮箱 / 网址 / 账号
- 空值不出现在简历上；上限 8 项（联系方式太长会挤占正文，不是技术限制）

渲染时带名称前缀（`QQ：123456789`）—— 裸的 QQ 号或微信号在简历上无法辨认。

校验接入了**全部三处**，与既有字段保持同一套谓词：

| 位置 | 行为 |
| ---- | ---- |
| 表单就地 | 失焦报错，随输入消失 |
| 导出闸门 | 有问题则拦下并列出 |
| 简历检查 | 作为「参考」项报出 |

实测 10 个场景：旧存档（无该字段）正常载入、预设渲染、QQ 类型为数字、
QQ 填字母报错、微信填中文报错、名称推断为网址、空值不入简历、
闸门拦截、上限 8 且按钮禁用。

### 📦 打包流程验证 + 去除 28 MB 无用依赖

`npm run package` 此前**从未跑过**（内测报告里列为未验证风险）。本次实跑并验证产物。

**发现的问题**：`app.asar` 达 31 MB，内含完整 `node_modules`。但这些代码**运行时根本不会被加载**：

```
out/main/index.js     只 require: electron, fs/promises, path   ← 全为内置模块
out/preload/index.js  只 require: electron
out/renderer/*.js     零 require 调用（zustand / jspdf / html2pdf-browser 已被 Vite 内联）
```

electron-builder 默认把生产依赖树打进 asar，`files: ["out/**/*"]` 并不会关掉这个行为。
加上 `"!node_modules/**/*"` 后：

| 指标 | 修复前 | 修复后 |
| ---- | ------ | ------ |
| app.asar | 31 MB | **2.48 MB** |
| 解包体积 | 384 MB | 357 MB |
| 安装包 | 101.2 MB | 97.3 MB |

安装包只小 4 MB —— 31 MB 的 JS 压缩后本就不大。真正的收益是**不再分发 28 MB 永远不会执行的代码**。

**产物体积的真相**：安装包约 97 MB，其中应用代码只占 1.7 MB，其余全是 Electron 自带的
Chromium + Node。想把体积降下来只能换掉 Electron，而不是"优化代码"。

**同时修复**：
- 补 `author` 字段（electron-builder 会警告缺失，且用于发布者信息）
- README 补上打包所需的**两个**镜像变量 —— 此前只记了 `ELECTRON_MIRROR`，
  但 electron-builder 还要下 NSIS、7zip 等，需要 `ELECTRON_BUILDER_BINARIES_MIRROR`

**验证方式**：不只是"打包成功"，而是启动产物并用 CDP 查包内真实 DOM：

```
{"preview":true,"nav":8,"footer":"简历工坊 v1.2.0|填写进度 0/6已保存","hasExportBtn":true}
```

确认 preload 解析、asar 路径、渲染进程加载、版本号注入均正常。

### ↩️ 「支持我」栏暂缓（未上线）

初版写的「支持我」栏已**移除**。原因：该栏文案是「本应用没有收费计划」，
而作者实际准备了打赏入口（仓库根目录 `support.jpg`，微信收款码），两者矛盾。

作者决定稍后再上，因此当前帮助模块为四栏：**常见问题 / 更新日志 / 建议 / 投稿**。
恢复时的注意事项已记在 `src/data/product.ts` 的 `donationImage` 注释里：
文案不可与收款码冲突，且打赏须保持可选、不与「全部功能免费」的表述打架。

> `support.jpg` 是个人收款码，**未纳入版本库**，仅保留在工作区。
> 是否随仓库分发需作者确认。

### ✅ 新增：版本更新提示

帮助模块承担「告知用户这版带来了什么」的职责。因为应用**完全离线、没有后端**，
拿不到"服务器上有没有新版本"，所以做法是：

- **更新日志随包内置**（`src/data/releases.ts`），记录当前这一版包含什么
- **版本变化时弹一次「本版更新」**：依据本地记录的 `lastSeenVersion` 判断，不联网。
  **首次运行不弹** —— 新用户没有可对比的旧版本，弹「更新了什么」很突兀，静默记录即可
- 弹窗里的「查看全部更新」直接跳到帮助模块的「更新日志」栏（分段选择因此提到 uiStore，
  以便跨组件跳转）
- 更新日志文案面向使用者而非 commit log：说清「我能得到什么」，技术细节留给本文档

### ✅ 新增：外部链接统一配置

新增 `src/data/product.ts` 集中放置需要填写的链接（仓库 / 讨论区 / 下载页）。
**留空的项不会渲染成死链**：讨论区未配置时显示为「还没有开放」并说明原因，
仓库与下载页入口直接隐藏。实测在全部留空的情况下，界面不会发起任何外链请求。

> 讨论区（社区）**刻意没有做成实体功能**。当前用户量少，空讨论区传递的信号是
> 「这项目没人用」，比没有更糟；且本应用的核心卖点是「无账号、无广告、完全离线」，
> 自建讨论区需要账号、服务器、审核与内容合规，等于换一个产品。
> 真要上的时候，优先用 GitHub Discussions 这类现成渠道（免费、零维护、可被搜索收录），
> 届时只需填 `PRODUCT.communityUrl`，界面自动变成可点击入口。

### ✅ 新增：帮助与反馈模块（第 8 步）

在「简历检查」之后新增一步，四个分段：

| 分段 | 内容 |
| ---- | ---- |
| **常见问题** | 18 条问答，参考技术社区的问答形态：搜索 + 分类筛选 + 折叠 + **逐条「有帮助 / 没解决」反馈** + 未解决兜底发邮件 |
| **建议** | 选反馈类型（问题反馈/功能建议/内容纠错/其他）+ 填写内容，生成预填好的邮件 |
| **投稿** | 说明可投稿的四类内容（模板/问答/措辞/文案），一键发信 |
| **支持我** | 明确「没有收费计划」，只列非金钱的支持方式 |

问答内容依据前期调研（高校职业中心指南、真实招聘 JD、中文简历规范），不是随手编的。
其中**如实说明本应用自身的限制**：导出的是图片型 PDF、文字不可选中、老旧 ATS 可能解析失败，
并给出应对建议 —— 与其让用户在投递失败后才发现，不如提前讲清楚。

配套改动：

- 新增 `electron/main` 的 **`open-external` IPC**，带协议白名单（只允许 `mailto:` / `https:` / `http:`）。
  `shell.openExternal` 若接受任意协议是已知的命令执行面，必须白名单。
- 同时补上 `setWindowOpenHandler` 与 `will-navigate` 拦截：**Electron 里裸 `<a href="mailto:">` 会触发导航，
  把渲染进程变成白屏**，所有外链必须走 IPC 交给系统默认程序。
- 新增 `Accordion` 与 `SegmentedControl` 两个原子组件
- 折叠面板收起时加 `inert`：内容留在 DOM 里做高度动画，不加 `inert` 会导致
  **Tab 聚焦到看不见的按钮上、屏幕阅读器念出折叠内容**（实测 18 个面板全部覆盖）
- 「帮助与反馈」不计入填写进度（保持 0/6 的分母）

新增文件：`src/data/faq.ts`、`src/utils/mailto.ts`、`src/components/ui/Accordion.tsx`、
`src/components/ui/SegmentedControl.tsx`、`src/components/editor/forms/HelpForm.tsx`

### 🐞 修复：全局 `*` 重置压掉了所有 padding / margin 工具类

**现象**：全站 `.p-*` / `.m-*` 工具类**静默失效**，计算值恒为 `0px`。

**实测证据**：

```
合成元素  .p-6 → 0px      .p-4 → 0px      .px-6 → 0px
真实元素  .p-4 卡片 → padding=0px
真实元素  .px-6 编辑头 → padding=0px
（而 CSS 里确有 .p-6 { padding: calc(var(--spacing) * 6) }）
```

**根因**：`index.css` 里有一条**无层（unlayered）**的 `* { margin: 0; padding: 0; box-sizing: border-box }`。
按 CSS 层叠层规范，**无层样式优先于任何 `@layer` 内的样式，与选择器权重无关**；
而 Tailwind v4 的全部工具类都在 `@layer utilities` 里 —— 于是这条重置赢了所有工具类。

**为什么长期没被发现**：布局大量依赖 `gap-*`（属于 gap，不受影响）与固定高度（`h-12`、`min-h-*`）撑开，
视觉上不至于崩坏，只是处处偏紧。这次是在量导出前校验对话框的内边距时才暴露出来。

**影响范围**：不只是应用外壳 —— **三个简历模板也大量使用 `px-[16mm]`、`py-7`、`space-y-*`**，
即模板排版间距同样被清零，此前的 PDF 是在压缩版式下验证的。

**修复**：删掉自定义 `*` 重置（Tailwind 的 preflight 已在 `@layer base` 内做了同样的事），
并把项目自有样式（`body` / `#root` / 滚动条 / 动画类）分别移入 `@layer base` 与 `@layer components`。
约定已写入 `src/index.css` 顶部注释与开发参考。

**验证**：修复后 `.p-6 → 24px`、`.p-4 → 16px`、`.px-6 → 0px 24px`；
三种模板重新导出 PDF 均为 1 页 100%×100%，多页用例 2 页、无元素越界。

### ✅ 新增：导出前的校验闸门

导出 PDF 前用**与表单同一套谓词**扫一遍，有问题则拦下并列出，而不是导出一份带错格式的简历。

- 对话框列出问题（超过 5 条折叠），可「去修正」直接跳到对应分区
- **保留「仍然导出」出口** —— 校验规则难免误报（例如境外手机号），拦死会让这类用户永远导不出。
  闸门是警示，不是牢笼
- **只拦导出，不拦 JSON 保存** —— 导出是发给 HR 的成品；保存是「还没做完先存个盘」，
  拦下来反而有丢数据的风险
- 选择对话框而非 toast：这是一件需要用户做决定的事，3 秒消失的提示容易被误认为「点了没反应」

新增文件：`src/components/ui/ValidationBlockDialog.tsx`

### ✅ 新增：字段级输入校验

此前所有输入框**没有任何格式校验** —— 电话里填「张三」、邮箱填「不是邮箱」都能存进去，
只有点了「开始检查」才会被事后告知。现在改为**失焦就地校验**。

- **联系信息**：邮箱（含中文/缺 @）、电话（中文、字母、位数、手机/固话区分）、
  个人网站、GitHub（用户名或链接均可）、LinkedIn
- **日期逻辑**：教育 / 工作 / 项目三处的结束时间早于开始时间，两个字段同时标红；
  勾选「至今」则不校验结束时间
- **GPA**：格式（`3.8` / `3.8/4.0` / `88/100`）与不超过满分
- **项目链接**：容忍省略协议（直接粘 `github.com/user/repo`），但拦住中文、空格与垃圾串

设计取舍：

- **失焦后才报错，报错后随输入实时消失** —— 一上来就红一片很烦，报了错却不随修改消失更烦
- **空值一律放过** —— 这是简历编辑器，用户可能正填到一半；「必填」是简历检查模块的职责
- **不限制字数**（本次明确不做）
- 错误态同时带 `aria-invalid` 与 `role="alert"`，屏幕阅读器可感知

**关键点：谓词只有一份。** 邮箱/手机/URL/GitHub 的判断抽到 `utils/validators.ts`，
**简历检查模块改为复用同一套谓词** —— 否则表单和检查报告各写一套正则，
迟早出现「输入框说没问题、检查报告说有问题」。提示文案仍各自维护：
就地校验要短，检查报告要解释清楚为什么、怎么改。

新增文件：`src/utils/validators.ts`

### 👤 新增：头像上传

`personalInfo.avatar` 字段从 v1.0.0 起就存在且模板会渲染，但**一直没有上传入口**。
现支持点击/拖入，自动居中裁成正方形并压到 256px（避免变形，也避免 base64 撑大存档）。

### 📄 模板：修复「填了却不显示」的字段 + 排版重做

- **修复数据丢失**：`Skill.category`（技能分组）、`Project.link`、`Education.description`、`WorkExperience.location` 此前用户能填但简历上永远不显示
- **修复经典模板侧栏耦合缺陷**：侧栏原先挂在 `skills.length > 0` 上，导致**没有技能的简历会丢掉姓名和联系方式**，且填写技能前后版式突变。现改为始终渲染
- **移除 emoji 图标**：ATS 解析会变乱码，html2canvas 栅格化也不稳
- **移除技能进度条**：改为文字熟练度（进度条/星级在多个来源被列为简历反模式）
- **统一排版尺度**：姓名 22px/700、分区标题 13px/700、正文 13px/1.55、日期 11.5px
- **自我评价移至末位**（原先在第一位）；`break-inside-avoid` 防止分页切断单条经历
- **旧存档兼容**：新增 `normalizeResumeData()`，旧 JSON 与旧 localStorage 缺字段时补齐默认值

### 🔧 其他

- 状态栏版本号改为从 `package.json` 注入（此前硬编码 `v1.0.0`），并显示填写进度与检查结果摘要
- 保存/打开/导出改走 toast 提示
- 补齐 `resources/icon.png`（此前 `build.win.icon` 指向不存在的文件，打包会失败）
- 移除已被取代的 `layout/Header.tsx` 与 `editor/FormNavigation.tsx`
- `tsconfig.web.json` 移除 `baseUrl`（TS 6.0 弃用 / 7.0 移除），`paths` 改为相对 tsconfig 的 `./src/*`

### 修改文件

```
新增 (16)
  src/components/ui/Button.tsx, Card.tsx, TextField.tsx, Icons.tsx,
                     ToastHost.tsx, ConfirmDialog.tsx, EmptyState.tsx
  src/components/layout/AppBar.tsx, NavDrawer.tsx
  src/components/editor/AccentPicker.tsx, FormScaffold.tsx
  src/components/templates/shared.tsx
  src/store/toastStore.ts
  src/hooks/useAccentTheme.ts, useResizable.ts
  src/utils/sectionProgress.ts, color.ts, accents.ts, image.ts
  resources/icon.png

重写 (16)
  src/index.css                        — 设计与动效令牌
  src/App.tsx                          — toast + Material 确认框
  src/components/layout/MainLayout.tsx — 可拖拽分栏
  src/components/layout/StatusBar.tsx
  src/components/editor/EditorPanel.tsx, TemplateSelector.tsx
  src/components/editor/forms/*.tsx    — 7 个表单迁移到原子组件
  src/components/preview/*.tsx         — 缩放层级 + 分页参考线
  src/components/templates/*Template.tsx
  src/utils/pdfExport.ts               — A4 定位 + 多页分页
  src/hooks/usePdfExport.ts            — 错误改走 toast
  src/types/resume.ts                  — accentColor + normalizeResumeData
  src/store/resumeStore.ts, uiStore.ts, global.d.ts
  electron.vite.config.ts              — 注入 __APP_VERSION__
  electron/../package.json             — jspdf 显式依赖，版本 1.2.0

删除 (2)
  src/components/layout/Header.tsx
  src/components/editor/FormNavigation.tsx
```

### 构建产物变化

| 指标 | v1.1.0      | v1.2.0      | 增量      |
| ---- | ----------- | ----------- | --------- |
| CSS  | 34.67 KB    | 49.17 KB    | +14.50 KB |
| JS   | 1,546.86 KB | 1,616.62 KB | +69.76 KB |

---

## v1.1.0 — 简历优化检查模块 (2026-06-24)

### 新增功能

- **简历优化检查引擎**：纯本地规则引擎，27 条检查规则
  - 完整性检查 (8条)：姓名、邮箱、电话、求职意向、教育经历、工作经历、自我评价、技能
  - 格式规范 (7条)：邮箱格式、手机号格式、URL格式、日期逻辑等
  - 表达质量 (9条)：弱动词检测、亮点数量、数据量化、篇幅建议
  - 一致性检查 (3条)：时间空档、技能数量
- **评分系统**：0-100 分，圆形仪表盘可视化
- **跳转功能**：从问题卡片一键跳转到对应编辑步骤
- **历史趋势**：保留最近 5 次检查记录，柱状图对比
- **修改提醒**：检测到数据变更后提示用户重新检查

### 新增文件

```
src/types/optimization.ts
src/utils/resumeChecker.ts
src/store/optimizationStore.ts
src/components/editor/forms/OptimizationForm.tsx
```

### 修改文件

```
src/store/uiStore.ts                    — FORM_STEPS 追加第7步
src/components/editor/EditorPanel.tsx   — 追加步骤6渲染
docs/development-reference.md           — 追加优化模块文档章节
```

### 构建产物变化

| 指标 | v1.0.0      | v1.1.0      | 增量      |
| ---- | ----------- | ----------- | --------- |
| CSS  | 27.09 KB    | 34.67 KB    | +7.58 KB  |
| JS   | 1,516.72 KB | 1,546.86 KB | +30.14 KB |

---

## v1.0.0 — 第一版基础功能 (2026-06-24)

### 功能

- 3 个简历模板：经典、现代、简约
- 6 步表单填写：个人信息、教育经历、工作经历、技能特长、项目经历、自我评价
- 右侧实时预览 + 缩放控制 (25%-200%)
- 导出 PDF（html2pdf-browser，所见即所得）
- JSON 文件保存/打开（Electron IPC 对话框）
- localStorage 自动保存（2秒防抖）
- 错误边界组件

### 技术栈

```
Electron 42 + React 19 + TypeScript
Vite 6 + electron-vite 5
Tailwind CSS 4 + Zustand 5
html2pdf-browser 1.x
```

### 初始文件清单（35个源文件）

---

## 优化建议（待评估）

> 以下建议来自开发和评审过程，供后续版本参考。

### 高优先级

- [ ] **PDF 文字可选**：当前 html2canvas 截图方案导出的 PDF 文字不可复制。改用 pdfmake 并注册中文字体，可让 PDF 文字可选且体积更小
- [ ] **Electron 二进制下载**：国内网络环境下载 Electron 经常失败，建议在文档中提供镜像配置说明（`.npmrc` 或环境变量 `ELECTRON_MIRROR`）
- [ ] **智能分页**：当前按页高硬切 canvas，极端情况下可能切断一行文字；改为按元素边界切页

### 中优先级

- [x] ~~**头像裁剪**：上传头像时增加裁剪功能（cropper.js）~~ → v1.2.0 已实现自动居中裁方 + 压缩，无需引入 cropper.js
- [ ] **撤销/重做**：集成 zundo 中间件到 Zustand store，记录操作历史
- [x] ~~**多页简历**：模板组件检测内容高度，A4 单页放不下时自动分页~~ → v1.2.0 已在 PDF 层实现，预览区同时显示分页参考线
- [ ] **更多检查规则**：日期重叠检测、技能分类一致性、LinkedIn URL 格式
- [ ] **导出预览**：导出 PDF 前弹出预览对话框，确认排版效果
- [ ] **字体/间距调节**：与主题色并列的外观三件套（各主流简历工具共性功能）

### 低优先级

- [ ] **更多模板**：增加双栏学术风、创意风等模板
- [ ] **简历对比**：切换模板时保留之前模板的截图，方便对比
- [ ] **云端同步**：接入云存储（如 WebDAV、GitHub Gist）
- [ ] **AI 文本润色**：可选接入 LLM API，仅对已有文本做措辞优化（不改内容、不编造）
- [ ] **i18n 国际化**：支持英文界面和英文简历模板
- [ ] **暗色模式**：v1.2.0 的 `@theme` 令牌已为其预留位置，加 `.dark` 作用域即可

### 技术债

- [x] ~~`html2pdf-browser` 的 `html2canvasOptions` 类型不兼容，当前用 `as any` 绕过~~ → v1.2.0 改用其导出的 `html2canvas`，类型可直接通过，`as any` 已移除
- [ ] `electron-vite 5.x` 配置变化大，后续考虑用 `npm create electron-vite@latest` 生成并迁移
- [ ] 规则引擎中 `issueCounter` 用模块级变量，多实例场景下可能冲突。后续考虑改为函数内局部变量
- [x] ~~表单组件存在大量重复代码（每个字段的 label/input 模式），可抽取通用 `FormField` 组件~~ → v1.2.0 已由 `ui/TextField.tsx` + `editor/FormScaffold.tsx` 落地
- [ ] **模板颜色的隐式约束**：模板内不能使用 Tailwind 调色板类（oklch）与透明度修饰符（color-mix），否则 PDF 导出抛错。约束较隐蔽，已在 `shared.tsx` 与开发文档第九节注明；后续可考虑加构建期检查

---

## 版本号规则

```
主版本.次版本.修订号

主版本：重大架构变更或不兼容的 API 变动
次版本：新增功能模块
修订号：Bug 修复和小改进
```
