import {
  invalidResponse,
  isRecord,
  request,
} from '../../../services/api/request'

export const authApi = {
  async login(body: { email: string; password: string }) {
    const result = await request('/auth/login', { method: 'POST', body })
    if (
      !isRecord(result) ||
      !isRecord(result.user) ||
      result.user.role !== 'customer' ||
      typeof result.user.id !== 'string'
    )
      invalidResponse()
  },
  register(body: { email: string; fullName: string; password: string }) {
    return request('/auth/register', { method: 'POST', body })
  },
  sendVerification(email: string) {
    return request('/auth/send-verification', {
      method: 'POST',
      body: { email },
    })
  },
  verifyEmail(token: string) {
    return request('/auth/verify-email', { method: 'POST', body: { token } })
  },
  forgotPassword(email: string) {
    return request('/auth/forgot-password', { method: 'POST', body: { email } })
  },
  resetPassword(token: string, password: string) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    })
  },
  logout() {
    return request('/auth/logout', { method: 'POST' })
  },
}
