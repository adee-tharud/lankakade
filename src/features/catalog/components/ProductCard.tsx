import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoaderCircle, Plus } from 'lucide-react'
import { catalogApi, type ProductSummary } from '../services/catalog-api'
import { useCart } from '../../cart/state/cart-context'
import { useLanguage } from '../../../lib/i18n/language-context'
import { Price } from '../../../components/Price'
import { Notice } from '../../../components/Notice'
import { errorMessage } from '../../../services/api/request'
import type { MessageKey } from '../../../lib/i18n/messages'
import { ProductImage } from './ProductImage'

export function ProductCard({ product }: { product: ProductSummary }) {
  const { t } = useLanguage()
  const cart = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<MessageKey | ''>('')
  const href = '/products/' + encodeURIComponent(product.slug)
  async function add() {
    if (!cart.requireCustomer() || loading) return
    setLoading(true)
    setError('')
    try {
      const detail = await catalogApi.product(product.slug)
      if (detail.variants.length !== 1) {
        navigate(href)
        return
      }
      await cart.add(detail.variants[0].id, 1)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setLoading(false)
    }
  }
  return (
    <article
      data-slot="product-card"
      className="flex w-full max-w-[260px] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface"
    >
      <Link
        to={href}
        className="mx-3 mt-2 grid h-32 place-items-center sm:h-36"
        aria-label={product.name}
      >
        <ProductImage
          url={product.imageUrl}
          alt={product.imageAltText || product.name}
          compact
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3 pt-2">
        <span className="text-[8px] leading-3 text-muted uppercase">
          {product.categorySlug.replaceAll('-', ' ')}
        </span>
        <h3 className="text-xs leading-5 wrap-anywhere sm:text-sm">
          <Link to={href} className="hover:underline hover:underline-offset-3">
            {product.name}
          </Link>
        </h3>
        <span
          className={`text-[10px] leading-4 ${product.inStock ? 'text-success' : 'text-muted'}`}
        >
          {product.inStock ? t('În stoc') : t('Stoc epuizat')}
        </span>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <small className="block text-[9px] leading-3 text-muted">
              {t('De la')}
            </small>
            <strong className="text-xs leading-5 sm:text-sm">
              <Price amount={product.priceFrom} />
            </strong>
          </div>
          <button
            type="button"
            className="grid size-8 shrink-0 place-items-center rounded-md bg-accent text-brand-deep transition-colors enabled:hover:bg-accent-hover"
            aria-busy={loading || undefined}
            disabled={loading || !product.inStock || cart.busy}
            onClick={() => void add()}
            aria-label={t('Adaugă în coș') + ' — ' + product.name}
          >
            {loading ? (
              <LoaderCircle
                size={16}
                className="motion-safe:animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Plus size={16} aria-hidden="true" />
            )}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-xs">
            <Notice>{t(error)}</Notice>
          </div>
        )}
      </div>
    </article>
  )
}
