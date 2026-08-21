import api from '../lib/axios'

export const cartService = {
  get: () => api.get('/cart'),
  addItem: (payload) => api.post('/cart/items', payload),
  updateItem: (id, payload) => api.put(`/cart/items/${id}`, payload),
  removeItem: (id) => api.delete(`/cart/items/${id}`),
  clear: () => api.delete('/cart'),
  validateCoupon: (code) => api.post('/coupons/validate', { code }),
}
