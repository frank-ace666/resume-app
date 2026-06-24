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
| 📝 **3 个简历模板** | 经典（双栏）、现代（卡片+时间线）、简约（单栏留白） |
| ✏️ **6 步表单** | 个人信息、教育经历、工作经历、技能特长、项目经历、自我评价 |
| 👁️ **实时预览** | 右侧 A4 预览，支持 25%-200% 缩放 |
| 📤 **导出 PDF** | 所见即所得，中文支持 |
| 💾 **本地保存** | JSON 文件保存/打开 + 自动保存 |
| 🔍 **简历检查** | 27 条规则引擎：完整性、格式、表达质量、一致性 |

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
| PDF 导出 | html2pdf-browser |
| 打包 | electron-builder |

## 📁 项目结构

```
resume-app/
├── electron/          # Electron 主进程 + preload
├── src/
│   ├── components/    # React 组件
│   │   ├── layout/    # Header / MainLayout / StatusBar
│   │   ├── editor/    # 编辑器面板 + 7步表单
│   │   ├── preview/   # 预览面板 + 缩放控制
│   │   └── templates/ # 3个简历模板
│   ├── store/         # Zustand 状态管理
│   ├── types/         # TypeScript 类型定义
│   ├── utils/         # 工具函数（规则引擎等）
│   └── hooks/         # 自定义 Hook
├── docs/              # 开发文档
└── package.json
```

## 📚 文档

| 文档 | 说明 |
|------|------|
| [开发参考](docs/development-reference.md) | 13章完整技术文档 |
| [错误记录](docs/errors-and-fixes.md) | 开发错误与解决方案 |
| [更新日志](docs/CHANGELOG.md) | 版本变更 + 优化建议 |

## 📄 许可证

MIT
