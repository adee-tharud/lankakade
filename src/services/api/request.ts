import type { MessageKey } from '../../lib/i18n/messages'
type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: object
  signal?: AbortSignal
}

export class ApiError extends Error {
  code: string
  status: number
  field?: string
  messageKey: MessageKey
  constructor(code: string, message: MessageKey, status = 0, field?: string) {
    super(message)
    this.messageKey = message
    this.code = code
    this.status = status
    this.field = field
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function getApiOrigin(): string {
  const value = import.meta.env.VITE_API_ORIGIN?.trim()
  if (!value) return ''
  try {
    const url = new URL(value)
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    if (
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash ||
      (url.protocol !== 'https:' && !(local && url.protocol === 'http:'))
    )
      throw new Error()
    return url.origin
  } catch {
    throw new ApiError(
      'CONFIGURATION',
      'Serviciul este configurat incorect. Încearcă din nou mai târziu.',
    )
  }
}

let onSessionExpired = () => {}
export function handleSessionExpiry(handler: () => void) {
  onSessionExpired = handler
}

export async function request(
  path: string,
  options: RequestOptions = {},
): Promise<unknown> {
  const origin = getApiOrigin()
  let response: Response
  try {
    response = await fetch(`${origin}/api/v1${path}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      cache: 'no-store',
      redirect: 'error',
      headers: options.body
        ? { 'Content-Type': 'application/json' }
        : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal
        ? AbortSignal.any([options.signal, AbortSignal.timeout(12000)])
        : AbortSignal.timeout(12000),
    })
  } catch {
    throw new ApiError(
      'NETWORK_ERROR',
      'Nu am putut contacta magazinul. Verifică conexiunea și încearcă din nou.',
    )
  }
  if (response.status === 204 || response.status === 202) {
    if (response.ok) return null
  }
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const code =
      isRecord(data) && typeof data.error === 'string'
        ? data.error
        : 'REQUEST_FAILED'
    const field =
      isRecord(data) && typeof data.field === 'string' ? data.field : undefined
    if (response.status === 401 && !path.startsWith('/auth/'))
      onSessionExpired()
    throw new ApiError(
      code,
      errorMessages[code] ?? 'Nu am putut finaliza cererea. Încearcă din nou.',
      response.status,
      field,
    )
  }
  return data
}

const errorMessages: Record<string, MessageKey> = {
  CART_STOCK_CHANGED:
    'Disponibilitatea s-a schimbat. Verifică produsul și cantitatea.',
  CART_LIMIT: 'Coșul poate conține cel mult 50 de produse diferite.',

  INVALID_CREDENTIALS:
    'Adresa de e-mail sau parola este incorectă. Verifică și dacă ai confirmat adresa de e-mail.',
  AUTHENTICATION_REQUIRED: 'Sesiunea a expirat. Autentifică-te din nou.',
  INVALID_OR_EXPIRED_TOKEN:
    'Linkul este invalid sau a expirat. Solicită un link nou.',
  INVALID_INPUT: 'Verifică informațiile introduse și încearcă din nou.',
  RATE_LIMITED:
    'Prea multe încercări. Așteaptă puțin înainte de a încerca din nou.',
  ADDRESS_LIMIT:
    'Poți salva cel mult 20 de adrese. Șterge o adresă înainte de a adăuga alta.',
  NOT_FOUND: 'Adresa nu mai este disponibilă. Reîncarcă lista de adrese.',
  ORIGIN_NOT_ALLOWED:
    'Cererea nu a putut fi autorizată. Încearcă din nou din pagina magazinului.',
  SERVICE_UNAVAILABLE:
    'Serviciul este temporar indisponibil. Încearcă din nou în câteva momente.',
}

export function errorMessage(error: unknown): MessageKey {
  return error instanceof ApiError
    ? error.messageKey
    : 'A apărut o problemă. Încearcă din nou.'
}

export function invalidResponse(): never {
  throw new ApiError(
    'INVALID_RESPONSE',
    'Răspunsul magazinului nu a putut fi citit. Încearcă din nou.',
  )
}
