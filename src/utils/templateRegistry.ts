import type { TemplateDefinition } from '@/types/template'
import ClassicTemplate from '@/components/templates/ClassicTemplate'
import ModernTemplate from '@/components/templates/ModernTemplate'
import MinimalTemplate from '@/components/templates/MinimalTemplate'

export const TEMPLATES: Record<string, TemplateDefinition> = {
  classic: {
    id: 'classic',
    name: '经典',
    description: '传统两栏布局，左侧个人信息，右侧经历详情',
    component: ClassicTemplate
  },
  modern: {
    id: 'modern',
    name: '现代',
    description: '顶部个人概要卡片，下方时间线式经历展示',
    component: ModernTemplate
  },
  minimal: {
    id: 'minimal',
    name: '简约',
    description: '单栏极简设计，注重留白和排版',
    component: MinimalTemplate
  }
}

export function getTemplate(id: string): TemplateDefinition {
  return TEMPLATES[id] || TEMPLATES.classic
}
