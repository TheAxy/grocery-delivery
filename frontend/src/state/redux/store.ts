import { configureStore } from '@reduxjs/toolkit'
import { appApi } from './api'
import { authReducer } from './authSlice'
import { cartReducer } from './cartSlice'

export const reduxStore = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [appApi.reducerPath]: appApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(appApi.middleware)
})

export type RootState = ReturnType<typeof reduxStore.getState>
export type AppDispatch = typeof reduxStore.dispatch
