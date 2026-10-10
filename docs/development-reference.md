# 简历工坊 — 开发参考文档

> 轻量化简历制作桌面应用 · 第一版
> 技术栈：Electron 42 + React 19 + TypeScript + Vite 6 + Tailwind CSS 4 + Zustand 5
> 开发日期：2026-06-24
>
> 🤖 **本项目由 AI（Claude Code + deepseek-v4-pro）辅助开发完成。**

---

## 一、项目概述

**产品定位**：面向求职新手（学生、转行从业者）的轻量化简历制作工具。

**设计原则**：

- **功能简洁**：核心流程——填写表单 → 选模板 → 导出 PDF，不堆砌功能
- **所见即所得**：左侧编辑、右侧实时预览，不用来回切换
- **离线优先**：本地运行，数据存在本地，不需要网络

---

## 二、技术架构

```Shell
┌─────────────────────────────────────────────┐
│                  Electron                    │
│  ┌──────────────┐    ┌───────────────────┐  │
│  │  Main Process │    │  Renderer Process │  │
│  │               │    │                   │  │
│  │  • 窗口管理    │ IPC │  React App        │  │
│  │  • 文件对话框  │◄──►│                   │  │
│  │  • PDF 写入   │    │  ┌─────────────┐  │  │
│  │               │    │  │ Editor (左) │  │  │
│  └──────────────┘    │  │ • 模板选择   │  │  │
│                      │  │ • 6步表单    │  │  │
│                      │  ├─────────────┤  │  │
│                      │  │Preview (右) │  │  │
│                      │  │ • 实时渲染   │  │  │
│                      │  │ • 缩放控制   │  │  │
│                      │  └─────────────┘  │  │
│                      │                   │  │
│                      │  Zustand Store    │  │
│                      │  (数据中枢)       │  │
│                      └───────────────────┘  │
└─────────────────────────────────────────────┘
```

### 关键依赖

| 类别     | 技术                     | 作用                                    |
| -------- | ------------------------ | --------------------------------------- |
| 桌面框架 | Electron 42              | 将 Web 应用打包为`.exe`               |
| 构建工具 | electron-vite 5 + Vite 6 | 三进程（main/preload/renderer）统一构建 |
| UI 框架  | React 19                 | 组件化渲染                              |
| 类型系统 | TypeScript               | 类型安全                                |
| 状态管理 | Zustand 5                | 轻量全局状态 + 内置 persist             |
| 样式方案 | Tailwind CSS 4           | 原子化 CSS                              |
| PDF 导出 | html2pdf-browser + jsPDF | 该库的 html2canvas（带中文修复）光栅化 → jsPDF 按 A4 分页 |

### 为什么选择这些技术？

- **Zustand 而非 Redux**：简历应用状态结构简单，Zustand 无 Provider、API 简洁、内置 persist，30 分钟就能上手。Redux 对这个小应用来说太重。
- **html2pdf-browser 而非 @react-pdf/renderer**：html2pdf 截取已渲染的 HTML → 图片 → PDF，所见即所得。@react-pdf/renderer 需要用其 DSL 重写模板，相当于做两遍 UI，第一版不划算。注意只使用它导出的 `html2canvas`（相比上游修了中文文字重叠与 SVG `<use href>`），**不要用它的 `html2pdf()` 一步到位** —— 原因见第十三节。`jspdf` 因此被显式声明为直接依赖（此前只是传递依赖）。
- **Tailwind CSS 而非 CSS Modules**：模板组件需要大量细粒度样式控制（A4 排版），Tailwind 原子类比手写 CSS 更高效。

---

## 三、核心数据模型

```
ResumeData
├── meta: { templateId, updatedAt, version }
├── personalInfo: { fullName, email, phone, location, title, ... }
├── summary: string
├── education[]: { id, school, degree, major, startDate, endDate, gpa }
├── workExperience[]: { id, company, position, startDate, endDate, isCurrent, achievements[] }
├── skills[]: { id, name, level(4档), category }
└── projects[]: { id, name, role, startDate, endDate, description, technologies[], highlights[] }
```

**设计要点**：

- 所有数组项带 `id` 字段（`crypto.randomUUID()`），支持精确的增删改操作
- `meta.version` 预留数据迁移能力
- 日期用 `"YYYY-MM"` 字符串，JSON 友好
- `createEmptyResume()` 工厂函数生成初始数据，数组默认为 `[]` 避免空值判断

