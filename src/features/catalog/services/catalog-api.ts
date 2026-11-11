import {
  invalidResponse,
  getApiOrigin,
  isRecord,
  request,
} from '../../../services/api/request'

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
}
export type ProductImage = { url: string; altText: string }
export type ProductSummary = {
  id: string
  categoryId: string
  name: string
  slug: string
  categorySlug: string
  imageUrl: string | null
  imageAltText: string | null
  priceFrom: string
  inStock: boolean
}
export type Variant = {
  id: string
  sku: string
  price: string
  optionValueIds: string[]
  availableStock: number
  availability: 'in_stock' | 'sold_out'
}
export type Product = Omit<
  ProductSummary,
  'imageUrl' | 'imageAltText' | 'priceFrom' | 'inStock'
> & {
  description: string | null
  images: ProductImage[]
  options: {
    id: string
    name: string
    values: { id: string; name: string }[]
  }[]
  variants: Variant[]
}
export const isId = (value: unknown): value is string =>
  typeof value === 'string' && /^[1-9]\d{0,19}$/.test(value)
export const isMoney = (value: unknown): value is string =>
  typeof value === 'string' && /^\d+\.\d{2}$/.test(value)
export const isCount = (value: unknown): value is number =>
  Number.isSafeInteger(value) && Number(value) >= 0
const optionalText = (value: unknown) =>
  value === null || typeof value === 'string'

function productBase(value: unknown) {
  if (
    !isRecord(value) ||
    !isId(value.id) ||
    !isId(value.categoryId) ||
    typeof value.name !== 'string' ||
    typeof value.slug !== 'string' ||
    typeof value.categorySlug !== 'string'
  )
    return invalidResponse()
  return {
    id: value.id,
    categoryId: value.categoryId,
    name: value.name,
    slug: value.slug,
    categorySlug: value.categorySlug,
  }
}

function page<T>(data: unknown, key: string, parse: (item: unknown) => T) {
  if (
    !isRecord(data) ||
    !Array.isArray(data[key]) ||
    !(data.nextCursor === null || isId(data.nextCursor))
  )
    return invalidResponse()
  return { items: data[key].map(parse), nextCursor: data.nextCursor }
}
function category(value: unknown): Category {
  if (
    !isRecord(value) ||
    !isId(value.id) ||
    typeof value.name !== 'string' ||
    typeof value.slug !== 'string' ||
    !optionalText(value.description)
  )
    return invalidResponse()
  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    description: value.description,
  }
}
function summary(value: unknown): ProductSummary {
  const base = productBase(value)
  if (
    !isRecord(value) ||
    !isMoney(value.priceFrom) ||
    typeof value.inStock !== 'boolean' ||
    !optionalText(value.imageUrl ?? null) ||
    !optionalText(value.imageAltText ?? null)
  )
    return invalidResponse()
  return {
    ...base,
    priceFrom: value.priceFrom,
    inStock: value.inStock,
    imageUrl: (value.imageUrl as string | null) ?? null,
    imageAltText: (value.imageAltText as string | null) ?? null,
  }
}
function variant(value: unknown): Variant {
  if (
    !isRecord(value) ||
    !isId(value.id) ||
    typeof value.sku !== 'string' ||
    !isMoney(value.price) ||
    !Array.isArray(value.optionValueIds) ||
    !value.optionValueIds.every(isId) ||
    !isCount(value.availableStock) ||
    !['in_stock', 'sold_out'].includes(String(value.availability))
  )
    return invalidResponse()
  return {
    id: value.id,
    sku: value.sku,
    price: value.price,
    optionValueIds: value.optionValueIds,
    availableStock: value.availableStock,
    availability: value.availability as Variant['availability'],
  }
}
function product(data: unknown): Product {
  const value = isRecord(data) ? data.product : null
  const base = productBase(value)
  if (
    !isRecord(value) ||
    !optionalText(value.description) ||
    !Array.isArray(value.images) ||
    !Array.isArray(value.options) ||
    !Array.isArray(value.variants)
  )
    return invalidResponse()
  const images = value.images.map((image) => {
    if (
      !isRecord(image) ||
      typeof image.url !== 'string' ||
      typeof image.altText !== 'string'
    )
      return invalidResponse()
    return { url: image.url, altText: image.altText }
  })
  const options = value.options.map((option) => {
    if (
      !isRecord(option) ||
      !isId(option.id) ||
      typeof option.name !== 'string' ||
      !Array.isArray(option.values)
    )
      return invalidResponse()
    return {
      id: option.id,
      name: option.name,
      values: option.values.map((choice) => {
        if (
          !isRecord(choice) ||
          !isId(choice.id) ||
          typeof choice.name !== 'string'
        )
          return invalidResponse()
        return { id: choice.id, name: choice.name }
      }),
    }
  })
  return {
    ...base,
    description: value.description,
    images,
    options,
    variants: value.variants.map(variant),
  }
}

export const catalogApi = {
  async categories(signal?: AbortSignal) {
    return page(
      await request('/categories?limit=50', { signal }),
      'categories',
      category,
    ).items
  },
  async products(query: string, signal?: AbortSignal) {
    return page(
      await request('/products?' + query, { signal }),
      'products',
      summary,
    )
  },
  async product(slug: string, signal?: AbortSignal) {
    return product(
      await request('/products/' + encodeURIComponent(slug), { signal }),
    )
  },
}

// Accept managed API image paths and external HTTPS images only.
export function imageUrl(value: string | null): string | undefined {
  if (!value) return undefined
  if (/^\/api\/v1\/product-images\/[a-f0-9-]{36}$/.test(value)) {
    try {
      return getApiOrigin() + value
    } catch {
      return undefined
    }
  }
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' && !url.username && !url.password)
      return url.href
  } catch {
    /* Invalid images use the shared fallback. */
  }
  return undefined
}
