import {
  invalidResponse,
  isRecord,
  request,
} from '../../../services/api/request'
import { isCount, isId, isMoney } from '../../catalog/services/catalog-api'

export type CartItem = {
  variantId: string
  productName: string
  productSlug: string
  sku: string
  quantity: number
  unitPrice: string | null
  availableStock: number
  availability: 'in_stock' | 'sold_out' | 'unavailable'
}
export type Cart = { revision: string; currency: 'RON'; items: CartItem[] }
function cart(data: unknown): Cart {
  const value = isRecord(data) ? data.cart : null
  if (
    !isRecord(value) ||
    typeof value.revision !== 'string' ||
    !/^\d+$/.test(value.revision) ||
    value.currency !== 'RON' ||
    !Array.isArray(value.items)
  )
    return invalidResponse()
  const items = value.items.map((item) => {
    if (
      !isRecord(item) ||
      !isId(item.variantId) ||
      typeof item.productName !== 'string' ||
      typeof item.productSlug !== 'string' ||
      typeof item.sku !== 'string' ||
      !isCount(item.quantity) ||
      item.quantity < 1 ||
      !isCount(item.availableStock) ||
      !(item.unitPrice === null || isMoney(item.unitPrice)) ||
      !['in_stock', 'sold_out', 'unavailable'].includes(
        String(item.availability),
      )
    )
      return invalidResponse()
    return {
      variantId: item.variantId,
      productName: item.productName,
      productSlug: item.productSlug,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      availableStock: item.availableStock,
      availability: item.availability as CartItem['availability'],
    }
  })
  return { revision: value.revision, currency: 'RON', items }
}
export const cartApi = {
  async get(signal?: AbortSignal) {
    return cart(await request('/cart', { signal }))
  },
  async setQuantity(id: string, quantity: number) {
    return cart(
      await request('/cart/items/' + encodeURIComponent(id), {
        method: quantity === 0 ? 'DELETE' : 'PUT',
        body: quantity === 0 ? undefined : { quantity },
      }),
    )
  },
}