---

## 四、数据流

```
用户输入表单
    │
    ▼
Zustand resumeStore.updateXxx()
    │
    ├──► 更新 data 对象（immer 式不可变更新）
    ├──► 标记 isDirty = true
    │
    ├──► 左侧表单重渲染（selector 精确订阅，按需渲染）
    │
    └──► 右侧预览重渲染（防抖 300ms）
              │
              ▼
        TemplateComponent(data)
              │
              ▼
        html2pdf-browser 截图 → PDF
```

**性能关键点**：

1. Zustand selector 精确订阅：编辑"教育经历"不会触发"工作经历"表单重渲染
2. 预览面板有 300ms 防抖，快速输入时不会频繁重渲染 A4 页面
3. `React.memo` 包裹模板组件，data 引用不变时不重渲染

**持久化**：

- Zustand persist 中间件 → localStorage（自动，防抖 2s）
- 手动保存 → JSON 文件（通过 Electron IPC → `dialog.showSaveDialog`）
- 手动打开 → 解析 JSON → `loadData()` 恢复

---

## 五、组件通信方式

| 场景                  | 方式                                                    |
| --------------------- | ------------------------------------------------------- |
| 编辑器 ↔ 预览器      | 共享 Zustand`resumeStore`                             |
| 步骤切换              | Zustand`uiStore.currentStep`                          |
| Header 按钮 → 数据层 | Props 传递回调函数（`onCreateNew`/`onSaveFile` 等） |
| 渲染进程 ↔ 主进程    | IPC via`contextBridge`（`window.electronAPI.*`）    |

**为什么不全部用 Zustand？**
Header 的文件操作（新建/打开/保存）需要协调多个 store 方法，通过 App.tsx 统一编排比各组件各自触发更清晰。

---

## 六、目录结构说明

```
resume-app/
├── electron/                         # Electron 原生层
│   ├── main/index.ts                 # 主进程：BrowerWindow 创建、IPC handler 注册
│   └── preload/index.ts              # contextBridge 暴露安全 API 给渲染进程
│
├── src/                              # React 渲染进程（前端应用）
│   ├── types/                        # TypeScript 类型契约
│   │   ├── resume.ts                 # ResumeData 及所有子类型
│   │   └── template.ts               # TemplateDefinition（模板注册用）
│   │
│   ├── store/                        # Zustand 全局状态
│   │   ├── resumeStore.ts            # 简历数据 + 增删改 + 文件操作
│   │   ├── uiStore.ts                # 步骤索引、缩放、布局偏好（持久化）
│   │   └── toastStore.ts             # 轻提示队列
│   │
│   ├── components/
│   │   ├── ui/                       # 原子组件（Material 风格，全站复用）
│   │   │   ├── Button.tsx            # 5 种变体 + 涟漪 + loading
│   │   │   ├── Card.tsx              # 表面容器
│   │   │   ├── TextField.tsx         # 浮动标签输入框 / 多行框
│   │   │   ├── Icons.tsx             # 内联 SVG 图标集（取代 emoji）
│   │   │   ├── ToastHost.tsx         # Gmail 式底部 snackbar
│   │   │   ├── ConfirmDialog.tsx     # 取代 window.confirm
│   │   │   └── EmptyState.tsx        # 空状态 + 主 CTA
│   │   ├── layout/                   # 框架层：AppBar / NavDrawer / MainLayout / StatusBar
│   │   ├── editor/                   # 编辑器：面板 + 模板选择 + 主题色 + 表单脚手架
│   │   │   └── forms/               # 7 个步骤表单（每个独立文件）
│   │   ├── preview/                  # 预览器：面板 + 缩放工具栏 + 渲染容器
│   │   └── templates/               # 3 个简历模板 + shared.tsx（排版尺度与打印色板）
│   │
│   ├── hooks/                        # 自定义 Hook
│   │   ├── useAutoSave.ts            # 自动保存逻辑（防抖 → localStorage）
│   │   ├── useAccentTheme.ts         # 主题色 → 应用 --color-brand 令牌
│   │   ├── useResizable.ts           # 编辑区/预览区拖拽分栏
│   │   └── usePdfExport.ts           # PDF 导出逻辑（状态管理 + 回调）
│   │
│   ├── utils/                        # 工具函数
│   │   ├── fileIO.ts                 # 文件保存/打开（IPC 层封装）
│   │   ├── pdfExport.ts              # 光栅化 + A4 分页（见第十三节）
│   │   ├── templateRegistry.ts       # 模板注册表（id → 组件映射）
│   │   ├── sectionProgress.ts        # 各分区完成度（导航对勾与进度条）
│   │   ├── color.ts                  # 对比度压暗、品牌色阶推导
│   │   ├── accents.ts                # 主题色预设
│   │   └── image.ts                  # 头像：读入 → 居中裁方 → 压缩
│   │
│   ├── App.tsx                       # 根组件：编排所有顶层逻辑
│   ├── main.tsx                      # React 入口：挂载到 DOM
│   ├── ErrorBoundary.tsx             # 错误边界：捕获渲染异常
│   ├── index.css                     # Tailwind 入口 + 全局样式
│   └── global.d.ts                   # window.electronAPI 类型声明
│
├── index.html                        # HTML 入口
├── electron.vite.config.ts           # Vite 三进程构建配置
├── tsconfig.json                     # TS 项目引用
├── tsconfig.node.json                # 主进程 TS 配置
├── tsconfig.web.json                 # 渲染进程 TS 配置
└── package.json                      # 依赖 + scripts + electron-builder 配置
```

