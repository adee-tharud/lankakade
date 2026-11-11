import { useLanguage } from '../lib/i18n/language-context'

export function Price({ amount }: { amount: string }) {
  const { language } = useLanguage()
  return (
    <span>
      {new Intl.NumberFormat(language === 'ro' ? 'ro-RO' : 'en-GB', {
        style: 'currency',
        currency: 'RON',
      }).format(Number(amount))}
    </span>
  )
}
