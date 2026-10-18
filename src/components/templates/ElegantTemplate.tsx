import { Fragment } from 'react'
import type { ResumeData } from '@/types/resume'
import { buildResumeModel } from './model'
import { ContactList, EntryHead } from './blocks'
import { TYPE, PRINT } from './shared'

/**
 * 雅致：居中单栏，中英双语分区标题。
 *
 * 参考「极简单页」类模板：姓名与联系方式居中，正文只有一条阅读轴。
 * 英文小字纯装饰，中文标题才是信息本身 —— ATS 读中文部分即可。
 * 单栏结构对机器解析最友好，适合投递国企、银行与一切保守岗位。
 */
export default function ElegantTemplate({ data }: { data: ResumeData }) {
  const m = buildResumeModel(data)

  const Section = ({
    title,
    en,
    children
  }: {
    title: string
    en: string
    children: React.ReactNode
  }) => (
    <section>
      <div className="mb-3 flex items-baseline gap-2">
        <h2
          className="text-[13.5px] font-bold tracking-[0.2em]"
          style={{ color: m.accent.text }}
        >
          {title}
        </h2>
        <span className="text-[9px] tracking-[0.18em]" style={{ color: PRINT.faint }}>
          {en}
        </span>
        <span className="ml-1 h-px flex-1" style={{ backgroundColor: PRINT.lineSoft }} />
      </div>
      {children}
    </section>
  )

  const Bullets = ({ items }: { items: string[] }) => (
    <ul className="mt-1 list-disc space-y-0.5 pl-4" style={{ color: PRINT.body }}>
      {items.map((b, i) => (
        <li key={i} className={TYPE.body}>
          {b}
        </li>
      ))}
    </ul>
  )

  return (
    <div
      className="min-h-[297mm] w-[210mm] bg-white px-[22mm] py-[20mm] font-sans"
      style={{ color: PRINT.body }}
    >
      <header className="mb-8 text-center">
        {m.avatar && (
          <img
            src={m.avatar}
            alt=""
            className="mx-auto mb-4 h-[64px] w-[64px] rounded-full object-cover"
          />
        )}
        <h1
          className="text-[28px] font-semibold leading-tight tracking-[0.12em]"
          style={{ color: PRINT.strong }}
        >
          {m.name}
        </h1>
        {m.jobTitle && (
          <p className={`${TYPE.jobTitle} mt-1.5`} style={{ color: PRINT.muted }}>
            {m.jobTitle}
          </p>
        )}

        {/* 双细线：强调色 + 中性色，比单条粗线更克制 */}
        <div className="mx-auto mt-4 flex w-16 items-center gap-1">
          <span className="h-[2px] flex-1" style={{ backgroundColor: m.accent.raw }} />
          <span className="h-[2px] w-2" style={{ backgroundColor: PRINT.line }} />
          <span className="h-[2px] flex-1" style={{ backgroundColor: m.accent.raw }} />
        </div>

        {m.contacts.length > 0 && (
          <ContactList
            contacts={m.contacts}
            layout="inline"
            labelColor={PRINT.faint}
            valueColor={PRINT.body}
            separatorColor={PRINT.line}
            className="mt-4 text-center"
          />
        )}
      </header>

      <div className="space-y-7">
        {m.work.length > 0 && (
          <Section title="工作经历" en="EXPERIENCE">
            <div className="space-y-4">
              {m.work.map((w) => (
                <div key={w.id} className="break-inside-avoid">
                  <EntryHead title={w.company} subtitle={w.roleLine} range={w.range} />
                  {w.description && (
                    <p className={`${TYPE.body} mt-1`} style={{ color: PRINT.body }}>
                      {w.description}
                    </p>
                  )}
                  {w.bullets.length > 0 && <Bullets items={w.bullets} />}
                </div>
              ))}
            </div>
          </Section>
        )}

        {m.projects.length > 0 && (
          <Section title="项目经历" en="PROJECTS">
            <div className="space-y-4">
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
                  {p.bullets.length > 0 && <Bullets items={p.bullets} />}
                  {p.tech && (
                    <p className={`${TYPE.meta} mt-1`} style={{ color: PRINT.faint }}>
                      技术栈：{p.tech}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {m.education.length > 0 && (
          <Section title="教育背景" en="EDUCATION">
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
          </Section>
        )}

        {m.skillGroups.length > 0 && (
          <Section title="技能证书" en="SKILLS">
            <div className="grid gap-x-4 gap-y-2" style={{ gridTemplateColumns: 'auto 1fr' }}>
              {m.skillGroups.map((g) => (
                <Fragment key={g.category}>
                  <span
                    className="text-[12.5px] leading-snug"
                    style={{ color: PRINT.faint, maxWidth: '30mm', overflowWrap: 'anywhere' }}
                  >
                    {g.category}
                  </span>
                  <p className={TYPE.body} style={{ color: PRINT.body }}>
                    {g.items.map((s) => s.name).join('、')}
                  </p>
                </Fragment>
              ))}
            </div>
          </Section>
        )}

        {m.summary && (
          <Section title="自我评价" en="PROFILE">
            <p className={`${TYPE.body} whitespace-pre-line`} style={{ color: PRINT.body }}>
              {m.summary}
            </p>
          </Section>
        )}
      </div>
    </div>
  )
}
