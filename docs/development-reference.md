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
| PDF 导出 | html2pdf-browser         | html2canvas 截图 → jsPDF               |

### 为什么选择这些技术？

- **Zustand 而非 Redux**：简历应用状态结构简单，Zustand 无 Provider、API 简洁、内置 persist，30 分钟就能上手。Redux 对这个小应用来说太重。
- **html2pdf-browser 而非 @react-pdf/renderer**：html2pdf 截取已渲染的 HTML → 图片 → PDF，所见即所得。@react-pdf/renderer 需要用其 DSL 重写模板，相当于做两遍 UI，第一版不划算。
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
│   │   └── uiStore.ts               # 步骤索引、缩放比例、保存状态
│   │
│   ├── components/
│   │   ├── layout/                   # 框架层：Header / MainLayout / StatusBar
│   │   ├── editor/                   # 编辑器：面板 + 模板选择 + 步骤导航
│   │   │   └── forms/               # 6 个步骤表单（每个独立文件）
│   │   ├── preview/                  # 预览器：面板 + 缩放工具栏 + 渲染容器
│   │   └── templates/               # 3 个简历模板（纯展示组件，只接收 data）
│   │
│   ├── hooks/                        # 自定义 Hook
│   │   ├── useAutoSave.ts            # 自动保存逻辑（防抖 → localStorage）
│   │   └── usePdfExport.ts           # PDF 导出逻辑（状态管理 + 回调）
│   │
│   ├── utils/                        # 工具函数
│   │   ├── fileIO.ts                 # 文件保存/打开（IPC 层封装）
│   │   ├── pdfExport.ts              # html2pdf-browser 封装
│   │   └── templateRegistry.ts       # 模板注册表（id → 组件映射）
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
4. 在 `TemplateSelector.tsx` 的 TEMPLATES 数组中添加选项

模板即组件，数据即 props，开闭原则——新增模板不改已有代码。

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

- 模板组件用 Tailwind 原子类 + 少量内联样式（A4 尺寸用 `mm` 单位）
- 3 个模板的视觉差异：
  - **经典**：`flex` 两栏，左侧灰底放个人信息+技能，右侧白底放经历
  - **现代**：顶部渐变色卡片 + 蓝色左边框分割线 + 时间线圆点
  - **简约**：单栏全白，大量留白，用 `tracking-[0.2em]` 上标小标题

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

### 第一版限制

| 限制             | 原因                               | 影响                   |
| ---------------- | ---------------------------------- | ---------------------- |
| PDF 文字不可选中 | html2canvas 截图方案，文字变为图片 | 部分 HR 习惯复制文字   |
| 无头像裁剪功能   | 第一版简化                         | 上传非正方形图片会变形 |
| 无撤销/重做      | Zustand 未集成 temporal 中间件     | 误操作后需手动恢复     |
| 单页简历         | A4 单页限制                        | 超过一页的内容会被截断 |
| 无云端同步       | 纯本地                             | 换电脑需手动迁移 JSON  |

### 后续可优化方向

1. **PDF 文字可选**：使用 pdfmake 替代 html2pdf，注册中文字体
2. **头像裁剪**：集成 cropper.js，上传后裁剪为正方形
3. **撤销/重做**：Zustand + zundo 中间件，记录操作历史
4. **多页支持**：模板组件中检测内容高度，自动分页
5. **更多模板**：社区模板市场
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

## 十三、文件清单

```
共 39 个源文件（不含 node_modules / out / dist）

配置文件 (4)：package.json, electron.vite.config.ts, tsconfig.json,
              tsconfig.node.json, tsconfig.web.json

Electron (2)：electron/main/index.ts, electron/preload/index.ts

类型定义 (3)：src/types/resume.ts, src/types/template.ts,
              src/types/optimization.ts

状态管理 (3)：src/store/resumeStore.ts, src/store/uiStore.ts,
              src/store/optimizationStore.ts

布局组件 (4)：components/layout/Header.tsx, MainLayout.tsx, StatusBar.tsx,
              ErrorBoundary.tsx

编辑器 (10)：components/editor/EditorPanel.tsx, TemplateSelector.tsx,
             FormNavigation.tsx
             forms/PersonalInfoForm.tsx, EducationForm.tsx,
             WorkExperienceForm.tsx, SkillsForm.tsx, ProjectsForm.tsx,
             SummaryForm.tsx, OptimizationForm.tsx

预览器 (3)：components/preview/PreviewPanel.tsx, PreviewToolbar.tsx,
            ResumePreview.tsx

模板 (3)：components/templates/ClassicTemplate.tsx, ModernTemplate.tsx,
          MinimalTemplate.tsx

Hooks (2)：hooks/useAutoSave.ts, hooks/usePdfExport.ts

工具 (4)：utils/fileIO.ts, utils/pdfExport.ts, utils/templateRegistry.ts,
          utils/resumeChecker.ts

入口 (4)：index.html, src/main.tsx, src/App.tsx, src/index.css, src/global.d.ts
```
