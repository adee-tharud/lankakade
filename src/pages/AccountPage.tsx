import { useLanguage } from '../lib/i18n/language-context'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import { useAppSelector } from '../app/store'
import { ProfileForm } from '../features/account/components/ProfileForm'

export function AccountPage() {
  const { t } = useLanguage()

  const user = useAppSelector((state) => state.session.user)
  if (!user) return null
  return (
    <>
      <ProfileForm user={user} />
      <div className="account-callout">
        <MapPin size={24} aria-hidden="true" />
        <div>
          <h3>{t('Următoarea comandă începe de aici.')}</h3>
          <p>
            {t(
              'Salvează o adresă și ai detaliile pregătite pentru mai târziu.',
            )}
          </p>
        </div>
        <Link to="/account/addresses" aria-label={t('Gestionează adresele')}>
          <ArrowRight size={22} />
        </Link>
      </div>
    </>
  )
}
