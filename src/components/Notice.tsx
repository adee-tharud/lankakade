import { CircleCheck, CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

const base =
  'mb-5 flex items-start gap-2.25 rounded-lg border p-3.25 text-[0.75rem] leading-[1.6] wrap-anywhere [&_svg]:mt-0.5'
const variants = {
  success: 'border-border bg-success-surface text-success',
  error: 'border-error-border bg-error-surface text-error',
}

export function Notice({
  children,
  tone = 'error',
}: {
  children: ReactNode
  tone?: 'success' | 'error'
}) {
  const Icon = tone === 'success' ? CircleCheck : CircleAlert
  return (
    <div
      data-slot="notice"
      className={`${base} ${variants[tone]}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon size={20} aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
