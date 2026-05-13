import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const ORDERS_URL = 'http://127.0.0.1:8001'
const AUTH_URL   = 'http://127.0.0.1:8000'

const api = axios.create({ baseURL: ORDERS_URL })

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config!
    if (error.response?.status === 401 && !(original as { _retry?: boolean })._retry) {
      (original as { _retry?: boolean })._retry = true
      const refreshToken = sessionStorage.getItem('refresh_token')
      if (!refreshToken) { sessionStorage.clear(); window.location.href = '/login'; return Promise.reject(error) }
      try {
        const { data } = await axios.post<{ access_token: string }>(
          `${AUTH_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        )
        sessionStorage.setItem('access_token', data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        sessionStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api
