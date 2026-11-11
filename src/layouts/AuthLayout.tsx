import { useLanguage } from '../lib/i18n/language-context'
import type { ReactNode } from 'react'
import { Leaf, MapPin, ShieldCheck, ArrowDownRight } from 'lucide-react'
import hero from '../assets/herosectionphoto.png'

export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage()

  return (
    <div className="auth-page">
      <div className="breadcrumb">
        Lanka Kade <span aria-hidden="true">/</span> {t('Contul tău')}{' '}
      </div>
      <div className="auth-grid">
        <aside
          className="auth-story"
          aria-label={t('Bine ai venit la Lanka Kade')}
        >
          <div className="story-heading">
            <span className="eyebrow">
              <Leaf size={15} aria-hidden="true" />{' '}
              {t('FAMILIAR. AUTENTIC. APROAPE.')}{' '}
            </span>
            <h2>
              {t('Gustul de acasă.')} <br />
              {t('La tine')} <span>{t('acasă.')}</span>
            </h2>
            <p>
              {t(
                'Ingredientele pe care le iubești și micile lucruri care îți lipsesc. Acum, mai aproape.',
              )}{' '}
            </p>
          </div>
          <div className="story-image">
            <img
              src={hero}
              width="1774"
              height="887"
              alt={t(
                'Produse Sri Lanka, orez, mirodenii și ceai de Ceylon, alături de o sacoșă Lanka Kade',
              )}
            />
          </div>
          <div className="story-bottom">
            <span>
              <MapPin size={16} aria-hidden="true" />{' '}
              {t('Din Sri Lanka, în România')}{' '}
            </span>
            <ArrowDownRight size={25} aria-hidden="true" />
          </div>
        </aside>
        <section className="auth-form-panel">
          {children}
          <div className="form-assurance">
            <ShieldCheck size={16} aria-hidden="true" />{' '}
            {t('Conectare sigură. Date protejate.')}{' '}
          </div>
        </section>
      </div>
    </div>
  )
}
