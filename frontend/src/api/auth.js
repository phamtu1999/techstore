import api from '../utils/axios'

const normalizeBaseUrl = (url) => {
  if (!url) return ''
  return url.trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '')
}

export const authAPI = {
  login: (credentials) => api.post('/auth/authenticate', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/password/forgot', { email }),
  resetPassword: (data) => api.post('/auth/password/reset', data),
  verifyPassword: (password) => api.post('/auth/password/verify', { password }),
  googleLogin: () => {
    const baseUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL || 'http://localhost:3000')
    const url = `${baseUrl}/api/v1/auth/google`
    window.location.href = url
  },
}
