import axios from 'axios'

// Este cliente llama a fastapi-orders (puerto 8001)
// El login y el refresh siguen usando fastapi-jwt (puerto 8000)
const ORDERS_URL = 'http://127.0.0.1:8001'
const AUTH_URL   = 'http://127.0.0.1:8000'

const api = axios.create({ baseURL: ORDERS_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) { localStorage.clear(); window.location.href = '/login'; return Promise.reject(error) }
      try {
        const { data } = await axios.post(`${AUTH_URL}/auth/refresh`, { refresh_token: refreshToken })
        localStorage.setItem('access_token', data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api
