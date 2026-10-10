import type { ResumeData } from '@/types/resume'
import type { ResumeIssue, ResumeCheckResult, SectionKey } from '@/types/optimization'
import { isEmail, isMobile, isLandline, isUrl, isGithubUsername, normalizeGithub } from './validators'

// ====== 规则类型 ======
type CheckRule = (data: ResumeData) => ResumeIssue | null

let issueCounter = 0
function issueId(): string {
  return `issue-${++issueCounter}`
}

function makeIssue(
  id: string,
  severity: ResumeIssue['severity'],
  category: ResumeIssue['category'],
  section: ResumeIssue['section'],
  field: string,
  title: string,
  description: string,
  suggestion: string,
  currentValue?: string
): ResumeIssue {
  return { id, severity, category, section, field, title, description, suggestion, currentValue }
}

// ====== 1. 完整性检查规则 ======

const completenessRules: CheckRule[] = [
  (data) => {
    if (!data.personalInfo.fullName.trim()) {
      return makeIssue(
        issueId(),
        'critical',
        'completeness',
        'personalInfo',
        'personalInfo.fullName',
        '姓名未填写',
        '简历缺少姓名，HR 无法识别你的身份。',
        '请填写你的全名。'
      )
    }
    return null
  },

  (data) => {
    if (!data.personalInfo.email.trim()) {
      return makeIssue(
        issueId(),
        'critical',
        'completeness',
        'personalInfo',
        'personalInfo.email',
        '邮箱未填写',
        '邮箱是 HR 联系你的主要方式，缺失会严重影响投递效果。',
        '请填写常用邮箱地址。'
      )
    }
    return null
  },

  (data) => {
    if (!data.personalInfo.phone.trim()) {
      return makeIssue(
        issueId(),
        'critical',
        'completeness',
        'personalInfo',
        'personalInfo.phone',
        '电话未填写',
        '电话号码是 HR 快速联系你的重要途径。',
        '请填写手机号码。'
      )
    }
    return null
  },

  (data) => {
    if (!data.personalInfo.title.trim()) {
      return makeIssue(
        issueId(),
        'critical',
        'completeness',
        'personalInfo',
        'personalInfo.title',
        '求职意向未填写',
        '明确的求职意向能让 HR 快速判断你与岗位的匹配度。',
        '请填写期望的职位名称，如"前端开发工程师"。'
      )
    }
    return null
  },

  (data) => {
    if (data.education.length === 0) {
      return makeIssue(
        issueId(),
        'critical',
        'completeness',
        'education',
        'education',
        '教育经历为空',
        '教育背景是简历的基本组成部分。',
        '请添加至少一条教育经历。如果是应届生，教育经历尤为重要。'
      )
    }
    return null
  },

  (data) => {
    if (data.workExperience.length === 0) {
      return makeIssue(
        issueId(),
        'critical',
        'completeness',
        'workExperience',
        'workExperience',
        '工作经历为空',
        '工作/实习经历是 HR 最关注的部分。应届生可以填写实习或项目经历。',
        '请添加你的工作或实习经历。没有工作经验也可以写校园项目或社会实践。'
      )
    }
    return null
  },

  (data) => {
    if (!data.summary.trim()) {
      return makeIssue(
        issueId(),
        'critical',
        'completeness',
        'summary',
        'summary',
        '自我评价未填写',
        '自我评价是简历的开场白，帮助 HR 快速建立对你的印象。',
        '建议写 100-200 字的自我评价，涵盖你的核心优势、职业目标和个人特质。'
      )
    }
    return null
  },

  (data) => {
    if (data.skills.length === 0) {
      return makeIssue(
        issueId(),
        'warning',
        'completeness',
        'skills',
        'skills',
        '技能列表为空',
        '技能标签有助于简历通过 ATS（简历筛选系统）的关键词匹配。',
        '请添加你的专业技能，包括编程语言、框架、工具等。'
      )
    }
    return null
  }
]

// ====== 2. 格式检查规则 ======

// 谓词统一来自 utils/validators.ts —— 表单就地校验与检查报告共用同一套判断，
// 否则两处正则各写一遍，早晚会出现「输入框说没问题、检查报告说有问题」。
// 提示文案仍各自维护：就地校验要短，检查报告要解释清楚为什么、怎么改。

