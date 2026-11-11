import { useRef, useState } from 'react'
import { ApiError, errorMessage } from '../services/api/request'
import { useLanguage } from '../lib/i18n/language-context'

export function useSubmission() {
  const { t } = useLanguage()
  const active = useRef(false)
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<unknown>(null)
  async function submit(action: () => Promise<void>) {
    if (active.current) return
    active.current = true
    setPending(true)
    setFailure(null)
    try {
      await action()
    } catch (error) {
      setFailure(error)
    } finally {
      active.current = false
      setPending(false)
    }
  }
  const error = failure ? t(errorMessage(failure)) : ''
  const fieldErrors: Record<string, string> =
    failure instanceof ApiError && failure.field
      ? { [failure.field]: error }
      : {}
  return { pending, error, fieldErrors, submit }
}
