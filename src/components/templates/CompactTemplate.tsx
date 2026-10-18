import type { ResumeData } from '@/types/resume'
import { buildResumeModel } from './model'
import { ContactList, EntryHead } from './blocks'
import { TYPE, PRINT } from './shared'

/**
 * 紧凑：信息密度最高的单栏版式。
 *
 * 参考国内常见的「单页推荐模板」：顶部姓名 + 两列基本信息 + 右侧证件照，
 * 分区标题用强调色实心条。色条上的白字依赖 accent.text 已经压暗到白底 4.5:1，
 * 因此白字对比度同样达标，浅色主题也不会看不清。
 */
export default function CompactTemplate({ data }: { data: ResumeData }) {
  const m = buildResumeModel(data)

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="break-inside-avoid">
      <h2
        className="mb-2 flex h-[22px] items-center px-2.5 text-[12.5px] font-bold tracking-[0.12em]"
        style={{ backgroundColor: m.accent.text, color: PRINT.white }}
      >
        {title}
      </h2>
      {children}
    </section>
  )

  const Bullets = ({ items }: { items: string[] }) => (
    <ul className="mt-0.5 list-disc space-y-0 pl-4" style={{ color: PRINT.body }}>
      {items.map((b, i) => (
        <li key={i} className={TYPE.body}>
          {b}
        </li>
      ))}
    </ul>
  )

  return (
    <div
      className="min-h-[297mm] w-[210mm] bg-white px-[15mm] py-[13mm] font-sans"
      style={{ color: PRINT.body }}
    >
      <header
        className="flex items-start justify-between gap-6 pb-4"
        style={{ borderBottom: `2px solid ${m.accent.raw}` }}
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-bold leading-tight" style={{ color: PRINT.strong }}>
            {m.name}
          </h1>
          {m.jobTitle && (
            <p className={`${TYPE.jobTitle} mt-1`} style={{ color: m.accent.text }}>
              求职意向：{m.jobTitle}
            </p>
          )}
          {m.contacts.length > 0 && (
            <ContactList
              contacts={m.contacts}
              layout="grid"
              labelColor={PRINT.faint}
              valueColor={PRINT.body}
              className="mt-3"
            />
          )}
        </div>

        {m.avatar && (
          <img
            src={m.avatar}
            alt=""
            className="h-[32mm] w-[24mm] shrink-0 object-cover"
            style={{ border: `1px solid ${PRINT.line}` }}
          />
        )}
      </header>

      <div className="mt-4 space-y-3.5">
        {m.work.length > 0 && (
          <Section title="工作经历">
            <div className="space-y-3">
              {m.work.map((w) => (
                <div key={w.id} className="break-inside-avoid">
                  <EntryHead title={w.company} subtitle={w.roleLine} range={w.range} />
                  {w.description && (
                    <p className={`${TYPE.body} mt-0.5`} style={{ color: PRINT.body }}>
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
          <Section title="项目经历">
            <div className="space-y-3">
              {m.projects.map((p) => (
                <div key={p.id} className="break-inside-avoid">
                  <EntryHead title={p.name} subtitle={p.role} range={p.range} />
                  {p.link && (
                    <p className={`${TYPE.meta} mt-0.5 break-all`} style={{ color: PRINT.faint }}>
                      {p.link}
                    </p>
                  )}
                  {p.description && (
                    <p className={`${TYPE.body} mt-0.5`} style={{ color: PRINT.body }}>
                      {p.description}
                    </p>
                  )}
                  {p.bullets.length > 0 && <Bullets items={p.bullets} />}
                  {p.tech && (
                    <p className={`${TYPE.meta} mt-0.5`} style={{ color: PRINT.faint }}>
                      技术栈：{p.tech}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {m.education.length > 0 && (
          <Section title="教育背景">
            <div className="space-y-2">
              {m.education.map((e) => (
                <div key={e.id} className="break-inside-avoid">
                  <EntryHead title={e.school} subtitle={e.detail} range={e.meta} />
                  {e.description && (
                    <p className={`${TYPE.body} mt-0.5`} style={{ color: PRINT.body }}>
                      {e.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {m.skillGroups.length > 0 && (
          <Section title="技能证书">
            <div className="space-y-1">
              {m.skillGroups.map((g) => (
                <p key={g.category} className={`${TYPE.body} break-words`} style={{ color: PRINT.body }}>
                  <span style={{ color: PRINT.muted }}>{g.category}：</span>
                  {g.items.map((s) => s.name).join('、')}
                </p>
              ))}
            </div>
          </Section>
        )}

        {m.summary && (
          <Section title="自我评价">
            <p className={`${TYPE.body} whitespace-pre-line`} style={{ color: PRINT.body }}>
              {m.summary}
            </p>
          </Section>
        )}
      </div>
    </div>
  )
}
