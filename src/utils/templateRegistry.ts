import type { TemplateDefinition } from '@/types/template'
import type { TemplateId } from '@/types/templateIds'
import ClassicTemplate from '@/components/templates/ClassicTemplate'
import ModernTemplate from '@/components/templates/ModernTemplate'
import MinimalTemplate from '@/components/templates/MinimalTemplate'
import SteadyTemplate from '@/components/templates/SteadyTemplate'
import ElegantTemplate from '@/components/templates/ElegantTemplate'
import CompactTemplate from '@/components/templates/CompactTemplate'
import FreshTemplate from '@/components/templates/FreshTemplate'

/**
 * 模板清单。键类型是 `TemplateId`，少注册一个 id 会直接类型报错，
 * 不会等到用户点击时才发现空白。
 */
export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
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
    description: '单栏极简设计，注重留白和排版，最 ATS 友好',
    component: MinimalTemplate
  },
  steady: {
    id: 'steady',
    name: '稳重',
    description: '深色侧栏搭配白色主栏，适合国企、金融等正式岗位',
    component: SteadyTemplate
  },
  elegant: {
    id: 'elegant',
    name: '雅致',
    description: '居中标题与中英双语分区，单栏排版，阅读节奏舒缓',
    component: ElegantTemplate
  },
  compact: {
    id: 'compact',
    name: '紧凑',
    description: '信息密度最高的单页版式，色块分区标题，适合经历较多时压缩篇幅',
    component: CompactTemplate
  },
  fresh: {
    id: 'fresh',
    name: '清新',
    description: '全宽头部与右侧浅色信息栏，版式轻盈，适合互联网与设计岗位',
    component: FreshTemplate
  }
}

export function getTemplate(id: string): TemplateDefinition {
  return TEMPLATES[id as TemplateId] || TEMPLATES.classic
}
