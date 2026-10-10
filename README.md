# 📄 简历工坊 — Resume Craft

> **轻量化简历制作桌面应用** · 面向求职新手（学生、转行从业者）
>
> 🖥️ Windows 桌面应用 · Electron + React + TypeScript + Tailwind CSS v4

---

## 🤖 AI 开发声明

**本项目由 AI（Claude Code + deepseek-v4-pro）辅助开发完成。** 人类开发者提供需求方向、设计决策和代码审核，AI 负责架构设计、代码编写和文档生成。所有代码均经过 TypeScript 类型检查和构建验证。

- 开发周期：2026-06-24（1天）
- AI 贡献：架构设计、全部代码、3份文档
- 人类贡献：需求定义、技术选型决策、关键设计约束（11维度分析）

> ⚠️ **注意**：本应用的简历优化模块仅做规则性检查和表达建议，**不会编造任何工作经历、项目、技能等虚假信息**。所有内容均由用户自行填写。

---

## ✨ 功能

| 功能 | 说明 |
|------|------|
| 📝 **3 个简历模板** | 经典（双栏）、现代（色块+竖条）、简约（单栏留白，最 ATS 友好） |
| 🎨 **主题色** | 8 个专业预设 + 自定义，同时应用到界面与简历标题 |
| ✏️ **7 步表单** | 个人信息（含头像）、教育、工作、技能、项目、自我评价、简历检查 |
| 👁️ **实时预览** | A4 预览，25%–200% 缩放、适应宽度、Ctrl+滚轮、**分页参考线** |
| 🖥️ **可调布局** | 拖拽分隔条调整编辑/预览比例，支持「专注预览」折叠编辑区 |
| 📤 **导出 PDF** | 所见即所得，中文支持，**超过一页自动分页**（不再截断） |
| 💾 **本地保存** | JSON 文件保存/打开 + 自动保存，旧存档自动补齐新字段 |
| 🔍 **简历检查** | 27 条规则引擎：完整性、格式、表达质量、一致性 |

> 界面为 Material 风格（Gmail / YouTube 系）：左侧分区导航带完成度与问题徽标、
> 顶部应用栏、涟漪与过渡动效、snackbar 提示，并遵循系统「减少动态效果」设置。
>
> 简历模板本身**刻意不使用**这套界面语言 —— 它是要打印和过机器筛选的文档，
> 只用单一强调色、纯文字熟练度、无 emoji 图标，以保证 ATS 解析与灰度打印都不出问题。

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 开发模式（HMR 热更新）
npm run dev

# 构建生产版本
npm run build

# 打包为 Windows .exe
npm run package
```

> 如果 Electron 下载失败（国内网络），使用镜像：
> ```bash
> set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
> npx install-electron --no
> ```

## 🏗️ 技术栈

| 类别 | 技术 |
|------|------|
| 桌面框架 | Electron 42 |
| 构建工具 | electron-vite 5 + Vite 6 |
| UI | React 19 + Tailwind CSS 4 |
| 语言 | TypeScript |
| 状态管理 | Zustand 5 |
| PDF 导出 | html2pdf-browser（`html2canvas`）+ jsPDF，自行做 A4 定位与分页 |
| 打包 | electron-builder |

## 📁 项目结构

```
resume-app/
├── electron/            # Electron 主进程 + preload
├── resources/           # 打包图标
├── src/
│   ├── components/
│   │   ├── ui/          # 原子组件（Button / Card / TextField / Icons / Toast …）
│   │   ├── layout/      # AppBar / NavDrawer / MainLayout / StatusBar
│   │   ├── editor/      # 编辑器面板 + 外观设置 + 7 步表单
│   │   ├── preview/     # 预览面板 + 缩放工具栏 + 渲染容器
│   │   └── templates/   # 3 个简历模板 + shared（排版尺度与打印色板）
│   ├── store/           # Zustand 状态管理
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数（规则引擎、A4 分页、配色、图像）
│   └── hooks/           # 自定义 Hook
├── docs/                # 开发文档
└── package.json
```

> 改模板前请先读 [开发参考 · 第九节](docs/development-reference.md)：
> 模板内颜色不能用 Tailwind 调色板类（oklch）与透明度修饰符（color-mix），
> 否则 PDF 导出会直接失败。

## 📚 文档

| 文档 | 说明 |
|------|------|
| [开发参考](docs/development-reference.md) | 14 章完整技术文档（含 PDF 管线与颜色约束） |
| [内测报告](docs/beta-test-report.md) | v1.2.0 内测：9 项缺陷、修复与验证证据 |
| [Apple 对比与优化建议](docs/design-benchmark-apple.md) | 对标 macOS 系统应用的差距分析与改进路线 |
| [错误记录](docs/errors-and-fixes.md) | 开发错误与解决方案 |
| [更新日志](docs/CHANGELOG.md) | 版本变更 + 优化建议 |

## 🧪 示例数据

`samples/sample-frontend.json` 是一份完整的示例简历，用于快速查看排版效果：

**打开 → 选择 `samples/sample-frontend.json`** 即可载入（该文件为虚构内容，不含任何真实个人信息）。

## 📄 许可证

MIT
