import { useResumeStore } from '@/store/resumeStore'
import { TEMPLATES, getTemplate } from '@/utils/templateRegistry'
import { TEMPLATE_IDS, type TemplateId } from '@/types/templateIds'
import { IconCheck } from '@/components/ui/Icons'

/** 用极简 CSS 微缩还原每种版式的结构，比纯文字卡片更直观 */
function Thumbnail({ id, accent }: { id: TemplateId; accent: string }) {
  if (id === 'modern') {
    return (
      <div className="flex h-full w-full flex-col bg-white">
        <div className="flex items-center gap-1 px-1.5 py-1.5" style={{ backgroundColor: accent }}>
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-white/70" />
          <span className="flex-1 space-y-0.5">
            <span className="block h-1 w-2/3 rounded-full bg-white/90" />
            <span className="block h-0.5 w-1/2 rounded-full bg-white/60" />
          </span>
        </div>
        <div className="flex-1 space-y-1 p-1.5">
          <span className="block h-0.5 w-1/3 rounded-full" style={{ backgroundColor: accent }} />
          <span className="block h-0.5 w-full rounded-full bg-slate-200" />
          <span className="block h-0.5 w-5/6 rounded-full bg-slate-200" />
          <span className="block h-0.5 w-1/3 rounded-full" style={{ backgroundColor: accent }} />
          <span className="block h-0.5 w-full rounded-full bg-slate-200" />
          <span className="block h-0.5 w-4/6 rounded-full bg-slate-200" />
        </div>
      </div>
    )
  }

  if (id === 'minimal') {
    return (
      <div className="flex h-full w-full flex-col gap-1.5 bg-white px-2 py-2">
        <span className="block h-1 w-1/2 rounded-full bg-slate-400" />
        <span className="block h-0.5 w-1/3 rounded-full bg-slate-300" />
        <span className="mt-1 block h-0.5 w-1/4 rounded-full bg-slate-300" />
        <span className="block h-0.5 w-full rounded-full bg-slate-200" />
        <span className="block h-0.5 w-5/6 rounded-full bg-slate-200" />
        <span className="mt-1 block h-0.5 w-1/4 rounded-full bg-slate-300" />
        <span className="block h-0.5 w-full rounded-full bg-slate-200" />
      </div>
    )
  }

  if (id === 'steady') {
    return (
      <div className="flex h-full w-full bg-white">
        <div className="flex w-[34%] flex-col items-center gap-1 bg-slate-700 px-1 py-1.5">
          <span className="h-3 w-3 rounded-full bg-slate-400" />
          <span className="block h-0.5 w-4/5 rounded-full bg-slate-300" />
          <span className="mt-1 block h-0.5 w-full rounded-full bg-slate-500" />
          <span className="block h-0.5 w-full rounded-full bg-slate-500" />
          <span className="block h-0.5 w-3/5 rounded-full bg-slate-500" />
        </div>
        <div className="flex-1 space-y-1 p-1.5">
          <span className="block h-1 w-1/2 rounded-full bg-slate-400" />
          <span className="mt-1 block h-0.5 w-1/3 rounded-full" style={{ backgroundColor: accent }} />
          <span className="block h-0.5 w-full rounded-full bg-slate-200" />
          <span className="block h-0.5 w-5/6 rounded-full bg-slate-200" />
          <span className="mt-1 block h-0.5 w-1/3 rounded-full" style={{ backgroundColor: accent }} />
          <span className="block h-0.5 w-full rounded-full bg-slate-200" />
        </div>
      </div>
    )
  }

  if (id === 'elegant') {
    return (
      <div className="flex h-full w-full flex-col items-center gap-1 bg-white px-2 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="block h-1 w-1/2 rounded-full bg-slate-400" />
        <span className="block h-0.5 w-1/3 rounded-full bg-slate-300" />
        <span className="mt-1 block h-0.5 w-1/4 rounded-full" style={{ backgroundColor: accent }} />
        <span className="block h-0.5 w-full rounded-full bg-slate-200" />
        <span className="block h-0.5 w-5/6 rounded-full bg-slate-200" />
        <span className="mt-1 block h-0.5 w-1/4 rounded-full" style={{ backgroundColor: accent }} />
        <span className="block h-0.5 w-full rounded-full bg-slate-200" />
      </div>
    )
  }

  if (id === 'compact') {
    return (
      <div className="flex h-full w-full flex-col bg-white p-1.5">
        <div className="flex gap-1">
          <div className="flex-1 space-y-0.5">
            <span className="block h-1 w-1/2 rounded-full bg-slate-400" />
            <span className="block h-0.5 w-2/3 rounded-full" style={{ backgroundColor: accent }} />
            <span className="block h-0.5 w-full rounded-full bg-slate-200" />
            <span className="block h-0.5 w-4/5 rounded-full bg-slate-200" />
          </div>
          <span className="h-5 w-3.5 shrink-0 bg-slate-300" />
        </div>
        <span className="mt-1 block h-1 w-full rounded-full" style={{ backgroundColor: accent }} />
        <span className="mt-0.5 block h-0.5 w-5/6 rounded-full bg-slate-200" />
        <span className="mt-1 block h-1 w-full rounded-full" style={{ backgroundColor: accent }} />
        <span className="mt-0.5 block h-0.5 w-4/5 rounded-full bg-slate-200" />
      </div>
    )
  }

  if (id === 'fresh') {
    return (
      <div className="flex h-full w-full flex-col bg-white">
        <div className="flex items-center justify-between px-1.5 py-1.5">
          <span className="space-y-0.5">
            <span className="block h-1 w-8 rounded-full bg-slate-400" />
            <span className="block h-0.5 w-5 rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="h-3 w-3 rounded-full bg-slate-300" />
        </div>
        <div className="flex flex-1">
          <div className="flex-1 space-y-1 p-1.5">
            <span className="block h-0.5 w-1/4 rounded-full" style={{ backgroundColor: accent }} />
            <span className="block h-0.5 w-full rounded-full bg-slate-200" />
            <span className="block h-0.5 w-5/6 rounded-full bg-slate-200" />
            <span className="block h-0.5 w-1/4 rounded-full" style={{ backgroundColor: accent }} />
            <span className="block h-0.5 w-full rounded-full bg-slate-200" />
          </div>
          <div className="w-[30%] space-y-1 bg-slate-100 p-1.5">
            <span className="block h-0.5 w-full rounded-full bg-slate-300" />
            <span className="block h-0.5 w-4/5 rounded-full bg-slate-300" />
            <span className="mt-1 block h-0.5 w-full rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
    )
  }

  // classic：左侧栏 + 右侧主内容
  return (
    <div className="flex h-full w-full bg-white">
      <div className="flex w-[34%] flex-col items-center gap-1 bg-slate-100 px-1 py-1.5">
        <span className="h-3 w-3 rounded-full bg-slate-300" />
        <span className="block h-0.5 w-4/5 rounded-full bg-slate-300" />
        <span className="mt-1 block h-0.5 w-full rounded-full" style={{ backgroundColor: accent }} />
        <span className="block h-0.5 w-full rounded-full bg-slate-300" />
        <span className="block h-0.5 w-3/5 rounded-full bg-slate-300" />
      </div>
      <div className="flex-1 space-y-1 p-1.5">
        <span className="block h-1 w-1/2 rounded-full bg-slate-400" />
        <span className="mt-1 block h-0.5 w-1/3 rounded-full" style={{ backgroundColor: accent }} />
        <span className="block h-0.5 w-full rounded-full bg-slate-200" />
        <span className="block h-0.5 w-5/6 rounded-full bg-slate-200" />
        <span className="mt-1 block h-0.5 w-1/3 rounded-full" style={{ backgroundColor: accent }} />
        <span className="block h-0.5 w-full rounded-full bg-slate-200" />
      </div>
    </div>
  )
}

