import api from '../lib/axios'

export const deliveryService = {
  profile: () => api.get('/delivery/profile'),
  updateProfile: (formData) => {
    formData.append('_method', 'PUT')
    return api.post('/delivery/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  toggleAvailability: () => api.patch('/delivery/availability'),
  updateLocation: (latitude, longitude) => api.patch('/delivery/location', { latitude, longitude }),

  availableOrders: () => api.get('/delivery/orders/available'),
  acceptOrder: (id) => api.post(`/delivery/orders/${id}/accept`),
  updateOrderStatus: (id, status) => api.patch(`/delivery/orders/${id}/status`, { status }),
  order: (id) => api.get(`/delivery/orders/${id}`),

  history: (params) => api.get('/delivery/history', { params }),
  earnings: (params) => api.get('/delivery/earnings', { params }),
  earningsSummary: () => api.get('/delivery/earnings/summary'),
}
