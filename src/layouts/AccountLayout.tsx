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
      <div
        className="px-6 py-12.5 gap-6 min-h-112.5 flex flex-col justify-center items-center [&_[data-slot=notice]]:max-w-137.5"
        role="status"
      >
        {t('Se verifică sesiunea…')}{' '}
      </div>
    )
  if (status === 'unavailable')
    return (
      <div className="px-6 py-12.5 gap-6 min-h-112.5 flex flex-col justify-center items-center [&_[data-slot=notice]]:max-w-137.5">
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
    <div className="px-0 mx-auto my-0 w-[min(1180px,_90%)] pt-6.75 pb-16.25 mobile:px-4.5 mobile:w-full mobile:pt-5.5 mobile:pb-10">
      <div className="gap-3 flex text-muted text-[0.66rem] mb-6.75 mobile:mb-5 mobile:text-[0.61rem]">
        Lanka Kade <span aria-hidden="true">/</span> {t('Contul meu')}{' '}
      </div>
      <div className="mx-0 my-9 gap-5 flex justify-between items-center mobile:mt-6">
        <div>
          <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
            {t('SPAȚIUL TĂU, ÎN MAGAZINUL NOSTRU')}
          </span>
          <h1 className="mx-0 mt-3.25 mb-2.5 mobile:text-[2rem] mobile:wrap-anywhere">
            {t('Bună,')} {user.fullName.split(' ')[0]}
            <span className="text-focus">.</span>
          </h1>
          <p className="text-[0.85rem] text-muted">
            {t('Tot ce ține de contul tău, într-un singur loc.')}
          </p>
        </div>
        <span className="gap-2.5 flex items-center text-[0.7rem] mobile:hidden">
          <ShieldCheck size={24} aria-hidden="true" />{' '}
          {t('Cont verificat')}{' '}
        </span>
      </div>
      <div className="gap-7.5 grid grid-cols-[275px_minmax(0,_1fr)] tablet:gap-5 tablet:grid-cols-[225px_minmax(0,_1fr)] mobile:gap-6 mobile:flex mobile:flex-col">
        <aside className="px-4 py-5.5 self-start bg-surface border border-border rounded-[15px] mobile:p-3 mobile:w-full">
          <div className="mx-1.5 gap-2.5 flex items-center pb-6 mt-0 mb-4.5 border-b border-b-border mobile:hidden">
            <div
              className="grid place-items-center h-10 w-10 shrink-0 rounded-full bg-brand-soft font-bold last:min-w-0"
              aria-hidden="true"
            >
              {user.fullName.slice(0, 1).toUpperCase()}
            </div>
            <div className="last:min-w-0">
              <strong className="block text-[0.8rem] wrap-anywhere">
                {user.fullName}
              </strong>
              <span className="block text-[0.63rem] text-muted mt-1.25 wrap-anywhere">
                {user.email}
              </span>
            </div>
          </div>
          <nav
            className="mb-4.5 grid gap-1.25 mobile:m-0 mobile:flex"
            aria-label={t('Meniul contului')}
          >
            <NavLink
              className="flex items-center gap-2.5 rounded-lg px-3 py-3.5 text-[0.72rem] [&.active]:bg-brand-soft [&.active]:font-bold mobile:flex-1 mobile:px-2 mobile:py-3 mobile:text-[0.67rem]"
              end
              to="/account"
            >
              <UserRound size={18} aria-hidden="true" /> {t('Date personale')}{' '}
              <ArrowUpRight
                className="ml-auto mobile:hidden"
                size={14}
                aria-hidden="true"
              />
            </NavLink>
            <NavLink
              className="flex items-center gap-2.5 rounded-lg px-3 py-3.5 text-[0.72rem] [&.active]:bg-brand-soft [&.active]:font-bold mobile:flex-1 mobile:px-2 mobile:py-3 mobile:text-[0.67rem]"
              to="/account/addresses"
            >
              <MapPin size={18} aria-hidden="true" /> {t('Adrese salvate')}{' '}
              <ArrowUpRight
                className="ml-auto mobile:hidden"
                size={14}
                aria-hidden="true"
              />
            </NavLink>
          </nav>
          <Button
            className="mobile:mt-1.5 mobile:min-h-10 mobile:text-[0.65rem]"
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
          <div className="px-1.5 mt-6 border-t border-t-border pt-6 pb-1.25 mobile:hidden">
            <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
              {t('BINE AI VENIT ACASĂ')}
            </span>
            <p className="text-muted text-[0.66rem] mt-2.5">
              {t('Mai puțin timp pentru detalii.')} <br />
              {t('Mai mult timp pentru ce contează.')}{' '}
            </p>
          </div>
        </aside>
        <div key={user.id}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
