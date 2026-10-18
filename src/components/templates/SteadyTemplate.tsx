import type { ResumeData } from '@/types/resume'
import { buildResumeModel } from './model'
import { ContactList, EntryHead } from './blocks'
import { TYPE, PRINT } from './shared'

/**
 * 稳重：深色左栏 + 白色主栏。
 *
 * 参考国企/金融类单页简历的常见版式：左栏放姓名、联系方式和技能证书，
 * 右栏按时间放经历。深色侧栏使用固定中性色而不是强调色 ——
 * 用户选的强调色可能是浅色，白字压上去会不可读。
 *
 * ATS 提示：双栏在老旧解析器里可能读串行，投递机器筛选严格的岗位建议用
 * 「雅致」或「简约」。
 */
export default function SteadyTemplate({ data }: { data: ResumeData }) {
  const m = buildResumeModel(data)

  const SideSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mt-6">
      <h2 className="text-[12px] font-bold tracking-[0.12em]" style={{ color: PRINT.onDark }}>
        {title}
      </h2>
      <div className="mt-1.5 h-px w-full" style={{ backgroundColor: PRINT.onDarkFaint }} />
      <div className="mt-2.5">{children}</div>
    </section>
  )

  const MainSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="break-inside-avoid">
      <h2
        className={`${TYPE.sectionTitle} mb-2.5 flex items-center gap-2`}
        style={{ color: PRINT.strong }}
      >
        <span
          className="inline-block h-3.5 w-[3px]"
          style={{ backgroundColor: m.accent.text }}
        />
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
      className="flex min-h-[297mm] w-[210mm] items-stretch bg-white font-sans"
      style={{ color: PRINT.body }}
    >
      {/* ===== 深色侧栏 ===== */}
      <aside className="w-[64mm] shrink-0 px-6 py-8" style={{ backgroundColor: PRINT.darkSidebar }}>
        <div className="text-center">
          {m.avatar && (
            <img
              src={m.avatar}
              alt=""
              className="mx-auto mb-3 h-[76px] w-[76px] rounded-full object-cover"
              style={{ outline: `2px solid ${PRINT.onDarkFaint}`, outlineOffset: '-2px' }}
            />
          )}
          <h1 className="text-[20px] font-bold leading-tight" style={{ color: PRINT.onDark }}>
            {m.name}
          </h1>
          {m.jobTitle && (
            <p className={`${TYPE.jobTitle} mt-1.5`} style={{ color: PRINT.onDarkMuted }}>
              {m.jobTitle}
            </p>
          )}
        </div>

        {m.contacts.length > 0 && (
          <SideSection title="联系方式">
            <ContactList
              contacts={m.contacts}
              layout="stacked"
              labelColor={PRINT.onDarkMuted}
              valueColor={PRINT.onDark}
            />
          </SideSection>
        )}

        {m.skillGroups.length > 0 && (
          <SideSection title="技能证书">
            <div className="space-y-2.5">
              {m.skillGroups.map((g) => (
                <div key={g.category}>
                  <p className={`${TYPE.meta} mb-1 font-medium`} style={{ color: PRINT.onDarkFaint }}>
                    {g.category}
                  </p>
                  <p
                    className="break-words text-[11.5px] leading-relaxed"
                    style={{ color: PRINT.onDark }}
                  >
                    {g.items.map((s) => s.name).join('、')}
                  </p>
                </div>
              ))}
            </div>
          </SideSection>
        )}
      </aside>

      {/* ===== 主内容 ===== */}
      <main className="flex-1 space-y-5 px-7 py-8">
        {m.work.length > 0 && (
          <MainSection title="工作经历">
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
          </MainSection>
        )}

        {m.projects.length > 0 && (
          <MainSection title="项目经历">
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
          </MainSection>
        )}

        {m.education.length > 0 && (
          <MainSection title="教育背景">
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
          </MainSection>
        )}

        {m.summary && (
          <MainSection title="自我评价">
            <p className={`${TYPE.body} whitespace-pre-line`} style={{ color: PRINT.body }}>
              {m.summary}
            </p>
          </MainSection>
        )}
      </main>
    </div>
  )
}
