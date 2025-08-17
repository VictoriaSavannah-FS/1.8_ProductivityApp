// // // 2.4 handlig Connection /states abnd offline Scenarios
// // // Robust Socket Service w/ Reconnetion
// // import { socketService } from "./socketService";

// // export type ConnectionState =
// //   | "CONNECTED"
// //   | "CONNECTING"
// //   | "RECONNECTING"
// //   | "DISCONNECTED"
// //   | "FAILED";

// // // export enum ConnectionState {
// // //   DISCONNECTED = "DISCONNECTED",
// // //   CONNECTING = "CONNECTING",
// // //   CONNECTED = "CONNECTED",
// // //   RECONNECTING = "RECONNECTING",
// // //   FAILED = "FAILED",
// // // }
// // export interface ConnectionInfo {
// //   state: ConnectionState;
// //   lastConnected?: Date;
// //   disconnectReason?: string;
// //   reconnectAttempt: number;
// //   isOnline: boolean;
// //   latency?: number;
// // }
// // export interface QueuedOperation {
// //   id: string;
// //   operation: any;
// //   timestamp: Date;
// //   retryCount: number;
// //   maxRetries: number;
// // }
// // class ConnectionManager {
// //   private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
// //   private reconnectAttempts: number = 0;
// //   private maxReconnectAttempts: number = 10;
// //   private reconnectTimeouts: number[] = [1000, 2000, 5000, 10000, 30000]; // Exponential backoff
// //   private reconnectTimer: NodeJS.Timeout | null = null;
// //   private heartbeatTimer: NodeJS.Timeout | null = null;
// //   private operationQueue: QueuedOperation[] = [];
// //   private isManualDisconnect: boolean = false;
// //   private lastHeartbeat: Date | null = null;
// //   private latency: number = 0;
// //   // Event listeners
// //   private connectionListeners: ((info: ConnectionInfo) => void)[] = [];
// //   private queueListeners: ((operations: QueuedOperation[]) => void)[] = [];
// //   constructor() {
// //     this.setupNetworkListeners();
// //     this.setupSocketListeners();
// //   }
// //   private setupNetworkListeners(): void {
// //     // Web network detection
// //     if (typeof window !== "undefined") {
// //       window.addEventListener("online", this.handleNetworkOnline.bind(this));
// //       window.addEventListener("offline", this.handleNetworkOffline.bind(this));
// //     }
// //     // React Native network detection would use @react-native-community/netinfo
// //     // import NetInfo from '@react-native-community/netinfo';
// //     // NetInfo.addEventListener(this.handleNetworkChange.bind(this));
// //   }
// //   private setupSocketListeners(): void {
// //     socketService.on("connect", this.handleSocketConnect.bind(this));
// //     socketService.on("disconnect", this.handleSocketDisconnect.bind(this));
// //     socketService.on("connect_error", this.handleSocketError.bind(this));
// //     socketService.on("reconnect", this.handleSocketReconnect.bind(this));
// //     socketService.on(
// //       "reconnect_error",
// //       this.handleSocketReconnectError.bind(this)
// //     );
// //     socketService.on("pong", this.handleHeartbeatResponse.bind(this));
// //   }
// //   async connect(): Promise<void> {
// //     if (this.connectionState === ConnectionState.CONNECTED) {
// //       return;
// //     }
// //     this.isManualDisconnect = false;
// //     this.setConnectionState(ConnectionState.CONNECTING);

// //     try {
// //       socketService.connect();
// //     } catch (error) {
// //       console.error("Connection error:", error);
// //       this.setConnectionState(ConnectionState.FAILED);
// //       this.scheduleReconnect();
// //     }
// //   }
// //   disconnect(): void {
// //     this.isManualDisconnect = true;
// //     this.clearReconnectTimer();
// //     this.clearHeartbeatTimer();

// //     socketService.disconnect();
// //     this.setConnectionState(ConnectionState.DISCONNECTED);
// //   }
// //   private handleSocketConnect(): void {
// //     console.log("Socket connected successfully");
// //     this.reconnectAttempts = 0;
// //     this.clearReconnectTimer();
// //     this.setConnectionState(ConnectionState.CONNECTED);
// //     this.startHeartbeat();
// //     this.processQueuedOperations();
// //   }
// //   private handleSocketDisconnect(reason: string): void {
// //     console.log("Socket disconnected:", reason);
// //     this.clearHeartbeatTimer();

