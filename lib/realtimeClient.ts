import { supabase } from './supabase'

interface RealtimeSubscriptionConfig {
  endpoint: string
  onUpdate: (data: any) => void
  onError?: (error: any) => void
}

export class RealtimeClient {
  private subscriptions = new Map<string, any>()

  subscribe(config: RealtimeSubscriptionConfig) {
    const { endpoint, onUpdate, onError } = config
    
    // Create a unique key for this subscription
    const subscriptionKey = `${endpoint}_${Date.now()}`

    try {
      console.log(`🔌 Setting up Supabase Realtime subscription for ${endpoint}...`)
      
      // Subscribe to Supabase Realtime for the specified table
      const subscription = supabase
        .channel(`${endpoint}-${subscriptionKey}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: endpoint,
          },
          (payload) => {
            console.log('📡 Raw Supabase payload:', payload)
            
            // Transform Supabase payload to our expected format
            const transformedPayload = {
              eventType: payload.eventType, // INSERT, UPDATE, DELETE
              new: payload.new, // new record data
              old: payload.old, // old record data (for UPDATE/DELETE)
              table: payload.table,
              schema: payload.schema,
              commit_timestamp: payload.commit_timestamp
            }
            
            console.log('📡 Transformed payload:', transformedPayload)
            onUpdate(transformedPayload)
          }
        )
        .subscribe((status) => {
          console.log('📡 Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to real-time updates')
            console.log(`🔍 Listening for changes on: public.${endpoint}`)
            console.log('🎯 Events: INSERT, UPDATE, DELETE')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Channel subscription error')
            if (onError) {
              onError(new Error('Channel subscription failed'))
            }
          } else if (status === 'TIMED_OUT') {
            console.error('❌ Subscription timed out')
            if (onError) {
              onError(new Error('Subscription timed out'))
            }
          } else if (status === 'CLOSED') {
            console.log('🔌 Subscription closed')
          }
        })

      this.subscriptions.set(subscriptionKey, subscription)
      
      return {
        subscriptionKey,
        unsubscribe: () => this.unsubscribe(subscriptionKey)
      }
    } catch (error) {
      console.error('❌ Real-time subscription error:', error)
      if (onError) {
        onError(error)
      }
      throw error
    }
  }

  unsubscribe(subscriptionKey: string) {
    const subscription = this.subscriptions.get(subscriptionKey)
    if (subscription) {
      console.log('🔌 Unsubscribing from real-time updates:', subscriptionKey)
      supabase.removeChannel(subscription)
      this.subscriptions.delete(subscriptionKey)
    }
  }

  unsubscribeAll() {
    console.log('🔌 Unsubscribing from all real-time updates')
    for (const [key] of this.subscriptions) {
      this.unsubscribe(key)
    }
  }

  // Add a test method to manually trigger an event
  testConnection() {
    console.log('🧪 Testing real-time connection...')
    console.log('Active subscriptions:', this.subscriptions.size)
    
    // List all active channels
    this.subscriptions.forEach((subscription, key) => {
      console.log(`📺 Active channel: ${key}`, subscription.topic)
    })
  }
}

// Export a singleton instance
export const realtimeClient = new RealtimeClient() 