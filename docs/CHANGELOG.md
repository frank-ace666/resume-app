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