// //     if (!this.isManualDisconnect) {
// //       this.setConnectionState(ConnectionState.RECONNECTING, reason);
// //       this.scheduleReconnect();
// //     }
// //   }
// //   private handleSocketError(error: any): void {
// //     console.error("Socket connection error:", error);

// //     if (this.connectionState === ConnectionState.CONNECTING) {
// //       this.setConnectionState(ConnectionState.FAILED, error.message);
// //       this.scheduleReconnect();
// //     }
// //   }
// //   private handleSocketReconnect(attemptNumber: number): void {
// //     console.log("Socket reconnected after", attemptNumber, "attempts");
// //     this.handleSocketConnect();
// //   }
// //   private handleSocketReconnectError(error: any): void {
// //     console.error("Socket reconnection error:", error);
// //     this.reconnectAttempts++;

// //     if (this.reconnectAttempts >= this.maxReconnectAttempts) {
// //       this.setConnectionState(
// //         ConnectionState.FAILED,
// //         "Max reconnection attempts reached"
// //       );
// //       return;
// //     }

// //     this.scheduleReconnect();
// //   }
// //   private handleNetworkOnline(): void {
// //     console.log("Network came online");
// //     if (
// //       this.connectionState !== ConnectionState.CONNECTED &&
// //       !this.isManualDisconnect
// //     ) {
// //       this.connect();
// //     }
// //   }
// //   private handleNetworkOffline(): void {
// //     console.log("Network went offline");
// //     this.setConnectionState(ConnectionState.DISCONNECTED, "Network offline");
// //   }
// //   private scheduleReconnect(): void {
// //     if (this.isManualDisconnect || this.reconnectTimer) {
// //       return;
// //     }
// //     const timeoutIndex = Math.min(
// //       this.reconnectAttempts,
// //       this.reconnectTimeouts.length - 1
// //     );
// //     const delay = this.reconnectTimeouts[timeoutIndex];

// //     console.log(
// //       `Scheduling reconnect attempt ${this.reconnectAttempts + 1} in ${delay}ms`
// //     );

// //     this.reconnectTimer = setTimeout(() => {
// //       this.reconnectTimer = null;
// //       if (!this.isManualDisconnect) {
// //         this.connect();
// //       }
// //     }, delay);
// //   }
// //   private clearReconnectTimer(): void {
// //     if (this.reconnectTimer) {
// //       clearTimeout(this.reconnectTimer);
// //       this.reconnectTimer = null;
// //     }
// //   }
// //   private startHeartbeat(): void {
// //     this.clearHeartbeatTimer();

// //     this.heartbeatTimer = setInterval(() => {
// //       if (this.connectionState === ConnectionState.CONNECTED) {
// //         const startTime = Date.now();
// //         this.lastHeartbeat = new Date();

// //         socketService.emit("ping", {
// //           timestamp: startTime,
// //           clientId: "heartbeat",
// //         });
// //       }
// //     }, 30000); // Heartbeat every 30 seconds
// //   }
// //   private handleHeartbeatResponse(data: any): void {
// //     if (data.clientId === "heartbeat") {
// //       const now = Date.now();
// //       this.latency = now - data.timestamp;
// //       this.notifyConnectionListeners();
// //     }
// //   }
// //   private clearHeartbeatTimer(): void {
// //     if (this.heartbeatTimer) {
// //       clearInterval(this.heartbeatTimer);
// //       this.heartbeatTimer = null;
// //     }
// //   }
// //   // Operation queueing for offline scenarios
// //   queueOperation(operation: any, maxRetries: number = 3): string {
// //     const queuedOp: QueuedOperation = {
// //       id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
// //       operation,
// //       timestamp: new Date(),
// //       retryCount: 0,
// //       maxRetries,
// //     };
// //     this.operationQueue.push(queuedOp);
// //     this.notifyQueueListeners();
// //     // Try to process immediately if connected
// //     if (this.connectionState === ConnectionState.CONNECTED) {
// //       this.processQueuedOperations();
// //     }
// //     return queuedOp.id;
// //   }
// //   private async processQueuedOperations(): Promise<void> {
// //     if (
// //       this.connectionState !== ConnectionState.CONNECTED ||
// //       this.operationQueue.length === 0
// //     ) {
// //       return;
// //     }
// //     const operationsToProcess = [...this.operationQueue];
// //     this.operationQueue = [];
// //     for (const queuedOp of operationsToProcess) {
// //       try {
// //         // Emit the operation
// //         socketService.emit(queuedOp.operation.type, queuedOp.operation.data);
// //         console.log("Processed queued operation:", queuedOp.id);
// //       } catch (error) {
// //         console.error("Error processing queued operation:", error);

