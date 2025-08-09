type EventCallback = (data?: any) => void;

export class EventBus {
  private static instance: EventBus;
  private events: Map<string, Set<EventCallback>>;

  private constructor() {
    this.events = new Map();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  emit(event: string, data?: any): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  once(event: string, callback: EventCallback): void {
    const onceCallback = (data?: any) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  clear(): void {
    this.events.clear();
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();

// Common events
export const Events = {
  IMAGE_LOADED: 'image:loaded',
  IMAGE_PROCESSING: 'image:processing',
  IMAGE_PROCESSED: 'image:processed',
  ALGORITHM_CHANGED: 'algorithm:changed',
  PALETTE_CHANGED: 'palette:changed',
  PARAMETER_CHANGED: 'parameter:changed',
  EXPORT_REQUESTED: 'export:requested',
  ERROR: 'app:error'
} as const;