export default function TemplateSelector() {
  const templateId = useResumeStore((s) => s.data.meta.templateId)
  const accent = useResumeStore((s) => s.data.meta.accentColor)
  const setTemplate = useResumeStore((s) => s.setTemplate)

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-ink">简历模板</h3>

      {/* auto-fill：编辑区拖窄时自动降到 2–3 列，拖宽时 4–5 列，7 张卡不出现孤行 */}
      <div
        className="grid gap-2.5"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(116px, 1fr))' }}
      >
        {TEMPLATE_IDS.map((id) => {
          const tpl = TEMPLATES[id]
          const active = templateId === id

          return (
            <button
              key={id}
              onClick={() => setTemplate(id)}
              title={`${tpl.name} — ${tpl.description}`}
              aria-pressed={active}
              className={`group overflow-hidden rounded-sm border-2 bg-surface text-left transition-all duration-[var(--duration-base)] ease-[var(--ease-standard)]
                hover:-translate-y-0.5 hover:shadow-e2
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1
                ${active ? 'border-brand shadow-e1' : 'border-outline hover:border-outline-strong'}`}
            >
              {/* 缩略图 */}
              <div className="relative h-[96px] w-full overflow-hidden border-b border-outline bg-white">
                <Thumbnail id={id} accent={accent} />
                {active && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white shadow-e1">
                    <IconCheck size={13} />
                  </span>
                )}
              </div>

              <div className="px-2 py-1.5">
                <p className={`text-[13px] font-medium ${active ? 'text-brand' : 'text-ink'}`}>
                  {tpl.name}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <p className="mt-2 text-xs leading-relaxed text-ink-3">
        {getTemplate(templateId).description}
      </p>
    </div>
  )
}