### `@/*` 路径别名：定义在两处，必须同步

| 位置 | 配置 | 作用范围 |
| ---- | ---- | -------- |
| `tsconfig.web.json` | `"paths": { "@/*": ["./src/*"] }` | 类型检查 |
| `electron.vite.config.ts` | `resolve.alias: { '@': resolve(__dirname, 'src') }` | 实际打包 |

两处缺一不可：只有 tsconfig 会类型通过但打包失败，只有 vite 别名会打包成功但编辑器报红。

**关于 `baseUrl`（不要加回来）**：旧配置写的是 `"baseUrl": "."` + `"paths": { "@/*": ["src/*"] }`。`baseUrl` 已在 TypeScript 6.0 标记弃用（TS5101），并将在 7.0 中彻底移除。现在 `paths` 直接相对 tsconfig 文件解析，因此不带 `baseUrl` 也能工作 —— 这是官方推荐的迁移写法，路径条目需自带 `./` 前缀。

> `electron/` 目录（主进程 / preload）走 `tsconfig.node.json`，**没有** `@` 别名，那里的相对导入不能改成 `@/`。

---

## 七、如何新增一个模板

1. 在 `src/components/templates/` 创建 `MyNewTemplate.tsx`
2. 实现 `FC<{ data: ResumeData }>` 接口，纯展示无状态
3. 在 `src/utils/templateRegistry.ts` 中注册：
   ```typescript
   import MyNewTemplate from '@/components/templates/MyNewTemplate'
   // ...
   'my-new': {
     id: 'my-new',
     name: '我的模板',
     description: '模板描述',
     component: MyNewTemplate
   }
   ```
4. 在 `TemplateSelector.tsx` 的 `TEMPLATE_ORDER` 数组中加入模板 id

模板即组件，数据即 props，开闭原则——新增模板不改已有代码。

> ⚠️ 模板内颜色必须遵守第九节的约束（不能用 Tailwind 调色板类与透明度修饰符），
> 否则会让 PDF 导出直接失败。请从 `shared.tsx` 的 `PRINT` 取色。

---

## 八、IPC 通信清单

| IPC Channel           | 方向             | 用途                               |
| --------------------- | ---------------- | ---------------------------------- |
| `save-file`         | Renderer → Main | 弹出保存对话框，写入 JSON 文件     |
| `open-file`         | Renderer → Main | 弹出打开对话框，读取 JSON 文件内容 |
| `export-pdf-dialog` | Renderer → Main | 弹出保存对话框，返回 PDF 文件路径  |
| `write-pdf`         | Renderer → Main | 将 PDF Blob 写入指定路径           |

**安全原则**：

- 渲染进程不直接访问 `fs` 或 `dialog` 模块
- 所有 Node.js API 调用封装在 preload 的 `contextBridge` 中
- `nodeIntegration: false` + `contextIsolation: true`

---

## 九、样式体系

### 全局样式 (`index.css`)

```css
@import "tailwindcss";

@theme {
  --font-sans: 'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif;
}
```

