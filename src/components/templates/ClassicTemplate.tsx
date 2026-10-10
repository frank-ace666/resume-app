import type { ResumeData } from '@/types/resume'
import { buildResumeModel } from './model'
import { TYPE, PRINT } from './shared'

/**
 * 经典：左侧栏（姓名 + 联系方式 + 技能）+ 右侧主内容。
 *
 * ATS 提示：两栏布局在部分老旧解析器中会把侧栏内容读串行，
 * 投递国企/银行等保守岗位建议改用「简约」。
 */
export default function ClassicTemplate({ data }: { data: ResumeData }) {
  const m = buildResumeModel(data)

  const MainSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
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

  const SideSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mt-6">
      <h2 className={TYPE.sectionTitle} style={{ color: PRINT.muted }}>
        {title}
      </h2>
      <div className="mt-1.5 h-px w-full" style={{ backgroundColor: PRINT.line }} />
      <div className="mt-2.5">{children}</div>
    </section>
  )

  return (
    <div
      className="flex min-h-[297mm] w-[210mm] items-stretch bg-white font-sans"
      style={{ color: PRINT.body }}
    >
      {/* ===== 左侧栏：始终渲染（不随技能有无而变），避免版式跳变 ===== */}
      <aside className="w-[68mm] shrink-0 px-6 py-7" style={{ backgroundColor: PRINT.sidebar }}>
        <div className="text-center">
          {m.avatar && (
            <img
              src={m.avatar}
              alt=""
              className="mx-auto mb-3 h-[76px] w-[76px] rounded-full object-cover"
              style={{ outline: `2px solid ${PRINT.white}`, outlineOffset: '-2px' }}
            />
          )}
          <h1 className="text-[19px] font-bold leading-tight" style={{ color: PRINT.strong }}>
            {m.name}
          </h1>
          {m.jobTitle && (
            <p className={`${TYPE.jobTitle} mt-1.5`} style={{ color: PRINT.muted }}>
              {m.jobTitle}
            </p>
          )}
        </div>

        {m.contacts.length > 0 && (
          <SideSection title="联系方式">
            <ul className="space-y-1.5">
              {m.contacts.map((c, i) => (
                <li key={i} className={`${TYPE.contact} break-all`} style={{ color: PRINT.body }}>
                  {c}
                </li>
              ))}
            </ul>
          </SideSection>
        )}

        {m.skillGroups.length > 0 && (
          <SideSection title="技能特长">
            <div className="space-y-2.5">
              {m.skillGroups.map((g) => (
                <div key={g.category}>
                  <p className={`${TYPE.meta} mb-1 font-medium`} style={{ color: PRINT.muted }}>
                    {g.category}
                  </p>
                  <ul className="space-y-0.5">
                    {g.items.map((s) => (
                      <li
                        key={s.id}
                        className={`${TYPE.contact} flex items-baseline justify-between gap-2`}
                      >
                        <span style={{ color: PRINT.body }}>{s.name}</span>
                        <span className="shrink-0" style={{ color: PRINT.faint }}>
                          {s.levelLabel}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SideSection>
        )}
      </aside>

      {/* ===== 右侧主内容 ===== */}
      <main className="flex-1 space-y-5 px-7 py-7">
        {m.work.length > 0 && (
          <MainSection title="工作经历">
            <div className="space-y-3.5">
              {m.work.map((w) => (
                <div key={w.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className={TYPE.entryTitle} style={{ color: PRINT.strong }}>
                      {w.company}
                    </h3>
                    <span className={`${TYPE.meta} shrink-0`} style={{ color: PRINT.faint }}>
                      {w.range}
                    </span>
                  </div>
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
          </MainSection>
        )}

        {m.projects.length > 0 && (
          <MainSection title="项目经历">
            <div className="space-y-3.5">
              {m.projects.map((p) => (
                <div key={p.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className={TYPE.entryTitle} style={{ color: PRINT.strong }}>
                      {p.name}
                      {p.role && (
                        <span className="ml-2 font-normal" style={{ color: PRINT.muted }}>
                          {p.role}
                        </span>
                      )}
                    </h3>
                    <span className={`${TYPE.meta} shrink-0`} style={{ color: PRINT.faint }}>
                      {p.range}
                    </span>
                  </div>
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
          </MainSection>
        )}

        {m.education.length > 0 && (
          <MainSection title="教育经历">
            <div className="space-y-2.5">
              {m.education.map((e) => (
                <div key={e.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className={TYPE.entryTitle} style={{ color: PRINT.strong }}>
                      {e.school}
                    </h3>
                    <span className={`${TYPE.meta} shrink-0`} style={{ color: PRINT.faint }}>
                      {e.meta}
                    </span>
                  </div>
                  {e.detail && (
                    <p className={TYPE.entryMeta} style={{ color: PRINT.muted }}>
                      {e.detail}
                    </p>
                  )}
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
