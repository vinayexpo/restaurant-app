import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  restaurant: null,
  categories: [],
  menuItems: [],
  orders: [],
  ordersPagination: { page: 1, per_page: 15, total: 0, last_page: 1 },
  reviews: [],
  coupons: [],
  revenue: null,
}

const ownerSlice = createSlice({
  name: 'owner',
  initialState,
  reducers: {
    setOwnerRestaurant: (state, action) => {
      state.restaurant = action.payload
    },
    setCategories: (state, action) => {
      state.categories = action.payload
    },
    setMenuItems: (state, action) => {
      state.menuItems = action.payload
    },
    setOwnerOrders: (state, action) => {
      state.orders = action.payload.data
      state.ordersPagination = action.payload.meta
    },
    prependOwnerOrder: (state, action) => {
      state.orders = [action.payload, ...state.orders]
    },
    setOwnerReviews: (state, action) => {
      state.reviews = action.payload
    },
    setOwnerCoupons: (state, action) => {
      state.coupons = action.payload
    },
    setRevenue: (state, action) => {
      state.revenue = action.payload
    },
  },
})

export const {
  setOwnerRestaurant,
  setCategories,
  setMenuItems,
  setOwnerOrders,
  prependOwnerOrder,
  setOwnerReviews,
  setOwnerCoupons,
  setRevenue,
} = ownerSlice.actions
export default ownerSlice.reducer
