import type { ButtonHTMLAttributes } from 'react'
import { LoaderCircle } from 'lucide-react'

const base =
  'inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg border py-3 text-[0.76rem] leading-[1.5] font-bold transition-colors duration-150'
const variants = {
  primary:
    'border-clear bg-accent px-5 text-brand-deep enabled:hover:bg-accent-hover',
  secondary:
    'border-border bg-surface px-5 text-brand enabled:hover:bg-brand-soft',
  quiet: 'border-clear bg-clear px-2 text-muted enabled:hover:bg-brand-soft',
  danger: 'border-clear bg-error px-5 text-surface',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger'
  pending?: boolean
}
export function Button({
  variant = 'primary',
  pending,
  children,
  disabled,
  type = 'button',
  className = '',
  ...props
}: Props) {
  return (
    <button
      {...props}
      data-slot="button"
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    >
      {pending && (
        <LoaderCircle
          size={18}
          data-slot="spinner"
          className="motion-safe:animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
