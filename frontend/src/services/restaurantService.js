import api from '../lib/axios'

export const restaurantService = {
  list: (params) => api.get('/restaurants', { params }),
  featured: () => api.get('/restaurants/featured'),
  search: (q, params = {}) => api.get('/restaurants/search', { params: { q, ...params } }),
  autocomplete: (q) => api.get('/restaurants/autocomplete', { params: { q } }),
  show: (slug) => api.get(`/restaurants/${slug}`),
  menu: (restaurantId) => api.get(`/restaurants/${restaurantId}/menu`),
  reviews: (restaurantId, params) => api.get(`/restaurants/${restaurantId}/reviews`, { params }),
}
