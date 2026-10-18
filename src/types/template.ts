import type { FC } from 'react'
import type { ResumeData } from './resume'
import type { TemplateId } from './templateIds'

export interface TemplateDefinition {
  id: TemplateId
  name: string // 中文名
  description: string
  component: FC<{ data: ResumeData }>
}
