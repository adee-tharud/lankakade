import { Link } from 'react-router-dom'
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '../features/cart/state/cart-context'
import { useAppSelector } from '../app/store'
import { useLanguage } from '../lib/i18n/language-context'
import { Notice } from '../components/Notice'
import { Button } from '../components/Button'
import { Price } from '../components/Price'
import { QuantityStepper } from '../components/QuantityStepper'

export function CartPage() {
  const { t } = useLanguage()
  const { cart, busy, error, refresh, setQuantity } = useCart()
  const status = useAppSelector((state) => state.session.status)
  if (status !== 'authenticated')
    return (
      <div className="px-6 py-12.5 gap-6 min-h-112.5 flex flex-col justify-center items-center [&_[data-slot=notice]]:max-w-137.5">
        <Notice>{t('Trebuie să te autentifici mai întâi.')}</Notice>
        <Link
          data-slot="button"
          className="px-5 py-3 gap-2.5 min-h-12 inline-flex items-center justify-center border border-clear rounded-lg text-[0.76rem] font-bold leading-[1.5] transition-colors duration-150 bg-accent text-brand-deep hover:bg-accent-hover"
          to="/sign-in"
        >
          {t('Intră în cont')}
        </Link>
      </div>
    )
  if (error)
    return (
      <div className="px-6 py-12.5 gap-6 min-h-112.5 flex flex-col justify-center items-center [&_[data-slot=notice]]:max-w-137.5">
        <Notice>{t('Coșul nu a putut fi încărcat.')}</Notice>
        <Button onClick={refresh}>{t('Încearcă din nou')}</Button>
      </div>
    )
  if (!cart)
    return (
      <div
        className="px-6 py-12.5 gap-6 min-h-112.5 flex flex-col justify-center items-center [&_[data-slot=notice]]:max-w-137.5"
        role="status"
      >
        {t('Se încarcă coșul…')}
      </div>
    )
  const cents = cart.items.reduce(
    (sum, item) =>
      sum +
      BigInt(item.unitPrice?.replace('.', '') ?? '0') * BigInt(item.quantity),
    0n,
  )
  const digits = cents.toString().padStart(3, '0')
  const subtotal = digits.slice(0, -2) + '.' + digits.slice(-2)
  return (
    <div className="mx-auto my-0 w-[min(1240px,_90%)] pt-7 pb-16.25">
      <div className="gap-3 flex text-muted text-[0.66rem] mb-6.75 mobile:mb-5 mobile:text-[0.61rem]">
        <Link to="/">{t('Acasă')}</Link>
        <span>/</span>
        {t('Coșul tău')}
      </div>
      <h1>{t('Coșul tău')}</h1>
      <p className="text-muted text-[0.85rem] mb-7.5">
        {t('Gusturile tale preferate, într-un singur loc.')}
      </p>
      {cart.items.length === 0 ? (
        <div className="px-5 py-12.5 bg-surface border border-dashed border-border rounded-[14px] text-center [&_>_svg]:mx-auto [&_>_svg]:mt-0 [&_>_svg]:mb-5 [&_>_svg]:text-muted">
          <ShoppingBag size={35} />
          <h2>{t('Coșul tău este gol')}</h2>
          <p className="mx-0 text-[0.78rem] mt-2.5 mb-6 text-muted">
            {t('Descoperă produsele și adaugă-ți preferatele.')}
          </p>
          <Link
            data-slot="button"
            className="px-5 py-3 gap-2.5 min-h-12 inline-flex items-center justify-center border border-clear rounded-lg text-[0.76rem] font-bold leading-[1.5] transition-colors duration-150 bg-accent text-brand-deep hover:bg-accent-hover"
            to="/shop"
          >
            {t('Explorează magazinul')}
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="gap-7.5 grid grid-cols-[minmax(0,_1fr)_310px] tablet:grid-cols-[1fr]">
          <div>
            {cart.items.map((item) => (
              <article
                data-slot="cart-line"
                className="p-6.25 gap-5 flex justify-between bg-surface border border-border rounded-xl mb-4 mobile:p-5 mobile:flex-col"
                key={item.variantId}
              >
                <div>
                  <Link
                    to={'/products/' + encodeURIComponent(item.productSlug)}
                  >
                    <h2 className="text-[1rem] tracking-normal">
                      {item.productName}
                    </h2>
                  </Link>
                  <p className="mx-0 my-2.25 text-[0.72rem] text-muted">
                    {item.sku}
                  </p>
                  <span className="text-[0.64rem] text-success">
                    {item.availability === 'in_stock'
                      ? t('În stoc')
                      : t('Indisponibil')}
                  </span>
                  {item.quantity > item.availableStock && (
                    <p className="mx-0 my-2.25 text-[0.72rem] text-muted">
                      {t('Stocul s-a schimbat. Verifică această cantitate.')}
                    </p>
                  )}
                </div>
                <div className="gap-2.5 grid justify-items-end mobile:flex mobile:items-center mobile:flex-wrap">
                  <strong className="text-[0.95rem]">
                    {item.unitPrice ? (
                      <Price amount={item.unitPrice} />
                    ) : (
                      t('Indisponibil')
                    )}
                  </strong>
                  <QuantityStepper
                    value={item.quantity}
                    max={Math.min(99, item.availableStock)}
                    disabled={busy}
                    onChange={(quantity) =>
                      void setQuantity(item.variantId, quantity)
                    }
                  />
                  <Button
                    variant="quiet"
                    disabled={busy}
                    onClick={() => void setQuantity(item.variantId, 0)}
                    aria-label={t('Elimină') + ' ' + item.productName}
                  >
                    <Trash2 size={16} />
                    {t('Elimină')}
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <aside className="p-6.25 border border-border rounded-xl bg-surface self-start">
            <h2 className="text-[1.2rem] mb-6.25">{t('Sumar coș')}</h2>
            <div className="gap-3.75 flex justify-between text-[0.85rem]">
              <span>{t('Subtotal')}</span>
              <strong>
                <Price amount={subtotal} />
              </strong>
            </div>
            <p className="mx-0 my-5 text-muted text-[0.73rem]">
              {t(
                'Livrarea și totalul final vor fi confirmate la finalizarea comenzii.',
              )}
            </p>
            <Link
              data-slot="button"
              className="w-full px-5 py-3 gap-2.5 min-h-12 inline-flex items-center justify-center border border-border rounded-lg text-[0.76rem] font-bold leading-[1.5] transition-colors duration-150 bg-surface text-brand hover:bg-brand-soft"
              to="/shop"
            >
              {t('Continuă cumpărăturile')}
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}