// //         // Retry if we haven't exceeded max retries
// //         if (queuedOp.retryCount < queuedOp.maxRetries) {
// //           queuedOp.retryCount++;
// //           this.operationQueue.push(queuedOp);
// //         } else {
// //           console.error("Max retries exceeded for operation:", queuedOp.id);
// //         }
// //       }
// //     }
// //     this.notifyQueueListeners();
// //   }
// //   removeQueuedOperation(operationId: string): void {
// //     this.operationQueue = this.operationQueue.filter(
// //       (op) => op.id !== operationId
// //     );
// //     this.notifyQueueListeners();
// //   }
// //   clearOperationQueue(): void {
// //     this.operationQueue = [];
// //     this.notifyQueueListeners();
// //   }
// //   // Connection state management
// //   private setConnectionState(state: ConnectionState, reason?: string): void {
// //     const previousState = this.connectionState;
// //     this.connectionState = state;

// //     console.log(
// //       `Connection state changed: ${previousState} -> ${state}`,
// //       reason ? `(${reason})` : ""
// //     );

// //     this.notifyConnectionListeners();
// //   }
// //   getConnectionInfo(): ConnectionInfo {
// //     return {
// //       state: this.connectionState,
// //       lastConnected: this.lastHeartbeat,
// //       disconnectReason: undefined, // Would store last disconnect reason
// //       reconnectAttempt: this.reconnectAttempts,
// //       isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
// //       latency: this.latency,
// //     };
// //   }
// //   isConnected(): boolean {
// //     return this.connectionState === ConnectionState.CONNECTED;
// //   }
// //   getQueuedOperations(): QueuedOperation[] {
// //     return [...this.operationQueue];
// //   }
// //   // Event listener management
// //   onConnectionChange(callback: (info: ConnectionInfo) => void): () => void {
// //     this.connectionListeners.push(callback);
// //     return () => {
// //       this.connectionListeners = this.connectionListeners.filter(
// //         (cb) => cb !== callback
// //       );
// //     };
// //   }
// //   onQueueChange(callback: (operations: QueuedOperation[]) => void): () => void {
// //     this.queueListeners.push(callback);
// //     return () => {
// //       this.queueListeners = this.queueListeners.filter((cb) => cb !== callback);
// //     };
// //   }
// //   private notifyConnectionListeners(): void {
// //     const info = this.getConnectionInfo();
// //     this.connectionListeners.forEach((callback) => callback(info));
// //   }
// //   private notifyQueueListeners(): void {
// //     this.queueListeners.forEach((callback) => callback(this.operationQueue));
// //   }
// // }
// // export const connectionManager = new ConnectionManager();

// // updated with new chanegs for Offline supporrt

// // services/connectionManager.ts
// // 2.4 Handling connection states + offline queue with Socket.IO

// import { Platform } from "react-native";
// import { socketService } from "./socketService";

// // Keep the simple union type you asked for
// export type ConnectionState =
//   | "CONNECTED"
//   | "CONNECTING"
//   | "RECONNECTING"
//   | "DISCONNECTED"
//   | "FAILED";

// export interface QueuedOperation {
//   id: string;
//   operation: { type: string; data?: any }; // what to emit later
//   retryCount: number;
//   maxRetries: number;
// }

// export interface ConnectionInfo {
//   state: ConnectionState;
//   isOnline: boolean; // device network idea (best-effort)
//   reconnectAttempt: number; // how many we’ve tried
//   latency?: number; // ms from heartbeat
//   lastConnected?: Date; // last time we saw the server
// }

