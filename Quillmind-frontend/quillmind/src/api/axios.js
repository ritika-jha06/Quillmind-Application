import axios from 'axios'
import { store } from '@/store'
import { logout } from '@/store/slices/authSlice'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 180000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout())
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
