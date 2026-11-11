import { useLanguage } from '../lib/i18n/language-context'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowUpRight, Leaf, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useAppSelector } from '../app/store'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import logo from '../assets/logo.png'

const copyrightYear = new Date().getFullYear()

export function StorefrontLayout() {
  const { language, t } = useLanguage()

  const signedIn = useAppSelector(
    (state) => state.session.status === 'authenticated',
  )
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        {t('Sari la conținut')}{' '}
      </a>
      <div className="announcement">
        <span>{t('Un strop de Sri Lanka, mai aproape de casă.')}</span>
        <span>
          {t('ROMÂNIA')} <span aria-hidden="true">·</span> RON (lei)
        </span>
      </div>
      <header className="site-header">
        <Link to="/" className="brand" aria-label="Romania Lanka Kade">
          <img src={logo} width="64" height="64" alt="" />
          <span>
            LANKA KADE<small>{t('GUSTUL DE ACASĂ')}</small>
          </span>
        </Link>
        <nav aria-label={t('Navigație principală')}>
          <NavLink to={signedIn ? '/account' : '/sign-in'} end>
            {signedIn ? t('Contul meu') : t('Autentificare')}
          </NavLink>
          <NavLink to={signedIn ? '/account/addresses' : '/register'}>
            {signedIn ? t('Adrese salvate') : t('Creează cont')}
            <ArrowUpRight size={15} aria-hidden="true" />
          </NavLink>
        </nav>
        <div className="header-actions">
          <span className="header-security">
            <ShieldCheck size={17} aria-hidden="true" /> {t('Acces securizat')}
          </span>
          <LanguageSwitcher />
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-brand">
          <Leaf size={22} aria-hidden="true" />
          <strong>{t('Puțin mai aproape de casă.')}</strong>
          <p>{t('Produse din Sri Lanka. O comunitate în România.')}</p>
        </div>
        <span className="footer-security">
          <LockKeyhole size={15} aria-hidden="true" />{' '}
          {t('Datele tale, în siguranță.')}{' '}
        </span>
        <div className="footer-bottom">
          <span>© {copyrightYear} Romania Lanka Kade</span>
          <span>
            {language.toUpperCase()} <span aria-hidden="true">·</span> RON (lei)
          </span>
        </div>
      </footer>
    </div>
  )
}
