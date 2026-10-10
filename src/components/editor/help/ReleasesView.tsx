import { RELEASES } from '@/data/releases'
import { PRODUCT, hasLink } from '@/data/product'
import { openExternal } from '@/utils/mailto'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { IconExternal, IconHistory } from '@/components/ui/Icons'
import { ReleaseHeader, ReleaseHighlights } from '@/components/ui/ReleaseNotes'

/** 更新日志：本应用离线运行，日志随包内置，记录当前版本包含什么。 */
/* ============ 视图 4：更新日志 ============ */

export default function ReleasesView() {
  const current = __APP_VERSION__

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-start gap-3 bg-canvas p-4">
        <span className="mt-0.5 shrink-0 text-brand">
          <IconHistory size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">
            当前版本 v{current}
            {PRODUCT.name ? ` · ${PRODUCT.name}` : ''}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-2">
            本应用完全离线运行，不会在后台联网检查新版本。这里的更新日志随安装包内置，
            记录的是你手上这一版包含的变化。要获取新版本，需手动下载覆盖安装。
          </p>
          {hasLink(PRODUCT.downloadUrl) && (
            <Button
              variant="tonal"
              size="sm"
              className="mt-2.5"
              icon={<IconExternal size={14} />}
              onClick={() => openExternal(PRODUCT.downloadUrl)}
            >
              前往下载页
            </Button>
          )}
        </div>
      </Card>

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
  )
}
