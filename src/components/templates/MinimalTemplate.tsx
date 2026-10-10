import { Fragment } from 'react'
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
 * 简约：纯单栏，最 ATS 友好的一版。
 * 无侧栏、无图标、无进度条，强调色只出现在姓名下的一条细线上。
 */
export default function MinimalTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, education, workExperience, skills, projects, summary } = data
  const accent = getAccentColors(data)
  const contacts = contactItems(data)
  const skillGroups = groupSkills(skills)

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2
      className={`${TYPE.sectionTitle} mb-3 uppercase tracking-[0.18em]`}
      style={{ color: PRINT.muted }}
    >
      {children}
    </h2>
  )

  return (
    <div
      className="min-h-[297mm] w-[210mm] bg-white px-[22mm] py-[20mm] font-sans"
      style={{ color: PRINT.body }}
    >
      {/* 头部 */}
      <header className="mb-8">
        <h1 className="text-[30px] font-light leading-tight tracking-wide" style={{ color: PRINT.strong }}>
          {personalInfo.fullName || '你的姓名'}
        </h1>

        {personalInfo.title && (
          <p className={`${TYPE.jobTitle} mt-1.5`} style={{ color: PRINT.muted }}>
            {personalInfo.title}
          </p>
        )}

        {/* 强调色细线：全篇唯一的彩色元素 */}
        <div className="mt-4 h-px w-10" style={{ backgroundColor: accent.raw }} />

        {contacts.length > 0 && (
          <p className={`${TYPE.contact} mt-4`} style={{ color: PRINT.faint }}>
            {contacts.join('  ·  ')}
          </p>
        )}
      </header>

      <div className="space-y-8">
        {/* 工作经历 */}
        {workExperience.some((w) => w.company?.trim()) && (
          <section>
            <SectionTitle>经历</SectionTitle>
            <div className="space-y-5">
              {workExperience.map((work) => {
                const points = nonEmpty(work.achievements)
                if (!work.company?.trim()) return null
                return (
                  <div key={work.id} className="break-inside-avoid">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h3 className={TYPE.entryTitle} style={{ color: PRINT.strong }}>
                        {work.company}
                        {work.position && (
                          <span className="ml-2 font-normal" style={{ color: PRINT.muted }}>
                            {work.position}
                          </span>
                        )}
                      </h3>
                      <span className={`${TYPE.meta} shrink-0`} style={{ color: PRINT.faint }}>
                        {formatRange(work.startDate, work.endDate, work.isCurrent)}
                      </span>
                    </div>

                    {work.location && (
                      <p className={`${TYPE.meta} mt-0.5`} style={{ color: PRINT.faint }}>
                        {work.location}
                      </p>
                    )}

                    {work.description?.trim() && (
                      <p className={`${TYPE.body} mt-1.5`} style={{ color: PRINT.body }}>
                        {work.description}
                      </p>
                    )}

                    {points.length > 0 && (
                      <ul className="mt-1 space-y-1">
                        {points.map((p, i) => (
                          <li key={i} className={`${TYPE.body} flex gap-2.5`} style={{ color: PRINT.body }}>
                            <span className="select-none" style={{ color: PRINT.line }}>
                              —
                            </span>
                            <span className="flex-1">{p}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 项目经历 */}
        {projects.some((p) => p.name?.trim()) && (
          <section>
            <SectionTitle>项目</SectionTitle>
            <div className="space-y-5">
              {projects.map((proj) => {
                const points = nonEmpty(proj.highlights)
                const tech = nonEmpty(proj.technologies)
                if (!proj.name?.trim()) return null
                return (
                  <div key={proj.id} className="break-inside-avoid">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
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
                      <p className={`${TYPE.body} mt-1.5`} style={{ color: PRINT.body }}>
                        {proj.description}
                      </p>
                    )}

                    {points.length > 0 && (
                      <ul className="mt-1 space-y-1">
                        {points.map((p, i) => (
                          <li key={i} className={`${TYPE.body} flex gap-2.5`} style={{ color: PRINT.body }}>
                            <span className="select-none" style={{ color: PRINT.line }}>
                              —
                            </span>
                            <span className="flex-1">{p}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {tech.length > 0 && (
                      <p className={`${TYPE.meta} mt-1.5`} style={{ color: PRINT.faint }}>
                        {tech.join('  ·  ')}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 教育经历 */}
        {education.some((e) => e.school?.trim()) && (
          <section>
            <SectionTitle>教育</SectionTitle>
            <div className="space-y-3">
              {education.map((edu) => {
                if (!edu.school?.trim()) return null
                const detail = [edu.degree, edu.major].filter(Boolean).join(' · ')
                return (
                  <div
                    key={edu.id}
                    className="break-inside-avoid flex flex-wrap items-baseline justify-between gap-x-4"
                  >
                    <div>
                      <h3 className={TYPE.entryTitle} style={{ color: PRINT.strong }}>
                        {edu.school}
                        {detail && (
                          <span className="ml-2 font-normal" style={{ color: PRINT.muted }}>
                            {detail}
                          </span>
                        )}
                      </h3>
                      {edu.description?.trim() && (
                        <p className={`${TYPE.body} mt-1`} style={{ color: PRINT.body }}>
                          {edu.description}
                        </p>
                      )}
                    </div>
                    <span className={`${TYPE.meta} shrink-0`} style={{ color: PRINT.faint }}>
                      {formatRange(edu.startDate, edu.endDate)}
                      {edu.gpa ? `  ·  GPA ${edu.gpa}` : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 技能：auto 宽度网格列，分类名再长也不会被硬折行 */}
        {skillGroups.length > 0 && (
          <section>
            <SectionTitle>技能</SectionTitle>
            <div className="grid gap-x-4 gap-y-1.5" style={{ gridTemplateColumns: 'auto 1fr' }}>
              {skillGroups.map((group) => (
                <Fragment key={group.category}>
                  <span
                    className={TYPE.body}
                    style={{ color: PRINT.faint, maxWidth: '26mm', overflowWrap: 'anywhere' }}
                  >
                    {group.category}
                  </span>
                  <p className={TYPE.body} style={{ color: PRINT.body }}>
                    {group.items
                      .map((s) => `${s.name}（${SKILL_LEVEL_LABEL[s.level] ?? s.level}）`)
                      .join('、')}
                  </p>
                </Fragment>
              ))}
            </div>
          </section>
        )}

        {/* 自我评价 */}
        {summary?.trim() && (
          <section className="break-inside-avoid">
            <SectionTitle>关于我</SectionTitle>
            <p className={`${TYPE.body} whitespace-pre-line`} style={{ color: PRINT.body }}>
              {summary}
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
