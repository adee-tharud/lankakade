import { useCallback, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react'
import { useLanguage } from '../lib/i18n/language-context'
import { useResource } from '../hooks/use-resource'
import { catalogApi } from '../features/catalog/services/catalog-api'
import {
  ProductGrid,
  ProductGridSkeleton,
} from '../features/catalog/components/ProductGrid'
import { Button } from '../components/Button'
import { Notice } from '../components/Notice'
import { FormField } from '../components/FormField'

export function ShopPage() {
  const [params] = useSearchParams()
  return <ShopResults key={params.toString()} />
}
function ShopResults() {
  const { t } = useLanguage()
  const [params, setParams] = useSearchParams()
  const query = new URLSearchParams()
  for (const key of ['q', 'category', 'minPrice', 'maxPrice', 'after']) {
    const value = params.get(key)
    if (value) query.set(key, value)
  }
  query.set('limit', '12')
  const search = query.toString()
  const load = useCallback(
    async (signal: AbortSignal) => {
      const [products, categories] = await Promise.all([
        catalogApi.products(search, signal),
        catalogApi.categories(signal),
      ])
      return { ...products, categories }
    },
    [search],
  )
  const { data, loading, error, retry } = useResource(load)
  function filter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const next = new URLSearchParams()
    for (const key of ['q', 'category', 'minPrice', 'maxPrice']) {
      const value = String(fields.get(key) ?? '').trim()
      if (value) next.set(key, value)
    }
    const min = next.get('minPrice'),
      max = next.get('maxPrice')
    if (min && max && Number(min) > Number(max)) {
      const input = event.currentTarget.elements.namedItem(
        'minPrice',
      ) as HTMLInputElement
      input.setCustomValidity(
        t('Prețul minim trebuie să fie mai mic decât prețul maxim.'),
      )
      input.reportValidity()
      return
    }
    setParams(next)
  }
  return (
    <div className="mx-auto my-0 w-[min(1240px,_90%)] pt-7 pb-16.25">
      <div className="gap-3 flex text-muted text-[0.66rem] mb-6.75 mobile:mb-5 mobile:text-[0.61rem]">
        <Link to="/">{t('Acasă')}</Link>
        <span>/</span>
        {t('Magazin')}
      </div>
      <div className="mx-0 my-9 mobile:mx-0 mobile:my-7">
        <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
          {t('GUSTUL DE ACASĂ')}
        </span>
        <h1 className="mx-0 mt-2.5 mb-3.5">{t('Cămara din Sri Lanka')}</h1>
        <p className="text-muted text-[0.85rem] mb-7.5">
          {t('Găsește ingredientele pentru mesele tale preferate.')}
        </p>
      </div>
      <div className="gap-7.5 grid grid-cols-[245px_minmax(0,_1fr)] tablet:gap-5 tablet:grid-cols-[210px_minmax(0,_1fr)] mobile:block">
        <aside className="p-5.75 border border-border bg-surface rounded-xl self-start mobile:p-5 mobile:mb-7 mobile:[&_form_>_[data-slot=field]]:col-span-full mobile:[&_form_>_[data-slot=filter-label]]:col-span-full mobile:[&_[data-slot=field]]:mb-3 mobile:[&_[data-slot=filter-label]]:mt-2.5">
          <div className="gap-2.25 flex items-center pb-5 border-b border-b-border mb-5.5 mobile:pb-3.5 mobile:mb-3.75">
            <SlidersHorizontal size={18} />
            <h2 className="text-[0.85rem] tracking-normal">
              {t('Filtrează produsele')}
            </h2>
          </div>
          <form
            className="mobile:grid mobile:grid-cols-[1fr_1fr] mobile:gap-y-0 mobile:gap-x-3"
            onSubmit={filter}
            onInput={(event) =>
              (
                event.currentTarget.elements.namedItem(
                  'minPrice',
                ) as HTMLInputElement
              ).setCustomValidity('')
            }
          >
            <FormField
              name="q"
              type="search"
              label={t('Caută produse')}
              maxLength={100}
              defaultValue={params.get('q') ?? ''}
              placeholder={t('Orez, ceai, mirodenii…')}
            />
            <label
              data-slot="filter-label"
              className="mx-0 block text-[0.72rem] font-semibold mt-4.5 mb-2.5"
              htmlFor="category-filter"
            >
              {t('Categorie')}
            </label>
            <select
              className="p-2 w-full bg-surface border border-border text-text text-[0.76rem] min-h-11 rounded-[7px] mobile:col-span-full"
              name="category"
              id="category-filter"
              defaultValue={params.get('category') ?? ''}
            >
              <option value="">{t('Toate produsele')}</option>
              {params.get('category') &&
                !data?.categories.some(
                  (c) => c.slug === params.get('category'),
                ) && (
                  <option value={params.get('category')!}>
                    {params.get('category')}
                  </option>
                )}
              {data?.categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <p
              data-slot="filter-label"
              className="mx-0 block text-[0.72rem] font-semibold mt-4.5 mb-2.5"
            >
              {t('Preț (RON)')}
            </p>
            <div className="gap-2.5 grid grid-cols-[1fr_1fr] mobile:col-span-full">
              <FormField
                label={t('Minim')}
                name="minPrice"
                type="number"
                min="0"
                max="9999999999.99"
                step=".01"
                defaultValue={params.get('minPrice') ?? ''}
                onChange={(event) => event.currentTarget.setCustomValidity('')}
              />
              <FormField
                label={t('Maxim')}
                name="maxPrice"
                type="number"
                min="0"
                max="9999999999.99"
                step=".01"
                defaultValue={params.get('maxPrice') ?? ''}
              />
            </div>
            <Button type="submit" className="w-full">
              <Search size={16} />
              {t('Aplică filtrele')}
            </Button>
            <Link
              className="block text-center text-[0.72rem] underline underline-offset-4 mt-5 mobile:m-0 mobile:self-center"
              to="/shop"
            >
              {t('Resetează filtrele')}
            </Link>
          </form>
        </aside>
        <section
          className="[&_>_[role='status']]:text-[0.8rem] [&_>_[role='status']]:mb-3.75"
          aria-label={t('Produse')}
        >
          <div className="gap-2.5 flex items-center justify-between text-[0.73rem] text-muted mb-5.75">
            <span>
              {data
                ? t('Se afișează {count} produse', { count: data.items.length })
                : t('Produse')}
            </span>
            <span>{t('Prețuri în RON')}</span>
          </div>
          {loading && (
            <>
              <p role="status">{t('Se încarcă produsele…')}</p>
              <ProductGridSkeleton />
            </>
          )}
          {Boolean(error) && (
            <>
              <Notice>
                {t(
                  'Produsele nu au putut fi încărcate. Verifică filtrele sau încearcă din nou.',
                )}
              </Notice>
              <Button variant="secondary" onClick={retry}>
                {t('Încearcă din nou')}
              </Button>
            </>
          )}
          {data && <ProductGrid products={data.items} />}
          {data?.items.length === 0 && (
            <div className="px-5 py-12.5 bg-surface border border-dashed border-border rounded-[14px] text-center [&_>_svg]:mx-auto [&_>_svg]:mt-0 [&_>_svg]:mb-5 [&_>_svg]:text-muted">
              <Search size={32} />
              <h2>{t('Nu am găsit produse')}</h2>
              <p className="mx-0 text-[0.78rem] mt-2.5 mb-6 text-muted">
                {t('Încearcă alți termeni sau resetează filtrele.')}
              </p>
              <Link
                data-slot="button"
                className="px-5 py-3 gap-2.5 min-h-12 inline-flex items-center justify-center border border-border rounded-lg text-[0.76rem] font-bold leading-[1.5] transition-colors duration-150 bg-surface text-brand hover:bg-brand-soft"
                to="/shop"
              >
                {t('Resetează filtrele')}
              </Link>
            </div>
          )}
          <div className="gap-5 flex items-center justify-center mt-7.5 text-[0.76rem]">
            {params.has('after') && (
              <Link
                to={
                  '/shop?' +
                  new URLSearchParams(
                    [...params].filter(([key]) => key !== 'after'),
                  ).toString()
                }
              >
                {t('Prima pagină')}
              </Link>
            )}
            {data?.nextCursor && (
              <Button
                variant="secondary"
                onClick={() => {
                  const next = new URLSearchParams(params)
                  next.set('after', data.nextCursor!)
                  setParams(next)
                }}
              >
                {t('Pagina următoare')}
                <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
