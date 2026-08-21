import api from '../lib/axios'

export const ownerService = {
  getRestaurant: () => api.get('/owner/restaurant'),
  submitRestaurant: (formData) => api.post('/owner/restaurant', formData, { headers: { 'Content-Type': undefined } }),
  updateRestaurant: (formData) => {
    formData.append('_method', 'PUT')
    return api.post('/owner/restaurant', formData, { headers: { 'Content-Type': undefined } })
  },
  getHours: () => api.get('/owner/restaurant/hours'),
  updateHours: (hours) => api.put('/owner/restaurant/hours', { hours }),

  categories: () => api.get('/owner/categories'),
  createCategory: (payload) => api.post('/owner/categories', payload),
  updateCategory: (id, payload) => api.put(`/owner/categories/${id}`, payload),
  deleteCategory: (id) => api.delete(`/owner/categories/${id}`),

  menuItems: (params) => api.get('/owner/menu-items', { params }),
  createMenuItem: (formData) => api.post('/owner/menu-items', formData, { headers: { 'Content-Type': undefined } }),
  updateMenuItem: (id, formData) => {
    formData.append('_method', 'PUT')
    return api.post(`/owner/menu-items/${id}`, formData, { headers: { 'Content-Type': undefined } })
  },
  deleteMenuItem: (id) => api.delete(`/owner/menu-items/${id}`),
  addVariant: (itemId, payload) => api.post(`/owner/menu-items/${itemId}/variants`, payload),
  updateVariant: (itemId, variantId, payload) => api.put(`/owner/menu-items/${itemId}/variants/${variantId}`, payload),
  deleteVariant: (itemId, variantId) => api.delete(`/owner/menu-items/${itemId}/variants/${variantId}`),

  orders: (params) => api.get('/owner/orders', { params }),
  order: (id) => api.get(`/owner/orders/${id}`),
  updateOrderStatus: (id, payload) => api.patch(`/owner/orders/${id}/status`, payload),

  reviews: (params) => api.get('/owner/reviews', { params }),
  replyReview: (id, owner_reply) => api.patch(`/owner/reviews/${id}/reply`, { owner_reply }),

  coupons: (params) => api.get('/owner/coupons', { params }),
  createCoupon: (payload) => api.post('/owner/coupons', payload),
  updateCoupon: (id, payload) => api.put(`/owner/coupons/${id}`, payload),
  deleteCoupon: (id) => api.delete(`/owner/coupons/${id}`),

  revenue: (params) => api.get('/owner/revenue', { params }),
}
