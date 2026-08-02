import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import devToolsEnhancer from 'redux-devtools-expo-dev-plugin'
import { persistReducer, persistStore } from 'redux-persist'
import { enhancedApi } from './api/enhancedApi'
import { fitnessApi } from './api/fitnessApi'
import { spotifyApi } from './api/spotifyApi'
import { workoutListenerMiddleware } from './middleware/workoutListenerMiddleware'
import chatSlice from './slices/chatSlice'
import fitnessPlayerSlice from './slices/fitnessPlayerSlice'
import musicSlice from './slices/musicSlice'
import spotifyAuthSlice from './slices/spotifyAuthSlice'
import userSlice from './slices/userSlice'
import workoutSlice from './slices/workoutSlice'

// Configure persistence for user slice (removed Spotify auth - now in separate slice)
const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
  whitelist: [
    'extractedProfile',
    'profileGenerated',
    'onboardingAnswers',
    'onboardingCompleted',
  ], // Persist user profile data and onboarding status
};

// Configure persistence for Spotify auth (separate from user)
const spotifyAuthPersistConfig = {
  key: 'spotifyAuth',
  storage: AsyncStorage,
  whitelist: [
    'accessToken',
    'refreshToken',
    'expiresAt',
    'user',
  ], // Persist Spotify auth state
};

// Configure persistence for music slice
const musicPersistConfig = {
  key: 'music',
  storage: AsyncStorage,
  whitelist: [
    'selectedMusicOption',
    'selectedPlaylist', 
    'selectedAppMusic',
    'volume',
    'shuffle',
    'repeat',
    'lastUsedMusicOption',
    'lastUsedPlaylist',
    'lastUsedAppMusic'
  ], // Persist all music preferences
};

// Configure persistence for fitness player slice
const fitnessPlayerPersistConfig = {
  key: 'fitnessPlayer',
  storage: AsyncStorage,
  whitelist: [
    'volume',
    'shuffle',
    'repeat',
    'lastMixRequest',
  ], // Persist player preferences and last mix request
};

const persistedUserReducer = persistReducer(userPersistConfig, userSlice);
const persistedMusicReducer = persistReducer(musicPersistConfig, musicSlice);
const persistedSpotifyAuthReducer = persistReducer(spotifyAuthPersistConfig, spotifyAuthSlice);
const persistedFitnessPlayerReducer = persistReducer(fitnessPlayerPersistConfig, fitnessPlayerSlice);

export const store = configureStore({
  reducer: {
    [enhancedApi.reducerPath]: enhancedApi.reducer,
    [fitnessApi.reducerPath]: fitnessApi.reducer,
    [spotifyApi.reducerPath]: spotifyApi.reducer,
    user: persistedUserReducer,
    music: persistedMusicReducer,
    spotifyAuth: persistedSpotifyAuthReducer,
    fitnessPlayer: persistedFitnessPlayerReducer,
    chat: chatSlice,
    workout: workoutSlice,
  },
  devTools: false, // Disable built-in devTools
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Dev invariant checks deep-walk the whole tree (workout + RTK Query caches) and
      // routinely exceed 300ms here. Both are off in production builds already.
      serializableCheck: __DEV__
        ? false
        : {
            ignoredActions: [
              enhancedApi.util.resetApiState.type,
              'persist/PERSIST',
              'persist/REHYDRATE',
              'user/generateProfileFromAnswers/pending',
              'user/generateProfileFromAnswers/fulfilled',
              'user/generateProfileFromAnswers/rejected',
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
              'workout.activeWorkout.setsCompleted',
              enhancedApi.reducerPath,
              fitnessApi.reducerPath,
              spotifyApi.reducerPath,
            ],
          },
      immutableCheck: __DEV__
        ? false
        : {
            ignoredPaths: [
              enhancedApi.reducerPath,
              fitnessApi.reducerPath,
              spotifyApi.reducerPath,
              'workout',
            ],
          },
    })
    .concat(enhancedApi.middleware)
    .concat(fitnessApi.middleware)
    .concat(spotifyApi.middleware)
    .concat(workoutListenerMiddleware.middleware),
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(
      devToolsEnhancer({
        name: 'BiXo App Redux Store',
        maxAge: 30,
        // Stack traces per action are expensive with a large store
        trace: false,
        actionsDenylist: [
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

// Note: User profile sync now happens through RTK Query cache and normal app flow

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 