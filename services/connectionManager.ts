// 2.4 update -- to fix RRUNTTIMEE error!
// services/connectionManager.ts
// 2.4 Handling connection states + offline queue with Socket.IO

import { Platform } from "react-native";
import { socketService } from "./socketService";

/**
 * RUNTIME ConnectionState (so `ConnectionState.CONNECTED` exists at runtime)
 * + a derived union type for strong typing.
 */
export const ConnectionState = {
  CONNECTED: "CONNECTED",
  CONNECTING: "CONNECTING",
  RECONNECTING: "RECONNECTING",
  DISCONNECTED: "DISCONNECTED",
  FAILED: "FAILED",
} as const;
export type ConnectionState =
  (typeof ConnectionState)[keyof typeof ConnectionState];

export interface QueuedOperation {
  id: string;
  operation: { type: string; data?: any }; // what to emit later
  retryCount: number;
  maxRetries: number;
}

export interface ConnectionInfo {
  state: ConnectionState;
  isOnline: boolean; // device network idea (best-effort)
  reconnectAttempt: number; // how many we’ve tried
  latency?: number; // ms from heartbeat
  lastConnected?: Date; // last time we saw the server
}

// Small helpers so TS works both on web & native
type TimeoutRef = ReturnType<typeof setTimeout> | null;
type IntervalRef = ReturnType<typeof setInterval> | null;

class ConnectionManager {
  // ---- internal state -------------------------------------------------------
  private queue: QueuedOperation[] = [];
  private info: ConnectionInfo = {
    state: ConnectionState.DISCONNECTED,
    isOnline: typeof navigator !== "undefined" ? !!navigator.onLine : true,
    reconnectAttempt: 0,
  };

  // timers
  private reconnectTimer: TimeoutRef = null;
  private heartbeatTimer: IntervalRef = null;

  // backoff ladder for reconnects
  private backoff = [1000, 2000, 5000, 10000, 30000];
  private maxReconnectAttempts = 10;

  // subscribers
  private connSubs: Array<(i: ConnectionInfo) => void> = [];
  private queueSubs: Array<(q: QueuedOperation[]) => void> = [];

