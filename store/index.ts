import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { persistReducer, persistStore } from 'redux-persist'
import { enhancedApi } from './api/enhancedApi'
import chatSlice from './slices/chatSlice'
import userSlice from './slices/userSlice'

// Configure persistence for user slice
const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
  whitelist: ['extractedProfile', 'profileGenerated', 'onboardingAnswers'], // Only persist these fields
};

const persistedUserReducer = persistReducer(userPersistConfig, userSlice);

export const store = configureStore({
  reducer: {
    [enhancedApi.reducerPath]: enhancedApi.reducer,
    user: persistedUserReducer,
    chat: chatSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          enhancedApi.util.resetApiState.type, 
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'user/generateProfileFromAnswers/pending',
          'user/generateProfileFromAnswers/fulfilled',
          'user/generateProfileFromAnswers/rejected',
        ],
      },
    }).concat(enhancedApi.middleware),
})

// Create persistor
export const persistor = persistStore(store);

// Setup listeners for automatic refetching
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 