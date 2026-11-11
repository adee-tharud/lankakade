import { useLanguage } from '../../../lib/i18n/language-context'
import { useState, type FormEvent } from 'react'
import { CircleCheck, Mail } from 'lucide-react'
import { useAppDispatch } from '../../../app/store'
import { Button } from '../../../components/Button'
import { FormField } from '../../../components/FormField'
import { Notice } from '../../../components/Notice'
import { useSubmission } from '../../../hooks/use-submission'
import { updateCustomer } from '../../auth/state/session'
import { accountApi, type Customer } from '../services/account-api'

export function ProfileForm({ user }: { user: Customer }) {
  const { t } = useLanguage()

  const dispatch = useAppDispatch()
  const [saved, setSaved] = useState(false)
  const { submit, pending, error, fieldErrors } = useSubmission()
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSaved(false)
    void submit(async () => {
      const profile = await accountApi.updateProfile({
        fullName: String(data.get('fullName')).trim(),
        phone: String(data.get('phone')).trim() || null,
      })
      dispatch(updateCustomer(profile))
      setSaved(true)
    })
  }
  return (
    <section className="account-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{t('DESPRE TINE')}</span>
          <h2>{t('Date personale')}</h2>
        </div>
        <span className="verified-badge">
          <CircleCheck size={14} /> {t('E-mail confirmat')}{' '}
        </span>
      </div>
      <p className="panel-description">
        {t('Păstrează-ți informațiile de contact la zi.')}{' '}
      </p>
      {error && <Notice>{error}</Notice>}
      {saved && (
        <Notice tone="success">{t('Datele tale au fost actualizate.')}</Notice>
      )}
      <form onSubmit={onSubmit}>
        <fieldset disabled={pending}>
          <FormField
            name="fullName"
            label={t('Nume complet')}
            autoComplete="name"
            defaultValue={user.fullName}
            maxLength={150}
            required
            error={fieldErrors.fullName}
          />
          <FormField
            name="phone"
            label={t('Telefon (opțional)')}
            type="tel"
            autoComplete="tel"
            placeholder="+40"
            defaultValue={user.phone ?? ''}
            maxLength={32}
            error={fieldErrors.phone}
          />
          <div className="email-readonly">
            <Mail size={18} aria-hidden="true" />
            <div>
              <span>{t('Adresa de e-mail')}</span>
              <strong>{user.email}</strong>
            </div>
          </div>
          <Button type="submit" pending={pending}>
            {t('Salvează modificările')}{' '}
          </Button>
        </fieldset>
      </form>
    </section>
  )
}
