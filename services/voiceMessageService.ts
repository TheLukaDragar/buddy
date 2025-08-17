/**
 * Global Context Bridge Service
 * Provides a callback-based system for sending voice messages from anywhere in the app
 */

type VoiceMessageCallback = (message: string) => void | Promise<void>;
type ContextualUpdateCallback = (context: string) => void | Promise<void>;

interface VoiceCallbacks {
  sendMessage?: VoiceMessageCallback;
  sendContext?: ContextualUpdateCallback;
}

class ContextBridgeService {
  private callbacks: VoiceCallbacks = {};

  /**
   * Register callbacks from a component (like ActiveWorkout)
   */
  registerCallbacks(callbacks: VoiceCallbacks) {
    // Check if callbacks are already the same to avoid unnecessary re-registration
    const hasChanged = 
      this.callbacks.sendMessage !== callbacks.sendMessage ||
      this.callbacks.sendContext !== callbacks.sendContext;
    
    if (hasChanged) {
      this.callbacks = { ...this.callbacks, ...callbacks };
      console.log('🎙️ Voice message callbacks registered/updated');
    } else {
      console.log('🎙️ Voice message callbacks already registered (no change)');
    }
  }

  /**
   * Unregister callbacks (component cleanup)
   */
  unregisterCallbacks() {
    this.callbacks = {};
    console.log('🎙️ Voice message callbacks unregistered');
  }

  /**
   * Send a user message via voice agent
   */
  async sendMessage(message: string): Promise<boolean> {
    if (this.callbacks.sendMessage) {
      try {
        const result = this.callbacks.sendMessage(message);
        // Handle both sync and async callbacks
        if (result instanceof Promise) {
          await result;
        }
        console.log('User message sent:', message);
        return true;
      } catch (error) {
        console.error('Failed to send user  message:', error);
        return false;
      }
    } else {
      console.warn('No user message callback registered');
      return false;
    }
  }

  /**
   * Send a contextual update via voice agent
   */
  async sendContextualUpdate(context: string): Promise<boolean> {
    if (this.callbacks.sendContext) {
      try {
        const result = this.callbacks.sendContext(context);
        // Handle both sync and async callbacks
        if (result instanceof Promise) {
          await result;
        }
        console.log('Contextual update sent:', context);
        return true;
      } catch (error) {
        console.error('Failed to send contextual update:', error);
        return false;
      }
    } else {
      console.warn('No contextual update callback registered');
      return false;
    }
  }

  /**
   * Check if voice messaging is available
   */
  isAvailable(): boolean {
    return !!(this.callbacks.sendMessage || this.callbacks.sendContext);
  }
}

// Export singleton instance
export const contextBridgeService = new ContextBridgeService();
