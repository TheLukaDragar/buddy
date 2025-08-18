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
  private conversationMode: 'speaking' | 'listening' | null = null;

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
    this.conversationMode = null;
    console.log('🎙️ Voice message callbacks unregistered');
  }

  /**
   * Update conversation mode for smart message routing
   */
  setConversationMode(mode: 'speaking' | 'listening' | null) {
    this.conversationMode = mode;
    //rconsole.log('🎙️ Conversation mode updated:', mode);
  }

  /**
   * Get current conversation mode
   */
  getConversationMode(): 'speaking' | 'listening' | null {
    return this.conversationMode;
  }

  /**
   * Send a user message via voice agent with retry logic
   */
  async sendMessage(message: string): Promise<boolean> {
    return this.sendWithRetry(message, 'message');
  }

  /**
   * Send a contextual update via voice agent with retry logic
   */
  async sendContextualUpdate(context: string): Promise<boolean> {
    return this.sendWithRetry(context, 'context');
  }

  /**
   * Smart send - chooses message type based on conversation mode
   * Uses context update if agent is speaking to avoid interruption
   */
  async sendSmart(message: string): Promise<boolean> {
    if (this.conversationMode === 'speaking') {
      console.log('🎙️ Agent speaking - sending as context update to avoid interruption');
      return this.sendContextualUpdate(message);
    } else {
      console.log('🎙️ Agent listening - sending as system message');
      return this.sendMessage(message);
    }
  }

  /**
   * Send message with retry logic for connection delays
   */
  private async sendWithRetry(message: string, type: 'message' | 'context', maxRetries = 3): Promise<boolean> {
    const callback = type === 'message' ? this.callbacks.sendMessage : this.callbacks.sendContext;
    
    if (!callback) {
      console.warn(`🎙️ No voice ${type} callback registered`);
      return false;
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = callback(message);
        // Handle both sync and async callbacks
        if (result instanceof Promise) {
          await result;
        }
        console.log(`🎙️ Voice ${type} sent:`, message);
        return true;
      } catch (error) {
        console.error(`🎙️ Failed to send voice ${type} (attempt ${attempt}):`, error);
        
        // If we get a "room not connected" error, wait and retry
        if (attempt < maxRetries && error.toString().includes('room not connected')) {
          const delay = attempt * 2000; // 2s, 4s, 6s delays
          console.log(`🎙️ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If final attempt or different error, give up
        return false;
      }
    }
    
    return false;
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
