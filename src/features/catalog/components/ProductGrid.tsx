import type { ProductSummary } from '../services/catalog-api'
import { ProductCard } from './ProductCard'

const gridClassName =
  'grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,260px)] sm:justify-start sm:gap-4'

export function ProductGrid({ products }: { products: ProductSummary[] }) {
  return (
    <div className={gridClassName}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
export function ProductGridSkeleton() {
  return (
    <div className={gridClassName} aria-hidden="true">
      {[0, 1, 2, 3].map((key) => (
        <div
          key={key}
          className="w-full max-w-[260px] rounded-xl border border-border bg-surface p-3 motion-safe:animate-pulse"
        >
          <div className="mx-auto h-32 w-full max-w-36 rounded-md bg-muted-surface sm:h-36" />
          <div className="mt-3 h-3 w-2/3 rounded bg-muted-surface" />
          <div className="mt-2 h-5 w-4/5 rounded bg-muted-surface" />
          <div className="mt-4 h-8 rounded bg-muted-surface" />
        </div>
      ))}
    </div>
  )
}
