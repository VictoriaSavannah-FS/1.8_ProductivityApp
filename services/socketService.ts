// services/socketService.ts
import { io, Socket } from "socket.io-client";
import { Platform } from "react-native";

// adding an AsyncFucntion-> so dev reload doesn't loose queseu cha/mssges
import AsyncStorage from "expo-sqlite/kv-store";

/** THIS IS WHAT I WAS MSSIGN!!! ---
 * Small "offline queue" item: if we emit while disconnected,
 * we store the event+payload here and flush it after connect.
 */
type QueueItem = { event: string; data?: any };
// added ths new Queueu Key
const QUEUE_KEY = "offlineQueue@v1";

export interface ISocketService {
  connect: () => void;
  disconnect: () => void;
  isConnected: () => boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, cb: (data: any) => void) => void;
  off: (event: string, cb?: (data: any) => void) => void;
  ensureConnected: () => Promise<void>;
  id: () => string | null;
}

class SocketServiceImpl implements ISocketService {
  private socket: Socket | null = null;
  private serverUrl: string;
  private queue: QueueItem[] = []; // offline queue

  constructor() {
    // Keep YOUR LAN IP for mobile; localhost for web
    this.serverUrl = __DEV__
      ? Platform.OS === "web"
        ? "http://localhost:3001"
        : "http://10.0.0.192:3001" //upodate own IP
      : // : "http://10.0.0.192:3001"
        process.env.EXPO_PUBLIC_SOCKET_URL || "https://your-server.com";

    // Auto-connect so components can just use the service
    this.connect();
  }

  connect(): void {
    // Avoid creating multiple clients
    if (this.socket?.connected) return;
    if (this.socket && !this.socket.connected) return;

    this.socket = io(this.serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Basic wiring
    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket?.id);

      // Flush any queued emits from while we were offline
      const items = [...this.queue];
      this.queue = [];
      for (const { event, data } of items) {
        this.socket!.emit(event, data);
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (err) => {
      console.warn("⚠️ connect_error:", err?.message || err);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  id(): string | null {
    return this.socket?.id ?? null;
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      // Not connected? Queue it so it sends after connect.
      this.queue.push({ event, data });
    }
  }

  on(event: string, cb: (data: any) => void): void {
    this.socket?.on(event, cb);
  }

  off(event: string, cb?: (data: any) => void): void {
    this.socket?.off(event, cb as any);
  }

  /**
   * Optional helper if you want to wait until we're connected before an action.
   */
  ensureConnected(): Promise<void> {
    if (this.isConnected()) return Promise.resolve();
    this.connect();

    return new Promise<void>((resolve, reject) => {
      if (!this.socket) return reject(new Error("Socket not initialized"));

      const onConnect = () => {
        cleanup();
        resolve();
      };
      const onError = (err: any) => {
        cleanup();
        reject(err);
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("Socket connect timeout"));
      }, 10000);

      const cleanup = () => {
        clearTimeout(timer);
        this.socket?.off("connect", onConnect);
        this.socket?.off("connect_error", onError);
      };

      this.socket.on("connect", onConnect);
      this.socket.on("connect_error", onError);
    });
  }
}

export const socketService: ISocketService = new SocketServiceImpl();
// Some code adapted with AI assistance, modified for this project
