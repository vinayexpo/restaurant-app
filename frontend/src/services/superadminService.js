import api from '../lib/axios'

export const superadminService = {
  admins: (params) => api.get('/superadmin/admins', { params }),
  createAdmin: (payload) => api.post('/superadmin/admins', payload),
  updateAdmin: (id, payload) => api.put(`/superadmin/admins/${id}`, payload),
  deleteAdmin: (id) => api.delete(`/superadmin/admins/${id}`),

  commissions: () => api.get('/superadmin/commissions'),
  createCommission: (payload) => api.post('/superadmin/commissions', payload),
  updateCommission: (id, payload) => api.put(`/superadmin/commissions/${id}`, payload),
  deleteCommission: (id) => api.delete(`/superadmin/commissions/${id}`),

  auditLogs: (params) => api.get('/superadmin/audit-logs', { params }),

  impersonate: (userId) => api.post(`/superadmin/impersonate/${userId}`),
  stopImpersonation: () => api.delete('/superadmin/impersonate'),

  financials: (params) => api.get('/superadmin/financials', { params }),

  featureFlags: () => api.get('/superadmin/feature-flags'),
  updateFeatureFlag: (key, value) => api.put(`/superadmin/feature-flags/${key}`, { value }),

  settings: () => api.get('/superadmin/settings'),
  updateSetting: (key, payload) => api.put(`/superadmin/settings/${key}`, payload),
}
