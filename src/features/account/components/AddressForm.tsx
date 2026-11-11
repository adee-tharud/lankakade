import { useLanguage } from '../../../lib/i18n/language-context'
import type { FormEvent } from 'react'
import { Button } from '../../../components/Button'
import { FormField } from '../../../components/FormField'
import { Notice } from '../../../components/Notice'
import { useSubmission } from '../../../hooks/use-submission'
import {
  accountApi,
  type Address,
  type AddressInput,
} from '../services/account-api'

const addressFields = [
  {
    name: 'label',
    label: 'Denumire (opțional)',
    placeholder: 'Acasă, serviciu…',
    maxLength: 80,
  },
  {
    name: 'recipientName',
    label: 'Numele destinatarului',
    autoComplete: 'shipping name',
    maxLength: 150,
    required: true,
  },
  {
    name: 'recipientPhone',
    label: 'Telefon',
    autoComplete: 'shipping tel',
    type: 'tel',
    maxLength: 32,
    required: true,
  },
  {
    name: 'addressLine1',
    label: 'Stradă, număr, bloc',
    autoComplete: 'shipping address-line1',
    maxLength: 200,
    required: true,
  },
  {
    name: 'addressLine2',
    label: 'Apartament, etaj (opțional)',
    autoComplete: 'shipping address-line2',
    maxLength: 200,
  },
  {
    name: 'locality',
    label: 'Localitate',
    autoComplete: 'shipping address-level2',
    maxLength: 100,
    required: true,
  },
  {
    name: 'region',
    label: 'Județ / sector',
    autoComplete: 'shipping address-level1',
    maxLength: 100,
    required: true,
  },
  {
    name: 'postalCode',
    label: 'Cod poștal',
    autoComplete: 'shipping postal-code',
    maxLength: 20,
    required: true,
  },
  {
    name: 'countryCode',
    label: 'Cod țară',
    autoComplete: 'shipping country',
    placeholder: 'RO',
    pattern: '[a-zA-Z]{2}',
    maxLength: 2,
    required: true,
  },
] as const

export function AddressForm({
  address,
  onSave,
  onCancel,
}: {
  address?: Address
  onSave: (value: Address) => void
  onCancel: () => void
}) {
  const { t } = useLanguage()

  const { submit, pending, error, fieldErrors } = useSubmission()
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const body = Object.fromEntries(
      addressFields.map(({ name }) => [
        name,
        String(data.get(name)).trim() || null,
      ]),
    ) as AddressInput
    body.countryCode = body.countryCode.toUpperCase()
    void submit(async () =>
      onSave(await accountApi.saveAddress(body, address?.id)),
    )
  }
  return (
    <section
      className="p-7.5 bg-surface border border-border rounded-[15px] mt-6 [&_[data-slot=field]]:max-w-132.5 mobile:p-5.5"
      aria-labelledby="address-editor-title"
    >
      <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
        {t('ADRESELE TALE')}
      </span>
      <h2 id="address-editor-title">
        {address ? t('Editează adresa') : t('Adaugă o adresă')}
      </h2>
      <p className="text-[0.78rem] text-muted mb-6.25">
        {t(
          'Completează adresa de livrare. Câmpurile opționale sunt marcate.',
        )}{' '}
      </p>
      {error && (
        <Notice>
          {error}{' '}
          {t(
            'Verifică lista de adrese înainte de a retrimite o cerere întreruptă.',
          )}{' '}
        </Notice>
      )}
      <form onSubmit={onSubmit}>
        <fieldset disabled={pending}>
          <div className="grid grid-cols-[1fr_1fr] gap-y-0 gap-x-5 [&>[data-slot=field]:nth-child(4)]:col-span-full [&>[data-slot=field]:nth-child(4)]:max-w-none [&>[data-slot=field]:nth-child(5)]:col-span-full [&>[data-slot=field]:nth-child(5)]:max-w-none mobile:grid-cols-[1fr] mobile:[&_>_*]:col-[1]!">
            {addressFields.map((field) => (
              <FormField
                key={field.name}
                {...field}
                label={t(field.label)}
                placeholder={
                  field.name === 'label'
                    ? t('Acasă, serviciu…')
                    : field.name === 'countryCode'
                      ? 'RO'
                      : undefined
                }
                defaultValue={
                  address?.[field.name] ??
                  (field.name === 'countryCode' ? 'RO' : '')
                }
                error={fieldErrors[field.name]}
              />
            ))}
          </div>
          <div className="gap-2.5 flex flex-wrap mobile:[&_>_[data-slot=button]]:flex-1">
            <Button type="submit" pending={pending}>
              {t('Salvează adresa')}{' '}
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              {t('Renunță')}{' '}
            </Button>
          </div>
        </fieldset>
      </form>
    </section>
  )
}
