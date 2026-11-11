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
      <div className="p-6 gap-4.5 mt-5.5 bg-brand-soft rounded-xl flex items-center mobile:p-5 mobile:gap-3 mobile:items-start mobile:[&_>_svg]:hidden">
        <MapPin size={24} aria-hidden="true" />
        <div>
          <h3 className="text-[0.85rem]">
            {t('Următoarea comandă începe de aici.')}
          </h3>
          <p className="text-[0.73rem] text-muted mt-1.25">
            {t(
              'Salvează o adresă și ai detaliile pregătite pentru mai târziu.',
            )}
          </p>
        </div>
        <Link
          className="p-2.5 ml-auto"
          to="/account/addresses"
          aria-label={t('Gestionează adresele')}
        >
          <ArrowRight size={22} />
        </Link>
      </div>
    </>
  )
}
