import { Fragment } from 'react'
import type { ResumeData } from '@/types/resume'
import {
  TYPE,
  PRINT,
  PAGE_PADDING,
  SKILL_LEVEL_LABEL,
  getAccentColors,
  formatRange,
  groupSkills,
  contactItems,
  nonEmpty
} from './shared'

export default function ModernTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, education, workExperience, skills, projects, summary } = data
  const accent = getAccentColors(data)
  const contacts = contactItems(data)
  const skillGroups = groupSkills(skills)

  /** 分区标题：强调色竖条 + 标题。全篇仅此一处使用强调色。 */
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className={`${TYPE.sectionTitle} mb-2.5 flex items-center gap-2`} style={{ color: PRINT.strong }}>
      <span
        className="inline-block h-3.5 w-[3px] rounded-full"
        style={{ backgroundColor: accent.text }}
      />
      {children}
    </h2>
  )

  return (
    <div className="min-h-[297mm] w-[210mm] bg-white font-sans" style={{ color: PRINT.body }}>
      {/* 顶部：单一实心强调色块（不用渐变、不用多色） */}
      <header className="px-[16mm] py-7" style={{ backgroundColor: accent.text }}>
        <div className="flex items-center gap-5">
          {personalInfo.avatar && (
            <img
              src={personalInfo.avatar}
              alt=""
              className="h-[68px] w-[68px] shrink-0 rounded-full border-2 object-cover"
              style={{ borderColor: PRINT.onAccentFaint }}
            />
          )}
          <div className="min-w-0">
            <h1 className={TYPE.name} style={{ color: PRINT.white }}>
              {personalInfo.fullName || '你的姓名'}
            </h1>
            {personalInfo.title && (
              <p className={`${TYPE.jobTitle} mt-1`} style={{ color: PRINT.onAccent }}>
                求职意向：{personalInfo.title}
              </p>
            )}
            {contacts.length > 0 && (
              <p className={`${TYPE.contact} mt-2.5`} style={{ color: PRINT.onAccentFaint }}>
                {contacts.join('  ·  ')}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-5" style={{ padding: `7mm ${PAGE_PADDING} 12mm` }}>
        {/* 工作经历 */}
        {workExperience.some((w) => w.company?.trim()) && (
          <section>
            <SectionTitle>工作经历</SectionTitle>
            <div className="space-y-3.5">
              {workExperience.map((work) => {
                const points = nonEmpty(work.achievements)
                if (!work.company?.trim()) return null
                return (
                  <div
                    key={work.id}
                    className="break-inside-avoid border-l pl-4"
                    style={{ borderColor: PRINT.lineSoft }}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
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
          </section>
        )}

        {/* 项目经历 */}
        {projects.some((p) => p.name?.trim()) && (
          <section>
            <SectionTitle>项目经历</SectionTitle>
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
          </section>
        )}

        {/* 教育经历 */}
        {education.some((e) => e.school?.trim()) && (
          <section>
            <SectionTitle>教育经历</SectionTitle>
            <div className="space-y-2.5">
              {education.map((edu) => {
                if (!edu.school?.trim()) return null
                const detail = [edu.degree, edu.major].filter(Boolean).join(' · ')
                return (
                  <div key={edu.id} className="break-inside-avoid">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className={TYPE.entryTitle} style={{ color: PRINT.strong }}>
                        {edu.school}
                        {detail && (
                          <span className="ml-2 font-normal" style={{ color: PRINT.muted }}>
                            {detail}
                          </span>
                        )}
                      </h3>
                      <span className={`${TYPE.meta} shrink-0`} style={{ color: PRINT.faint }}>
                        {formatRange(edu.startDate, edu.endDate)}
                        {edu.gpa ? `  ·  GPA ${edu.gpa}` : ''}
                      </span>
                    </div>
                    {edu.description?.trim() && (
                      <p className={`${TYPE.body} mt-1`} style={{ color: PRINT.body }}>
                        {edu.description}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 技能特长：按分类分组，熟练度用文字（不用进度条/星级）
            用 auto 宽度的网格列，分类名再长也不会被硬折行 */}
        {skillGroups.length > 0 && (
          <section>
            <SectionTitle>技能特长</SectionTitle>
            <div className="grid gap-x-3 gap-y-1.5" style={{ gridTemplateColumns: 'auto 1fr' }}>
              {skillGroups.map((group) => (
                <Fragment key={group.category}>
                  <span
                    className={TYPE.body}
                    style={{ color: PRINT.muted, maxWidth: '26mm', overflowWrap: 'anywhere' }}
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

        {/* 自我评价：置于末位 */}
        {summary?.trim() && (
          <section className="break-inside-avoid">
            <SectionTitle>自我评价</SectionTitle>
            <p className={`${TYPE.body} whitespace-pre-line`} style={{ color: PRINT.body }}>
              {summary}
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
