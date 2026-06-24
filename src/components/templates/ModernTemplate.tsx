import type { ResumeData } from '@/types/resume'

export default function ModernTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, education, workExperience, skills, projects, summary } = data

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white font-sans text-slate-800">
      {/* 顶部色块卡片 */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6">
        <div className="flex items-center gap-5">
          {personalInfo.avatar && (
            <img
              src={personalInfo.avatar}
              alt=""
              className="w-16 h-16 rounded-full border-2 border-white object-cover shrink-0"
            />
          )}
          <div>
            <h1 className="text-xl font-bold">{personalInfo.fullName || '你的姓名'}</h1>
            <p className="text-sm text-blue-100 mt-0.5">{personalInfo.title}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-100 mt-2">
              {personalInfo.email && <span>📧 {personalInfo.email}</span>}
              {personalInfo.phone && <span>📱 {personalInfo.phone}</span>}
              {personalInfo.location && <span>📍 {personalInfo.location}</span>}
              {personalInfo.github && <span>💻 {personalInfo.github}</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-5 space-y-5">
        {/* 自我评价 */}
        {summary && (
          <section>
            <h2 className="text-sm font-bold text-blue-700 border-l-4 border-blue-500 pl-2 mb-2">
              关于我
            </h2>
            <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line">{summary}</p>
          </section>
        )}

        {/* 工作经历 */}
        {workExperience.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-blue-700 border-l-4 border-blue-500 pl-2 mb-3">
              工作经历
            </h2>
            <div className="space-y-4">
              {workExperience.map((work) => (
                <div key={work.id} className="relative pl-4 border-l-2 border-blue-200">
                  <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                    <h3 className="text-xs font-semibold">{work.company}</h3>
                    <span className="text-xs text-slate-400">
                      {work.startDate} – {work.isCurrent ? '至今' : work.endDate}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 font-medium">{work.position}</p>
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
            </div>
          </section>
        )}

        {/* 教育经历 */}
        {education.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-blue-700 border-l-4 border-blue-500 pl-2 mb-2">
              教育经历
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline flex-wrap gap-x-2">
                  <div>
                    <span className="text-xs font-semibold">{edu.school}</span>
                    <span className="text-xs text-slate-500 ml-2">
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
          <section>
            <h2 className="text-sm font-bold text-blue-700 border-l-4 border-blue-500 pl-2 mb-2">
              技能特长
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                >
                  {skill.name}
                  <span className="text-blue-400">
                    ·{' '}
                    {{ beginner: '入门', intermediate: '熟练', advanced: '精通', expert: '专家' }[
                      skill.level
                    ]}
                  </span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 项目经历 */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-blue-700 border-l-4 border-blue-500 pl-2 mb-3">
              项目经历
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                    <h3 className="text-xs font-semibold">{proj.name}</h3>
                    <span className="text-xs text-slate-400">
                      {proj.startDate}{proj.endDate ? ` – ${proj.endDate}` : ''}
                    </span>
                  </div>
                  {proj.role && <p className="text-xs text-blue-600">{proj.role}</p>}
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
                              className="text-xs px-1.5 py-0.5 bg-slate-100 rounded text-slate-500"
                            >
                              {tech}
                            </span>
                          )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
