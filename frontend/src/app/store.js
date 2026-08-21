import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/es/storage'

import authReducer from '../features/auth/authSlice'
import cartReducer from '../features/customer/cartSlice'
import orderReducer from '../features/customer/orderSlice'
import restaurantReducer from '../features/customer/restaurantSlice'
import loyaltyReducer from '../features/customer/loyaltySlice'
import favouriteReducer from '../features/customer/favouriteSlice'
import notificationsReducer from '../features/customer/notificationsSlice'
import ownerReducer from '../features/owner/ownerSlice'
import deliveryReducer from '../features/delivery/deliverySlice'
import adminReducer from '../features/admin/adminSlice'
import superadminReducer from '../features/superadmin/superadminSlice'
import uiReducer from '../features/ui/uiSlice'

const authPersistConfig = { key: 'auth', storage }
const cartPersistConfig = { key: 'cart', storage }

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
  order: orderReducer,
  restaurant: restaurantReducer,
  loyalty: loyaltyReducer,
  favourite: favouriteReducer,
  notifications: notificationsReducer,
  owner: ownerReducer,
  delivery: deliveryReducer,
  admin: adminReducer,
  superadmin: superadminReducer,
  ui: uiReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
