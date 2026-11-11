import { CircleCheck, CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

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
      className={`notice notice-${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon size={20} aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
