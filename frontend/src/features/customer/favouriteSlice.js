import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  list: [],
}

const favouriteSlice = createSlice({
  name: 'favourite',
  initialState,
  reducers: {
    setFavourites: (state, action) => {
      state.list = action.payload
    },
    addFavourite: (state, action) => {
      state.list.push(action.payload)
    },
    removeFavourite: (state, action) => {
      state.list = state.list.filter((f) => f.restaurant_id !== action.payload)
    },
  },
})

export const { setFavourites, addFavourite, removeFavourite } = favouriteSlice.actions
export default favouriteSlice.reducer
