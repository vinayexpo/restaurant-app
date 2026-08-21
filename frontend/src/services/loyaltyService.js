import api from '../lib/axios'

export const loyaltyService = {
  summary: () => api.get('/loyalty'),
  transactions: (params) => api.get('/loyalty/transactions', { params }),
  redeem: (points) => api.post('/loyalty/redeem', { points }),
  tiers: () => api.get('/loyalty/tiers'),
}
