import { VERSION_MANIFEST_URL, DOWNLOAD_URL } from '@/data/product'

/**
 * 检查更新。
 *
 * ## 设计约束
 *
 * 1. **只在用户点击时发起**，不做启动自动检查。
 *    本应用对外的承诺是「无账号、无广告、完全离线」，
 *    擅自联网既破坏这个承诺，也容易被当成静默上报。
 * 2. **只读一个公开文件，不发送任何本机信息**。
 *    请求里没有版本号、没有设备信息、没有简历内容 —— 服务端无法据此区分用户。
 * 3. **不自动下载、不自动安装**。发现新版本只给出下载页链接，由用户决定。
 *
 * 读的是仓库里的 package.json（见 product.ts 的注释解释为何不用 GitHub API）。
 */

export type UpdateResult =
  | { kind: 'up-to-date'; current: string }
  | { kind: 'outdated'; current: string; latest: string; downloadUrl: string }
  | { kind: 'unconfigured' }
  | { kind: 'error'; reason: string }

const TIMEOUT_MS = 10_000

/** 逐段比较数字版本号。只认 `x.y.z`，预发布后缀不参与比较。 */
function isNewerVersion(latest: string, current: string): boolean {
  const parse = (v: string) => v.split('-')[0].split('.').map((n) => parseInt(n, 10) || 0)
  const a = parse(latest)
  const b = parse(current)
  for (let i = 0; i < 3; i++) {
    const x = a[i] ?? 0
    const y = b[i] ?? 0
    if (x !== y) return x > y
  }
  return false
}

export async function checkForUpdate(): Promise<UpdateResult> {
  if (!VERSION_MANIFEST_URL) return { kind: 'unconfigured' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    // cache: 'no-store' —— 否则可能读到上次的缓存，给出过时的结论
    const res = await fetch(VERSION_MANIFEST_URL, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    })

    if (!res.ok) {
      return {
        kind: 'error',
        reason:
          res.status === 404
            ? '读不到版本清单（仓库地址可能已变更或仓库转为私有）'
            : `获取版本信息失败（HTTP ${res.status}）`
      }
    }

    const data = (await res.json()) as { version?: unknown }
    const latest = typeof data.version === 'string' ? data.version : ''
    if (!latest) return { kind: 'error', reason: '版本清单里没有版本号' }

    const current = __APP_VERSION__
    return isNewerVersion(latest, current)
      ? { kind: 'outdated', current, latest, downloadUrl: DOWNLOAD_URL }
      : { kind: 'up-to-date', current }
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError'
    return {
      kind: 'error',
      reason: aborted
        ? '请求超时，请检查网络后重试'
        : '网络不可达。本应用平时完全离线，只有检查更新需要联网。'
    }
  } finally {
    clearTimeout(timer)
  }
}
