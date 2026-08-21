import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  dashboard: null,
  users: [],
  usersPagination: { page: 1, per_page: 15, total: 0, last_page: 1 },
  restaurants: [],
  restaurantsPagination: { page: 1, per_page: 15, total: 0, last_page: 1 },
  orders: [],
  deliveryPartners: [],
  coupons: [],
  loyaltyConfig: null,
  loyaltyTiers: [],
  settings: [],
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setDashboard: (state, action) => {
      state.dashboard = action.payload
    },
    setUsers: (state, action) => {
      state.users = action.payload.data
      state.usersPagination = action.payload.meta
    },
    setAdminRestaurants: (state, action) => {
      state.restaurants = action.payload.data
      state.restaurantsPagination = action.payload.meta
    },
    setAdminOrders: (state, action) => {
      state.orders = action.payload.data
    },
    setDeliveryPartners: (state, action) => {
      state.deliveryPartners = action.payload.data
    },
    setAdminCoupons: (state, action) => {
      state.coupons = action.payload.data
    },
    setLoyaltyConfig: (state, action) => {
      state.loyaltyConfig = action.payload
    },
    setLoyaltyTiers: (state, action) => {
      state.loyaltyTiers = action.payload
    },
    setAdminSettings: (state, action) => {
      state.settings = action.payload
    },
  },
})

export const {
  setDashboard,
  setUsers,
  setAdminRestaurants,
  setAdminOrders,
  setDeliveryPartners,
  setAdminCoupons,
  setLoyaltyConfig,
  setLoyaltyTiers,
  setAdminSettings,
} = adminSlice.actions
export default adminSlice.reducer
