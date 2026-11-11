import { useState } from 'react'
import { PackageOpen } from 'lucide-react'
import { imageUrl } from '../services/catalog-api'
import { useLanguage } from '../../../lib/i18n/language-context'

export function ProductImage({
  url,
  alt,
  eager = false,
  compact = false,
}: {
  url: string | null
  alt: string
  eager?: boolean
  compact?: boolean
}) {
  const { t } = useLanguage()
  const src = imageUrl(url)
  const [failed, setFailed] = useState<string | null>(null)
  return (
    <div
      data-slot="product-image"
      className={`grid place-items-center overflow-hidden ${compact ? 'h-full w-full max-w-36' : 'aspect-[4/3] bg-muted-surface'}`}
    >
      {src && failed !== src ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className={`block size-full object-contain ${compact ? '' : 'p-2.5'}`}
          onError={() => setFailed(src)}
        />
      ) : (
        <div className="grid justify-items-center gap-3 p-3 text-center text-[10px] text-muted">
          <PackageOpen size={compact ? 28 : 38} aria-hidden="true" />
          <span>{t('Imagine indisponibilă')}</span>
        </div>
      )}
    </div>
  )
}
