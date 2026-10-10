import { useState } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import type { ContactKind, CustomField } from '@/types/resume'
import { CONTACT_KINDS } from '@/types/resume'
import { CONTACT_PRESETS, presetByLabel, inferContactKind } from '@/data/contactPresets'
import { CONTACT_KIND_LABEL, checkContact, errorOf } from '@/utils/validators'
import { TextField, ValidatedTextField } from '@/components/ui/TextField'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { IconPlus, IconTrash } from '@/components/ui/Icons'

/** 联系项上限。不是技术限制，是防止把简历的联系方式栏塞成一页纸 */
const MAX_FIELDS = 8

const uuid = () => crypto.randomUUID()

/**
 * 自定义联系项（QQ、微信、作品集…）。
 *
 * 字段名由用户定，但**类型由模板给出**、校验跟着类型走 ——
 * 若让用户自己选类型，多数人会直接选「文本」，自定义字段就等于没有校验。
 * 预设把常见情况的一次点击成本降到最低。
 */
export default function CustomFieldsEditor() {
  const fields = useResumeStore((s) => s.data.personalInfo.customFields) ?? []
  const update = useResumeStore((s) => s.updatePersonalInfo)
  const [showAllPresets, setShowAllPresets] = useState(false)

  const write = (next: CustomField[]) => update({ customFields: next })

  const addPreset = (presetLabel: string) => {
    if (fields.length >= MAX_FIELDS) return
    const preset = presetByLabel(presetLabel)
    write([
      ...fields,
      {
        id: uuid(),
        label: presetLabel,
        value: '',
        kind: preset?.kind ?? 'text'
      }
    ])
  }

  const addBlank = () => {
    if (fields.length >= MAX_FIELDS) return
    write([...fields, { id: uuid(), label: '', value: '', kind: 'text' }])
  }

  const patch = (id: string, next: Partial<CustomField>) =>
    write(fields.map((f) => (f.id === id ? { ...f, ...next } : f)))

  const remove = (id: string) => write(fields.filter((f) => f.id !== id))

  const used = new Set(fields.map((f) => f.label.trim().toLowerCase()))
  const available = CONTACT_PRESETS.filter((p) => !used.has(p.label.toLowerCase()))
  // 默认只露出前 8 个，其余折叠 —— 一屏铺 16 个芯片会盖过正事
  const shown = showAllPresets ? available : available.slice(0, 8)
  const full = fields.length >= MAX_FIELDS

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-ink">更多联系方式</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-3">
          国内求职常写 QQ、微信；设计和前端岗位常附作品集。点一下即可添加，
          也可以完全自定义名称与类型。
        </p>
      </div>

      {/* 预设 */}
      {!full && available.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {shown.map((p) => (
            <button
              key={p.label}
              onClick={() => addPreset(p.label)}
              title={p.placeholder}
              className="rounded-full border border-outline px-3 py-1 text-xs text-ink-2 transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
                hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft hover:text-brand
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
            >
              + {p.label}
            </button>
          ))}
          {available.length > 8 && (
            <button
              onClick={() => setShowAllPresets((v) => !v)}
              className="rounded-full px-2 py-1 text-xs text-ink-3 transition-colors hover:text-ink-2"
            >
              {showAllPresets ? '收起' : `更多 ${available.length - 8} 个`}
            </button>
          )}
        </div>
      )}

      {full && (
        <p className="text-xs text-ink-3">
          最多 {MAX_FIELDS} 项。联系方式太长会挤占简历正文，建议只留 HR 会看的。
        </p>
      )}

      {/* 已添加的字段 */}
      {fields.length > 0 && (
        <div className="space-y-3">
          {fields.map((f) => {
            const name = f.label.trim() || '这项'
            return (
              <Card key={f.id} className="anim-pop-in space-y-3 p-3">
                <div className="flex items-center gap-2">
                  <span className="flex-1">
                    <ValidatedTextField
                      label="名称"
                      placeholder="如：QQ、微信、作品集"
                      value={f.label}
                      onChange={(e) => {
                        const label = e.target.value
                        // 名称变化时若用户还没手动改过类型，跟着名称自动推断
                        const kind = presetByLabel(label)?.kind ?? inferContactKind(label)
                        patch(f.id, { label, kind })
                      }}
                      validate={(v) => (v.trim() ? { ok: true } : { ok: false, message: '请填写名称' })}
                    />
                  </span>

                  {/* 类型决定校验规则，所以它是可见可改的 */}
                  <div className="relative shrink-0">
                    <select
                      value={f.kind}
                      onChange={(e) => patch(f.id, { kind: e.target.value as ContactKind })}
                      aria-label={`${name}的校验类型`}
                      className="h-12 w-[116px] appearance-none rounded-xs border border-outline bg-transparent px-3 pr-7 text-xs text-ink transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    >
                      {CONTACT_KINDS.map((k) => (
                        <option key={k} value={k}>
                          {CONTACT_KIND_LABEL[k]}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </div>

                  <Button
                    variant="icon"
                    size="sm"
                    title={`删除「${name}」`}
                    aria-label={`删除「${name}」`}
                    className="shrink-0 hover:bg-danger-soft hover:text-danger"
                    onClick={() => remove(f.id)}
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>

                <ValidatedTextField
                  label={f.label.trim() ? `${f.label.trim()} 的内容` : '内容'}
                  placeholder={
                    presetByLabel(f.label)?.placeholder ?? '按所选类型填写'
                  }
                  value={f.value}
                  onChange={(e) => patch(f.id, { value: e.target.value })}
                  validate={(v) => checkContact(f.kind, v, name)}
                />

                {f.kind !== 'text' && !f.value.trim() && (
                  <p className="pl-1 text-[11px] text-ink-3">
                    这一项为空时不会出现在简历上；{CONTACT_KIND_LABEL[f.kind]}类型会做格式校验。
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outlined"
          size="sm"
          icon={<IconPlus size={15} />}
          onClick={addBlank}
          disabled={full}
        >
          自定义字段
        </Button>
        {fields.length > 0 && (
          <span className="self-center text-xs text-ink-3">
            已添加 {fields.length}/{MAX_FIELDS}
          </span>
        )}
      </div>
    </div>
  )
}
