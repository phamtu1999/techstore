import axios from 'axios'

const normalizeBaseUrl = (url) => {
  if (!url) return ''
  return url.trim().replace(/\/+$/, '')
}

const getBaseURL = () => {
  const envUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL)
  if (envUrl) return `${envUrl}/api/v1`

  return 'http://localhost:3000/api/v1'
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  withCredentials: true, // Crucial for HttpOnly Cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


// Response interceptor to handle errors and status codes
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const publicPaths = [
      '/public/',
      '/settings',
      '/auth/',
      '/products',
      '/categories',
      '/brands',
      '/recommendations',
      '/trending',
      '/flash-sales',
      '/coupons/validate'
    ]
    const isPublicPath = publicPaths.some(path => error.config?.url?.includes(path))
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(error.config?.method?.toUpperCase())

    if (error.response?.status === 401 && (!isPublicPath || isMutation)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
