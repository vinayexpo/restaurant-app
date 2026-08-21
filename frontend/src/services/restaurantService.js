import api from '../lib/axios'

export const restaurantService = {
  list: (params) => api.get('/restaurants', { params }),
  featured: () => api.get('/restaurants/featured'),
  search: (q) => api.get('/restaurants/search', { params: { q } }),
  autocomplete: (q) => api.get('/restaurants/autocomplete', { params: { q } }),
  show: (slug) => api.get(`/restaurants/${slug}`),
  menu: (restaurantId) => api.get(`/restaurants/${restaurantId}/menu`),
  reviews: (restaurantId, params) => api.get(`/restaurants/${restaurantId}/reviews`, { params }),
}