const formatRules: CheckRule[] = [
  (data) => {
    const email = data.personalInfo.email.trim()
    if (email && !isEmail(email)) {
      return makeIssue(
        issueId(),
        'warning',
        'format',
        'personalInfo',
        'personalInfo.email',
        '邮箱格式不正确',
        `当前填写的 "${email}" 不是有效的邮箱格式。`,
        '请填写正确格式的邮箱，如 example@email.com。',
        email
      )
    }
    return null
  },

  (data) => {
    const raw = data.personalInfo.phone.trim()
    // 手机号或带区号的固定电话都算合法，与表单就地校验保持一致
    if (raw && !isMobile(raw) && !isLandline(raw)) {
      return makeIssue(
        issueId(),
        'warning',
        'format',
        'personalInfo',
        'personalInfo.phone',
        '手机号格式可疑',
        `当前填写的 "${data.personalInfo.phone.trim()}" 不是标准的 11 位手机号格式。`,
        '请填写 11 位手机号码，如 13800138000。如果是固定电话请加区号。',
        data.personalInfo.phone.trim()
      )
    }
    return null
  },

  (data) => {
    const website = data.personalInfo.website?.trim()
    if (website && !isUrl(website)) {
      return makeIssue(
        issueId(),
        'info',
        'format',
        'personalInfo',
        'personalInfo.website',
        '个人网站 URL 格式不正确',
        `当前填写的 "${website}" 不是有效的 URL 格式。`,
        '请填写完整 URL，以 https:// 开头。',
        website
      )
    }
    return null
  },

  (data) => {
    const github = data.personalInfo.github?.trim()
    if (github && !isGithubUsername(normalizeGithub(github))) {
      return makeIssue(
        issueId(),
        'info',
        'format',
        'personalInfo',
        'personalInfo.github',
        'GitHub 用户名可能不正确',
        `"${github}" 包含 GitHub 用户名不允许的字符。`,
        'GitHub 用户名只能包含字母、数字、连字符和下划线。',
        github
      )
    }
    return null
  },

  // 教育经历日期检查
  ...(() => {
    const rules: CheckRule[] = []
    return {
      push: (r: CheckRule) => rules.push(r),
      get: () => rules
    }
  })().get(),

  // 工作经历日期检查（动态生成，因为每条经历都需要独立检查）
]

// ====== 3. 表达质量检查规则 ======

const WEAK_VERBS = [
  '负责', '参与', '了解', '熟悉', '协助', '帮忙',
  '知道了', '做过', '弄过', '接触', '搞过'
]

const STRONG_VERB_SUGGESTIONS: Record<string, string> = {
  '负责': '主导、管理、带领',
  '参与': '协作、贡献、推动',
  '了解': '掌握、精通、深入理解',
  '熟悉': '精通、掌握、具备',
  '协助': '支持、配合、推动',
  '帮忙': '支持、协助、推进'
}

const qualityRules: CheckRule[] = [
  // 自我评价长度
  (data) => {
    const len = data.summary.trim().length
    if (len > 0 && len < 50) {
      return makeIssue(
        issueId(),
        'warning',
        'quality',
        'summary',
        'summary',
        '自我评价过短',
        `当前自我评价仅 ${len} 字，过于简短，难以给 HR 留下印象。`,
        '建议扩充到 100-200 字，涵盖核心优势、职业目标和关键成就。',
        `当前 ${len} 字`
      )
    }
    return null
  },

  (data) => {
    const len = data.summary.trim().length
    if (len > 300) {
      return makeIssue(
        issueId(),
        'info',
        'quality',
        'summary',
        'summary',
        '自我评价过长',
        `当前自我评价 ${len} 字，HR 通常只用 6-10 秒扫描简历，过长可能被跳过。`,
        '建议精简到 200 字以内，突出最核心的 2-3 个亮点。',
        `当前 ${len} 字`
      )
    }
    return null
  },

  // 弱动词检测 - 自我评价
  (data) => {
    const found: string[] = []
    for (const verb of WEAK_VERBS) {
      if (data.summary.includes(verb)) {
        found.push(verb)
      }
    }
    if (found.length > 0) {
      const suggestion = found
        .map((v) => `"${v}" → ${STRONG_VERB_SUGGESTIONS[v] || '更具体的动词'}`)
        .join('；')
      return makeIssue(
        issueId(),
        'warning',
        'quality',
        'summary',
        'summary',
        `自我评价中发现 ${found.length} 个弱动词`,
        `检测到弱动词：${found.join('、')}。弱动词让你的描述显得被动、缺少影响力。`,
        `建议改用更有力的表达：${suggestion}。`,
        found.join(', ')
      )
    }
    return null
  },

  // 工作亮点数量检查
  ...([] as CheckRule[])
]

// ====== 4. 一致性检查规则 ======

const consistencyRules: CheckRule[] = [
  // 技能数量过多
  (data) => {
    if (data.skills.length > 20) {
      return makeIssue(
        issueId(),
        'info',
        'consistency',
        'skills',
        'skills',
        '技能数量较多',
        `当前填写了 ${data.skills.length} 项技能。列举过多技能可能让 HR 觉得不够聚焦。`,
        '建议精简到 8-15 个核心技能，根据目标岗位筛选最相关的。',
        `${data.skills.length} 项`
      )
    }
    return null
  }
]

