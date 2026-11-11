import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Leaf } from 'lucide-react'
import { useLanguage } from '../lib/i18n/language-context'
import { useResource } from '../hooks/use-resource'
import {
  catalogApi,
  type Product,
} from '../features/catalog/services/catalog-api'
import { ProductImage } from '../features/catalog/components/ProductImage'
import { ProductGrid } from '../features/catalog/components/ProductGrid'
import { useCart } from '../features/cart/state/cart-context'
import { Button } from '../components/Button'
import { Notice } from '../components/Notice'
import { Price } from '../components/Price'
import { QuantityStepper } from '../components/QuantityStepper'
import { ApiError } from '../services/api/request'

export function ProductPage() {
  const { slug = '' } = useParams()
  return <ProductLoader key={slug} slug={slug} />
}
function ProductLoader({ slug }: { slug: string }) {
  const { t } = useLanguage()
  const load = useCallback(
    (signal: AbortSignal) => catalogApi.product(slug, signal),
    [slug],
  )
  const { data, error, loading, retry } = useResource(load)
  if (loading)
    return (
      <div
        className="px-6 py-12.5 gap-6 min-h-112.5 flex flex-col justify-center items-center [&_[data-slot=notice]]:max-w-137.5"
        role="status"
      >
        {t('Se încarcă produsul…')}
      </div>
    )
  if (error)
    return (
      <div className="px-6 py-12.5 gap-6 min-h-112.5 flex flex-col justify-center items-center [&_[data-slot=notice]]:max-w-137.5">
        <h1>
          {error instanceof ApiError && error.status === 404
            ? t('Produsul nu mai este disponibil.')
            : t('Produsul nu a putut fi încărcat.')}
        </h1>
        <Button onClick={retry} variant="secondary">
          {t('Încearcă din nou')}
        </Button>
        <Link to="/shop">{t('Înapoi la magazin')}</Link>
      </div>
    )
  return data ? <ProductDetail product={data} /> : null
}
function ProductDetail({ product }: { product: Product }) {
  const { t } = useLanguage()
  const cart = useCart()
  const first =
    product.variants.find((variant) => variant.availableStock > 0) ??
    product.variants[0]
  const [choices, setChoices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.options.map((option) => [
        option.id,
        option.values.find((value) => first?.optionValueIds.includes(value.id))
          ?.id ?? '',
      ]),
    ),
  )
  const [requested, setRequested] = useState(1)
  const [image, setImage] = useState(0)
  const variant = product.variants.find((item) =>
    product.options.every((option) =>
      item.optionValueIds.includes(choices[option.id]),
    ),
  )
  const quantity = Math.min(
    requested,
    Math.max(1, variant?.availableStock ?? 1),
    99,
  )
  return (
    <div className="mx-auto my-0 w-[min(1240px,_90%)] pt-7 pb-16.25">
      <div className="gap-3 flex text-muted text-[0.66rem] mb-6.75 mobile:mb-5 mobile:text-[0.61rem]">
        <Link to="/">{t('Acasă')}</Link>
        <span>/</span>
        <Link to="/shop">{t('Magazin')}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>
      <div className="gap-15 grid grid-cols-[1fr_1fr] mt-10 tablet:gap-7.5 mobile:block mobile:mt-6.25">
        <section
          className="[&_>_[data-slot=product-image]]:border [&_>_[data-slot=product-image]]:border-solid [&_>_[data-slot=product-image]]:border-border [&_>_[data-slot=product-image]]:rounded-[15px] [&_>_[data-slot=product-image]]:aspect-[1] [&_>_[data-slot=product-image]]:bg-surface [&_>_[data-slot=product-image]_img]:p-7.5"
          aria-label={t('Imagini produs')}
        >
          <ProductImage
            url={product.images[image]?.url ?? null}
            alt={product.images[image]?.altText || product.name}
            eager
          />
          {product.images.length > 1 && (
            <div className="gap-3 flex mt-3.75 [&_button[aria-pressed='true']]:outline-2 [&_button[aria-pressed='true']]:outline-solid [&_button[aria-pressed='true']]:outline-focus">
              {product.images.map((photo, index) => (
                <button
                  className="p-0 w-18.75 overflow-hidden border border-border rounded-lg bg-surface"
                  key={photo.url}
                  type="button"
                  aria-label={t('Imaginea {number}', { number: index + 1 })}
                  aria-pressed={image === index}
                  onClick={() => setImage(index)}
                >
                  <ProductImage url={photo.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </section>
        <section className="mobile:mt-7">
          <Link
            className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]"
            to={'/shop?category=' + encodeURIComponent(product.categorySlug)}
          >
            {product.categorySlug.replaceAll('-', ' ')}
          </Link>
          <h1 className="mx-0 my-4 text-[clamp(1.9rem,_3vw,_2.6rem)] mobile:text-[1.8rem]">
            {product.name}
          </h1>
          <div
            className={
              variant && variant.availableStock > 0
                ? 'px-3 py-1.75 inline-flex bg-brand-soft rounded-[25px] text-[0.68rem]'
                : 'px-3 py-1.75 inline-flex bg-brand-soft rounded-[25px] text-[0.68rem] text-muted'
            }
          >
            {variant
              ? variant.availableStock > 0
                ? t('În stoc')
                : t('Stoc epuizat')
              : t('Combinație indisponibilă')}
          </div>
          {variant && (
            <p className="mx-0 text-[2rem] font-bold mt-5.5 mb-3.75 tracking-[-0.03em]">
              <Price amount={variant.price} />
            </p>
          )}
          <p className="text-muted text-[0.83rem] whitespace-pre-line">
            {product.description ||
              t('Descoperă acest produs din selecția Lanka Kade.')}
          </p>
          {product.options.map((option) => (
            <fieldset className="mt-6.25" key={option.id}>
              <legend className="text-[0.8rem] font-semibold mb-3">
                {option.name}
              </legend>
              <div className="gap-2.5 flex flex-wrap">
                {option.values.map((value) => (
                  <label className="relative" key={value.id}>
                    <input
                      className="peer absolute inset-0 opacity-0"
                      type="radio"
                      name={option.id}
                      value={value.id}
                      checked={choices[option.id] === value.id}
                      onChange={() =>
                        setChoices((current) => ({
                          ...current,
                          [option.id]: value.id,
                        }))
                      }
                    />
                    <span className="px-4 py-2.75 inline-block border border-border rounded-[7px] text-[0.75rem] cursor-pointer peer-checked:bg-brand-soft peer-checked:border-brand peer-checked:font-semibold peer-focus-visible:outline-3 peer-focus-visible:outline-focus peer-focus-visible:outline-offset-3">
                      {value.name}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {!variant && (
            <Notice>
              {t('Această combinație nu este disponibilă. Alege alte opțiuni.')}
            </Notice>
          )}
          <p className="mt-6.5 mb-2.5 text-[0.75rem] font-semibold">
            {t('Cantitate')}
          </p>
          <div className="gap-3.75 flex mobile:gap-2.5">
            <QuantityStepper
              value={quantity}
              max={Math.min(99, variant?.availableStock ?? 0)}
              onChange={setRequested}
              disabled={cart.busy || !variant?.availableStock}
            />
            <Button
              className="flex-1 mobile:px-3 mobile:text-[0.7rem]"
              pending={cart.busy}
              disabled={!variant || variant.availableStock === 0}
              onClick={() => variant && void cart.add(variant.id, quantity)}
            >
              <ShoppingBag size={18} />
              {t('Adaugă în coș')}
            </Button>
          </div>
          <p className="text-[0.68rem] text-muted mt-3.75">
            {t('Disponibilitatea și prețul sunt reconfirmate în coș.')}
          </p>
          {variant && (
            <p className="text-[0.68rem] text-muted mt-5">
              SKU · {variant.sku}
            </p>
          )}
          <div className="gap-2.5 flex items-center text-[0.75rem] border-t border-t-border pt-5.5 mt-5.5">
            <Leaf size={20} aria-hidden="true" />
            <span>{t('Un ingredient pentru gusturile tale de acasă.')}</span>
          </div>
        </section>
      </div>
      <section className="mt-11.25 border-t border-t-border pt-7.5">
        <h2>{t('Detalii produs')}</h2>
        <p className="text-muted mt-3.75 text-[0.82rem] whitespace-pre-line">
          {product.description ||
            t(
              'Consultă ambalajul pentru ingrediente, alergeni și informații despre produs.',
            )}
        </p>
      </section>
      <RelatedProducts product={product} />
    </div>
  )
}
function RelatedProducts({ product }: { product: Product }) {
  const { t } = useLanguage()
  const load = useCallback(
    (signal: AbortSignal) =>
      catalogApi.products(
        'limit=4&category=' + encodeURIComponent(product.categorySlug),
        signal,
      ),
    [product.categorySlug],
  )
  const { data } = useResource(load)
  const products = data?.items.filter((item) => item.id !== product.id) ?? []
  if (!products.length) return null
  return (
    <section className="px-0 pt-12.5 pb-3 mobile:pt-8">
      <div className="gap-5 flex justify-between items-center mb-6.5 [&_p]:text-muted [&_p]:text-[0.8rem] [&_p]:mt-2.5 mobile:gap-3.5 mobile:items-start mobile:flex-col mobile:[&_p]:text-[0.76rem]">
        <h2 className="text-[1.85rem] mt-2 mobile:text-[1.5rem]">
          {t('Completează-ți cămara')}
        </h2>
        <Link
          className="gap-2.25 flex items-center text-[0.75rem] font-semibold whitespace-nowrap"
          to="/shop"
        >
          {t('Vezi toate produsele')}
          <ArrowRight size={16} />
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  )
}
