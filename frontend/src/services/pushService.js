import api from '../lib/axios'

export const pushService = {
  subscribe: (subscription) => api.post('/push-subscriptions', subscription),
  unsubscribe: (endpoint) => api.delete('/push-subscriptions', { data: { endpoint } }),
}
