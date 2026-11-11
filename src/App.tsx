import { useLanguage } from './lib/i18n/language-context'
import { useEffect } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAppSelector } from './app/store'
import { StorefrontLayout } from './layouts/StorefrontLayout'
import { AccountLayout } from './layouts/AccountLayout'
import { AuthPage } from './pages/AuthPage'
import { AccountPage } from './pages/AccountPage'
import { Addresses } from './features/account/components/Addresses'

export function App({
  emailLink,
}: {
  emailLink: { path: string; token: string | null }
}) {
  const { t } = useLanguage()

  const authenticated = useAppSelector(
    (state) => state.session.status === 'authenticated',
  )
  const location = useLocation()
  useEffect(() => {
    document.title = t('Contul tău · Romania Lanka Kade')
  }, [t])
  useEffect(() => {
    document.querySelector<HTMLElement>('#main-content')?.focus()
    window.scrollTo(0, 0)
  }, [location.pathname])
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route
          index
          element={
            <Navigate to={authenticated ? '/account' : '/sign-in'} replace />
          }
        />
        <Route path="sign-in" element={<AuthPage mode="sign-in" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route
          path="forgot-password"
          element={<AuthPage mode="forgot-password" />}
        />
        <Route
          path="verify-email"
          element={
            <AuthPage
              mode="verify-email"
              token={
                emailLink.path === '/verify-email' ? emailLink.token : null
              }
            />
          }
        />
        <Route
          path="reset-password"
          element={
            <AuthPage
              mode="reset-password"
              token={
                emailLink.path === '/reset-password' ? emailLink.token : null
              }
            />
          }
        />
        <Route path="account" element={<AccountLayout />}>
          <Route index element={<AccountPage />} />
          <Route path="addresses" element={<Addresses />} />
        </Route>
        <Route
          path="*"
          element={
            <div className="page-status">
              <h1>{t('Pagina nu a fost găsită.')}</h1>
              <Link className="button button-primary" to="/">
                {t('Înapoi la contul tău')}{' '}
              </Link>
            </div>
          }
        />
      </Route>
    </Routes>
  )
}
