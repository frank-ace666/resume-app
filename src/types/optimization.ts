export type IssueSeverity = 'critical' | 'warning' | 'info'
export type IssueCategory = 'completeness' | 'format' | 'quality' | 'consistency'
export type SectionKey =
  | 'personalInfo'
  | 'education'
  | 'workExperience'
  | 'skills'
  | 'projects'
  | 'summary'

export interface ResumeIssue {
  id: string
  severity: IssueSeverity
  category: IssueCategory
  section: SectionKey
  field: string
  title: string
  description: string
  suggestion: string
  currentValue?: string
}

export interface CheckSummary {
  totalIssues: number
  critical: number
  warning: number
  info: number
  score: number
}

export interface ResumeCheckResult {
  summary: CheckSummary
  issues: ResumeIssue[]
  checkedAt: string
}
