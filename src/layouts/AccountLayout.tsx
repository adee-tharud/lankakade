import { useLanguage } from '../lib/i18n/language-context'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import {
  UserRound,
  MapPin,
  LogOut,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../app/store'
import { clearSession, restoreSession } from '../features/auth/state/session'
import { authApi } from '../features/auth/services/auth-api'
import { Button } from '../components/Button'
import { Notice } from '../components/Notice'
import { ApiError } from '../services/api/request'
import { useSubmission } from '../hooks/use-submission'

export function AccountLayout() {
  const { t } = useLanguage()

  const { user, status } = useAppSelector((state) => state.session)
  const dispatch = useAppDispatch()
  const { submit, error, pending } = useSubmission()
  const navigate = useNavigate()
  if (status === 'checking')
    return (
      <div className="page-status" role="status">
        {t('Se verifică sesiunea…')}{' '}
      </div>
    )
  if (status === 'unavailable')
    return (
      <div className="page-status">
        <Notice>
          {t(
            'Nu am putut verifica sesiunea. Încearcă din nou pentru a-ți accesa contul.',
          )}{' '}
        </Notice>
        <Button onClick={() => void dispatch(restoreSession())}>
          {t('Încearcă din nou')}{' '}
        </Button>
      </div>
    )
  if (!user || status !== 'authenticated')
    return <Navigate to="/sign-in" replace />

  return (
    <div className="account-page">
      <div className="breadcrumb">
        Lanka Kade <span aria-hidden="true">/</span> {t('Contul meu')}{' '}
      </div>
      <div className="account-heading">
        <div>
          <span className="eyebrow">
            {t('SPAȚIUL TĂU, ÎN MAGAZINUL NOSTRU')}
          </span>
          <h1>
            {t('Bună,')} {user.fullName.split(' ')[0]}
            <span className="greeting-dot">.</span>
          </h1>
          <p>{t('Tot ce ține de contul tău, într-un singur loc.')}</p>
        </div>
        <span className="account-seal">
          <ShieldCheck size={24} aria-hidden="true" />{' '}
          {t('Cont verificat')}{' '}
        </span>
      </div>
      <div className="account-grid">
        <aside className="account-sidebar">
          <div className="customer-mini">
            <div className="avatar" aria-hidden="true">
              {user.fullName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <strong>{user.fullName}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <nav aria-label={t('Meniul contului')}>
            <NavLink end to="/account">
              <UserRound size={18} aria-hidden="true" /> {t('Date personale')}{' '}
              <ArrowUpRight size={14} aria-hidden="true" />
            </NavLink>
            <NavLink to="/account/addresses">
              <MapPin size={18} aria-hidden="true" /> {t('Adrese salvate')}{' '}
              <ArrowUpRight size={14} aria-hidden="true" />
            </NavLink>
          </nav>
          <Button
            variant="quiet"
            pending={pending}
            onClick={() =>
              void submit(async () => {
                try {
                  await authApi.logout()
                } catch (failure) {
                  if (!(failure instanceof ApiError && failure.status === 401))
                    throw failure
                }
                dispatch(clearSession())
                navigate('/sign-in', { replace: true })
              })
            }
          >
            <LogOut size={18} aria-hidden="true" />{' '}
            {pending ? t('Se deconectează…') : t('Deconectare')}
          </Button>
          {error && <Notice>{error}</Notice>}
          <div className="sidebar-note">
            <span className="eyebrow">{t('BINE AI VENIT ACASĂ')}</span>
            <p>
              {t('Mai puțin timp pentru detalii.')} <br />
              {t('Mai mult timp pentru ce contează.')}{' '}
            </p>
          </div>
        </aside>
        <div className="account-content" key={user.id}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
