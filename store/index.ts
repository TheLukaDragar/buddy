import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import devToolsEnhancer from 'redux-devtools-expo-dev-plugin'
import { persistReducer, persistStore } from 'redux-persist'
import { enhancedApi } from './api/enhancedApi'
import { workoutListenerMiddleware } from './middleware/workoutListenerMiddleware'
import chatSlice from './slices/chatSlice'
import userSlice from './slices/userSlice'
import workoutSlice from './slices/workoutSlice'

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
    workout: workoutSlice,
  },
  devTools: false, // Disable built-in devTools
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
          // Workout slice actions with non-serializable data
          'workout/selectWorkout',
          'workout/completeSet',
        ],
        ignoredActionsPaths: ['payload.timestamp'],
        ignoredPaths: [
          'workout.session.createdAt', 
          'workout.activeWorkout.startTime', 
          'workout.activeWorkout.currentPhaseStartTime',
          'workout.activeWorkout.pauseStartTime',
          'workout.activeWorkout.adjustmentsMade',
          'workout.activeWorkout.lastFeedback.timestamp',
          'workout.session.exercises',
          'workout.activeWorkout.currentExercise',
          'workout.activeWorkout.currentSet',
          'workout.activeWorkout.setsCompleted'
        ],
      },
    })
    .concat(enhancedApi.middleware)
    .concat(workoutListenerMiddleware.middleware),
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(
      devToolsEnhancer({
        name: 'Buddy App Redux Store',
        maxAge: 50, // Keep more actions for workout debugging
        trace: true, // Enable trace for better debugging
        actionsDenylist: [
          // Hide noisy actions from devtools
          'persist/PERSIST',
          'persist/REHYDRATE',
        ],
      })
    ),
})

// Create persistor
export const persistor = persistStore(store);

// Setup listeners for automatic refetching
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 