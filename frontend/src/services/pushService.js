import api from '../lib/axios'

export const pushService = {
  subscribe: (subscription) => api.post('/push-subscriptions', subscription),
  unsubscribe: (endpoint) => api.delete('/push-subscriptions', { data: { endpoint } }),
  unreadCount: () => api.get('/notifications/unread-count'),
  list: (page = 1) => api.get('/notifications', { params: { page } }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
}
