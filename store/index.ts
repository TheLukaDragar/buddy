import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { enhancedApi } from './api/enhancedApi'
import chatSlice from './slices/chatSlice'
import userSlice from './slices/userSlice'

export const store = configureStore({
  reducer: {
    [enhancedApi.reducerPath]: enhancedApi.reducer,
    user: userSlice,
    chat: chatSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [enhancedApi.util.resetApiState.type],
      },
    }).concat(enhancedApi.middleware),
})

// Setup listeners for automatic refetching
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 