  constructor() {
    // Wire socket events once
    this.setupSocketListeners();

    // Optional: basic online/offline detection on web only (prevents RN Hermes crash)
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnline());
      window.addEventListener("offline", () => this.handleOffline());
    }
  }

  // ---- public API consumed by your UI/hooks ---------------------------------

  /** Current snapshot for seeding UIs */
  getConnectionInfo(): ConnectionInfo {
    return this.info;
  }

  /** Used by ConnectionStatus to seed initial queued ops list */
  getQueue(): QueuedOperation[] {
    return this.queue;
  }

  /** Subscribe to connection changes (returns unsubscribe) */
  onConnectionChange(cb: (info: ConnectionInfo) => void): () => void {
    this.connSubs.push(cb);
    // push current snapshot immediately (nice UX)
    cb(this.info);
    return () => {
      this.connSubs = this.connSubs.filter((f) => f !== cb);
    };
  }

  /** Subscribe to queue changes (returns unsubscribe) */
  onQueueChange(cb: (q: QueuedOperation[]) => void): () => void {
    this.queueSubs.push(cb);
    cb(this.queue);
    return () => {
      this.queueSubs = this.queueSubs.filter((f) => f !== cb);
    };
  }

  /** Kick off a connection (idempotent) */
  connect(): void {
    if (
      this.info.state === ConnectionState.CONNECTED ||
      this.info.state === ConnectionState.CONNECTING
    ) {
      return;
    }
    this.setState(ConnectionState.CONNECTING);
    try {
      socketService.connect(); // your socketService handles the actual io()
    } catch (_e) {
      this.setState(ConnectionState.FAILED);
      this.scheduleReconnect();
    }
  }

  /** Cleanly disconnect (stops timers & cancels backoff) */
  disconnect(): void {
    this.clearReconnect();
    this.clearHeartbeat();
    socketService.disconnect();
    this.setState(ConnectionState.DISCONNECTED);
  }

  /** Is the socket currently usable? */
  isConnected(): boolean {
    return this.info.state === ConnectionState.CONNECTED;
  }

  /** Queue an operation for later */
  queueOperation(op: { type: string; data?: any }, maxRetries = 3): string {
    const id = `op_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const item: QueuedOperation = {
      id,
      operation: op,
      retryCount: 0,
      maxRetries,
    };
    this.queue.push(item);
    this.notifyQueue();
    // if already connected, try to flush now
    if (this.isConnected()) this.processQueue();
    return id;
  }

  removeQueuedOperation(id: string): void {
    this.queue = this.queue.filter((q) => q.id !== id);
    this.notifyQueue();
  }

  clearOperationQueue(): void {
    this.queue = [];
    this.notifyQueue();
  }

  // ---- socket wiring & state machine ----------------------------------------

  private setupSocketListeners() {
    socketService.on("connect", () => {
      // reset attempts, mark timestamps, start heartbeat
      this.info.reconnectAttempt = 0;
      this.info.lastConnected = new Date();
      this.setState(ConnectionState.CONNECTED);
      this.clearReconnect();
      this.startHeartbeat();
      this.processQueue(); // try to drain offline work
    });

    socketService.on("disconnect", (_reason: string) => {
      this.clearHeartbeat();
      // move into RECONNECTING and start backoff loop
      this.setState(ConnectionState.RECONNECTING);
      this.scheduleReconnect();
    });

    socketService.on("connect_error", (_err: any) => {
      if (this.info.state === ConnectionState.CONNECTING) {
        this.setState(ConnectionState.FAILED);
        this.scheduleReconnect();
      }
    });

    // socket.io fires this after a successful reconnect
    socketService.on("reconnect", () => {
      this.info.reconnectAttempt = 0;
      this.setState(ConnectionState.CONNECTED);
      this.clearReconnect();
      this.startHeartbeat();
      this.processQueue();
    });

    // Heartbeat reply from server (your server should echo the timestamp back)
    socketService.on(
      "pong",
      (data: { timestamp?: number; clientId?: string }) => {
        if (
          data?.clientId === "heartbeat" &&
          typeof data.timestamp === "number"
        ) {
          this.info.latency = Date.now() - data.timestamp;
          this.notifyConn();
        }
      }
    );
  }

  // minimal web-only network signal
  private handleOnline() {
    this.info.isOnline = true;
    this.notifyConn();
    if (!this.isConnected()) this.connect();
  }
  private handleOffline() {
    this.info.isOnline = false;
    this.setState(ConnectionState.DISCONNECTED);
  }

  // ---- heartbeat -------------------------------------------------------------

  private startHeartbeat() {
    this.clearHeartbeat();
    // ping every 30s; server should emit 'pong' right back with the timestamp
    this.heartbeatTimer = setInterval(() => {
      if (!this.isConnected()) return;
      socketService.emit("ping", {
        clientId: "heartbeat",
        timestamp: Date.now(),
      });
    }, 30_000);
  }
  private clearHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ---- reconnect backoff -----------------------------------------------------

  private scheduleReconnect() {
    if (
      this.reconnectTimer ||
      this.info.reconnectAttempt >= this.maxReconnectAttempts
    ) {
      if (this.info.reconnectAttempt >= this.maxReconnectAttempts) {
        this.setState(ConnectionState.FAILED);
      }
      return;
    }
    const idx = Math.min(this.info.reconnectAttempt, this.backoff.length - 1);
    const delay = this.backoff[idx];
    this.info.reconnectAttempt += 1;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      // try again
      this.connect();
    }, delay);
    this.notifyConn(); // so UI shows the attempt counter
  }

  private clearReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // ---- queue processing ------------------------------------------------------

  private processQueue() {
    if (!this.isConnected() || this.queue.length === 0) return;

    // drain a snapshot so we can requeue failures without infinite loops
    const pending = [...this.queue];
    this.queue = [];
    for (const item of pending) {
      try {
        socketService.emit(item.operation.type, item.operation.data);
        // success -> drop it
      } catch (_e) {
        // failed: requeue with backoff if retries remain
        if (item.retryCount < item.maxRetries) {
          item.retryCount += 1;
          this.queue.push(item);
        } else {
          // give up on this one (optional: surface a toast)
        }
      }
    }
    this.notifyQueue();
  }

  // ---- tiny helpers ----------------------------------------------------------

  private setState(next: ConnectionState) {
    if (this.info.state === next) return;
    this.info = { ...this.info, state: next };
    this.notifyConn();
  }

  private notifyConn() {
    const snap = this.getConnectionInfo();
    this.connSubs.forEach((cb) => cb(snap));
  }

  private notifyQueue() {
    const snap = this.getQueue();
    this.queueSubs.forEach((cb) => cb(snap));
  }
}

export const connectionManager = new ConnectionManager();
