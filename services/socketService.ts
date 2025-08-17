// import { io, Socket } from "socket.io-client";
// import { Platform } from "react-native";
// export interface SocketService {
//   connect: () => void;
//   disconnect: () => void;
//   isConnected: () => boolean;
//   emit: (event: string, data?: any) => void;
//   on: (event: string, callback: (data: any) => void) => void;
//   off: (event: string, callback?: (data: any) => void) => void;
// }
// class SocketServiceImpl implements SocketService {
//   private socket: Socket | null = null;
//   private serverUrl: string;
//   constructor() {
//     // Configure server URL based on platform
//     this.serverUrl = this.getServerUrl();
//   }
//   private getServerUrl(): string {
//     if (__DEV__) {
//       // Development URLs
//       if (Platform.OS === "web") {
//         return "http://localhost:3001";
//       } else {
//         // Mobile development - adjust IP to your computer's IP
//         // return "http://192.168.1.100:3001";
//         return "http://10.0.0.192:3001";
//       }
//     } else {
//       // Production URL
//       return process.env.EXPO_PUBLIC_SOCKET_URL || "https://your-server.com";
//     }
//   }
//   connect(): void {
//     if (this.socket?.connected) {
//       console.log("Socket already connected");
//       return;
//     }
//     console.log(`Connecting to socket server: ${this.serverUrl}`);

//     this.socket = io(this.serverUrl, {
//       transports: ["websocket", "polling"],
//       timeout: 20000,
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });
//     this.setupEventListeners();
//   }
//   private setupEventListeners(): void {
//     if (!this.socket) return;
//     this.socket.on("connect", () => {
//       console.log("Socket connected:", this.socket?.id);
//     });
//     this.socket.on("disconnect", (reason) => {
//       console.log("Socket disconnected:", reason);
//     });
//     this.socket.on("connect_error", (error) => {
//       console.error("Socket connection error:", error.message);
//     });
//     this.socket.on("reconnect", (attemptNumber) => {
//       console.log("Socket reconnected after", attemptNumber, "attempts");
//     });
//     this.socket.on("reconnect_error", (error) => {
//       console.error("Socket reconnection error:", error.message);
//     });
//   }
//   disconnect(): void {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//     }
//   }
//   isConnected(): boolean {
//     return this.socket?.connected || false;
//   }
//   emit(event: string, data?: any): void {
//     if (this.socket?.connected) {
//       this.socket.emit(event, data);
//     } else {
//       console.warn("Socket not connected, cannot emit event:", event);
//     }
//   }
//   on(event: string, callback: (data: any) => void): void {
//     this.socket?.on(event, callback);
//   }
//   off(event: string, callback?: (data: any) => void): void {
//     this.socket?.off(event, callback);
//   }
// }
// export const socketService = new SocketServiceImpl();

// // services/socketService.ts
// import { io, Socket } from "socket.io-client";
// import { Platform } from "react-native";

// // let's try this:
// type QueueItem = { event: string; data?: any };

// export interface SocketService {
//   connect: () => void;
//   disconnect: () => void;
//   isConnected: () => boolean;
//   emit: (event: string, data?: any) => void;
//   on: (event: string, callback: (data: any) => void) => void;
//   off: (event: string, callback?: (data: any) => void) => void;
//   ensureConnected: () => Promise<void>; // <-- add
//   id: () => string | null; // <-- optional
// }

// // class SocketServiceImpl implements SocketService {
// //   private socket: Socket | null = null;
// //   private serverUrl: string;

// //   constructor() {
// //     this.serverUrl = this.getServerUrl();
// //     //  auto-connect -----
// //     this.connect();
// //   }

// //   private getServerUrl(): string {
// //     if (__DEV__) {
// //       return Platform.OS === "web"
// //         ? "http://localhost:3001"
// //         : "http://10.0.0.192:3001"; // your LAN IP + :3001
// //     }
// //     return process.env.EXPO_PUBLIC_SOCKET_URL || "https://your-server.com";
// //   }

// //   connect(): void {
// //     if (this.socket?.connected) {
// //       console.log("Socket already connected");
// //       return;
// //     }
// //     if (this.socket && !this.socket.connected) {
// //       // avoid creating a second client while connecting
// //       return;
// //     }

