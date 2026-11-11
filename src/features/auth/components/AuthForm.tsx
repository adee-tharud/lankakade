import type { MessageKey } from '../../../lib/i18n/messages'
import { useLanguage } from '../../../lib/i18n/language-context'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, MailCheck, ArrowLeft } from 'lucide-react'
import { Button } from '../../../components/Button'
import { FormField } from '../../../components/FormField'
import { Notice } from '../../../components/Notice'
import { useSubmission } from '../../../hooks/use-submission'
import { useAppDispatch } from '../../../app/store'
import { restoreSession } from '../state/session'
import { authApi } from '../services/auth-api'

export type AuthMode =
  | 'sign-in'
  | 'register'
  | 'forgot-password'
  | 'verify-email'
const headings = {
  'sign-in': ['Bine ai revenit.', 'Intră în cont și regăsește-ți preferatele.'],
  register: ['Un loc pentru tine.', 'Creează un cont și simte-te ca acasă.'],
  'forgot-password': [
    'Ai uitat parola?',
    'Se întâmplă. Îți trimitem un link pentru a alege una nouă.',
  ],
  'verify-email': [
    'Verifică-ți e-mailul.',
    'Solicită un link pentru a confirma adresa de e-mail.',
  ],
} as const

export function AuthForm({ mode }: { mode: AuthMode }) {
  const { t } = useLanguage()

  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { pending, error, fieldErrors, submit } = useSubmission()
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [validation, setValidation] = useState<MessageKey | ''>('')
  const [cooldown, setCooldown] = useState(0)
  const registration = mode === 'register'
  const signIn = mode === 'sign-in'
  const hasPassword = registration || signIn

  useEffect(() => {
    if (cooldown === 0) return
    const timer = window.setTimeout(
      () => setCooldown((value) => value - 1),
      1000,
    )
    return () => window.clearTimeout(timer)
  }, [cooldown])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email')).trim()
    const password = String(data.get('password') ?? '')
    setValidation('')
    if (registration && password !== data.get('confirmPassword')) {
      setValidation('Parolele nu se potrivesc.')
      return
    }
    if (
      registration &&
      ([...password].length < 8 ||
        new TextEncoder().encode(password).length > 512)
    ) {
      setValidation(
        'Folosește o parolă de cel puțin 8 caractere și cel mult 512 octeți.',
      )
      return
    }
    void submit(async () => {
      if (signIn) {
        await authApi.login({ email, password })
        form.reset()
        await dispatch(restoreSession()).unwrap()
        const destination: unknown = location.state?.returnTo
        const returnTo =
          typeof destination === 'string' &&
          /^(?:\/(?:shop|cart|products\/[a-z0-9-]+)(?:\?[^#]*)?|\/)$/.test(
            destination,
          )
            ? destination
            : '/account'
        navigate(returnTo, { replace: true })
      } else {
        if (registration)
          await authApi.register({
            email,
            password,
            fullName: String(data.get('fullName')).trim(),
          })
        else if (mode === 'forgot-password') await authApi.forgotPassword(email)
        else await authApi.sendVerification(email)
        form.reset()
        setSentEmail(email)
        setSent(true)
        setCooldown(45)
      }
    })
  }

  if (sent)
    return (
      <div className="m-auto w-full max-w-105">
        <div className="w-16.5 h-16.5 grid place-items-center rounded-[18px] bg-brand-soft text-brand mb-6.25">
          <MailCheck size={30} aria-hidden="true" />
        </div>
        <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
          {t('ÎNCĂ UN PAS')}
        </span>
        <h1 className="mobile:text-[2rem]">
          {t('Verifică-ți căsuța poștală.')}
        </h1>
        <p className="mx-0 text-muted text-[0.82rem] mt-3.5 mb-6.25 mobile:mb-5.5">
          {t('Dacă adresa')} <strong>{sentEmail}</strong>{' '}
          {t('este eligibilă, vei primi un link pentru')}{' '}
          {mode === 'forgot-password'
            ? t('resetarea parolei')
            : t('confirmarea contului')}
          {t('. Verifică și folderul spam.')}{' '}
        </p>
        {error && <Notice>{error}</Notice>}
        <p className="mx-0 my-4.75 text-muted text-[0.7rem]">
          {t('Nu a ajuns e-mailul? Poți solicita un link nou.')}{' '}
        </p>
        <Button
          className="w-full"
          variant="secondary"
          pending={pending}
          disabled={cooldown > 0}
          onClick={() => {
            void submit(async () => {
              if (mode === 'forgot-password')
                await authApi.forgotPassword(sentEmail)
              else await authApi.sendVerification(sentEmail)
              setCooldown(45)
            })
          }}
        >
          {cooldown > 0
            ? t('Solicită din nou în {seconds}s', { seconds: cooldown })
            : t('Trimite din nou linkul')}
        </Button>
        <button
          className="px-0 py-3.5 mx-auto underline underline-offset-4 block text-[0.7rem] bg-clear text-muted border-0"
          onClick={() => {
            setSent(false)
            setCooldown(0)
          }}
        >
          {t('Folosește altă adresă de e-mail')}{' '}
        </button>
        <Link
          className="gap-2 underline underline-offset-4 text-[0.74rem] flex items-center justify-center mt-6.5"
          to="/sign-in"
        >
          <ArrowLeft size={16} aria-hidden="true" />{' '}
          {t('Înapoi la autentificare')}{' '}
        </Link>
      </div>
    )

  return (
    <div className="m-auto w-full max-w-105">
      <div className="flex items-center justify-between mb-4.5 mobile:mb-4">
        <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
          {t('CONTUL TĂU LANKA KADE')}
        </span>
        <span className="text-[22px] text-brand" aria-hidden="true">
          ✳
        </span>
      </div>
      <h1 className="mobile:text-[2rem]">{t(headings[mode][0])}</h1>
      <p className="mx-0 text-muted text-[0.82rem] mt-3.5 mb-6.25 mobile:mb-5.5">
        {t(headings[mode][1])}
      </p>
      {signIn && (
        <div
          className="flex border-b border-border mb-7 text-[0.76rem]"
          aria-label={t('Acces în cont')}
        >
          <span
            className="w-1/2 px-0.5 py-3 text-center text-brand border-b-2 border-brand font-bold"
            aria-current="page"
          >
            {t('Autentificare')}
          </span>
          <Link
            className="w-1/2 px-0.5 py-3 text-center text-muted"
            to="/register"
          >
            {t('Creează cont')}
          </Link>
        </div>
      )}
      {(error || validation) && (
        <Notice>{validation ? t(validation) : error}</Notice>
      )}
      <form onSubmit={onSubmit}>
        <fieldset disabled={pending}>
          {registration && (
            <FormField
              name="fullName"
              label={t('Nume complet')}
              placeholder={t('Numele și prenumele tău')}
              autoComplete="name"
              maxLength={150}
              required
              error={fieldErrors.fullName}
            />
          )}
          <FormField
            name="email"
            label={t('Adresă de e-mail')}
            type="email"
            autoComplete="email"
            placeholder={t('nume@exemplu.ro')}
            maxLength={254}
            required
            error={fieldErrors.email}
          />
          {hasPassword && (
            <FormField
              name="password"
              label={t('Parolă')}
              type="password"
              autoComplete={registration ? 'new-password' : 'current-password'}
              placeholder={
                registration ? t('Alege o parolă sigură') : t('Introdu parola')
              }
              required
              maxLength={512}
              error={fieldErrors.password}
              hint={
                registration ? t('Folosește cel puțin 8 caractere.') : undefined
              }
            />
          )}
          {registration && (
            <FormField
              name="confirmPassword"
              label={t('Confirmă parola')}
              type="password"
              placeholder={t('Repetă parola')}
              autoComplete="new-password"
              required
              maxLength={512}
            />
          )}
          {signIn && (
            <div className="mx-0 text-right -mt-0.75 mb-6 text-[0.7rem] font-semibold">
              <Link
                className="underline underline-offset-4"
                to="/forgot-password"
              >
                {t('Ai uitat parola?')}
              </Link>
            </div>
          )}
          <Button type="submit" className="w-full" pending={pending}>
            {signIn
              ? t('Intră în cont')
              : registration
                ? t('Creează contul')
                : t('Trimite linkul')}
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </fieldset>
      </form>
      {signIn ? (
        <>
          <p className="mt-6 text-[0.74rem] text-center text-muted">
            {t('Ești nou aici?')}{' '}
            <Link
              className="underline underline-offset-4 text-brand font-bold ml-0.75"
              to="/register"
            >
              {t('Creează un cont')}
            </Link>
          </p>
          <Link
            className="underline underline-offset-4 text-[0.66rem] block text-center mt-3.75 text-muted"
            to="/verify-email"
          >
            {t('Nu ai primit linkul de confirmare?')}{' '}
          </Link>
        </>
      ) : (
        <Link
          className="gap-2 underline underline-offset-4 text-[0.74rem] flex items-center justify-center mt-6.5"
          to="/sign-in"
        >
          <ArrowLeft size={16} aria-hidden="true" />{' '}
          {t('Înapoi la autentificare')}{' '}
        </Link>
      )}
      {registration && (
        <p className="mx-0 my-4.75 text-muted text-[0.7rem]">
          {t(
            'Îți vom trimite un link pentru confirmarea adresei de e-mail.',
          )}{' '}
        </p>
      )}
    </div>
  )
}
