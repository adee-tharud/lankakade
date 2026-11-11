import { useLanguage } from '../lib/i18n/language-context'
import { Navigate, useLocation } from 'react-router-dom'
import { Notice } from '../components/Notice'
import { isRecord } from '../services/api/request'
import { useAppSelector } from '../app/store'
import { AuthLayout } from '../layouts/AuthLayout'
import { AuthForm, type AuthMode } from '../features/auth/components/AuthForm'
import { EmailAction } from '../features/auth/components/EmailAction'

export function AuthPage({
  mode,
  token,
}: {
  mode: AuthMode | 'reset-password'
  token?: string | null
}) {
  const { t } = useLanguage()

  const location = useLocation()
  const verified =
    mode === 'sign-in' &&
    isRecord(location.state) &&
    location.state.emailVerified === true
  const status = useAppSelector((state) => state.session.status)
  if (
    (mode === 'sign-in' || mode === 'register') &&
    status === 'authenticated' &&
    !verified
  )
    return <Navigate to="/account" replace />
  const emailAction =
    mode === 'reset-password' || (mode === 'verify-email' && Boolean(token))
  return (
    <AuthLayout>
      {verified && (
        <Notice tone="success">
          {t('Adresa de e-mail a fost verificată. Te poți autentifica acum.')}
        </Notice>
      )}
      {emailAction ? (
        <EmailAction
          key={mode}
          mode={mode === 'reset-password' ? 'reset-password' : 'verify-email'}
          token={token ?? null}
        />
      ) : (
        <AuthForm key={mode} mode={mode as AuthMode} />
      )}
    </AuthLayout>
  )
}
