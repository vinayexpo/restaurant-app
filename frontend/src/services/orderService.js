import api from '../lib/axios'

export const orderService = {
  list: (params) => api.get('/orders', { params }),
  show: (id) => api.get(`/orders/${id}`),
  cancel: (id, reason) => api.patch(`/orders/${id}/cancel`, { reason }),
  reorder: (id) => api.post(`/orders/${id}/reorder`),
  rateDelivery: (id, payload) => api.post(`/orders/${id}/rate-delivery`, payload),
  paymentInitiate: (payload) => api.post('/payment/initiate', payload),
  paymentVerify: (payload) => api.post('/payment/verify', payload),
}
