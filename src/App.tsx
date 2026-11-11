import { useLanguage } from './lib/i18n/language-context'
import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { useAppSelector } from './app/store'
import { StorefrontLayout } from './layouts/StorefrontLayout'
import { AccountLayout } from './layouts/AccountLayout'
import { AuthPage } from './pages/AuthPage'
import { AccountPage } from './pages/AccountPage'
import { HomePage } from './pages/HomePage'
import { ShopPage } from './pages/ShopPage'
import { ProductPage } from './pages/ProductPage'
import { CartPage } from './pages/CartPage'
import { CartProvider } from './features/cart/components/CartProvider'
import { Addresses } from './features/account/components/Addresses'

export function App({
  emailLink,
}: {
  emailLink: { path: string; token: string | null }
}) {
  const { t } = useLanguage()

  const userId = useAppSelector((state) => state.session.user?.id)
  const location = useLocation()
  useEffect(() => {
    document.title = t(
      /^\/(account|sign-in|register|verify-email|reset-password|forgot-password)(?:\/|$)/.test(
        location.pathname,
      )
        ? 'Contul tău · Romania Lanka Kade'
        : 'Magazin · Romania Lanka Kade',
    )
  }, [t, location.pathname])
  useEffect(() => {
    document.querySelector<HTMLElement>('#main-content')?.focus()
    window.scrollTo(0, 0)
  }, [location.pathname])
  return (
    <CartProvider key={userId ?? 'guest'}>
      <Routes>
        <Route element={<StorefrontLayout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="products/:slug" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
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
              <div className="px-6 py-12.5 gap-6 min-h-112.5 flex flex-col justify-center items-center [&_[data-slot=notice]]:max-w-137.5">
                <h1>{t('Pagina nu a fost găsită.')}</h1>
                <Link
                  data-slot="button"
                  className="px-5 py-3 gap-2.5 min-h-12 inline-flex items-center justify-center border border-clear rounded-lg text-[0.76rem] font-bold leading-[1.5] transition-colors duration-150 bg-accent text-brand-deep hover:bg-accent-hover"
                  to="/"
                >
                  {t('Acasă')}
                </Link>
              </div>
            }
          />
        </Route>
      </Routes>
    </CartProvider>
  )
}