// // Small helpers so TS works both on web & native
// type TimeoutRef = ReturnType<typeof setTimeout> | null;
// type IntervalRef = ReturnType<typeof setInterval> | null;

// class ConnectionManager {
//   // ---- internal state -------------------------------------------------------
//   private queue: QueuedOperation[] = [];
//   private info: ConnectionInfo = {
//     state: "DISCONNECTED",
//     isOnline: typeof navigator !== "undefined" ? !!navigator.onLine : true,
//     reconnectAttempt: 0,
//   };

//   // timers
//   private reconnectTimer: TimeoutRef = null;
//   private heartbeatTimer: IntervalRef = null;

//   // backoff ladder for reconnects
//   private backoff = [1000, 2000, 5000, 10000, 30000];
//   private maxReconnectAttempts = 10;

//   // subscribers
//   private connSubs: Array<(i: ConnectionInfo) => void> = [];
//   private queueSubs: Array<(q: QueuedOperation[]) => void> = [];

//   constructor() {
//     // Wire socket events once
//     this.setupSocketListeners();
//     // Optional: basic online/offline detection on web only
//     if (Platform.OS === "web" && typeof window !== "undefined") {
//       window.addEventListener("online", () => this.handleOnline());
//       window.addEventListener("offline", () => this.handleOffline());
//     }
//   }

//   // ---- public API consumed by your UI/hooks ---------------------------------

//   getConnectionInfo(): ConnectionInfo {
//     return this.info;
//   }

//   // used by ConnectionStatus to seed initial list
//   getQueue(): QueuedOperation[] {
//     return this.queue;
//   }

//   // subscribe to connection changes
//   onConnectionChange(cb: (info: ConnectionInfo) => void): () => void {
//     this.connSubs.push(cb);
//     // push current snapshot immediately (nice UX)
//     cb(this.info);
//     return () => {
//       this.connSubs = this.connSubs.filter((f) => f !== cb);
//     };
//   }

//   // subscribe to queue changes
//   onQueueChange(cb: (q: QueuedOperation[]) => void): () => void {
//     this.queueSubs.push(cb);
//     cb(this.queue);
//     return () => {
//       this.queueSubs = this.queueSubs.filter((f) => f !== cb);
//     };
//   }

//   // kick off a connection (idempotent)
//   connect(): void {
//     if (this.info.state === "CONNECTED" || this.info.state === "CONNECTING") {
//       return;
//     }
//     this.setState("CONNECTING");
//     try {
//       socketService.connect(); // your socketService handles the actual io()
//     } catch (e) {
//       this.setState("FAILED");
//       this.scheduleReconnect();
//     }
//   }

//   // cleanly disconnect (stops timers & cancels backoff)
//   disconnect(): void {
//     this.clearReconnect();
//     this.clearHeartbeat();
//     socketService.disconnect();
//     this.setState("DISCONNECTED");
//   }

//   // Is the socket currently usable?
//   isConnected(): boolean {
//     return this.info.state === "CONNECTED";
//   }

//   // queue an operation for later
//   queueOperation(op: { type: string; data?: any }, maxRetries = 3): string {
//     const id = `op_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
//     const item: QueuedOperation = {
//       id,
//       operation: op,
//       retryCount: 0,
//       maxRetries,
//     };
//     this.queue.push(item);
//     this.notifyQueue();
//     // if already connected, try to flush now
//     if (this.isConnected()) this.processQueue();
//     return id;
//   }

//   removeQueuedOperation(id: string): void {
//     this.queue = this.queue.filter((q) => q.id !== id);
//     this.notifyQueue();
//   }

//   clearOperationQueue(): void {
//     this.queue = [];
//     this.notifyQueue();
//   }

//   // ---- socket wiring & state machine ----------------------------------------

//   private setupSocketListeners() {
//     socketService.on("connect", () => {
//       // reset attempts, mark timestamps, start heartbeat
//       this.info.reconnectAttempt = 0;
//       this.info.lastConnected = new Date();
//       this.setState("CONNECTED");
//       this.clearReconnect();
//       this.startHeartbeat();
//       this.processQueue(); // try to drain offline work
//     });

