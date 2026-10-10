import { useResumeStore } from '@/store/resumeStore'
import { ACCENT_PRESETS } from '@/utils/accents'
import { IconCheck, IconPalette } from '@/components/ui/Icons'

export default function AccentPicker() {
  const accent = useResumeStore((s) => s.data.meta.accentColor)
  const setAccentColor = useResumeStore((s) => s.setAccentColor)

  const isPreset = ACCENT_PRESETS.some(
    (p) => p.value.toLowerCase() === (accent || '').toLowerCase()
  )

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-ink-3">
          <IconPalette size={16} />
        </span>
        <h3 className="text-sm font-medium text-ink">主题色</h3>
        <span className="text-xs text-ink-3">应用到界面与简历标题</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {ACCENT_PRESETS.map((preset) => {
          const active = preset.value.toLowerCase() === (accent || '').toLowerCase()
          return (
            <button
              key={preset.value}
              onClick={() => setAccentColor(preset.value)}
              title={preset.name}
              aria-label={`主题色：${preset.name}`}
              aria-pressed={active}
              style={{ backgroundColor: preset.value }}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-white transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
                hover:scale-110 active:scale-95
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink-3
                ${active ? 'ring-2 ring-offset-2 ring-ink-2' : ''}`}
            >
              {active && <IconCheck size={15} />}
            </button>
          )
        })}

        {/* 自定义颜色 */}
        <label
          title="自定义颜色"
          className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-outline-strong text-ink-3 transition-colors hover:border-ink-3 hover:text-ink-2
            ${!isPreset ? 'ring-2 ring-offset-2 ring-ink-2' : ''}`}
        >
          <input
            type="color"
            value={accent || '#1a73e8'}
            onChange={(e) => setAccentColor(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="自定义主题色"
          />
          {!isPreset ? (
            <span
              className="h-5 w-5 rounded-full"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            />
          ) : (
            <span className="text-sm leading-none">+</span>
          )}
        </label>
      </div>
    </div>
  )
}
