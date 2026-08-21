import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  profile: null,
  availableOrders: [],
  activeOrder: null,
  earnings: null,
  earningsSummary: null,
}

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    setDeliveryProfile: (state, action) => {
      state.profile = action.payload
    },
    setAvailableOrders: (state, action) => {
      state.availableOrders = action.payload
    },
    setActiveOrder: (state, action) => {
      state.activeOrder = action.payload
    },
    setEarnings: (state, action) => {
      state.earnings = action.payload
    },
    setEarningsSummary: (state, action) => {
      state.earningsSummary = action.payload
    },
  },
})

export const { setDeliveryProfile, setAvailableOrders, setActiveOrder, setEarnings, setEarningsSummary } =
  deliverySlice.actions
export default deliverySlice.reducer
