import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  list: [],
  pagination: { page: 1, per_page: 15, total: 0, last_page: 1 },
  featured: [],
  current: null,
  menu: [],
  filters: { city: null, cuisine_type: null, is_veg: false, min_rating: null, sort: null },
}

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setRestaurants: (state, action) => {
      state.list = action.payload.data
      state.pagination = action.payload.meta
    },
    appendRestaurants: (state, action) => {
      state.list = [...state.list, ...action.payload.data]
      state.pagination = action.payload.meta
    },
    setFeatured: (state, action) => {
      state.featured = action.payload
    },
    setCurrentRestaurant: (state, action) => {
      state.current = action.payload
    },
    setMenu: (state, action) => {
      state.menu = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
  },
})

export const { setRestaurants, appendRestaurants, setFeatured, setCurrentRestaurant, setMenu, setFilters } =
  restaurantSlice.actions
export default restaurantSlice.reducer
