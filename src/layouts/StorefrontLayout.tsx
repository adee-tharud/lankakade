import { useRef, useState, type FormEvent } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  Search,
  Leaf,
  UserRound,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  LogOut,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../app/store'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { Button } from '../components/Button'
import { Notice } from '../components/Notice'
import { useLanguage } from '../lib/i18n/language-context'
import { useCart } from '../features/cart/state/cart-context'
import { authApi } from '../features/auth/services/auth-api'
import { clearSession } from '../features/auth/state/session'
import { ApiError } from '../services/api/request'
import { useSubmission } from '../hooks/use-submission'
import logo from '../assets/logo.png'

const copyrightYear = new Date().getFullYear()
export function StorefrontLayout() {
  const { language, t } = useLanguage()
  const { user, status } = useAppSelector((state) => state.session)
  const { feedback, dismiss, cart, requireCustomer } = useCart()
  const [menu, setMenu] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { pending, error, submit } = useSubmission()
  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = String(
      new FormData(event.currentTarget).get('q') ?? '',
    ).trim()
    setMenu(false)
    navigate('/shop' + (query ? '?q=' + encodeURIComponent(query) : ''))
  }
  function logout() {
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
  const nav = (
    <>
      <NavLink end to="/" onClick={() => setMenu(false)}>
        {t('Acasă')}
      </NavLink>
      <NavLink to="/shop" onClick={() => setMenu(false)}>
        {t('Magazin')}
      </NavLink>
      <span aria-disabled="true" title={t('În curând')}>
        {t('Contactează-ne')}
      </span>
      <span aria-disabled="true" title={t('În curând')}>
        {t('Despre noi')}
      </span>
    </>
  )
  return (
    <div className="min-h-svh flex flex-col">
      <a
        className="p-3 fixed -top-25 left-5 z-10 bg-brand text-on-brand focus:top-3"
        href="#main-content"
      >
        {t('Sari la conținut')}
      </a>
      <div className="px-[max(5vw,_20px)] py-2.5 gap-5 bg-brand text-on-brand text-[0.66rem] flex justify-between tracking-[0.015em] mobile:px-4 mobile:py-2.25 mobile:justify-center mobile:text-center mobile:text-[0.61rem]">
        <span className="last:text-[0.62rem] last:tracking-[0.1em] mobile:last:hidden">
          {t('Un strop de Sri Lanka, mai aproape de casă.')}
        </span>
        <span className="last:text-[0.62rem] last:tracking-[0.1em] mobile:last:hidden">
          {t('ROMÂNIA')} · RON (lei)
        </span>
      </div>
      <header
        className="bg-surface border-b border-b-border"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && menu) {
            setMenu(false)
            menuButton.current?.focus()
          }
        }}
      >
        <div className="px-0 py-3.25 m-auto gap-6.25 w-[min(1360px,_94%)] flex items-center justify-between compact-nav:w-[90%] mobile:px-0 mobile:py-3 mobile:grid mobile:grid-cols-[minmax(0,_1fr)_auto] mobile:gap-y-2 mobile:gap-x-2.5">
          <Link
            data-slot="brand"
            to="/"
            className="gap-2.5 flex items-center mobile:col-start-1 mobile:row-start-1 mobile:gap-1.25"
            aria-label="Romania Lanka Kade"
          >
            <img
              className="w-15.25 h-15.25 object-contain mobile:w-11.25 mobile:h-11.25"
              src={logo}
              width="64"
              height="64"
              alt=""
            />
            <span className="text-[1.05rem] font-bold tracking-[0.04em] mobile:text-[0.75rem]">
              LANKA KADE
              <small className="block text-[0.52rem] tracking-[0.18em] font-medium mt-0.75 text-muted mobile:text-[0.4rem]">
                {t('GUSTUL DE ACASĂ')}
              </small>
            </span>
          </Link>
          <nav
            className="gap-5.75 flex items-center text-[0.76rem] font-semibold whitespace-nowrap [&_>_*]:px-0 [&_>_*]:py-3 [&_.active]:underline [&_.active]:underline-offset-10 [&_.active]:decoration-2 [&_[aria-disabled]]:text-muted [&_[aria-disabled]]:cursor-default compact-nav:hidden"
            aria-label={t('Navigație principală')}
          >
            {nav}
          </nav>
          <div className="gap-5.5 flex items-center mobile:contents mobile:[&_[data-slot=language-switcher]]:col-[2] mobile:[&_[data-slot=language-switcher]]:row-[1]">
            <LanguageSwitcher />
            {status === 'authenticated' && user ? (
              <details
                data-slot="account-menu"
                className="relative [&_[data-slot=button]]:w-full [&_[data-slot=button]]:justify-start mobile:col-[1] mobile:row-[2] mobile:justify-self-start"
                key={location.pathname}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.currentTarget.open = false
                    event.currentTarget.querySelector('summary')?.focus()
                  }
                }}
              >
                <summary className="gap-1.75 flex items-center min-h-11 text-[0.7rem] font-semibold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <UserRound size={20} />
                  <span className="max-w-23.75 overflow-hidden text-ellipsis">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown size={13} />
                </summary>
                <div className="p-3 absolute top-12.5 right-0 z-50 w-60 bg-surface border border-border shadow-panel rounded-xl mobile:left-0 mobile:right-auto">
                  <Link
                    className="px-2.5 py-3.5 gap-2.25 flex items-center text-[0.75rem] rounded-md hover:bg-brand-soft"
                    to="/account"
                  >
                    <UserRound size={16} />
                    {t('Contul meu')}
                  </Link>
                  <Link
                    className="px-2.5 py-3.5 gap-2.25 flex items-center text-[0.75rem] rounded-md hover:bg-brand-soft"
                    to="/account/addresses"
                  >
                    <MapPin size={16} />
                    {t('Adrese salvate')}
                  </Link>
                  <Button variant="quiet" pending={pending} onClick={logout}>
                    <LogOut size={16} />
                    {t('Deconectare')}
                  </Button>
                  {error && <Notice>{error}</Notice>}
                </div>
              </details>
            ) : (
              <Link
                className="gap-1.75 flex items-center min-h-11 text-[0.7rem] font-semibold mobile:col-[1] mobile:row-[2] mobile:justify-self-start"
                to="/sign-in"
              >
                <UserRound size={20} />
                <span className="max-w-23.75 leading-[1.45] mobile:max-w-none mobile:text-[0.7rem]">
                  {t('Autentificare / Înregistrare')}
                </span>
              </Link>
            )}
            <Link
              className="relative grid place-items-center min-w-10 min-h-11 mobile:col-[2] mobile:row-[2] mobile:justify-self-start"
              to="/cart"
              onClick={(event) => {
                if (!requireCustomer()) event.preventDefault()
              }}
              aria-label={t('Coș de cumpărături') + ' (' + count + ')'}
            >
              <ShoppingBag size={22} />
              <span
                className="p-0.5 absolute top-0 -right-1 min-w-4.75 h-4.75 rounded-full bg-accent text-brand grid place-items-center text-[0.58rem] font-bold"
                aria-hidden="true"
              >
                {count}
              </span>
            </Link>
            <button
              className="hidden min-w-11 min-h-11 bg-clear border-0 text-brand compact-nav:grid compact-nav:place-items-center mobile:col-[2] mobile:row-[2] mobile:justify-self-end"
              ref={menuButton}
              type="button"
              aria-label={menu ? t('Închide meniul') : t('Deschide meniul')}
              aria-expanded={menu}
              aria-controls="mobile-navigation"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        <div className="px-[max(5vw,_18px)] py-2.75 gap-7.5 border-t border-t-border flex items-center justify-between text-[0.69rem] mobile:px-[5vw] mobile:pt-2.5 mobile:pb-3.75">
          <span className="gap-2 flex items-center tablet:hidden">
            <Leaf size={15} />
            {t('Ingredientele tale de acasă')}
          </span>
          <form
            className="relative flex-1 max-w-137.5 mobile:max-w-none"
            onSubmit={search}
            role="search"
            key={location.search}
          >
            <label className="sr-only" htmlFor="header-search">
              {t('Caută produse')}
            </label>
            <input
              className="py-3 w-full bg-page border border-border rounded-lg min-h-11 text-text pr-12.5 pl-4 [font:inherit]"
              id="header-search"
              name="q"
              type="search"
              maxLength={100}
              placeholder={t('Caută orez, ceai, mirodenii…')}
              defaultValue={new URLSearchParams(location.search).get('q') ?? ''}
            />
            <button
              className="absolute top-0 right-0.75 min-w-11 min-h-11 grid place-items-center border-0 bg-clear text-brand"
              type="submit"
              aria-label={t('Caută')}
            >
              <Search size={19} />
            </button>
          </form>
          <Link className="gap-2 flex items-center mobile:hidden" to="/shop">
            {t('Explorează magazinul')}
            <ArrowRight size={15} />
          </Link>
        </div>
        {menu && (
          <nav
            id="mobile-navigation"
            className="px-[5vw] grid pt-3 pb-5.5 border-t border-t-border [&_>_*]:p-3.25 [&_>_*]:rounded-[7px] [&_>_*]:text-[0.83rem] [&_a.active]:bg-brand-soft [&_a.active]:font-semibold [&_[aria-disabled]]:text-muted"
            tabIndex={-1}
            aria-label={t('Meniu mobil')}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setMenu(false)
            }}
          >
            {nav}
          </nav>
        )}
      </header>
      {feedback && (
        <div className="fixed bottom-5.5 right-5.5 z-90 w-[min(450px,_calc(100%_-_32px))] [&_[data-slot=notice]]:py-5 [&_[data-slot=notice]]:m-0 [&_[data-slot=notice]]:shadow-panel [&_[data-slot=notice]]:pr-10.5 [&_[data-slot=notice]]:pl-4.5 [&_[data-slot=notice]_a]:gap-2 [&_[data-slot=notice]_a]:inline-flex [&_[data-slot=notice]_a]:items-center [&_[data-slot=notice]_a]:mt-2 [&_[data-slot=notice]_a]:underline [&_[data-slot=notice]_a]:underline-offset-4 [&_[data-slot=notice]_a]:font-bold mobile:bottom-4 mobile:right-4">
          <Notice tone={feedback.tone}>
            {t(feedback.message)}{' '}
            {feedback.signIn && (
              <Link
                to="/sign-in"
                state={{ returnTo: location.pathname + location.search }}
              >
                {t('Intră în cont')}
                <ArrowRight size={14} />
              </Link>
            )}
            {feedback.tone === 'success' && (
              <Link to="/cart">
                {t('Vezi coșul')}
                <ArrowRight size={14} />
              </Link>
            )}
          </Notice>
          <button
            className="absolute top-2.25 right-2.25 grid place-items-center w-7.5 h-7.5 border-0 rounded-md bg-clear text-brand"
            type="button"
            onClick={dismiss}
            aria-label={t('Închide notificarea')}
          >
            <X size={18} />
          </button>
        </div>
      )}
      <main className="flex-1" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="px-[max(5vw,_20px)] gap-7.5 bg-brand-deep text-on-brand pt-8.5 pb-4.5 grid grid-cols-[1fr_1fr] tablet:grid-cols-[1fr_1fr] mobile:px-5.5 mobile:gap-5.5 mobile:flex mobile:flex-col mobile:pt-7.5 mobile:pb-4.5">
        <div className="[&_>_svg]:inline [&_>_svg]:mr-2.5 [&_>_svg]:align-middle">
          <Leaf size={22} />
          <strong className="text-[0.87rem] font-semibold">
            {t('Puțin mai aproape de casă.')}
          </strong>
          <p className="text-[0.69rem] mt-2.25 text-on-brand-muted">
            {t('Produse din Sri Lanka. O comunitate în România.')}
          </p>
        </div>
        <Link
          className="p-2.5 gap-2.5 self-start justify-self-end flex items-center text-[0.75rem]"
          to="/shop"
        >
          {t('Explorează magazinul')}
          <ArrowRight size={16} />
        </Link>
        <div className="col-span-full border-t border-t-brand-border pt-4 flex justify-between text-[0.6rem] text-on-brand-muted mobile:gap-3.75 mobile:text-[0.56rem]">
          <span>© {copyrightYear} Romania Lanka Kade</span>
          <span>{language.toUpperCase()} · RON (lei)</span>
        </div>
      </footer>
    </div>
  )
}
