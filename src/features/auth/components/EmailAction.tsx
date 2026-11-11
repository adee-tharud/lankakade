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
      <div className="m-auto w-full max-w-105">
        <div className="w-16.5 h-16.5 grid place-items-center rounded-[18px] bg-brand-soft text-brand mb-6.25">
          <CircleCheck size={32} />
        </div>
        <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
          {t('TOTUL ESTE PREGĂTIT')}
        </span>
        <h1 className="mobile:text-[2rem]">
          {reset ? t('Parola a fost actualizată.') : t('E-mail confirmat.')}
        </h1>
        <p className="mx-0 text-muted text-[0.82rem] mt-3.5 mb-6.25 mobile:mb-5.5">
          {t('Te poți autentifica acum')}{' '}
          {reset ? t('folosind noua parolă') : t('în contul tău Lanka Kade')}.
        </p>
        <Link
          data-slot="button"
          to="/sign-in"
          className="w-full px-5 py-3 gap-2.5 min-h-12 inline-flex items-center justify-center border border-clear rounded-lg text-[0.76rem] font-bold leading-[1.5] transition-colors duration-150 bg-accent text-brand-deep hover:bg-accent-hover"
        >
          {t('Mergi la autentificare')}{' '}
        </Link>
      </div>
    )

  if (!token)
    return (
      <div className="m-auto w-full max-w-105">
        <div className="w-16.5 h-16.5 grid place-items-center rounded-[18px] bg-brand-soft text-brand mb-6.25">
          <KeyRound size={30} />
        </div>
        <h1 className="mobile:text-[2rem]">{t('Ai nevoie de un link nou.')}</h1>
        <p className="mx-0 text-muted text-[0.82rem] mt-3.5 mb-6.25 mobile:mb-5.5">
          {t(
            'Deschide linkul din e-mail. Dacă a expirat sau ai reîncărcat această pagină, poți solicita altul.',
          )}{' '}
        </p>
        <Link
          data-slot="button"
          className="w-full px-5 py-3 gap-2.5 min-h-12 inline-flex items-center justify-center border border-clear rounded-lg text-[0.76rem] font-bold leading-[1.5] transition-colors duration-150 bg-accent text-brand-deep hover:bg-accent-hover"
          to={reset ? '/forgot-password' : '/verify-email'}
        >
          {t('Solicită un link nou')}{' '}
        </Link>
      </div>
    )

  return (
    <div className="m-auto w-full max-w-105">
      <div className="w-16.5 h-16.5 grid place-items-center rounded-[18px] bg-brand-soft text-brand mb-6.25">
        {reset ? <KeyRound size={30} /> : <MailCheck size={30} />}
      </div>
      <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
        {t('CONTUL TĂU LANKA KADE')}
      </span>
      <h1 className="mobile:text-[2rem]">
        {reset ? t('O parolă nouă.') : t('Confirmă adresa de e-mail.')}
      </h1>
      <p className="mx-0 text-muted text-[0.82rem] mt-3.5 mb-6.25 mobile:mb-5.5">
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
          className="gap-2 underline underline-offset-4 text-[0.74rem] flex items-center justify-center mt-6.5"
          to={reset ? '/forgot-password' : '/verify-email'}
        >
          {t('Solicită un link nou')}{' '}
        </Link>
      )}
    </div>
  )
}
