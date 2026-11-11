import {
  invalidResponse,
  isRecord,
  request,
} from '../../../services/api/request'

export type Customer = {
  id: string
  email: string
  fullName: string
  phone: string | null
  role: 'customer'
  emailVerifiedAt: string | null
  createdAt: string
}

export type Address = {
  id: string
  label: string | null
  recipientName: string
  recipientPhone: string
  addressLine1: string
  addressLine2: string | null
  locality: string
  region: string
  postalCode: string
  countryCode: string
}
export type AddressInput = Omit<Address, 'id'>
const isId = (value: unknown): value is string =>
  typeof value === 'string' && /^[1-9]\d{0,19}$/.test(value)
const optionalString = (value: unknown) =>
  value === null || typeof value === 'string'

function customer(data: unknown): Customer {
  const user = isRecord(data) ? data.user : null
  if (
    !isRecord(user) ||
    !isId(user.id) ||
    user.role !== 'customer' ||
    typeof user.email !== 'string' ||
    typeof user.fullName !== 'string' ||
    !optionalString(user.phone) ||
    !optionalString(user.emailVerifiedAt) ||
    typeof user.createdAt !== 'string'
  )
    return invalidResponse()
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
  }
}

function address(value: unknown): Address {
  const fields = [
    'recipientName',
    'recipientPhone',
    'addressLine1',
    'locality',
    'region',
    'postalCode',
    'countryCode',
  ]
  if (
    !isRecord(value) ||
    !isId(value.id) ||
    !optionalString(value.label) ||
    !optionalString(value.addressLine2) ||
    !fields.every((field) => typeof value[field] === 'string')
  )
    return invalidResponse()
  return {
    id: value.id,
    label: value.label,
    recipientName: String(value.recipientName),
    recipientPhone: String(value.recipientPhone),
    addressLine1: String(value.addressLine1),
    addressLine2: value.addressLine2,
    locality: String(value.locality),
    region: String(value.region),
    postalCode: String(value.postalCode),
    countryCode: String(value.countryCode),
  }
}

export const accountApi = {
  async profile(signal?: AbortSignal) {
    return customer(await request('/account', { signal }))
  },
  async updateProfile(body: { fullName: string; phone: string | null }) {
    return customer(await request('/account', { method: 'PATCH', body }))
  },
  async addresses(signal?: AbortSignal) {
    const data = await request('/account/addresses', { signal })
    if (!isRecord(data) || !Array.isArray(data.addresses))
      return invalidResponse()
    return data.addresses.map(address)
  },
  async saveAddress(body: AddressInput, id?: string) {
    const data = await request(
      id
        ? `/account/addresses/${encodeURIComponent(id)}`
        : '/account/addresses',
      {
        method: id ? 'PUT' : 'POST',
        body,
      },
    )
    return address(isRecord(data) ? data.address : null)
  },
  removeAddress(id: string) {
    return request(`/account/addresses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },
}
