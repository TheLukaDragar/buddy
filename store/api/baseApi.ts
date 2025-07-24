import { createApi } from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'
import { supabase } from '../../lib/supabase'

// GraphQL base query with Supabase authentication
const graphqlBaseQuery = graphqlRequestBaseQuery({
  url: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/graphql/v1`,
  prepareHeaders: async (headers: Headers) => {
    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession()
    
    // Always set the API key
    headers.set('apikey', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '')
    
    // Add authorization header if user is authenticated
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`)
    }
    
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

// Base API slice - minimal, will be enhanced by codegen and real-time
export const api = createApi({
  reducerPath: 'api',
  baseQuery: graphqlBaseQuery,
  tagTypes: ['Todo', 'User'],
  endpoints: () => ({}), // Empty - will be populated by injectEndpoints from codegen
})

export const baseApi = api
export default api 