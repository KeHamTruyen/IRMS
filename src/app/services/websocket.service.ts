// WebSocket Service for real-time notifications
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

export interface NotificationEvent {
  type: string;
  title: string;
  message: string;
  data: any;
  timestamp: string;
}

type NotificationCallback = (event: NotificationEvent) => void;

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private subscriptions: Map<string, any> = new Map();
  private callbacks: Map<string, NotificationCallback[]> = new Map();

  // Connect to WebSocket
  connect(): void {
    if (this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.resubscribeAll();
      },
      
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
      },
      
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
      },
    });

    this.client.activate();
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
      this.subscriptions.clear();
      this.callbacks.clear();
    }
  }

  // Subscribe to a topic
  subscribe(topic: string, callback: NotificationCallback): void {
    // Store callback
    if (!this.callbacks.has(topic)) {
      this.callbacks.set(topic, []);
    }
    this.callbacks.get(topic)!.push(callback);

    // Subscribe if connected
    if (this.isConnected && this.client) {
      this.subscribeToTopic(topic);
    }
  }

  // Unsubscribe from a topic
  unsubscribe(topic: string, callback?: NotificationCallback): void {
    if (callback) {
      // Remove specific callback
      const callbacks = this.callbacks.get(topic);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    } else {
      // Remove all callbacks
      this.callbacks.delete(topic);
    }

    // Unsubscribe if no more callbacks
    if (!this.callbacks.has(topic) || this.callbacks.get(topic)!.length === 0) {
      const subscription = this.subscriptions.get(topic);
      if (subscription) {
        subscription.unsubscribe();
        this.subscriptions.delete(topic);
      }
    }
  }

  // Private: Subscribe to topic
  private subscribeToTopic(topic: string): void {
    if (!this.client || this.subscriptions.has(topic)) {
      return;
    }

    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const event: NotificationEvent = JSON.parse(message.body);
        this.notifyCallbacks(topic, event);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(topic, subscription);
  }

  // Private: Resubscribe to all topics after reconnection
  private resubscribeAll(): void {
    this.callbacks.forEach((_, topic) => {
      this.subscribeToTopic(topic);
    });
  }

  // Private: Notify all callbacks for a topic
  private notifyCallbacks(topic: string, event: NotificationEvent): void {
    const callbacks = this.callbacks.get(topic);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Topic constants
export const WS_TOPICS = {
  ORDERS: '/topic/orders',
  KITCHEN: '/topic/kitchen',
  SERVERS: '/topic/servers',
  TABLES: '/topic/tables',
  BILLING: '/topic/billing',
};