// ====== 动态规则生成 ======

/**
 * 为每条教育经历生成日期检查规则
 */
function educationDateRules(data: ResumeData): ResumeIssue[] {
  const issues: ResumeIssue[] = []
  for (const edu of data.education) {
    if (edu.startDate && edu.endDate && edu.startDate > edu.endDate) {
      issues.push(
        makeIssue(
          issueId(),
          'warning',
          'format',
          'education',
          `education.${edu.id}.dates`,
          `"${edu.school || '未命名学校'}" 的起止时间不合理`,
          `开始时间 ${edu.startDate} 晚于结束时间 ${edu.endDate}。`,
          '请检查并修正教育经历的起止时间。',
          `${edu.startDate} → ${edu.endDate}`
        )
      )
    }
  }
  return issues
}

/**
 * 为每条工作经历生成日期和内容检查规则
 */
function workExperienceRules(data: ResumeData): ResumeIssue[] {
  const issues: ResumeIssue[] = []
  for (const work of data.workExperience) {
    const label = work.company || '未命名公司'

    // 日期检查
    if (!work.isCurrent && work.startDate && work.endDate && work.startDate > work.endDate) {
      issues.push(
        makeIssue(
          issueId(),
          'warning',
          'format',
          'workExperience',
          `workExperience.${work.id}.dates`,
          `"${label}" 的起止时间不合理`,
          `开始时间 ${work.startDate} 晚于结束时间 ${work.endDate}。`,
          '请检查并修正工作经历的起止时间。',
          `${work.startDate} → ${work.endDate}`
        )
      )
    }

    // 亮点数量检查
    const validAchievements = work.achievements.filter((a) => a.trim())
    if (validAchievements.length === 0) {
      issues.push(
        makeIssue(
          issueId(),
          'warning',
          'quality',
          'workExperience',
          `workExperience.${work.id}.achievements`,
          `"${label}" 缺少工作亮点`,
          '没有写工作亮点，HR 无法了解你的具体贡献。',
          '建议每条经历至少写 2 条亮点，用数据量化成果。例如"优化页面加载速度，从 3s 降至 0.8s"。',
          '无亮点'
        )
      )
    } else if (validAchievements.length < 2) {
      issues.push(
        makeIssue(
          issueId(),
          'info',
          'quality',
          'workExperience',
          `workExperience.${work.id}.achievements`,
          `"${label}" 的工作亮点较少`,
          `只有 ${validAchievements.length} 条亮点，建议每条经历至少写 2-3 条。`,
          '补充更多工作成果和数据，让经历更有说服力。',
          `${validAchievements.length} 条`
        )
      )
    }

    // 工作描述是否包含数据
    if (work.description.trim() && !/\d/.test(work.description)) {
      issues.push(
        makeIssue(
          issueId(),
          'info',
          'quality',
          'workExperience',
          `workExperience.${work.id}.description`,
          `"${label}" 的工作描述缺少数据支撑`,
          '当前描述没有包含任何数字或量化指标，显得说服力不足。',
          '尝试加入数据，如"管理 5 人团队""提升效率 30%""服务 200+ 客户"。',
          work.description.substring(0, 50) + '...'
        )
      )
    }

    // 弱动词检测 - 工作亮点
    const weakVerbsInWork: string[] = []
    const allText = work.description + ' ' + work.achievements.join(' ')
    for (const verb of WEAK_VERBS) {
      if (allText.includes(verb)) {
        weakVerbsInWork.push(verb)
      }
    }
    if (weakVerbsInWork.length > 0) {
      issues.push(
        makeIssue(
          issueId(),
          'info',
          'quality',
          'workExperience',
          `workExperience.${work.id}.weakVerbs`,
          `"${label}" 中发现弱动词`,
          `检测到：${weakVerbsInWork.join('、')}。弱动词显得被动，无法突出你的主动性。`,
          '建议换用更有力的动词：主导、实现、优化、设计、搭建、推动、提升、达成。',
          weakVerbsInWork.join(', ')
        )
      )
    }
  }
  return issues
}

/**
 * 为每条项目经历生成检查规则
 */
