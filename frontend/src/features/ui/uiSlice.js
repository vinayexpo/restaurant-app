import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cartOpen: false,
  mobileNavOpen: false,
  toasts: [],
  settings: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCart: (state) => {
      state.cartOpen = true
    },
    closeCart: (state) => {
      state.cartOpen = false
    },
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen
    },
    toggleMobileNav: (state) => {
      state.mobileNavOpen = !state.mobileNavOpen
    },
    closeMobileNav: (state) => {
      state.mobileNavOpen = false
    },
    setSettings: (state, action) => {
      state.settings = action.payload
    },
  },
})

export const { openCart, closeCart, toggleCart, toggleMobileNav, closeMobileNav, setSettings } = uiSlice.actions
export default uiSlice.reducer