// //     console.log(`Connecting to socket server: ${this.serverUrl}`);
// //     this.socket = io(this.serverUrl, {
// //       transports: ["websocket", "polling"],
// //       timeout: 20000,
// //       reconnection: true,
// //       reconnectionAttempts: 5,
// //       reconnectionDelay: 1000,
// //     });
// //     this.setupEventListeners();
// //   }

// //   private setupEventListeners(): void {
// //     if (!this.socket) return;
// //     this.socket.on("connect", () => {
// //       console.log("Socket connected:", this.socket?.id);
// //     });
// //     this.socket.on("disconnect", (reason) => {
// //       console.log("Socket disconnected:", reason);
// //     });
// //     this.socket.on("connect_error", (error) => {
// //       console.error("Socket connection error:", error.message);
// //     });
// //     this.socket.on("reconnect", (attemptNumber) => {
// //       console.log("Socket reconnected after", attemptNumber, "attempts");
// //     });
// //     this.socket.on("reconnect_error", (error) => {
// //       console.error("Socket reconnection error:", error.message);
// //     });
// //   }
// // let's try this.....
// // class SocketServiceImpl {
// //   private socket: Socket | null = null;
// //   private serverUrl: string;
// //   private queue: QueueItem[] = []; // offline queue

// //   constructor() {
// //     // keep your LAN/web logic exactly as before
// //     this.serverUrl = __DEV__
// //       ? Platform.OS === "web"
// //         ? "http://localhost:3001"
// //         : "http://10.0.0.192:3001"
// //       : process.env.EXPO_PUBLIC_SOCKET_URL || "https://your-server.com";
// //   }

// //   connect() {
// //     if (this.socket?.connected) return;
// //     if (this.socket && !this.socket.connected) return; // avoid double client

// //     this.socket = io(this.serverUrl, {
// //       transports: ["websocket", "polling"],
// //       timeout: 20000,
// //       reconnection: true,
// //       reconnectionAttempts: 5,
// //       reconnectionDelay: 1000,
// //     });

// //     this.socket.on("connect", () => {
// //       console.log("Socket connected:", this.socket?.id);
// //       // flush queued events on connect
// //       const items = [...this.queue];
// //       this.queue = [];
// //       items.forEach(({ event, data }) => this.socket!.emit(event, data));
// //     });

// //     this.socket.on("disconnect", (reason) => {
// //       console.log("Socket disconnected:", reason);
// //     });

// //     this.socket.on("connect_error", (err) => {
// //       console.warn("Socket connect_error:", err?.message || err);
// //     });
// //   }

// //   disconnect() {
// //     this.socket?.disconnect();
// //     this.socket = null;
// //   }

// //   isConnected() {
// //     return this.socket?.connected || false;
// //   }

// //   emit(event: string, data?: any) {
// //     if (this.socket?.connected) {
// //       this.socket.emit(event, data);
// //     } else {
// //       // store to send later
// //       this.queue.push({ event, data });
// //     }
// //   }

// //   on(event: string, cb: (data: any) => void) {
// //     this.socket?.on(event, cb);
// //   }

// //   off(event: string, cb?: (data: any) => void) {
// //     this.socket?.off(event, cb as any);
// //   }

// //   id() {
// //     return this.socket?.id ?? null;
// //   }
// //   // THIS IS WHERE IT ENDS----- ^^^^^^

// //   // NEW: await a connection before proceeding
// //   async ensureConnected(): Promise<void> {
// //     if (this.isConnected()) return;
// //     this.connect();

// //     return new Promise<void>((resolve, reject) => {
// //       if (!this.socket) return reject(new Error("Socket not initialized"));

// //       const timer = setTimeout(() => {
// //         cleanup();
// //         reject(new Error("Socket connect timeout"));
// //       }, 10000);

// //       const onConnect = () => {
// //         cleanup();
// //         resolve();
// //       };
// //       const onError = (err: any) => {
// //         cleanup();
// //         reject(err);
// //       };
// //       const cleanup = () => {
// //         clearTimeout(timer);
// //         this.socket?.off("connect", onConnect);
// //         this.socket?.off("connect_error", onError);
// //       };

