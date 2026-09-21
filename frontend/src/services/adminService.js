import api from '../lib/axios'

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),

  createRestaurantOwner: (payload) => api.post('/admin/users', payload),
  users: (params) => api.get('/admin/users', { params }),
  user: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, payload) => api.patch(`/admin/users/${id}`, payload),
  activateUser: (id) => api.patch(`/admin/users/${id}/activate`),
  deactivateUser: (id) => api.patch(`/admin/users/${id}/deactivate`),

  restaurants: (params) => api.get('/admin/restaurants', { params }),
  restaurant: (id) => api.get(`/admin/restaurants/${id}`),
  approveRestaurant: (id) => api.patch(`/admin/restaurants/${id}/approve`),
  rejectRestaurant: (id, rejection_reason) => api.patch(`/admin/restaurants/${id}/reject`, { rejection_reason }),
  suspendRestaurant: (id, reason) => api.patch(`/admin/restaurants/${id}/suspend`, { reason }),
  toggleFeatured: (id) => api.patch(`/admin/restaurants/${id}/feature`),

  orders: (params) => api.get('/admin/orders', { params }),
  order: (id) => api.get(`/admin/orders/${id}`),

  deliveryPartners: (params) => api.get('/admin/delivery-partners', { params }),
  verifyDeliveryPartner: (id) => api.patch(`/admin/delivery-partners/${id}/verify`),
  suspendDeliveryPartner: (id) => api.patch(`/admin/delivery-partners/${id}/suspend`),
  deliveryPayouts: (params) => api.get('/admin/delivery-payouts', { params }),
  approveDeliveryPayout: (id) => api.patch(`/admin/delivery-payouts/${id}/approve`),
  rejectDeliveryPayout: (id, reason) => api.patch(`/admin/delivery-payouts/${id}/reject`, { reason }),

  coupons: (params) => api.get('/admin/coupons', { params }),
  createCoupon: (payload) => api.post('/admin/coupons', payload),
  updateCoupon: (id, payload) => api.put(`/admin/coupons/${id}`, payload),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  loyaltyConfig: () => api.get('/admin/loyalty/config'),
  updateLoyaltyConfig: (payload) => api.put('/admin/loyalty/config', payload),
  loyaltyTiers: () => api.get('/admin/loyalty/tiers'),
  createLoyaltyTier: (payload) => api.post('/admin/loyalty/tiers', payload),
  updateLoyaltyTier: (id, payload) => api.put(`/admin/loyalty/tiers/${id}`, payload),
  deleteLoyaltyTier: (id) => api.delete(`/admin/loyalty/tiers/${id}`),
  grantLoyaltyBonus: (payload) => api.post('/admin/loyalty/bonus', payload),

  broadcastNotification: (payload) => api.post('/admin/notifications/broadcast', payload),

  settings: () => api.get('/admin/settings'),
  updateSetting: (key, payload) => api.put(`/admin/settings/${key}`, payload),

  revenueReport: (params) => api.get('/admin/reports/revenue', { params }),
  ordersReport: (params) => api.get('/admin/reports/orders', { params }),
}
