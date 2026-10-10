import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes
} from 'react'
import { errorOf, type FieldCheck } from '@/utils/validators'
import { IconAlert } from './Icons'

/**
 * Material 描边式文本字段，带浮动标签与错误态。
 * 这个组件同时偿还了 CHANGELOG 里记录的既有技术债
 * （「表单组件存在大量重复代码，可抽取通用 FormField」）。
 */

interface CommonProps {
  label: string
  hint?: string
  /** 错误文案。存在时进入 Material 错误态：红色描边 + 红色标签 + 下方错误说明 */
  error?: string
  /** 右侧附加内容（如「至今」勾选、单位） */
  addon?: ReactNode
  className?: string
}

const FIELD_BASE = `peer w-full bg-transparent text-sm text-ink
  rounded-xs transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]
  focus:outline-none focus:ring-1
  placeholder:text-ink-3
  disabled:bg-hover disabled:text-ink-3 disabled:cursor-not-allowed`

const FIELD_TONE_OK = 'border-outline focus:border-brand focus:ring-brand'
const FIELD_TONE_ERROR = 'border-danger focus:border-danger focus:ring-danger'

// 标签的浮动位置与配色分开，避免用类名顺序去压 color（Tailwind 下不可靠）
const LABEL_POS = `pointer-events-none absolute left-2.5 z-10 bg-surface px-1
  transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
  top-0 -translate-y-1/2 text-[11px]
  peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm
  peer-placeholder-shown:peer-focus:top-0 peer-placeholder-shown:peer-focus:text-[11px]
  peer-focus:top-0 peer-focus:text-[11px]`

const LABEL_TONE_OK = 'text-ink-3 peer-focus:text-brand'
const LABEL_TONE_ERROR = 'text-danger peer-focus:text-danger'

function Shell({
  id,
  messageId,
  label,
  hint,
  error,
  addon,
  className,
  children
}: CommonProps & { id: string; messageId: string; children: ReactNode }) {
  return (
    <div className={className}>
      <div className="relative">
        {children}
        <label htmlFor={id} className={`${LABEL_POS} ${error ? LABEL_TONE_ERROR : LABEL_TONE_OK}`}>
          {label}
        </label>
        {addon && (
          <div className="absolute right-2.5 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1.5">
            {addon}
          </div>
        )}
      </div>

      {/* 错误优先于提示文案，二者不同时出现 */}
      {error ? (
        <p
          id={messageId}
          role="alert"
          className="mt-1.5 flex items-start gap-1 pl-1 text-xs leading-snug text-danger"
        >
          <span className="mt-px shrink-0">
            <IconAlert size={13} />
          </span>
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 pl-1 text-xs text-ink-3">{hint}</p>
      )}
    </div>
  )
}

export type TextFieldProps = CommonProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>

export function TextField({ label, hint, error, addon, className, ...rest }: TextFieldProps) {
  const autoId = useId()
  const id = rest.id || autoId
  const messageId = `${id}-msg`

  return (
    <Shell
      id={id}
      messageId={messageId}
      label={label}
      hint={hint}
      error={error}
      addon={addon}
      className={className}
    >
      <input
        {...rest}
        id={id}
        placeholder=" "
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
        className={`${FIELD_BASE} h-12 px-3.5 ${addon ? 'pr-28' : ''}
          ${error ? FIELD_TONE_ERROR : FIELD_TONE_OK}`}
      />
    </Shell>
  )
}

export type TextAreaProps = CommonProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>

export function TextArea({ label, hint, error, addon, className, ...rest }: TextAreaProps) {
  const autoId = useId()
  const id = rest.id || autoId
  const messageId = `${id}-msg`

  return (
    <Shell
      id={id}
      messageId={messageId}
      label={label}
      hint={hint}
      error={error}
      addon={addon}
      className={className}
    >
      <textarea
        {...rest}
        id={id}
        placeholder=" "
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
        className={`${FIELD_BASE} min-h-[88px] resize-y px-3.5 pb-2.5 pt-4
          ${error ? FIELD_TONE_ERROR : FIELD_TONE_OK}`}
      />
    </Shell>
  )
}

/* ============================================================
   自管理校验的字段
   ------------------------------------------------------------
   策略：**失焦后才报错**，报错后随输入实时重算。
   一上来就红一片会让人烦躁；而已经报错却不随修改消失，更烦。
   值本身来自 store，改动即触发重算，所以不需要额外的 effect。
   ============================================================ */

type ValidatedProps = Omit<TextFieldProps, 'error'> & {
  validate: (value: string) => FieldCheck
}

export function ValidatedTextField({ validate, value, onBlur, ...rest }: ValidatedProps) {
  const [touched, setTouched] = useState(false)
  const result = touched ? validate(String(value ?? '')) : null

  return (
    <TextField
      {...rest}
      value={value}
      error={errorOf(result ?? { ok: true })}
      onBlur={(e) => {
        setTouched(true)
        onBlur?.(e)
      }}
    />
  )
}

export default TextField
