import type { FC } from 'react'
import type { ResumeData } from './resume'

export interface TemplateDefinition {
  id: string
  name: string // 中文名
  description: string
  component: FC<{ data: ResumeData }>
}
