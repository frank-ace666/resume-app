# 发布清单（Windows）

> 适用于 tag 驱动的自动发布。工作流见 `.github/workflows/release.yml`。
>
> 目标：**推一个 tag，就得到可下载的安装包**，避免再出现「本地打包成功、GitHub 上却没有 Release」。

## 0. 一次性准备

- [ ] 仓库默认分支为 `main`。
- [ ] GitHub 仓库 Settings → Actions → General → Workflow permissions：
      选择 **Read and write permissions**（工作流里虽然声明了 `contents: write`，
      但仓库/组织策略可以覆盖它）。
- [ ] 关闭当前正在运行的「简历工坊」和 VS Code（或确认 `.vscode/settings.json`
      的 watcher 排除已生效），避免本地打包时 `app.asar` 被占用。
- [ ] 不要在本地提交 `dist/`、`out/`：它们已在 `.gitignore` 中。
      exe 应作为 Release 附件，而不是 git 内容。

## 1. 版本号三处同步

- [ ] `package.json` → `version`
- [ ] `src/data/releases.ts` → 数组头部新增对应版本条目
- [ ] `docs/CHANGELOG.md` → 新增 `## vX.Y.Z — 标题 (日期)` 段落
- [ ] `README.md` → 当前版本、安装包名、数据路径（`%APPDATA%\resume-app`）同步更新
- [ ] `src/data/faq.ts` → 数据路径、换机/卸载说明、版本相关文案同步更新

> 应用内「检查更新」读取的是
> `https://raw.githubusercontent.com/frank-ace666/resume-app/main/package.json`。
> **版本号必须先进 main**，否则老用户永远检查不到新版本。

## 2. 合并与本地验证

```bash
git switch main
git merge --ff-only feat/vX.Y.Z-xxx
git push origin main

npm ci
npm run build
```

- [ ] 确认 `main` 已包含发布提交：`git branch -a --contains <commit>`
- [ ] 确认 `package.json` 版本与准备打的 tag 一致
- [ ] 手工冒烟（发布前至少覆盖）：
  - [ ] 启动、关闭、再次启动（单实例锁）
  - [ ] 7 套模板逐一切换，已填内容不丢
  - [ ] 主题色切换，界面与简历标题同时生效
  - [ ] 保存 JSON、重新打开、自动保存恢复
  - [ ] 旧存档迁移（如 `DATA_VERSION` 有变更）
  - [ ] 旧版 localStorage 明文 → `resume-data.enc` 迁移成功，旧键被删除
  - [ ] 加密文件不含明文姓名/电话；修改后重载能恢复
  - [ ] 自动备份生成；「帮助与反馈 → 数据」能恢复最近备份
  - [ ] 「清除本机数据」双重确认后主文件与备份为空
  - [ ] 模拟损坏的 `resume-data.enc`，能显示加载错误页
  - [ ] PDF 导出：单页、多页、不同缩放级别、无空白尾页
  - [ ] 「帮助与反馈 → 更新日志 → 检查更新」可访问网络并返回正确版本
  - [ ] 免安装版 `ResumeCraft-X.Y.Z-portable.exe` 可直接运行，与安装版共用数据目录

## 3. 打 tag 并触发 CI

```bash
git tag -a vX.Y.Z -m "vX.Y.Z — 一句话说明"
git push origin main vX.Y.Z
```

- [ ] tag 打在 **main 上的发布提交**（不是功能分支的旧提交）
- [ ] tag 指向的提交里包含 `.github/workflows/release.yml`
- [ ] 确认没有复用已发布过的版本号

推送 tag 后，GitHub Actions 会自动：

1. 校验 `tag === 'v' + package.json.version`（不一致直接失败）；
2. `npm ci` + `npm run build`；
3. `electron-builder --win --publish always`，把
   `ResumeCraft-Setup-X.Y.Z.exe`、`ResumeCraft-X.Y.Z-portable.exe`
   （及 `latest.yml` / blockmap）上传到 **draft release**。

## 4. 验收并发布

> **不要**在网页上为同一个 tag 手动新建 Release。等待 CI 生成 draft，
> 确认 Assets 里安装版和免安装版都在，再点 Publish；否则容易出现
> 「Release 存在但没有 exe 资产」的重复发布问题。

- [ ] Actions 页面：`发布 Windows 安装包` 工作流成功
- [ ] Releases 页面出现对应草稿，**Assets 同时包含**
      `ResumeCraft-Setup-X.Y.Z.exe` 与 `ResumeCraft-X.Y.Z-portable.exe`
- [ ] 下载草稿中的安装版，在干净环境完成安装、启动、PDF 导出
- [ ] 下载草稿中的免安装版，直接运行；确认与安装版看到同一份数据
- [ ] 点击 **Publish release**
- [ ] 确认勾选 **Set as the latest release**

> 不需要全自动发布时保持 `releaseType: "draft"`。
> 如果确认要“推 tag 即公开”，把 `package.json` 的 `build.publish.releaseType`
> 改成 `"release"`，但前提是冒烟测试已经稳定。

## 5. 发布后验证

- [ ] `https://github.com/frank-ace666/resume-app/releases/latest` 指向新版本
- [ ] 用上一版应用点「检查更新」，能提示新版本
- [ ] README 下载入口正常
- [ ] 下载链接可访问，安装包大小正常
- [ ] 记录 SHA256（GitHub 资产详情里会显示 digest）

## 6. 出问题时

- 安装包有阻断性问题：**删除该 Release 和 tag**，修复后提升版本号重新发布。
  不要覆盖同一版本号的资产，否则用户无法判断自己装的是哪一版。
- CI 失败但 tag 已推送：修复代码后删掉 tag 重新打（或打新版本号），
  不要让一个失败的 tag 长期留在仓库里。
- 如果只是草稿阶段发现问题：直接删除草稿，修复后重新推 tag。

## 附：本地手动打包（应急）

```bash
npm ci
npm run build
npx electron-builder --win --publish never
```

产物：

- `dist/ResumeCraft-Setup-X.Y.Z.exe` — NSIS 安装包
- `dist/ResumeCraft-X.Y.Z-portable.exe` — 免安装单文件版
- `dist/win-unpacked/简历工坊.exe` — 免安装版

手动上传时，把 exe 作为 Release 附件上传即可；不要提交进仓库。
