import axios from 'axios'
import { store } from '../app/store'
import { logout } from '../features/auth/authSlice'
import toast from 'react-hot-toast'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      store.dispatch(logout())
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/login')) {
        window.location.href = '/auth/login'
      }
    } else if (status === 422) {
      const errors = error.response?.data?.errors ?? {}
      const firstError = Object.values(errors)[0]?.[0]
      if (firstError) toast.error(firstError)
    } else if (status === 429) {
      toast.error('Too many requests. Please wait a moment.')
    } else if (status >= 500) {
      toast.error('Something went wrong. Please try again.')
    } else if (status === 403) {
      toast.error(error.response?.data?.message || 'You are not authorized to do that.')
    }

    return Promise.reject(error)
  }
)

export default api
