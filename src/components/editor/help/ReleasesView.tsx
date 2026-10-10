import { useState } from 'react'
import { RELEASES } from '@/data/releases'
import { PRODUCT, hasLink } from '@/data/product'
import { openExternal } from '@/utils/mailto'
import { checkForUpdate, type UpdateResult } from '@/utils/updateChecker'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  IconAlert,
  IconCheckCircle,
  IconDownload,
  IconHistory,
  IconSparkles
} from '@/components/ui/Icons'
import { ReleaseHeader, ReleaseHighlights } from '@/components/ui/ReleaseNotes'

/**
 * 更新日志 + 检查更新。
 *
 * 更新日志随安装包内置（离线可看）；「检查更新」是**用户主动触发**的，
 * 也是全应用**唯一可能发生的联网行为** —— 所以界面上必须把这件事讲清楚，
 * 不能让人怀疑在偷偷联网。
 */

type CheckState =
  | { phase: 'idle' }
  | { phase: 'checking' }
  | { phase: 'done'; result: UpdateResult; at: string }

function CheckUpdateCard() {
  const [state, setState] = useState<CheckState>({ phase: 'idle' })

  const run = async () => {
    setState({ phase: 'checking' })
    const result = await checkForUpdate()
    setState({
      phase: 'done',
      result,
      at: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    })
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-medium text-ink">当前版本</span>
            <span className="text-sm font-semibold text-brand">v{__APP_VERSION__}</span>
            {PRODUCT.name && <span className="text-xs text-ink-3">· {PRODUCT.name}</span>}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink-3">
            平时完全离线。点「检查更新」会读取一次公开的版本文件 —— 这是全应用唯一的联网行为，
            请求里不含版本号、设备信息或任何简历内容。
          </p>
        </div>

        <Button
          variant="tonal"
          size="sm"
          icon={state.phase === 'checking' ? undefined : <IconHistory size={15} />}
          loading={state.phase === 'checking'}
          onClick={run}
          className="shrink-0"
        >
          {state.phase === 'checking' ? '检查中…' : '检查更新'}
        </Button>
      </div>

      {state.phase === 'done' && (
        <div className="anim-pop-in mt-3 border-t border-outline pt-3">
          <CheckResult result={state.result} checkedAt={state.at} />
        </div>
      )}
    </Card>
  )
}

function CheckResult({ result, checkedAt }: { result: UpdateResult; checkedAt: string }) {
  if (result.kind === 'up-to-date') {
    return (
      <p className="flex flex-wrap items-center gap-2 text-[13px] text-success">
        <IconCheckCircle size={16} />
        已是最新版本
        <span className="text-xs text-ink-3">（{checkedAt} 检查）</span>
      </p>
    )
  }

  if (result.kind === 'outdated') {
    return (
      <div className="space-y-2.5">
        <p className="flex items-center gap-2 text-[13px] font-medium text-brand">
          <IconSparkles size={16} />
          发现新版本 v{result.latest}
        </p>
        <p className="text-xs leading-relaxed text-ink-2">
          不会自动下载或安装。前往下载页取安装包，覆盖安装即可，简历数据不受影响。
        </p>
        {hasLink(result.downloadUrl) && (
          <Button
            variant="filled"
            size="sm"
            icon={<IconDownload size={15} />}
            onClick={() => openExternal(result.downloadUrl)}
          >
            前往下载 v{result.latest}
          </Button>
        )}
      </div>
    )
  }

  if (result.kind === 'unconfigured') {
    return (
      <p className="text-[13px] text-ink-2">
        未配置代码仓库地址，无法检查更新。
        <span className="mt-1 block text-xs text-ink-3">
          在 <code className="rounded-xs bg-hover px-1">src/data/product.ts</code> 填入{' '}
          <code className="rounded-xs bg-hover px-1">repoUrl</code> 即可启用。
        </span>
      </p>
    )
  }

  return (
    <p className="flex items-start gap-2 text-[13px] text-ink-2">
      <span className="mt-0.5 shrink-0 text-warning">
        <IconAlert size={16} />
      </span>
      <span>
        {result.reason}
        <span className="mt-1 block text-xs text-ink-3">
          不影响使用，更新日志仍可离线查看。
        </span>
      </span>
    </p>
  )
}

export default function ReleasesView() {
  const current = __APP_VERSION__

  return (
    <div className="space-y-4">
      <CheckUpdateCard />

      <div className="pt-1">
        <h3 className="mb-3 text-sm font-medium text-ink">更新日志</h3>
        <div className="space-y-4">
          {RELEASES.map((r) => {
            const isCurrent = r.version === current
            return (
              <Card key={r.version} className={`p-4 ${isCurrent ? 'ring-1 ring-brand' : ''}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <ReleaseHeader release={r} />
                  {isCurrent && (
                    <span className="ml-auto shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand">
                      当前版本
                    </span>
                  )}
                </div>
                <div className="mt-4 border-t border-outline pt-4">
                  <ReleaseHighlights release={r} />
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
