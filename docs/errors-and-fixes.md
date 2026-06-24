# 错误记录与解决方案

> 记录"简历工坊"第一版开发过程中遇到的所有错误、原因分析和解决方案。

---

## 1. electron-vite 版本号不存在

**现象**：
```
npm error notarget No matching version found for electron-vite@^2.4.0.
```

**原因**：`package.json` 中写的 `"electron-vite": "^2.4.0"` 版本号过时。electron-vite 已经迭代到 5.x。

**解决**：
```bash
npm view electron-vite versions --json  # 查看可用版本
```
最终使用 `"electron-vite": "^5.0.0"`。

**教训**：在新项目初始化时，应先用 `npm view <package> version` 确认最新版本号，不要凭记忆写入版本。

---

## 2. html2pdf-browser 版本号不存在

**现象**：
```
npm error notarget No matching version found for html2pdf-browser@^0.0.2.
```

**原因**：计划阶段设想的版本号 `0.0.2` 不存在，实际最新版本是 `1.0.2`。

**解决**：修改为 `"html2pdf-browser": "^1.0.0"`。

---

## 3. electron-vite 5.x 配置格式变更

**现象**：
```
ERROR An entry point is required in the electron vite main config,
which can be specified using "build.lib.entry" or "build.rollupOptions.input".
```

**原因**：electron-vite 2.x → 5.x 大版本升级后，`main`/`preload`/`renderer` 配置块需要显式指定入口文件。同时 `externalizeDepsPlugin()` 插件已废弃，改为 `build.externalizeDeps: true` 配置项。

**错误的配置（v2.x 格式）**：
```typescript
// ❌ 旧格式
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]  // 已废弃
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [react(), tailwindcss()]
  }
})
```

**正确的配置（v5.x 格式）**：
```typescript
// ✅ 新格式
export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main/index.ts')
        }
      },
      externalizeDeps: true  // 替代 externalizeDepsPlugin()
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload/index.ts')
        }
      },
      externalizeDeps: true
    }
  },
  renderer: {
    root: '.',
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
```

**教训**：使用 `npm create electron-vite@latest` 官方脚手架创建项目，可以避免手动配置的坑。

---

## 4. Electron 二进制文件下载失败

**现象**：
```
Error: Electron failed to install correctly.
TypeError: fetch failed
```

**原因**：`npm install` 安装 electron 包时，会自动触发 `postinstall` 脚本下载 Electron 二进制文件（约 100MB）。在无代理环境中，从 GitHub Releases 下载可能超时或失败。

**解决方案**：

**方案 A — 使用国内镜像**：
```bash
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
npx install-electron --no
```

**方案 B — 手动安装**：
```bash
npx install-electron --no
```

**方案 C — 删除重装**：
```bash
rm -rf node_modules/electron
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
npm install electron
```

**教训**：在国内开发 Electron 应用时，建议提前配置镜像环境变量，或使用 `.npmrc` 配置：
```
electron_mirror=https://npmmirror.com/mirrors/electron/
```

---

## 5. html2pdf-browser TypeScript 类型不兼容

**现象**：
```
error TS2322: Type '{ scale: number; useCORS: true; logging: false; }'
is not assignable to type 'Options'.
Type is missing the following properties from type 'WindowOptions':
scrollX, scrollY, windowWidth, windowHeight
```

**原因**：`html2pdf-browser` 的类型定义中，`html2canvasOptions` 参数被声明为完整的 `Options` 类型（继承自 `html2canvas` 的 `WindowOptions`），而不是 `Partial<Options>`。但实际上 `scrollX`/`scrollY`/`windowWidth`/`windowHeight` 这些属性在运行时都有默认值，不需要显式传入。

**解决**：使用类型断言绕过：
```typescript
html2canvasOptions: {
  scale: 2,
  useCORS: true,
  logging: false
} as any  // 绕过 WindowOptions 必填属性的类型检查
```

**教训**：第三方库的类型定义不一定准确反映运行时行为。当类型报错但逻辑合理时，使用 `as any` 是可行的过渡方案。后续可以在项目中添加自己的类型声明文件来覆盖不准确的类型。

---

## 6. @vitejs/plugin-react 版本兼容性

**现象**：无报错，但潜在风险——vite 6.x + `@vitejs/plugin-react` 4.x 可能存在兼容性问题。

**原因**：初始计划使用 `"@vitejs/plugin-react": "^4.3.0"`，但当前 Vite 已到 6.x，该插件最新稳定版是 5.1.x。

**解决**：使用 `"@vitejs/plugin-react": "^5.0.0"`，与 Vite 6.x 兼容。

**教训**：Vite 生态中，`@vitejs/plugin-react` 的主版本号应与 Vite 主版本号大体重合。即 Vite 6 → plugin 5.x，Vite 7 → plugin 6.x。

---

## 7. npm create electron-vite 无法在当前目录创建

**现象**：在当前空目录 `G:\MyProject\Resume` 中无法直接使用 `npm create electron-vite` 脚手架。

**原因**：脚手架工具会创建子目录，不能指定当前目录（`.`）作为项目名。

**解决**：改为手动初始化所有配置文件，逐文件创建项目结构。这样做的好处是可以精确控制每个文件的内容，避免清理脚手架生成的示例代码。

---

## 总结：版本号参考

| 包名 | 错误版本 | 正确版本 | 备注 |
|------|---------|---------|------|
| electron | ^33.0.0 | ^42.0.0 | 当前最新 42.5 |
| electron-vite | ^2.4.0 | ^5.0.0 | 配置格式大幅变更 |
| electron-builder | ^25.0.0 | ^26.0.0 | 打包工具 |
| html2pdf-browser | ^0.0.2 | ^1.0.0 | API 略有不同 |
| @vitejs/plugin-react | ^4.3.0 | ^5.0.0 | 与 Vite 6 兼容 |
| vite | ^6.0.0 | ^6.0.0 | ✅ |
| react | ^19.0.0 | ^19.0.0 | ✅ |
| zustand | ^5.0.0 | ^5.0.0 | ✅ |
| tailwindcss | ^4.0.0 | ^4.0.0 | ✅ |
| @tailwindcss/vite | ^4.0.0 | ^4.3.1 | ✅ |

**快速检查版本号的命令**：
```bash
npm view <package-name> version          # 最新版本
npm view <package-name> versions --json  # 所有版本列表
```
