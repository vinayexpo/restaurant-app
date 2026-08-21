import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  balance: 0,
  lifetimeEarned: 0,
  tier: null,
  nextTier: null,
  pointsToNextTier: 0,
  nextExpiry: null,
  transactions: [],
  pagination: { page: 1, per_page: 15, total: 0, last_page: 1 },
}

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState,
  reducers: {
    setLoyaltySummary: (state, action) => {
      const { balance, lifetime_earned, tier, next_tier, points_to_next_tier, next_expiry } = action.payload
      state.balance = balance
      state.lifetimeEarned = lifetime_earned
      state.tier = tier
      state.nextTier = next_tier
      state.pointsToNextTier = points_to_next_tier
      state.nextExpiry = next_expiry
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload.data
      state.pagination = action.payload.meta
    },
  },
})

export const { setLoyaltySummary, setTransactions } = loyaltySlice.actions
export default loyaltySlice.reducer
