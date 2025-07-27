import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// For web platform during static rendering, we need to handle this differently
let supabaseInstance: SupabaseClient | null = null

function createSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Check if we're in a browser environment (not during static rendering)
  const isBrowser = typeof window !== 'undefined'
  
  // For static rendering, we'll create a minimal client without storage
  const authConfig = isBrowser ? {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  } : {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  }

  supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: authConfig,
  })

  // Only set up AppState listener in native environments
  if (Platform.OS !== 'web' && isBrowser) {
    AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabaseInstance?.auth.startAutoRefresh()
      } else {
        supabaseInstance?.auth.stopAutoRefresh()
      }
    })
  }

  return supabaseInstance
}

// Export a getter function instead of the client directly
export const getSupabase = () => createSupabaseClient()

// For backward compatibility, export the client but lazy-load it
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = createSupabaseClient()
    return client[prop as keyof SupabaseClient]
  }
}) 