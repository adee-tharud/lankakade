import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, PackageCheck, HeartHandshake } from 'lucide-react'
import { useLanguage } from '../lib/i18n/language-context'
import { useResource } from '../hooks/use-resource'
import { catalogApi } from '../features/catalog/services/catalog-api'
import { CategoryTiles } from '../features/catalog/components/CategoryTiles'
import {
  ProductGrid,
  ProductGridSkeleton,
} from '../features/catalog/components/ProductGrid'
import { Notice } from '../components/Notice'
import { Button } from '../components/Button'
import hero from '../assets/herosectionphoto.png'

export function HomePage() {
  const { t } = useLanguage()
  const load = useCallback(async (signal: AbortSignal) => {
    const [categories, products] = await Promise.all([
      catalogApi.categories(signal),
      catalogApi.products('limit=4', signal),
    ])
    return { categories, products: products.items }
  }, [])
  const { data, loading, error, retry } = useResource(load)
  return (
    <div>
      <section
        className="relative isolate aspect-[3/1] max-h-[650px] bg-brand-deep bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${hero})` }}
        aria-labelledby="home-heading"
      >
        <h1 id="home-heading" className="sr-only">
          Romania Lanka Kade
        </h1>
        <Link
          to="/shop"
          className="absolute bottom-[12%] left-[6%] inline-flex min-h-10 items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-brand-deep transition-colors hover:bg-accent-hover sm:min-h-12 sm:gap-3 sm:px-5 sm:text-sm"
        >
          {t('Descoperă magazinul')}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
      <div className="mx-auto my-0 w-[min(1240px,_90%)]">
        <section className="px-0 pt-12.5 pb-3 mobile:pt-8">
          <div className="gap-5 flex justify-between items-center mb-6.5 [&_p]:text-muted [&_p]:text-[0.8rem] [&_p]:mt-2.5 mobile:gap-3.5 mobile:items-start mobile:flex-col mobile:[&_p]:text-[0.76rem]">
            <div>
              <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
                {t('UMPLE CĂMARA CU CE IUBEȘTI')}
              </span>
              <h2 className="text-[1.85rem] mt-2 mobile:text-[1.5rem]">
                {t('Explorează categoriile')}
              </h2>
            </div>
            <Link
              className="gap-2.25 flex items-center text-[0.75rem] font-semibold whitespace-nowrap"
              to="/shop"
            >
              {t('Vezi toate produsele')}
              <ArrowRight size={16} />
            </Link>
          </div>
          {data && <CategoryTiles categories={data.categories.slice(0, 6)} />}
        </section>
        <section className="px-0 pt-12.5 pb-3 mobile:pt-8">
          <div className="gap-5 flex justify-between items-center mb-6.5 mobile:gap-3.5 mobile:items-start mobile:flex-col">
            <div>
              <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
                {t('PENTRU BUCĂTĂRIA TA')}
              </span>
              <h2 className="text-[1.85rem] mt-2 mobile:text-[1.5rem]">
                {t('Din cămara Lanka Kade')}
              </h2>
              <p className="text-muted text-[0.8rem] mt-2.5 mobile:text-[0.76rem]">
                {t(
                  'Ingredientele de zi cu zi pentru gusturile de care îți este dor.',
                )}
              </p>
            </div>
            <Link
              className="gap-2.25 flex items-center text-[0.75rem] font-semibold whitespace-nowrap"
              to="/shop"
            >
              {t('Vezi toate produsele')}
              <ArrowRight size={16} />
            </Link>
          </div>
          {loading && (
            <>
              <p role="status" className="sr-only">
                {t('Se încarcă produsele…')}
              </p>
              <ProductGridSkeleton />
            </>
          )}
          {Boolean(error) && (
            <>
              <Notice>{t('Produsele nu au putut fi încărcate.')}</Notice>
              <Button onClick={retry} variant="secondary">
                {t('Încearcă din nou')}
              </Button>
            </>
          )}
          {data && <ProductGrid products={data.products} />}
          {!loading && !error && data?.products.length === 0 && (
            <p className="p-8.75 text-muted text-[0.85rem]">
              {t('Catalogul este în pregătire. Revino în curând.')}
            </p>
          )}
        </section>
        <section className="p-11 mx-0 gap-6.25 mt-13.75 mb-10 bg-brand rounded-2xl text-on-brand flex justify-between items-center [&_>_svg]:text-accent [&_>_svg]:mr-7.5 mobile:p-7 mobile:mx-0 mobile:my-8.75 mobile:[&_>_svg]:hidden">
          <div>
            <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
              {t('MICILE LUCRURI CARE CONTEAZĂ')}
            </span>
            <h2 className="mx-0 text-[clamp(1.7rem,_3vw,_2.7rem)] mt-3.25 mb-2.5 max-w-140">
              {t('O cămară plină de amintiri.')}
            </h2>
            <p className="text-on-brand-muted text-[0.8rem] mb-5.75">
              {t('Descoperă ingredientele pentru următoarea masă împreună.')}
            </p>
            <Link
              data-slot="button"
              className="px-5 py-3 gap-2.5 min-h-12 inline-flex items-center justify-center border border-clear rounded-lg text-[0.76rem] font-bold leading-[1.5] transition-colors duration-150 bg-accent text-brand-deep hover:bg-accent-hover"
              to="/shop"
            >
              {t('Explorează magazinul')}
              <ArrowRight size={18} />
            </Link>
          </div>
          <Leaf size={110} strokeWidth={0.8} aria-hidden="true" />
        </section>
        <section
          className="px-0 gap-6.25 flex justify-between pt-0 pb-11.25 mobile:gap-5.75 mobile:flex-col mobile:pb-8.75"
          aria-label={t('Despre cumpărături')}
        >
          <div className="gap-3.75 flex items-center">
            <Leaf size={25} />
            <div>
              <h3 className="text-[0.83rem]">{t('Selecție din Sri Lanka')}</h3>
              <p className="text-[0.68rem] text-muted mt-0.75">
                {t('Gusturi pe care le cunoști')}
              </p>
            </div>
          </div>
          <div className="gap-3.75 flex items-center">
            <PackageCheck size={25} />
            <div>
              <h3 className="text-[0.83rem]">{t('Cumpărături simple')}</h3>
              <p className="text-[0.68rem] text-muted mt-0.75">
                {t('Preț și disponibilitate la vedere')}
              </p>
            </div>
          </div>
          <div className="gap-3.75 flex items-center">
            <HeartHandshake size={25} />
            <div>
              <h3 className="text-[0.83rem]">{t('Mai aproape de casă')}</h3>
              <p className="text-[0.68rem] text-muted mt-0.75">
                {t('O comunitate în România')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
