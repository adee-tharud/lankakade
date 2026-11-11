import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useAppSelector } from '../../../app/store'
import { useResource } from '../../../hooks/use-resource'
import { ApiError } from '../../../services/api/request'
import { cartApi, type Cart } from '../services/cart-api'
import { CartContext, type CartFeedback } from '../state/cart-context'

export function CartProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAppSelector((state) => state.session)
  const [updatedCart, setUpdatedCart] = useState<Cart | null>(null)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<CartFeedback>(null)
  const active = useRef(false)
  const customerId = user?.id
  const load = useCallback(
    async (signal: AbortSignal) => (customerId ? cartApi.get(signal) : null),
    [customerId],
  )
  const resource = useResource(load)
  function requireCustomer() {
    if (status === 'authenticated') return true
    if (status === 'checking')
      setFeedback({ message: 'Se verifică sesiunea…', tone: 'error' })
    else if (status === 'unavailable')
      setFeedback({
        message:
          'Nu am putut verifica sesiunea. Încearcă din nou pentru a-ți accesa contul.',
        tone: 'error',
      })
    else
      setFeedback({
        message: 'Trebuie să te autentifici mai întâi.',
        tone: 'error',
        signIn: true,
      })
    return false
  }
  async function change(id: string, quantity: number, add: boolean) {
    if (!requireCustomer() || active.current) return
    active.current = true
    setBusy(true)
    setFeedback(null)
    try {
      let next = quantity
      if (add) {
        const current = await cartApi.get()
        next +=
          current.items.find((item) => item.variantId === id)?.quantity ?? 0
      }
      if (next > 99)
        throw new ApiError(
          'CART_LIMIT',
          'Poți adăuga cel mult 99 de bucăți dintr-un produs.',
        )
      setUpdatedCart(await cartApi.setQuantity(id, next))
      setFeedback({
        message: add
          ? 'Produsul a fost adăugat în coș.'
          : 'Coșul a fost actualizat.',
        tone: 'success',
      })
    } catch (failure) {
      setFeedback({
        message:
          failure instanceof ApiError
            ? failure.messageKey
            : 'A apărut o problemă. Încearcă din nou.',
        tone: 'error',
      })
      try {
        setUpdatedCart(await cartApi.get())
      } catch {
        /* Keep the last confirmed cart and show the failure. */
      }
    } finally {
      active.current = false
      setBusy(false)
    }
  }
  return (
    <CartContext.Provider
      value={{
        cart: updatedCart ?? resource.data,
        busy,
        error: updatedCart ? null : resource.error,
        feedback,
        requireCustomer,
        add: (id, quantity) => change(id, quantity, true),
        setQuantity: (id, quantity) => change(id, quantity, false),
        dismiss: () => setFeedback(null),
        refresh: () => {
          setUpdatedCart(null)
          resource.retry()
        },
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