**要点**：

- Tailwind v4 不再使用 `tailwind.config.js`，所有自定义在 CSS 的 `@theme` 块中
- 不再使用 `@tailwind base/components/utilities`，改用 `@import "tailwindcss"`
- 中文字体栈按优先级排列，确保 Windows/macOS/Linux 都有可用字体

### 模板样式策略

### ⚠️ 模板内颜色的硬性约束（违反会导致 PDF 导出直接失败）

简历模板的颜色**只能**取自 `src/components/templates/shared.tsx` 的 `PRINT` 色板，并以 inline style 施加。原因：

1. **不能用 Tailwind 调色板类**（`text-slate-700`、`border-slate-200` …）。Tailwind v4 的默认调色板全部编译成 `oklch()`，而 html2canvas 1.4 不认识 oklch，解析颜色时会抛错。实测修复前捕获子树中有 448 处 oklch。
2. **不能用透明度修饰符**（`text-white/90`、`bg-black/5`）。它们编译成 `color-mix(in oklab, …)`，同样不被支持。需要半透明请写 `rgba()`。
3. 颜色走 inline style 而非 Tailwind 任意值类（`text-[#222222]`），是为了让色板集中在 `PRINT` 里维护 —— Tailwind 的扫描器读不到由常量拼出来的类名。

字体/字号/行高这类非颜色样式仍可正常使用 Tailwind 类（`TYPE` 常量即是）。

### 模板样式策略

- 排版尺度统一由 `shared.tsx` 的 `TYPE` 提供：姓名 22px/700、分区标题 13px/700、正文 13px/1.55、日期 11.5px
- 强调色由 `meta.accentColor` 驱动，经 `ensureContrastOnWhite()` 压暗到白底 4.5:1 后使用；全篇只出现在分区标题与分隔线上
- 3 个模板的视觉差异：
  - **经典**：`flex` 两栏，左侧灰底放姓名+联系方式+技能，右侧白底放经历（侧栏始终渲染）
  - **现代**：顶部实心强调色块 + 强调色竖条标题
  - **简约**：纯单栏全白，大量留白，`tracking-[0.18em]` 小标题，最 ATS 友好
- 条目加 `break-inside-avoid`，避免分页把一段经历切断

---

## 十、开发命令

```bash
npm run dev       # 启动开发服务器 + Electron 窗口（HMR 热更新）
npm run build     # 构建生产版本到 out/ 目录
npm run preview   # 预览构建结果
npm run package   # 构建 + 打包为 Windows .exe 安装包（NSIS）
```

**打包配置**（`package.json` → `build` 字段）：

- App ID：`com.resume-craft.app`
- Windows 安装包：NSIS，允许自定义安装目录，中文安装界面
- 输出目录：`dist/`

---

## 十一、已知限制 & 后续改进方向

### 当前限制

| 限制             | 原因                               | 影响                   |
| ---------------- | ---------------------------------- | ---------------------- |
| PDF 文字不可选中 | html2canvas 截图方案，文字变为图片 | 部分 HR 习惯复制文字   |
| 分页按高度硬切   | 不检测元素边界                     | 极端情况下可能切断一行文字 |
| 无撤销/重做      | Zustand 未集成 temporal 中间件     | 误操作后需手动恢复     |
| 无云端同步       | 纯本地                             | 换电脑需手动迁移 JSON  |
| 无暗色模式       | 本期未做                           | token 体系已预留位置   |

> 头像已支持上传（自动居中裁方 + 压到 256px），不再需要引入 cropper.js。
> 多页简历已支持，不再截断 —— 见下一节。

### 后续可优化方向

1. **PDF 文字可选**：使用 pdfmake 替代光栅化方案，注册中文字体
2. **智能分页**：按元素边界切页，避免行内截断
3. **撤销/重做**：Zustand + zundo 中间件，记录操作历史
4. **字体/间距调节**：与主题色并列的外观三件套
5. **暗色模式**：复用 `@theme` 令牌加 `.dark` 作用域
6. **更多模板**：社区模板市场
## 十二、简历优化检查模块

### 设计原则

纯本地规则引擎，完全离线运行。**只检查、只建议、不编造**。引擎只分析用户已填写的内容，绝不在任何字段中生成虚假经历、技能或成就。

### 架构

