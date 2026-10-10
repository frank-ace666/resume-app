import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes
} from 'react'

/**
 * Material 描边式文本字段，带浮动标签。
 * 这个组件同时偿还了 CHANGELOG 里记录的既有技术债
 * （「表单组件存在大量重复代码，可抽取通用 FormField」）。
 */

interface CommonProps {
  label: string
  hint?: string
  /** 右侧附加内容（如「至今」勾选、单位） */
  addon?: ReactNode
  className?: string
}

const FIELD_BASE = `peer w-full bg-transparent text-sm text-ink
  border rounded-xs transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]
  focus:outline-none
  placeholder:text-ink-3
  disabled:bg-hover disabled:text-ink-3 disabled:cursor-not-allowed`

const LABEL_BASE = `pointer-events-none absolute left-2.5 z-10 bg-surface px-1
  text-ink-3 transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
  peer-focus:text-brand
  top-0 -translate-y-1/2 text-[11px]
  peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm
  peer-placeholder-shown:peer-focus:top-0 peer-placeholder-shown:peer-focus:text-[11px]
  peer-focus:top-0 peer-focus:text-[11px]`

function Shell({
  id,
  label,
  hint,
  addon,
  className,
  children
}: CommonProps & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      <div className="relative">
        {children}
        <label htmlFor={id} className={LABEL_BASE}>
          {label}
        </label>
        {addon && (
          <div className="absolute right-2.5 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1.5">
            {addon}
          </div>
        )}
      </div>
      {hint && <p className="mt-1.5 pl-1 text-xs text-ink-3">{hint}</p>}
    </div>
  )
}

export type TextFieldProps = CommonProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>

export function TextField({ label, hint, addon, className, ...rest }: TextFieldProps) {
  const autoId = useId()
  const id = rest.id || autoId

  return (
    <Shell id={id} label={label} hint={hint} addon={addon} className={className}>
      <input
        {...rest}
        id={id}
        placeholder=" "
        className={`${FIELD_BASE} h-12 px-3.5 ${addon ? 'pr-28' : ''}
          border-outline focus:border-brand focus:ring-1 focus:ring-brand`}
      />
    </Shell>
  )
}

export type TextAreaProps = CommonProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>

export function TextArea({ label, hint, addon, className, ...rest }: TextAreaProps) {
  const autoId = useId()
  const id = rest.id || autoId

  return (
    <Shell id={id} label={label} hint={hint} addon={addon} className={className}>
      <textarea
        {...rest}
        id={id}
        placeholder=" "
        className={`${FIELD_BASE} min-h-[88px] resize-y px-3.5 pb-2.5 pt-4
          border-outline focus:border-brand focus:ring-1 focus:ring-brand`}
      />
    </Shell>
  )
}

export default TextField
