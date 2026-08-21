import api from '../lib/axios'

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (payload) => {
    if (payload instanceof FormData) {
      payload.append('_method', 'PUT')
      return api.post('/auth/profile', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    return api.put('/auth/profile', payload)
  },
  changePassword: (payload) => api.put('/auth/password', payload),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  resendVerification: () => api.post('/auth/email/resend'),
}
