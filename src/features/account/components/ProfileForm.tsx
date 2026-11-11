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
    <section className="p-7.5 bg-surface border border-border rounded-[15px] [&_[data-slot=field]]:max-w-132.5 mobile:p-5.5">
      <div
        data-slot="panel-heading"
        className="gap-3.5 flex justify-between items-center mb-3 mobile:items-start mobile:flex-wrap"
      >
        <div>
          <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
            {t('DESPRE TINE')}
          </span>
          <h2 className="mt-2">{t('Date personale')}</h2>
        </div>
        <span className="px-2.5 py-1.75 gap-1.25 inline-flex items-center text-success bg-brand-soft rounded-[20px] text-[0.6rem] whitespace-nowrap mobile:text-[0.56rem]">
          <CircleCheck size={14} /> {t('E-mail confirmat')}{' '}
        </span>
      </div>
      <p className="text-[0.78rem] text-muted mb-6.25">
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
          <div className="p-3.75 gap-3 flex items-center bg-muted-surface mb-6.25 rounded-lg">
            <Mail size={18} aria-hidden="true" />
            <div>
              <span className="block text-[0.62rem] text-muted">
                {t('Adresa de e-mail')}
              </span>
              <strong className="block text-[0.75rem] font-medium mt-1 wrap-anywhere">
                {user.email}
              </strong>
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