function projectRules(data: ResumeData): ResumeIssue[] {
  const issues: ResumeIssue[] = []
  for (const proj of data.projects) {
    const label = proj.name || '未命名项目'

    // 日期检查
    if (
      proj.startDate &&
      proj.endDate &&
      proj.startDate > proj.endDate
    ) {
      issues.push(
        makeIssue(
          issueId(),
          'warning',
          'format',
          'projects',
          `projects.${proj.id}.dates`,
          `"${label}" 的起止时间不合理`,
          `开始时间 ${proj.startDate} 晚于结束时间 ${proj.endDate}。`,
          '请检查并修正项目经历的起止时间。',
          `${proj.startDate} → ${proj.endDate}`
        )
      )
    }

    // 亮点检查
    const validHighlights = proj.highlights.filter((h) => h.trim())
    if (validHighlights.length === 0) {
      issues.push(
        makeIssue(
          issueId(),
          'info',
          'quality',
          'projects',
          `projects.${proj.id}.highlights`,
          `"${label}" 缺少项目亮点`,
          '没有填写项目亮点，无法展示你的贡献和成果。',
          '建议补充 2-3 条项目成果，突出技术难点和业务价值。',
          '无亮点'
        )
      )
    }

    // 技术栈检查
    if (proj.technologies.filter((t) => t.trim()).length === 0) {
      issues.push(
        makeIssue(
          issueId(),
          'info',
          'quality',
          'projects',
          `projects.${proj.id}.technologies`,
          `"${label}" 未填写技术栈`,
          '缺少技术栈信息，HR 和技术面试官无法评估技术匹配度。',
          '建议填写项目使用的技术栈，如 React、Node.js、MySQL 等。'
        )
      )
    }
  }
  return issues
}

/**
 * 时间空档检查
 */
function gapCheck(data: ResumeData): ResumeIssue[] {
  const issues: ResumeIssue[] = []
  const allDates: { label: string; start: string; end: string; section: SectionKey }[] = []

  for (const edu of data.education) {
    if (edu.startDate && edu.endDate) {
      allDates.push({ label: edu.school, start: edu.startDate, end: edu.endDate, section: 'education' })
    }
  }
  for (const work of data.workExperience) {
    const end = work.isCurrent ? '' : work.endDate
    if (work.startDate && end) {
      allDates.push({ label: work.company, start: work.startDate, end, section: 'workExperience' })
    }
  }

  if (allDates.length < 2) return issues

  // 按开始时间排序
  allDates.sort((a, b) => a.start.localeCompare(b.start))

  // 检查相邻时间段是否有超过 1 年的空档
  for (let i = 0; i < allDates.length - 1; i++) {
    const prev = allDates[i]
    const next = allDates[i + 1]
    if (prev.end && next.start && prev.end < next.start) {
      const gapMonths = monthDiff(prev.end, next.start)
      if (gapMonths > 12) {
        issues.push(
          makeIssue(
            issueId(),
            'info',
            'consistency',
            prev.section,
            'timeline.gap',
            `时间线上存在 ${Math.round(gapMonths / 12)} 年空档`,
            `"${prev.label}"（${prev.end}）和 "${next.label}"（${next.start}）之间约有 ${Math.round(gapMonths / 12)} 年间隔。`,
            '如果这段时间有进修、旅行或其他经历，建议补充说明。如果没有，也无需担心，HR 会理解。',
            `${prev.end} → ${next.start}（约 ${Math.round(gapMonths / 12)} 年）`
          )
        )
      }
    }
  }

  return issues
}

function monthDiff(d1: string, d2: string): number {
  const [y1, m1] = d1.split('-').map(Number)
  const [y2, m2] = d2.split('-').map(Number)
  return (y2 - y1) * 12 + (m2 - m1)
}

// ====== 主检查函数 ======

export function checkResume(data: ResumeData): ResumeCheckResult {
  // 重置计数器
  issueCounter = 0

  const allIssues: ResumeIssue[] = []

  // 1. 完整性规则
  for (const rule of completenessRules) {
    const issue = rule(data)
    if (issue) allIssues.push(issue)
  }

  // 2. 格式规则
  for (const rule of formatRules) {
    const issue = rule(data)
    if (issue) allIssues.push(issue)
  }

  // 3. 动态规则 - 教育经历
  allIssues.push(...educationDateRules(data))

  // 4. 动态规则 - 工作经历
  allIssues.push(...workExperienceRules(data))

  // 5. 动态规则 - 项目经历
  allIssues.push(...projectRules(data))

  // 6. 表达质量规则
  for (const rule of qualityRules) {
    const issue = rule(data)
    if (issue) allIssues.push(issue)
  }

  // 7. 一致性规则
  for (const rule of consistencyRules) {
    const issue = rule(data)
    if (issue) allIssues.push(issue)
  }

  // 8. 时间空档检查
  allIssues.push(...gapCheck(data))

  // 计算统计
  const critical = allIssues.filter((i) => i.severity === 'critical').length
  const warning = allIssues.filter((i) => i.severity === 'warning').length
  const info = allIssues.filter((i) => i.severity === 'info').length

  // 评分：满分 100，每条 critical -10，每条 warning -3，每条 info -1，最低 0
  const score = Math.max(0, 100 - critical * 10 - warning * 3 - info * 1)

  return {
    summary: {
      totalIssues: allIssues.length,
      critical,
      warning,
      info,
      score
    },
    issues: allIssues,
    checkedAt: new Date().toISOString()
  }
}
