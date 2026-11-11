import { createContext, useContext } from 'react'
import type { Cart } from '../services/cart-api'
import type { MessageKey } from '../../../lib/i18n/messages'

export type CartFeedback = {
  message: MessageKey
  tone: 'success' | 'error'
  signIn?: boolean
} | null
export type CartContextValue = {
  cart: Cart | null
  busy: boolean
  error: unknown
  feedback: CartFeedback
  requireCustomer: () => boolean
  add: (variantId: string, quantity: number) => Promise<void>
  setQuantity: (variantId: string, quantity: number) => Promise<void>
  dismiss: () => void
  refresh: () => void
}
export const CartContext = createContext<CartContextValue | null>(null)
export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('CartProvider is required')
  return value
}