```
用户点击"开始检查"
      │
      ▼
resumeChecker.ts  ──── 纯函数规则引擎
      │
      ├── 完整性检查 (8条规则) → 必填项缺失
      ├── 格式检查   (7条规则) → 邮箱/电话/URL/日期
      ├── 表达质量   (9条规则) → 弱动词/长度/数据量化
      └── 一致性检查 (3条规则) → 时间空档/技能数量
      │
      ▼
optimizationStore  ──── 结果 + 历史记录(最近5次)
      │
      ▼
OptimizationForm   ──── 评分环 + 统计 + 问题列表 + 跳转
```

### 检查规则（27 条）

| 维度 | 规则数 | 严重程度 | 示例 |
|------|-------|---------|------|
| 完整性 | 8 | critical | 姓名/邮箱/电话/求职意向缺失、教育/工作/自我评价为空 |
| 格式 | 7 | warning | 邮箱格式不合法、日期倒挂、URL/手机号格式错误 |
| 表达质量 | 9 | warning/info | 弱动词、亮点数量不足、缺少数据支撑、自我评价过长/过短 |
| 一致性 | 3 | info | 时间空档 > 1年、技能 > 20个 |

### 评分算法

```
满分 100
- 每条 critical 扣 10 分
- 每条 warning  扣  3 分
- 每条 info     扣  1 分
最低 0 分
```

### 新增文件

| 文件 | 用途 |
|------|------|
| `src/types/optimization.ts` | ResumeIssue、ResumeCheckResult 类型 |
| `src/utils/resumeChecker.ts` | 规则引擎（~350行，27条规则） |
| `src/store/optimizationStore.ts` | 检查结果状态 + 历史 |
| `src/components/editor/forms/OptimizationForm.tsx` | 检查面板 UI |

### 交互设计

- **步骤导航**：第 7 步"简历检查"，独立于编辑步骤
- **模板选择器**：检查页面隐藏模板选择器和常规导航
- **跳转功能**：点击问题卡片上的"跳转到XXX"自动切换到对应编辑步骤
- **重新检查**：修改数据后提示"简历已修改，建议重新检查"
- **历史趋势**：保留最近 5 次检查的评分柱状图

### 第一版明确不做

- ❌ 不接入大模型 API
- ❌ 不自动修改用户内容
- ❌ 不给出排名比较
- ❌ 不做图片/头像检查
- ❌ 不做语法拼写检查
- ❌ 不联网同步

---

### 与表单就地校验的关系（重要）

格式类判断（邮箱 / 手机 / URL / GitHub / GPA / 日期顺序）的**谓词**统一放在
`src/utils/validators.ts`，**本模块与表单共用**，只是提示文案各自写：

| 调用方 | 时机 | 文案风格 |
| ------ | ---- | -------- |
| 表单（`ValidatedTextField`） | 失焦后就地报错，随输入实时消失 | 短、直接 |
| 本模块（`formatRules`） | 用户点「开始检查」后汇总 | 长、解释为什么与怎么改 |

**不要在本模块里重新写一份正则。** 两套判断并存必然漂移，用户会看到
「输入框说没问题、检查报告说有问题」这种自相矛盾的结果。

注意二者的职责边界：就地校验管**格式**，不管**必填**。
空值在 `validators.ts` 中一律放过 —— 用户可能正填到一半，
「哪里还缺内容」是检查模块的职责。

---

## 十三、PDF 导出管线

### 为什么不用 `html2pdf-browser` 的 `html2pdf()`

该库内部这样放图（`dist/index.es.js`）：

```js
b = el.offsetWidth; w = el.offsetHeight
pdf.addImage(dataURL, 'JPEG', 0, 0, b, w)   // 尺寸单位跟随 jsPDF 的 unit
```

- 210mm 宽的元素在 CSS 里是 **793.7px**
- 而 jsPDF 没有任何一种 unit 等于 1 CSS px（实测 A4 宽度：`pt`=595.28 / `mm`=210 / `px`=446.46）

所以**无论 `unit` 传什么，图片都会比 A4 宽**。原实现传 `unit: 'mm'`，图片被按 794mm 绘制到 210mm 的页面上，实测溢出 **3.78 倍**，导出结果只剩简历左上角 26%，有效精度约 51dpi；长简历还会被整页压进一页后截断。

### 现在的做法

