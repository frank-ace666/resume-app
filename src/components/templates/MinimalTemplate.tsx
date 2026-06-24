import type { ResumeData } from '@/types/resume'

export default function MinimalTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, education, workExperience, skills, projects, summary } = data

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white font-sans text-slate-800 px-10 py-10">
      {/* 头部：姓名 + 联系方式 */}
      <header className="mb-8">
        <h1 className="text-2xl font-light tracking-wide">
          {personalInfo.fullName || '你的姓名'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{personalInfo.title}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-slate-400 mt-3">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
          {personalInfo.github && <span>github.com/{personalInfo.github}</span>}
        </div>
      </header>

      {/* 自我评价 */}
      {summary && (
        <section className="mb-8">
          <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line">{summary}</p>
        </section>
      )}

      {/* 工作经历 */}
      {workExperience.length > 0 && (
        <section className="mb-7">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
            经历
          </h2>
          <div className="space-y-5">
            {workExperience.map((work) => (
              <div key={work.id}>
                <div className="flex justify-between items-baseline flex-wrap">
                  <div>
                    <h3 className="text-sm font-medium">{work.company}</h3>
                    <p className="text-xs text-slate-500">{work.position}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {work.startDate} – {work.isCurrent ? '至今' : work.endDate}
                  </span>
                </div>
                {work.description && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{work.description}</p>
                )}
                {work.achievements.length > 0 && work.achievements[0] && (
                  <ul className="mt-1 space-y-0.5">
                    {work.achievements.map(
                      (ach, i) =>
                        ach && (
                          <li key={i} className="text-xs text-slate-600 flex gap-2">
                            <span className="text-slate-300">—</span>
                            {ach}
                          </li>
                        )
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 教育经历 */}
      {education.length > 0 && (
        <section className="mb-7">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
            教育
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline flex-wrap">
                <div>
                  <span className="text-sm font-medium">{edu.school}</span>
                  <span className="text-xs text-slate-500 ml-3">
                    {edu.degree} · {edu.major}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {edu.startDate} – {edu.endDate}
                  {edu.gpa && ` · GPA ${edu.gpa}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 技能 */}
      {skills.length > 0 && (
        <section className="mb-7">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
            技能
          </h2>
          <div className="flex flex-wrap gap-x-0 gap-y-1 text-xs text-slate-600">
            {skills.map((skill, i) => (
              <span key={skill.id}>
                {skill.name}
                <span className="text-slate-400 ml-1">
                  ({{
                    beginner: '入门',
                    intermediate: '熟练',
                    advanced: '精通',
                    expert: '专家'
                  }[skill.level] || skill.level})
                </span>
                {i < skills.length - 1 && <span className="mx-2 text-slate-300">·</span>}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 项目经历 */}
      {projects.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
            项目
          </h2>
          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline flex-wrap">
                  <h3 className="text-sm font-medium">{proj.name}</h3>
                  <span className="text-xs text-slate-400">
                    {proj.startDate}{proj.endDate ? ` – ${proj.endDate}` : ''}
                  </span>
                </div>
                {proj.role && <p className="text-xs text-slate-500">{proj.role}</p>}
                {proj.description && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                )}
                {proj.highlights.length > 0 && proj.highlights[0] && (
                  <ul className="mt-1 space-y-0.5">
                    {proj.highlights.map(
                      (hl, i) =>
                        hl && (
                          <li key={i} className="text-xs text-slate-600 flex gap-2">
                            <span className="text-slate-300">—</span>
                            {hl}
                          </li>
                        )
                    )}
                  </ul>
                )}
                {proj.technologies.length > 0 && proj.technologies[0] && (
                  <p className="text-xs text-slate-400 mt-1">
                    {proj.technologies.filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