//     socketService.on("disconnect", (reason: string) => {
//       this.clearHeartbeat();
//       // move into RECONNECTING and start backoff loop
//       this.setState("RECONNECTING");
//       this.scheduleReconnect();
//     });

//     socketService.on("connect_error", (_err: any) => {
//       if (this.info.state === "CONNECTING") {
//         this.setState("FAILED");
//         this.scheduleReconnect();
//       }
//     });

//     socketService.on("reconnect", () => {
//       // socket.io fires this after a successful reconnect
//       this.info.reconnectAttempt = 0;
//       this.setState("CONNECTED");
//       this.clearReconnect();
//       this.startHeartbeat();
//       this.processQueue();
//     });

//     // Heartbeat reply from server (your server should echo the timestamp back)
//     socketService.on(
//       "pong",
//       (data: { timestamp?: number; clientId?: string }) => {
//         if (
//           data?.clientId === "heartbeat" &&
//           typeof data.timestamp === "number"
//         ) {
//           this.info.latency = Date.now() - data.timestamp;
//           this.notifyConn();
//         }
//       }
//     );
//   }

//   // minimal web-only network signal
//   private handleOnline() {
//     this.info.isOnline = true;
//     this.notifyConn();
//     if (!this.isConnected()) this.connect();
//   }
//   private handleOffline() {
//     this.info.isOnline = false;
//     this.setState("DISCONNECTED");
//   }

//   // ---- heartbeat -------------------------------------------------------------

//   private startHeartbeat() {
//     this.clearHeartbeat();
//     // ping every 30s; server should emit 'pong' right back with the timestamp
//     this.heartbeatTimer = setInterval(() => {
//       if (!this.isConnected()) return;
//       socketService.emit("ping", {
//         clientId: "heartbeat",
//         timestamp: Date.now(),
//       });
//     }, 30_000);
//   }
//   private clearHeartbeat() {
//     if (this.heartbeatTimer) {
//       clearInterval(this.heartbeatTimer);
//       this.heartbeatTimer = null;
//     }
//   }

//   // ---- reconnect backoff -----------------------------------------------------

//   private scheduleReconnect() {
//     if (
//       this.reconnectTimer ||
//       this.info.reconnectAttempt >= this.maxReconnectAttempts
//     ) {
//       if (this.info.reconnectAttempt >= this.maxReconnectAttempts) {
//         this.setState("FAILED");
//       }
//       return;
//     }
//     const idx = Math.min(this.info.reconnectAttempt, this.backoff.length - 1);
//     const delay = this.backoff[idx];
//     this.info.reconnectAttempt += 1;

//     this.reconnectTimer = setTimeout(() => {
//       this.reconnectTimer = null;
//       // try again
//       this.connect();
//     }, delay);
//     this.notifyConn(); // so UI shows the attempt counter
//   }

//   private clearReconnect() {
//     if (this.reconnectTimer) {
//       clearTimeout(this.reconnectTimer);
//       this.reconnectTimer = null;
//     }
//   }

//   // ---- queue processing ------------------------------------------------------

//   private processQueue() {
//     if (!this.isConnected() || this.queue.length === 0) return;

//     // drain a snapshot so we can requeue failures without infinite loops
//     const pending = [...this.queue];
//     this.queue = [];
//     for (const item of pending) {
//       try {
//         socketService.emit(item.operation.type, item.operation.data);
//         // success -> drop it
//       } catch (e) {
//         // failed: requeue with backoff if retries remain
//         if (item.retryCount < item.maxRetries) {
//           item.retryCount += 1;
//           this.queue.push(item);
//         } else {
//           // give up on this one
//           // (optional: surface a toast)
//         }
//       }
//     }
//     this.notifyQueue();
//   }

//   // ---- tiny helpers ----------------------------------------------------------

//   private setState(next: ConnectionState) {
//     if (this.info.state === next) return;
//     this.info = { ...this.info, state: next };
//     this.notifyConn();
//   }

//   private notifyConn() {
//     const snap = this.getConnectionInfo();
//     this.connSubs.forEach((cb) => cb(snap));
//   }

//   private notifyQueue() {
//     const snap = this.getQueue();
//     this.queueSubs.forEach((cb) => cb(snap));
//   }
// }

// export const connectionManager = new ConnectionManager();

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
