import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  admins: [],
  commissions: [],
  auditLogs: [],
  auditLogsPagination: { page: 1, per_page: 25, total: 0, last_page: 1 },
  financials: null,
  featureFlags: null,
  settings: [],
  impersonating: null,
}

const superadminSlice = createSlice({
  name: 'superadmin',
  initialState,
  reducers: {
    setAdmins: (state, action) => {
      state.admins = action.payload.data
    },
    setCommissions: (state, action) => {
      state.commissions = action.payload
    },
    setAuditLogs: (state, action) => {
      state.auditLogs = action.payload.data
      state.auditLogsPagination = action.payload.meta
    },
    setFinancials: (state, action) => {
      state.financials = action.payload
    },
    setFeatureFlags: (state, action) => {
      state.featureFlags = action.payload
    },
    setSuperadminSettings: (state, action) => {
      state.settings = action.payload
    },
    setImpersonating: (state, action) => {
      state.impersonating = action.payload
    },
  },
})

export const {
  setAdmins,
  setCommissions,
  setAuditLogs,
  setFinancials,
  setFeatureFlags,
  setSuperadminSettings,
  setImpersonating,
} = superadminSlice.actions
export default superadminSlice.reducer