// //       this.socket.on("connect", onConnect);
// //       this.socket.on("connect_error", onError);
// //     });
// //   }

// //   disconnect(): void {
// //     if (this.socket) {
// //       this.socket.disconnect();
// //       this.socket = null;
// //     }
// //   }

// //   isConnected(): boolean {
// //     return this.socket?.connected || false;
// //   }

// //   id(): string | null {
// //     return this.socket?.id ?? null;
// //   }

// //   emit(event: string, data?: any): void {
// //     if (this.socket?.connected) {
// //       this.socket.emit(event, data);
// //     } else {
// //       console.warn("Socket not connected, cannot emit event:", event);
// //     }
// //   }

// //   on(event: string, callback: (data: any) => void): void {
// //     this.socket?.on(event, callback);
// //   }

// //   off(event: string, callback?: (data: any) => void): void {
// //     this.socket?.off(event, callback as any);
// //   }
// // }

// // export const socketService = new SocketServiceImpl();

// update for offline

// // services/socketService.ts
// import { io, Socket } from "socket.io-client";
// import { Platform } from "react-native";

// // Define a "queue item" type — holds any event/data we try to send while offline
// type QueueItem = { event: string; data?: any };

// class SocketService {
//   private socket: Socket | null = null; // socket.io connection
//   private serverUrl: string; // server URL for socket.io
//   private queue: QueueItem[] = []; // offline queue: stores unsent events

//   constructor() {
//     // Decide which server URL to use based on platform
//     // Web uses localhost. For mobile, you must use your machine's LAN IP (not localhost).
//     this.serverUrl =
//       Platform.OS === "web"
//         ? "http://localhost:3001" // web browser → localhost
//         : "http://192.168.1.45:3001"; // replace with YOUR LAN IP (mobile needs LAN, not localhost)

//     // this.serverUrl =
//     //   Platform.OS === "web" ? "http://localhost:3001" : "http://YOUR_IP:3001";
//   }

//   // Connect to the Socket.io server
//   connect(): void {
//     if (this.socket?.connected) return; // if already connected, do nothing

//     // Create the socket connection
//     this.socket = io(this.serverUrl, {
//       transports: ["websocket", "polling"], // fallback if websocket not available
//       reconnection: true, // try to reconnect automatically
//       reconnectionAttempts: 5, // max number of retries
//     });

//     // When we successfully connect…
//     this.socket.on("connect", () => {
//       console.log("✅ Connected to socket server:", this.socket?.id);

//       // Flush (send) any queued events from while we were offline
//       const items = [...this.queue];
//       this.queue = []; // clear the queue after copying
//       for (const { event, data } of items) {
//         this.socket!.emit(event, data);
//       }
//     });

//     // Handle disconnects (optional: just for debug/logging)
//     this.socket.on("disconnect", (reason) => {
//       console.log("❌ Disconnected from socket:", reason);
//     });
//   }

//   // Emit (send) an event to the server
//   emit(event: string, data?: any): void {
//     if (this.socket?.connected) {
//       // If connected, send immediately
//       this.socket.emit(event, data);
//     } else {
//       // If NOT connected, add to the offline queue
//       console.warn("⚠️ Not connected, queueing event:", event);
//       this.queue.push({ event, data });
//     }
//   }

//   // Listen for events from the server
//   on(event: string, callback: (data: any) => void): void {
//     this.socket?.on(event, callback);
//   }

//   // Stop listening to events
//   off(event: string, callback?: (data: any) => void): void {
//     this.socket?.off(event, callback as any);
//   }

//   // Disconnect manually
//   disconnect(): void {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//     }
//   }

//   // Check if socket is currently connected
//   isConnected(): boolean {
//     return this.socket?.connected || false;
//   }
// }

// // Export one global instance of the service
// export const socketService = new SocketService();

// services/socketService.ts
import { io, Socket } from "socket.io-client";
import { Platform } from "react-native";

/**
 * Small "offline queue" item: if we emit while disconnected,
 * we store the event+payload here and flush it after connect.
 */
type QueueItem = { event: string; data?: any };

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
        : "http://10.0.0.192:3001"
      : process.env.EXPO_PUBLIC_SOCKET_URL || "https://your-server.com";

    // ✅ Auto-connect so components can just use the service
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
