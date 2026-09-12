import { io, Socket } from 'socket.io-client';

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}${window.location.port === '3000' || window.location.port === '80' || window.location.port === '' ? '' : ':3000'}/ws`
    : 'http://localhost:3000/ws');

export class AdminWebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  connect(token: string) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      auth: { token },
      query: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[Admin Socket.io] Connected to server Gateway');
      this.notify('connection_status', { connected: true });
    });

    this.socket.on('connect_error', (err) => {
      // Graceful retry without crashing
      this.notify('connection_status', { connected: false });
    });

    this.socket.on('disconnect', () => {
      console.log('[Admin Socket.io] Disconnected');
      this.notify('connection_status', { connected: false });
    });

    // Subscribed Events
    const events = [
      'agent.status.updated',
      'kyc.status.updated',
      'property.status.updated',
      'payment.created',
      'payment.deleted',
      'agent.registered',
      'ticket.created',
      'ticket.updated',
      'earnings.updated',
    ];

    events.forEach((event) => {
      this.socket?.on(event, (data) => {
        console.log(`[Admin Socket.io] 📢 Received event: ${event}`, data);
        this.notify(event, data);
      });
    });

    // Also forward any generic event dynamically
    this.socket.onAny((event, ...args) => {
      const data = args && args.length > 0 ? args[0] : null;
      this.notify(event, data);
    });
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event)!.filter((cb) => cb !== callback);
    this.listeners.set(event, callbacks);
  }

  private notify(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const adminSocket = new AdminWebSocketService();
