import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentOrder: null,
  orders: [],
  pagination: { page: 1, per_page: 15, total: 0, last_page: 1 },
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
    setOrders: (state, action) => {
      state.orders = action.payload.data
      state.pagination = action.payload.meta
    },
    appendOrders: (state, action) => {
      state.orders = [...state.orders, ...action.payload.data]
      state.pagination = action.payload.meta
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload
      if (state.currentOrder?.id === orderId) {
        state.currentOrder.status = status
      }
      const order = state.orders.find((o) => o.id === orderId)
      if (order) order.status = status
    },
  },
})

export const { setCurrentOrder, setOrders, appendOrders, updateOrderStatus } = orderSlice.actions
export default orderSlice.reducer
