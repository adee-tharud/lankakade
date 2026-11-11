import type { MessageKey } from '../../../lib/i18n/messages'
import { useLanguage } from '../../../lib/i18n/language-context'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CircleCheck, KeyRound, MailCheck } from 'lucide-react'
import { FormField } from '../../../components/FormField'
import { Button } from '../../../components/Button'
import { Notice } from '../../../components/Notice'
import { useSubmission } from '../../../hooks/use-submission'
import { authApi } from '../services/auth-api'
import { clearSession } from '../state/session'
import { useAppDispatch } from '../../../app/store'

export function EmailAction({
  mode,
  token: initialToken,
}: {
  mode: 'verify-email' | 'reset-password'
  token: string | null
}) {
  const { t } = useLanguage()

  const [token, setToken] = useState(initialToken)
  const [done, setDone] = useState(false)
  const [validation, setValidation] = useState<MessageKey | ''>('')
  const { submit, pending, error } = useSubmission()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const reset = mode === 'reset-password'

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const password = String(data.get('password') ?? '')
    setValidation('')
    if (reset && password !== data.get('confirmPassword')) {
      setValidation('Parolele nu se potrivesc.')
      return
    }
    if (
      reset &&
      ([...password].length < 8 ||
        new TextEncoder().encode(password).length > 512)
    ) {
      setValidation(
        'Parola trebuie să conțină cel puțin 8 caractere și cel mult 512 octeți.',
      )
      return
    }
    if (!token) return
    void submit(async () => {
      if (reset) {
        await authApi.resetPassword(token, password)
        dispatch(clearSession())
      } else {
        await authApi.verifyEmail(token)
        setToken(null)
        navigate('/sign-in', { replace: true, state: { emailVerified: true } })
        return
      }
      form.reset()
      setToken(null)
      setDone(true)
    })
  }

  if (done)
    return (
      <div className="auth-content">
        <div className="state-icon">
          <CircleCheck size={32} />
        </div>
        <span className="eyebrow">{t('TOTUL ESTE PREGĂTIT')}</span>
        <h1>
          {reset ? t('Parola a fost actualizată.') : t('E-mail confirmat.')}
        </h1>
        <p className="intro">
          {t('Te poți autentifica acum')}{' '}
          {reset ? t('folosind noua parolă') : t('în contul tău Lanka Kade')}.
        </p>
        <Link to="/sign-in" className="button button-primary w-full">
          {t('Mergi la autentificare')}{' '}
        </Link>
      </div>
    )

  if (!token)
    return (
      <div className="auth-content">
        <div className="state-icon">
          <KeyRound size={30} />
        </div>
        <h1>{t('Ai nevoie de un link nou.')}</h1>
        <p className="intro">
          {t(
            'Deschide linkul din e-mail. Dacă a expirat sau ai reîncărcat această pagină, poți solicita altul.',
          )}{' '}
        </p>
        <Link
          className="button button-primary w-full"
          to={reset ? '/forgot-password' : '/verify-email'}
        >
          {t('Solicită un link nou')}{' '}
        </Link>
      </div>
    )

  return (
    <div className="auth-content">
      <div className="state-icon">
        {reset ? <KeyRound size={30} /> : <MailCheck size={30} />}
      </div>
      <span className="eyebrow">{t('CONTUL TĂU LANKA KADE')}</span>
      <h1>{reset ? t('O parolă nouă.') : t('Confirmă adresa de e-mail.')}</h1>
      <p className="intro">
        {reset
          ? t('Alege o parolă sigură pentru contul tău.')
          : t('Un singur pas și te poți conecta la contul tău.')}
      </p>
      {(error || validation) && (
        <Notice>{validation ? t(validation) : error}</Notice>
      )}
      <form onSubmit={onSubmit}>
        <fieldset disabled={pending}>
          {reset && (
            <>
              <FormField
                name="password"
                type="password"
                label={t('Parolă nouă')}
                autoComplete="new-password"
                hint={t('Folosește cel puțin 8 caractere.')}
                required
                maxLength={512}
              />
              <FormField
                name="confirmPassword"
                type="password"
                label={t('Confirmă parola nouă')}
                autoComplete="new-password"
                required
                maxLength={512}
              />
            </>
          )}
          <Button type="submit" pending={pending} className="w-full">
            {reset
              ? t('Salvează parola')
              : pending
                ? t('Se verifică e-mailul…')
                : t('Confirmă e-mailul')}
          </Button>
        </fieldset>
      </form>
      {error && (
        <Link
          className="back-link"
          to={reset ? '/forgot-password' : '/verify-email'}
        >
          {t('Solicită un link nou')}{' '}
        </Link>
      )}
    </div>
  )
}
