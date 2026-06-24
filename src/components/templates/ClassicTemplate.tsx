import type { ResumeData } from '@/types/resume'

export default function ClassicTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, education, workExperience, skills, projects, summary } = data

  const hasLeftCol = skills.length > 0

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white font-sans text-slate-800">
      <div className="flex min-h-[297mm]">
        {/* 左侧栏 */}
        {hasLeftCol && (
          <aside className="w-[65mm] bg-slate-100 p-5 shrink-0">
            {/* 姓名 + 头像 */}
            <div className="text-center mb-6">
              {personalInfo.avatar && (
                <img
                  src={personalInfo.avatar}
                  alt=""
                  className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                />
              )}
              <h1 className="text-lg font-bold">{personalInfo.fullName || '你的姓名'}</h1>
              <p className="text-xs text-slate-500 mt-1">{personalInfo.title}</p>
            </div>

            {/* 联系方式 */}
            <section className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-300 pb-1 mb-2">
                联系方式
              </h2>
              <div className="text-xs space-y-1 text-slate-600">
                {personalInfo.email && <p>📧 {personalInfo.email}</p>}
                {personalInfo.phone && <p>📱 {personalInfo.phone}</p>}
                {personalInfo.location && <p>📍 {personalInfo.location}</p>}
                {personalInfo.website && <p>🔗 {personalInfo.website}</p>}
                {personalInfo.github && <p>💻 github.com/{personalInfo.github}</p>}
              </div>
            </section>

            {/* 技能 */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-300 pb-1 mb-2">
                技能特长
              </h2>
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span>{skill.name}</span>
                      <span className="text-slate-400">
                        {{ beginner: '入门', intermediate: '熟练', advanced: '精通', expert: '专家' }[
                          skill.level
                        ] || skill.level}
                      </span>
                    </div>
                    <div className="h-1 bg-slate-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width:
                            skill.level === 'expert'
                              ? '100%'
                              : skill.level === 'advanced'
                                ? '75%'
                                : skill.level === 'intermediate'
                                  ? '50%'
                                  : '25%'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        )}

        {/* 右侧主内容 */}
        <main className={`flex-1 p-6 ${!hasLeftCol ? 'max-w-full' : ''}`}>
          {/* 姓名（无侧栏时） */}
          {!hasLeftCol && (
            <header className="mb-5 border-b-2 border-slate-300 pb-3">
              <h1 className="text-xl font-bold">{personalInfo.fullName || '你的姓名'}</h1>
              <p className="text-sm text-slate-500 mt-1">
                {[personalInfo.title, personalInfo.email, personalInfo.phone]
                  .filter(Boolean)
                  .join(' | ')}
              </p>
            </header>
          )}

          {/* 自我评价 */}
          {summary && (
            <section className="mb-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
                个人简介
              </h2>
              <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line">{summary}</p>
            </section>
          )}

          {/* 工作经历 */}
          {workExperience.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
                工作经历
              </h2>
              {workExperience.map((work) => (
                <div key={work.id} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-semibold">{work.company}</h3>
                    <span className="text-xs text-slate-400">
                      {work.startDate} – {work.isCurrent ? '至今' : work.endDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{work.position}</p>
                  {work.description && (
                    <p className="text-xs text-slate-600 mt-1">{work.description}</p>
                  )}
                  {work.achievements.length > 0 && work.achievements[0] && (
                    <ul className="list-disc pl-4 text-xs text-slate-600 mt-1 space-y-0.5">
                      {work.achievements.map(
                        (ach, i) => ach && <li key={i}>{ach}</li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* 教育经历 */}
          {education.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
                教育经历
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-semibold">{edu.school}</h3>
                    <span className="text-xs text-slate-400">
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {edu.degree && `${edu.degree} · `}
                    {edu.major}
                    {edu.gpa && ` · GPA ${edu.gpa}`}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* 项目经历 */}
          {projects.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
                项目经历
              </h2>
              {projects.map((proj) => (
                <div key={proj.id} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-semibold">{proj.name}</h3>
                    <span className="text-xs text-slate-400">
                      {proj.startDate}{proj.endDate ? ` – ${proj.endDate}` : ''}
                    </span>
                  </div>
                  {proj.role && <p className="text-xs text-slate-500">{proj.role}</p>}
                  {proj.description && (
                    <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                  )}
                  {proj.highlights.length > 0 && proj.highlights[0] && (
                    <ul className="list-disc pl-4 text-xs text-slate-600 mt-1 space-y-0.5">
                      {proj.highlights.map(
                        (hl, i) => hl && <li key={i}>{hl}</li>
                      )}
                    </ul>
                  )}
                  {proj.technologies.length > 0 && proj.technologies[0] && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.technologies.map(
                        (tech, i) =>
                          tech && (
                            <span
                              key={i}
                              className="text-xs px-1.5 py-0.5 bg-slate-200 rounded text-slate-600"
                            >
                              {tech}
                            </span>
                          )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
