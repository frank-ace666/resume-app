import { Fragment } from 'react'
import type { ResumeData } from '@/types/resume'
import { buildResumeModel } from './model'
import { TYPE, PRINT } from './shared'

/**
 * 简约：纯单栏，最 ATS 友好的一版。
 * 无侧栏、无图标、无进度条，强调色只出现在姓名下的一条细线上。
 */
export default function MinimalTemplate({ data }: { data: ResumeData }) {
  const m = buildResumeModel(data)

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2
      className={`${TYPE.sectionTitle} mb-3 uppercase tracking-[0.18em]`}
      style={{ color: PRINT.muted }}
    >
      {children}
    </h2>
  )

  /** 破折号引导的要点列表 —— 本模板统一的列表形态 */
  const DashList = ({ items }: { items: string[] }) => (
    <ul className="mt-1 space-y-1">
      {items.map((t, i) => (
        <li key={i} className={`${TYPE.body} flex gap-2.5`} style={{ color: PRINT.body }}>
          <span className="select-none" style={{ color: PRINT.line }}>
            —
          </span>
          <span className="flex-1">{t}</span>
        </li>
      ))}
    </ul>
  )

  const EntryHead = ({
    title,
    subtitle,
    range
  }: {
    title: string
    subtitle?: string
    range?: string
  }) => (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
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
    <div
      className="min-h-[297mm] w-[210mm] bg-white px-[22mm] py-[20mm] font-sans"
      style={{ color: PRINT.body }}
    >
      <header className="mb-8">
        <h1
          className="text-[30px] font-light leading-tight tracking-wide"
          style={{ color: PRINT.strong }}
        >
          {m.name}
        </h1>

        {m.jobTitle && (
          <p className={`${TYPE.jobTitle} mt-1.5`} style={{ color: PRINT.muted }}>
            {m.jobTitle}
          </p>
        )}

        {/* 全篇唯一的彩色元素 */}
        <div className="mt-4 h-px w-10" style={{ backgroundColor: m.accent.raw }} />

        {m.contacts.length > 0 && (
          <p className={`${TYPE.contact} mt-4`} style={{ color: PRINT.faint }}>
            {m.contacts.join('  ·  ')}
          </p>
        )}
      </header>

      <div className="space-y-8">
        {m.work.length > 0 && (
          <section>
            <SectionTitle>经历</SectionTitle>
            <div className="space-y-5">
              {m.work.map((w) => (
                <div key={w.id} className="break-inside-avoid">
                  <EntryHead title={w.company} subtitle={w.position} range={w.range} />
                  {w.location && (
                    <p className={`${TYPE.meta} mt-0.5`} style={{ color: PRINT.faint }}>
                      {w.location}
                    </p>
                  )}
                  {w.description && (
                    <p className={`${TYPE.body} mt-1.5`} style={{ color: PRINT.body }}>
                      {w.description}
                    </p>
                  )}
                  {w.bullets.length > 0 && <DashList items={w.bullets} />}
                </div>
              ))}
            </div>
          </section>
        )}

        {m.projects.length > 0 && (
          <section>
            <SectionTitle>项目</SectionTitle>
            <div className="space-y-5">
              {m.projects.map((p) => (
                <div key={p.id} className="break-inside-avoid">
                  <EntryHead title={p.name} subtitle={p.role} range={p.range} />
                  {p.link && (
                    <p className={`${TYPE.meta} mt-0.5 break-all`} style={{ color: PRINT.faint }}>
                      {p.link}
                    </p>
                  )}
                  {p.description && (
                    <p className={`${TYPE.body} mt-1.5`} style={{ color: PRINT.body }}>
                      {p.description}
                    </p>
                  )}
                  {p.bullets.length > 0 && <DashList items={p.bullets} />}
                  {p.tech && (
                    <p className={`${TYPE.meta} mt-1.5`} style={{ color: PRINT.faint }}>
                      {p.tech}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {m.education.length > 0 && (
          <section>
            <SectionTitle>教育</SectionTitle>
            <div className="space-y-3">
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
            <SectionTitle>技能</SectionTitle>
            <div className="grid gap-x-4 gap-y-1.5" style={{ gridTemplateColumns: 'auto 1fr' }}>
              {m.skillGroups.map((g) => (
                <Fragment key={g.category}>
                  <span
                    className={TYPE.body}
                    style={{ color: PRINT.faint, maxWidth: '26mm', overflowWrap: 'anywhere' }}
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
            <SectionTitle>关于我</SectionTitle>
            <p className={`${TYPE.body} whitespace-pre-line`} style={{ color: PRINT.body }}>
              {m.summary}
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
