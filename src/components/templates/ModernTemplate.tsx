import { Fragment } from 'react'
import type { ResumeData } from '@/types/resume'
import { buildResumeModel } from './model'
import { TYPE, PRINT, PAGE_PADDING } from './shared'

/** 现代：顶部实心强调色块 + 强调色竖条标题。全篇仅标题与色块使用强调色。 */
export default function ModernTemplate({ data }: { data: ResumeData }) {
  const m = buildResumeModel(data)

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className={`${TYPE.sectionTitle} mb-2.5 flex items-center gap-2`} style={{ color: PRINT.strong }}>
      <span
        className="inline-block h-3.5 w-[3px] rounded-full"
        style={{ backgroundColor: m.accent.text }}
      />
      {children}
    </h2>
  )

  /** 公司 + 职位同行、时间靠右 —— 项目与工作共用这一段排版 */
  const EntryHead = ({
    title,
    subtitle,
    range
  }: {
    title: string
    subtitle?: string
    range?: string
  }) => (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
      <h3 className={TYPE.entryTitle} style={{ color: PRINT.strong }}>
        {title}
        {subtitle && (
          <span className="ml-2 font-normal" style={{ color: PRINT.muted }}>
            {subtitle}
          </span>
        )}
      </h3>
      {range && (
        <span className={`${TYPE.meta} shrink-0`} style={{ color: PRINT.faint }}>
          {range}
        </span>
      )}
    </div>
  )

  return (
    <div className="min-h-[297mm] w-[210mm] bg-white font-sans" style={{ color: PRINT.body }}>
      <header className="px-[16mm] py-7" style={{ backgroundColor: m.accent.text }}>
        <div className="flex items-center gap-5">
          {m.avatar && (
            <img
              src={m.avatar}
              alt=""
              className="h-[68px] w-[68px] shrink-0 rounded-full border-2 object-cover"
              style={{ borderColor: PRINT.onAccentFaint }}
            />
          )}
          <div className="min-w-0">
            <h1 className={TYPE.name} style={{ color: PRINT.white }}>
              {m.name}
            </h1>
            {m.jobTitle && (
              <p className={`${TYPE.jobTitle} mt-1`} style={{ color: PRINT.onAccent }}>
                求职意向：{m.jobTitle}
              </p>
            )}
            {m.contacts.length > 0 && (
              <p className={`${TYPE.contact} mt-2.5`} style={{ color: PRINT.onAccentFaint }}>
                {m.contacts.join('  ·  ')}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-5" style={{ padding: `7mm ${PAGE_PADDING} 12mm` }}>
        {m.work.length > 0 && (
          <section>
            <SectionTitle>工作经历</SectionTitle>
            <div className="space-y-3.5">
              {m.work.map((w) => (
                <div
                  key={w.id}
                  className="break-inside-avoid border-l pl-4"
                  style={{ borderColor: PRINT.lineSoft }}
                >
                  <EntryHead title={w.company} subtitle={w.position} range={w.range} />
                  {w.location && (
                    <p className={`${TYPE.meta} mt-0.5`} style={{ color: PRINT.faint }}>
                      {w.location}
                    </p>
                  )}
                  {w.description && (
                    <p className={`${TYPE.body} mt-1`} style={{ color: PRINT.body }}>
                      {w.description}
                    </p>
                  )}
                  {w.bullets.length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-4" style={{ color: PRINT.body }}>
                      {w.bullets.map((b, i) => (
                        <li key={i} className={TYPE.body}>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {m.projects.length > 0 && (
          <section>
            <SectionTitle>项目经历</SectionTitle>
            <div className="space-y-3.5">
              {m.projects.map((p) => (
                <div key={p.id} className="break-inside-avoid">
                  <EntryHead title={p.name} subtitle={p.role} range={p.range} />
                  {p.link && (
                    <p className={`${TYPE.meta} mt-0.5 break-all`} style={{ color: PRINT.faint }}>
                      {p.link}
                    </p>
                  )}
                  {p.description && (
                    <p className={`${TYPE.body} mt-1`} style={{ color: PRINT.body }}>
                      {p.description}
                    </p>
                  )}
                  {p.bullets.length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-4" style={{ color: PRINT.body }}>
                      {p.bullets.map((b, i) => (
                        <li key={i} className={TYPE.body}>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  {p.tech && (
                    <p className={`${TYPE.meta} mt-1`} style={{ color: PRINT.faint }}>
                      技术栈：{p.tech}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {m.education.length > 0 && (
          <section>
            <SectionTitle>教育经历</SectionTitle>
            <div className="space-y-2.5">
              {m.education.map((e) => (
                <div key={e.id} className="break-inside-avoid">
                  <EntryHead title={e.school} subtitle={e.detail} range={e.meta} />
                  {e.description && (
                    <p className={`${TYPE.body} mt-1`} style={{ color: PRINT.body }}>
                      {e.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {m.skillGroups.length > 0 && (
          <section>
            <SectionTitle>技能特长</SectionTitle>
            <div className="grid gap-x-3 gap-y-1.5" style={{ gridTemplateColumns: 'auto 1fr' }}>
              {m.skillGroups.map((g) => (
                <Fragment key={g.category}>
                  <span
                    className={TYPE.body}
                    style={{ color: PRINT.muted, maxWidth: '26mm', overflowWrap: 'anywhere' }}
                  >
                    {g.category}
                  </span>
                  <p className={TYPE.body} style={{ color: PRINT.body }}>
                    {g.items.map((s) => `${s.name}（${s.levelLabel}）`).join('、')}
                  </p>
                </Fragment>
              ))}
            </div>
          </section>
        )}

        {m.summary && (
          <section className="break-inside-avoid">
            <SectionTitle>自我评价</SectionTitle>
            <p className={`${TYPE.body} whitespace-pre-line`} style={{ color: PRINT.body }}>
              {m.summary}
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
