import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cart: null,
  items: [],
  restaurantId: null,
  subtotal: 0,
  totalItems: 0,
  pricingPreview: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      const { cart, pricing_preview } = action.payload ?? {}
      state.cart = cart ?? null
      state.items = cart?.items ?? []
      state.restaurantId = cart?.restaurant_id ?? null
      state.pricingPreview = pricing_preview ?? null
      state.subtotal = pricing_preview?.subtotal ?? 0
      state.totalItems = (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0)
    },
    clearCart: (state) => {
      state.cart = null
      state.items = []
      state.restaurantId = null
      state.subtotal = 0
      state.totalItems = 0
      state.pricingPreview = null
    },
  },
})

export const { setCart, clearCart } = cartSlice.actions
export default cartSlice.reducer
