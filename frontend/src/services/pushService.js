import api from '../lib/axios'

export const pushService = {
  subscribe: (subscription) => api.post('/push-subscriptions', subscription),
  unsubscribe: (endpoint) => api.delete('/push-subscriptions', { data: { endpoint } }),
  unreadCount: () => api.get('/notifications/unread-count'),
  list: (params = {}) => api.get('/notifications', { params: typeof params === 'number' ? { page: params } : params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
}
