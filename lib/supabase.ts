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
    console.log('🔧 [SUPABASE] Returning existing client instance');
    return supabaseInstance
  }

  console.log('🔧 [SUPABASE] Creating new Supabase client');
  console.log('🔧 [SUPABASE] Platform:', Platform.OS);
  
  // Check if we're in a browser environment (not during static rendering)
  const isBrowser = typeof window !== 'undefined'
  const isNative = Platform.OS !== 'web'
  
  console.log('🔧 [SUPABASE] isBrowser:', isBrowser, 'isNative:', isNative);
  
  // For React Native, always use AsyncStorage and persist session
  // For web, check if we're in a browser (not static rendering)
  const authConfig = (isNative || isBrowser) ? {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  } : {
    // Only for static rendering (SSR)
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  }

  console.log('🔧 [SUPABASE] Auth config:', JSON.stringify(authConfig, null, 2));

  supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: authConfig,
  })
  
  console.log('🔧 [SUPABASE] Client created successfully');

  // Only set up AppState listener in native environments
  if (isNative) {
    console.log('🔧 [SUPABASE] Setting up AppState listener for native platform');
    AppState.addEventListener('change', (state) => {
      console.log('🔧 [SUPABASE] AppState changed:', state);
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