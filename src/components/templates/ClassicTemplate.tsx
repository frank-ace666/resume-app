import type { ResumeData } from '@/types/resume'
import {
  TYPE,
  PRINT,
  SKILL_LEVEL_LABEL,
  getAccentColors,
  formatRange,
  groupSkills,
  contactItems,
  nonEmpty
} from './shared'

/**
 * 经典：左侧栏（姓名 + 联系方式 + 技能）+ 右侧主内容。
 *
 * 注意：侧栏改为「始终渲染」。旧实现把整个侧栏（含姓名与联系方式）
 * 挂在 `skills.length > 0` 上，导致没有技能的简历会丢掉姓名和联系方式，
 * 且版式在填写技能前后突然跳变。
 *
 * ATS 提示：两栏布局在部分老旧解析器中会把侧栏内容读串行，
 * 若投递国企/银行等保守岗位，建议改用「简约」（纯单栏）。
 */
export default function ClassicTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, education, workExperience, skills, projects, summary } = data
  const accent = getAccentColors(data)
  const contacts = contactItems(data)
  const skillGroups = groupSkills(skills)

  const MainSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="break-inside-avoid">
      <h2
        className={`${TYPE.sectionTitle} mb-2.5 border-b pb-1`}
        style={{ color: PRINT.strong, borderColor: accent.raw }}
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
      {/* ===== 左侧栏（始终渲染） ===== */}
      <aside className="w-[68mm] shrink-0 px-6 py-7" style={{ backgroundColor: PRINT.sidebar }}>
        <div className="text-center">
          {personalInfo.avatar && (
            <img
              src={personalInfo.avatar}
              alt=""
              className="mx-auto mb-3 h-[76px] w-[76px] rounded-full object-cover"
              style={{ outline: `2px solid ${PRINT.white}`, outlineOffset: '-2px' }}
            />
          )}
          <h1 className="text-[19px] font-bold leading-tight" style={{ color: PRINT.strong }}>
            {personalInfo.fullName || '你的姓名'}
          </h1>
          {personalInfo.title && (
            <p className={`${TYPE.jobTitle} mt-1.5`} style={{ color: PRINT.muted }}>
              {personalInfo.title}
            </p>
          )}
        </div>

        {/* 联系方式 */}
        {contacts.length > 0 && (
          <SideSection title="联系方式">
            <ul className="space-y-1.5">
              {contacts.map((item, i) => (
                <li key={i} className={`${TYPE.contact} break-all`} style={{ color: PRINT.body }}>
                  {item}
                </li>
              ))}
            </ul>
          </SideSection>
        )}

        {/* 技能：分组 + 文字熟练度（不使用进度条/星级） */}
        {skillGroups.length > 0 && (
          <SideSection title="技能特长">
            <div className="space-y-2.5">
              {skillGroups.map((group) => (
                <div key={group.category}>
                  <p className={`${TYPE.meta} mb-1 font-medium`} style={{ color: PRINT.muted }}>
                    {group.category}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((s) => (
                      <li
                        key={s.id}
                        className={`${TYPE.contact} flex items-baseline justify-between gap-2`}
                      >
                        <span style={{ color: PRINT.body }}>{s.name}</span>
                        <span className="shrink-0" style={{ color: PRINT.faint }}>
                          {SKILL_LEVEL_LABEL[s.level] ?? s.level}
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
        {/* 工作经历 */}
        {workExperience.some((w) => w.company?.trim()) && (
          <MainSection title="工作经历">
            <div className="space-y-3.5">
              {workExperience.map((work) => {
                const points = nonEmpty(work.achievements)
                if (!work.company?.trim()) return null
                return (
                  <div key={work.id} className="break-inside-avoid">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className={TYPE.entryTitle} style={{ color: PRINT.strong }}>
                        {work.company}
                      </h3>
                      <span className={`${TYPE.meta} shrink-0`} style={{ color: PRINT.faint }}>
                        {formatRange(work.startDate, work.endDate, work.isCurrent)}
                      </span>
                    </div>
                    <p className={TYPE.entryMeta} style={{ color: PRINT.muted }}>
                      {[work.position, work.location].filter(Boolean).join(' · ')}
                    </p>
                    {work.description?.trim() && (
                      <p className={`${TYPE.body} mt-1`} style={{ color: PRINT.body }}>
                        {work.description}
                      </p>
                    )}
                    {points.length > 0 && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4" style={{ color: PRINT.body }}>
                        {points.map((p, i) => (
                          <li key={i} className={TYPE.body}>
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </MainSection>
        )}

        {/* 项目经历 */}
        {projects.some((p) => p.name?.trim()) && (
          <MainSection title="项目经历">
            <div className="space-y-3.5">
              {projects.map((proj) => {
                const points = nonEmpty(proj.highlights)
                const tech = nonEmpty(proj.technologies)
                if (!proj.name?.trim()) return null
                return (
                  <div key={proj.id} className="break-inside-avoid">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className={TYPE.entryTitle} style={{ color: PRINT.strong }}>
                        {proj.name}
                        {proj.role && (
                          <span className="ml-2 font-normal" style={{ color: PRINT.muted }}>
                            {proj.role}
                          </span>
                        )}
                      </h3>
                      <span className={`${TYPE.meta} shrink-0`} style={{ color: PRINT.faint }}>
                        {formatRange(proj.startDate, proj.endDate || '')}
                      </span>
                    </div>
                    {proj.link?.trim() && (
                      <p className={`${TYPE.meta} mt-0.5 break-all`} style={{ color: PRINT.faint }}>
                        {proj.link}
                      </p>
                    )}
                    {proj.description?.trim() && (
                      <p className={`${TYPE.body} mt-1`} style={{ color: PRINT.body }}>
                        {proj.description}
                      </p>
                    )}
                    {points.length > 0 && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4" style={{ color: PRINT.body }}>
                        {points.map((p, i) => (
                          <li key={i} className={TYPE.body}>
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                    {tech.length > 0 && (
                      <p className={`${TYPE.meta} mt-1`} style={{ color: PRINT.faint }}>
                        技术栈：{tech.join('、')}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </MainSection>
        )}

        {/* 教育经历 */}
        {education.some((e) => e.school?.trim()) && (
          <MainSection title="教育经历">
            <div className="space-y-2.5">
              {education.map((edu) => {
                if (!edu.school?.trim()) return null
                const detail = [edu.degree, edu.major].filter(Boolean).join(' · ')
                return (
                  <div key={edu.id} className="break-inside-avoid">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className={TYPE.entryTitle} style={{ color: PRINT.strong }}>
                        {edu.school}
                      </h3>
                      <span className={`${TYPE.meta} shrink-0`} style={{ color: PRINT.faint }}>
                        {formatRange(edu.startDate, edu.endDate)}
                        {edu.gpa ? `  ·  GPA ${edu.gpa}` : ''}
                      </span>
                    </div>
                    {detail && (
                      <p className={TYPE.entryMeta} style={{ color: PRINT.muted }}>
                        {detail}
                      </p>
                    )}
                    {edu.description?.trim() && (
                      <p className={`${TYPE.body} mt-1`} style={{ color: PRINT.body }}>
                        {edu.description}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </MainSection>
        )}

        {/* 自我评价 */}
        {summary?.trim() && (
          <MainSection title="自我评价">
            <p className={`${TYPE.body} whitespace-pre-line`} style={{ color: PRINT.body }}>
              {summary}
            </p>
          </MainSection>
        )}
      </main>
    </div>
  )
}
