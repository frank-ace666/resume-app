import { useCallback, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { IconLoader } from './Icons'

type Variant = 'filled' | 'tonal' | 'outlined' | 'text' | 'icon'
/** 只有两档 —— `lg` 曾存在但从未被使用，删掉比留着维护它便宜 */
type Size = 'sm' | 'md'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
}

const VARIANT_CLASS: Record<Variant, string> = {
  filled: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-active shadow-e1',
  tonal: 'bg-brand-soft text-brand hover:bg-brand-soft-hover active:bg-brand-soft-hover',
  outlined: 'border border-outline text-ink-2 bg-surface hover:bg-hover active:bg-hover',
  text: 'text-ink-2 hover:bg-hover active:bg-hover',
  icon: 'text-ink-2 hover:bg-hover active:bg-hover rounded-full'
}

const SIZE_CLASS: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-4 text-sm gap-2'
}

const ICON_SIZE_CLASS: Record<Size, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9'
}

export default function Button({
  variant = 'text',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  onClick,
  ...rest
}: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const id = Date.now() + Math.random()
      setRipples((r) => [
        ...r,
        { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size }
      ])
      window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 600)
      onClick?.(e)
    },
    [onClick]
  )

  const isIcon = variant === 'icon'
  const sizeClass = isIcon ? ICON_SIZE_CLASS[size] : SIZE_CLASS[size]

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium
        transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
        active:scale-[0.97]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1
        disabled:opacity-45 disabled:cursor-not-allowed disabled:active:scale-100
        ${VARIANT_CLASS[variant]} ${sizeClass} ${className}`}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="anim-ripple pointer-events-none absolute rounded-full bg-current opacity-20"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
      {loading ? <IconLoader size={size === 'sm' ? 14 : 16} /> : icon}
      {children}
    </button>
  )
}
