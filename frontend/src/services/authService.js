import api from '../lib/axios'

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  superadminBootstrapStatus: () => api.get('/superadmin/bootstrap-status'),
  createFirstSuperadmin: (payload) => api.post('/superadmin/bootstrap', payload),
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
  deleteAccount: (payload) => api.delete('/auth/account', { data: payload }),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
}
