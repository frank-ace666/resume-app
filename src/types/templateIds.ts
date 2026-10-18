/**
 * 模板 ID 的单一事实来源。
 *
 * 刻意不 import 任何模块：`types/resume.ts` 需要在 normalize 时做白名单校验，
 * 而 `templateRegistry.ts` 要 import 所有模板组件（组件又 import resume 类型）。
 * 若把常量放进 registry，会形成「resume → registry → 组件 → resume」的循环。
 */
export const TEMPLATE_IDS = [
  'classic',
  'modern',
  'minimal',
  'steady',
  'elegant',
  'compact',
  'fresh'
] as const

export type TemplateId = (typeof TEMPLATE_IDS)[number]

/** 校验任意值（旧存档、手改 JSON）是否为合法模板 ID */
export function isTemplateId(value: unknown): value is TemplateId {
  return typeof value === 'string' && (TEMPLATE_IDS as readonly string[]).includes(value)
}
