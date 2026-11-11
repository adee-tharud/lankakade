import type { ButtonHTMLAttributes } from 'react'
import { LoaderCircle } from 'lucide-react'

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
      type={type}
      className={`button button-${variant} ${className}`}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    >
      {pending && (
        <LoaderCircle size={18} className="spin" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
