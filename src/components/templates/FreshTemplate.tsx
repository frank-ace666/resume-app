import type { ResumeData } from '@/types/resume'
import { buildResumeModel } from './model'
import { ContactList, EntryHead } from './blocks'
import { TYPE, PRINT } from './shared'

/**
 * 清新：全宽头部 + 左侧正文 + 右侧浅色信息栏。
 *
 * 与「经典」「稳重」的左侧栏形成镜像，视觉上更轻。信息栏始终渲染，
 * 这样用户添加第一条联系方式时版式不会突然横向跳动。
 */
export default function FreshTemplate({ data }: { data: ResumeData }) {
  const m = buildResumeModel(data)

  const SideSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mt-6 first:mt-0">
      <h2 className={TYPE.sectionTitle} style={{ color: PRINT.muted }}>
        {title}
      </h2>
      <div className="mt-1.5 h-px w-full" style={{ backgroundColor: PRINT.line }} />
      <div className="mt-2.5">{children}</div>
    </section>
  )

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="break-inside-avoid">
      <h2
        className={`${TYPE.sectionTitle} mb-2.5 border-b pb-1`}
        style={{ color: PRINT.strong, borderColor: m.accent.raw }}
      >
        {title}
      </h2>
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
      className="flex min-h-[297mm] w-[210mm] flex-col bg-white font-sans"
      style={{ color: PRINT.body }}
    >
      <header className="flex items-center justify-between gap-6 px-[16mm] pb-5 pt-10">
        <div className="min-w-0">
          <h1
            className="text-[30px] font-bold leading-tight tracking-wide"
            style={{ color: PRINT.strong }}
          >
            {m.name}
          </h1>
          {m.jobTitle && (
            <p className={`${TYPE.jobTitle} mt-1.5`} style={{ color: m.accent.text }}>
              {m.jobTitle}
            </p>
          )}
          <div className="mt-3 h-[3px] w-12" style={{ backgroundColor: m.accent.raw }} />
        </div>
        {m.avatar && (
          <img
            src={m.avatar}
            alt=""
            className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
          />
        )}
      </header>

      <div className="flex flex-1 items-stretch border-t" style={{ borderColor: PRINT.lineSoft }}>
        <main className="flex-1 space-y-5 px-7 py-7">
          {m.work.length > 0 && (
            <Section title="工作经历">
              <div className="space-y-3.5">
                {m.work.map((w) => (
                  <div key={w.id} className="break-inside-avoid">
                    <EntryHead title={w.company} range={w.range} />
                    {w.roleLine && (
                      <p className={TYPE.entryMeta} style={{ color: PRINT.muted }}>
                        {w.roleLine}
                      </p>
                    )}
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
            <Section title="项目经历">
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
            <Section title="教育背景">
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
            </Section>
          )}

          {m.summary && (
            <Section title="自我评价">
              <p className={`${TYPE.body} whitespace-pre-line`} style={{ color: PRINT.body }}>
                {m.summary}
              </p>
            </Section>
          )}
        </main>

        <aside
          className="w-[58mm] shrink-0 px-6 py-7"
          style={{ backgroundColor: PRINT.sidebar }}
        >
          {m.contacts.length > 0 && (
            <SideSection title="联系方式">
              <ContactList
                contacts={m.contacts}
                layout="stacked"
                labelColor={PRINT.muted}
                valueColor={PRINT.body}
              />
            </SideSection>
          )}

          {m.skillGroups.length > 0 && (
            <SideSection title="技能证书">
              <div className="space-y-2.5">
                {m.skillGroups.map((g) => (
                  <div key={g.category}>
                    <p className={`${TYPE.meta} mb-1 font-medium`} style={{ color: PRINT.muted }}>
                      {g.category}
                    </p>
                    <p
                      className="break-words text-[11.5px] leading-relaxed"
                      style={{ color: PRINT.body }}
                    >
                      {g.items.map((s) => s.name).join('、')}
                    </p>
                  </div>
                ))}
              </div>
            </SideSection>
          )}
        </aside>
      </div>
    </div>
  )
}