保留该库真正有价值的部分 —— 它导出的 `html2canvas` 带中文文字重叠与 SVG `<use href>` 渲染修复 —— 页面尺寸与分页自己控制：

```
html2canvas(el, { scale: 2 })        # 2 ≈ 192dpi
      │
      ├─ pxPerMm = canvas.width / (el.offsetWidth / (96/25.4))
      ├─ pageHeightPx = 297 * pxPerMm
      ├─ pageCount = ceil((canvas.height - 1) / pageHeightPx)   # 减 1px 容差防空白页
      │
      └─ 逐页：切 canvas 竖条 → toDataURL('image/jpeg', .95)
               → pdf.addImage(img, 'JPEG', 0, 0, 210, sliceHeight / pxPerMm)
```

要点：

- **`pxPerMm` 由元素布局宽度反推**，不依赖缩放倍率，因此导出结果与预览区当前缩放级别无关
- 被捕获节点 `#resume-preview-content` 上**不能有 `transform`**；缩放放在它的父层。否则 html2canvas 的光栅化尺寸会随预览缩放漂移
- 捕获前给元素加 `.pdf-capture-stabilize` 冻结动画与过渡，避免栅格化结果不确定
- 底层仍用该库的 `html2canvas`，因此模板内的颜色必须遵守第九节的约束

### 实测结果（12 段工作经历 + 8 个项目）

| 页 | 绘制尺寸 (pt) | 占页面 |
| -- | ------------- | ------ |
| 1  | 595.3 × 841.9 | 100% × 100% |
| 2  | 595.3 × 841.9 | 100% × 100% |
| 3  | 595.3 × 135.8 | 100% × 16.1% |

页面尺寸均为 A4（595.28 × 841.89pt），宽度始终 100%，最后一页按剩余高度绘制且不变形。

---

## 十四、文件清单

```
共 39 个源文件（不含 node_modules / out / dist）

配置文件 (5)：package.json, electron.vite.config.ts, tsconfig.json,
              tsconfig.node.json, tsconfig.web.json

Electron (2)：electron/main/index.ts, electron/preload/index.ts

类型定义 (3)：src/types/resume.ts, src/types/template.ts,
              src/types/optimization.ts

状态管理 (4)：src/store/resumeStore.ts, src/store/uiStore.ts,
              src/store/optimizationStore.ts, src/store/toastStore.ts

原子组件 (7)：components/ui/Button.tsx, Card.tsx, TextField.tsx, Icons.tsx,
              ToastHost.tsx, ConfirmDialog.tsx, EmptyState.tsx

布局组件 (4)：components/layout/AppBar.tsx, NavDrawer.tsx, MainLayout.tsx,
              StatusBar.tsx（ErrorBoundary 在 components/ 根下）

编辑器 (11)：components/editor/EditorPanel.tsx, TemplateSelector.tsx,
             AccentPicker.tsx, FormScaffold.tsx
             forms/PersonalInfoForm.tsx, EducationForm.tsx,
             WorkExperienceForm.tsx, SkillsForm.tsx, ProjectsForm.tsx,
             SummaryForm.tsx, OptimizationForm.tsx

预览器 (3)：components/preview/PreviewPanel.tsx, PreviewToolbar.tsx,
            ResumePreview.tsx

模板 (4)：components/templates/ClassicTemplate.tsx, ModernTemplate.tsx,
          MinimalTemplate.tsx, shared.tsx

Hooks (4)：hooks/useAutoSave.ts, hooks/useAccentTheme.ts,
           hooks/useResizable.ts, hooks/usePdfExport.ts

工具 (9)：utils/fileIO.ts, utils/pdfExport.ts, utils/templateRegistry.ts,
          utils/resumeChecker.ts, utils/validators.ts, utils/sectionProgress.ts,
          utils/color.ts, utils/accents.ts, utils/image.ts

入口 (5)：index.html, src/main.tsx, src/App.tsx, src/index.css, src/global.d.ts

资源 (1)：resources/icon.png（打包图标；由 SVG 形状程序化生成）

示例 (1)：samples/sample-frontend.json（虚构的示例简历，用于查看排版效果）

文档 (5)：docs/development-reference.md（本文件）、docs/beta-test-report.md、
          docs/design-benchmark-apple.md、docs/errors-and-fixes.md,
          docs/CHANGELOG.md
```
