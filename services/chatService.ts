// // // // import { socketService } from "./socketService";
// // // // import { chatDatabaseService, ChatMessage, ChatRoom } from "./chatDatabase";
// // // // export interface TypingUser {
// // // //   userId: string;
// // // //   userName: string;
// // // //   isTyping: boolean;
// // // //   timestamp: string;
// // // // }
// // // // export interface ChatUser {
// // // //   userId: string;
// // // //   userName: string;
// // // //   socketId?: string;
// // // //   isOnline: boolean;
// // // // }
// // // // class ChatService {
// // // //   private currentUserId: string | null = null;
// // // //   private currentUserName: string | null = null;
// // // //   private currentRoomId: string | null = null;
// // // //   private typingTimeout: NodeJS.Timeout | null = null;
// // // //   // Event listeners
// // // //   private messageListeners: ((message: ChatMessage) => void)[] = [];
// // // //   private typingListeners: ((typingUser: TypingUser) => void)[] = [];
// // // //   private presenceListeners: ((users: ChatUser[]) => void)[] = [];
// // // //   private deliveryListeners: ((tempId: string, messageId: string) => void)[] =
// // // //     [];
// // // //   async initialize(userId: string, userName: string): Promise<void> {
// // // //     this.currentUserId = userId;
// // // //     this.currentUserName = userName;

// // // //     await chatDatabaseService.initializeDatabase();
// // // //     this.setupSocketListeners();

// // // //     // Join user session
// // // //     socketService.emit("user_join", {
// // // //       userId,
// // // //       userName,
// // // //       timestamp: new Date().toISOString(),
// // // //     });
// // // //   }
// // // //   private setupSocketListeners(): void {
// // // //     // Handle new messages
// // // //     socketService.on("new_message", (message: ChatMessage) => {
// // // //       this.handleNewMessage(message);
// // // //     });
// // // //     // Handle typing indicators
// // // //     socketService.on("user_typing", (data: TypingUser) => {
// // // //       this.notifyTypingListeners(data);
// // // //     });
// // // //     // Handle message delivery confirmation
// // // //     socketService.on(
// // // //       "message_delivered",
// // // //       (data: { tempId: string; messageId: string; timestamp: string }) => {
// // // //         this.handleMessageDelivered(data.tempId, data.messageId);
// // // //       }
// // // //     );
// // // //     // Handle room joined
// // // //     socketService.on(
// // // //       "room_joined",
// // // //       async (data: {
// // // //         roomId: string;
// // // //         messages: ChatMessage[];
// // // //         participants: ChatUser[];
// // // //       }) => {
// // // //         await this.handleRoomJoined(data);
// // // //       }
// // // //     );
// // // //     // Handle user presence
// // // //     socketService.on("user_joined_room", (data: ChatUser) => {
// // // //       // Handle user joining room
// // // //     });
// // // //     socketService.on("user_left_room", (data: ChatUser) => {
// // // //       // Handle user leaving room
// // // //     });
// // // //   }
// // // //   async joinRoom(roomId: string, roomName: string): Promise<void> {
// // // //     this.currentRoomId = roomId;

// // // //     // Create/update room in local database
// // // //     await chatDatabaseService.createOrUpdateRoom({
// // // //       id: roomId,
// // // //       name: roomName,
// // // //       unreadCount: 0,
// // // //       participants: [this.currentUserId!],
// // // //     });

// // // //     // Join room on server
// // // //     socketService.emit("join_room", {
// // // //       roomId,
// // // //       userId: this.currentUserId,
// // // //       userName: this.currentUserName,
// // // //     });
// // // //   }
// // // //   async sendMessage(text: string): Promise<void> {
// // // //     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName) {
// // // //       throw new Error("Not connected to a room");
// // // //     }
// // // //     const tempId = `temp_${Date.now()}_${Math.random()
// // // //       .toString(36)
// // // //       .substr(2, 9)}`;
// // // //     const message: ChatMessage = {
// // // //       id: tempId, // Will be replaced when server confirms
// // // //       tempId,
// // // //       roomId: this.currentRoomId,
// // // //       userId: this.currentUserId,
// // // //       userName: this.currentUserName,
// // // //       text,
// // // //       timestamp: new Date().toISOString(),
// // // //       delivered: false,
// // // //       read: true, // Own messages are considered read
// // // //       type: "text",
// // // //     };
// // // //     // Save optimistically to local database
// // // //     await chatDatabaseService.saveMessage(message);

// // // //     // Notify UI immediately
// // // //     this.notifyMessageListeners(message);
// // // //     // Send to server
// // // //     socketService.emit("send_message", {
// // // //       roomId: this.currentRoomId,
// // // //       message: {
// // // //         tempId,
// // // //         userId: this.currentUserId,
// // // //         userName: this.currentUserName,
// // // //         text,
// // // //         type: "text",
// // // //       },
// // // //     });
// // // //   }
// // // //   startTyping(): void {
// // // //     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName)
// // // //       return;
// // // //     socketService.emit("typing_start", {
// // // //       roomId: this.currentRoomId,
// // // //       userId: this.currentUserId,
// // // //       userName: this.currentUserName,
// // // //     });
// // // //     // Auto-stop typing after 3 seconds
// // // //     if (this.typingTimeout) {
// // // //       clearTimeout(this.typingTimeout);
// // // //     }

// // // //     this.typingTimeout = setTimeout(() => {
// // // //       this.stopTyping();
// // // //     }, 3000);
// // // //   }
// // // //   stopTyping(): void {
// // // //     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName)
// // // //       return;
// // // //     socketService.emit("typing_stop", {
// // // //       roomId: this.currentRoomId,
// // // //       userId: this.currentUserId,
// // // //       userName: this.currentUserName,
// // // //     });
// // // //     if (this.typingTimeout) {
// // // //       clearTimeout(this.typingTimeout);
// // // //       this.typingTimeout = null;
// // // //     }
// // // //   }
// // // //   async getMessagesForRoom(
// // // //     roomId: string,
// // // //     limit: number = 50,
// // // //     offset: number = 0
// // // //   ): Promise<ChatMessage[]> {
// // // //     return await chatDatabaseService.getMessagesForRoom(roomId, limit, offset);
// // // //   }
// // // //   async getAllRooms(): Promise<ChatRoom[]> {
// // // //     return await chatDatabaseService.getAllRooms();
// // // //   }
// // // //   private async handleNewMessage(message: ChatMessage): Promise<void> {
// // // //     // Save to local database
// // // //     await chatDatabaseService.saveMessage(message);

// // // //     // Notify UI
// // // //     this.notifyMessageListeners(message);
// // // //   }
// // // //   private async handleMessageDelivered(
// // // //     tempId: string,
// // // //     messageId: string
// // // //   ): Promise<void> {
// // // //     // Update local database
// // // //     await chatDatabaseService.updateMessageDeliveryStatus(
// // // //       tempId,
// // // //       messageId,
// // // //       true
// // // //     );

// // // //     // Notify UI
// // // //     this.notifyDeliveryListeners(tempId, messageId);
// // // //   }
// // // //   private async handleRoomJoined(data: {
// // // //     roomId: string;
// // // //     messages: ChatMessage[];
// // // //     participants: ChatUser[];
// // // //   }): Promise<void> {
// // // //     // Save historical messages to local database
// // // //     for (const message of data.messages) {
// // // //       await chatDatabaseService.saveMessage(message);
// // // //     }
// // // //   }
// // // //   // Event listener management
// // // //   onMessage(callback: (message: ChatMessage) => void): () => void {
// // // //     this.messageListeners.push(callback);
// // // //     return () => {
// // // //       this.messageListeners = this.messageListeners.filter(
// // // //         (cb) => cb !== callback
// // // //       );
// // // //     };
// // // //   }
// // // //   onTyping(callback: (typingUser: TypingUser) => void): () => void {
// // // //     this.typingListeners.push(callback);
// // // //     return () => {
// // // //       this.typingListeners = this.typingListeners.filter(
// // // //         (cb) => cb !== callback
// // // //       );
// // // //     };
// // // //   }
// // // //   onDelivery(
// // // //     callback: (tempId: string, messageId: string) => void
// // // //   ): () => void {
// // // //     this.deliveryListeners.push(callback);
// // // //     return () => {
// // // //       this.deliveryListeners = this.deliveryListeners.filter(
// // // //         (cb) => cb !== callback
// // // //       );
// // // //     };
// // // //   }
// // // //   private notifyMessageListeners(message: ChatMessage): void {
// // // //     this.messageListeners.forEach((callback) => callback(message));
// // // //   }
// // // //   private notifyTypingListeners(typingUser: TypingUser): void {
// // // //     this.typingListeners.forEach((callback) => callback(typingUser));
// // // //   }
// // // //   private notifyDeliveryListeners(tempId: string, messageId: string): void {
// // // //     this.deliveryListeners.forEach((callback) => callback(tempId, messageId));
// // // //   }
// // // // }
// // // // export const chatService = new ChatService();
// // // // //

// // // // services/chatService.ts
// // // import { socketService } from "./socketService";
// // // import { chatDatabaseService, ChatMessage, ChatRoom } from "./chatDatabase";

// // // export interface TypingUser {
// // //   userId: string;
// // //   userName: string;
// // //   isTyping: boolean;
// // //   timestamp: string;
// // // }
// // // export interface ChatUser {
// // //   userId: string;
// // //   userName: string;
// // //   socketId?: string;
// // //   isOnline: boolean;
// // // }

// // // class ChatService {
// // //   private currentUserId: string | null = null;
// // //   private currentUserName: string | null = null;
// // //   private currentRoomId: string | null = null;
// // //   private typingTimeout: NodeJS.Timeout | null = null;

// // //   // Event listeners
// // //   private messageListeners: ((message: ChatMessage) => void)[] = [];
// // //   private typingListeners: ((typingUser: TypingUser) => void)[] = [];
// // //   private deliveryListeners: ((tempId: string, messageId: string) => void)[] =
// // //     [];

// // //   // services/chatService.ts
// // //   async initialize(userId: string, userName: string): Promise<void> {
// // //     this.currentUserId = userId;
// // //     this.currentUserName = userName;

// // //     // MFIANLLY! Connected!
// // //     await socketService.ensureConnected();

// // //     // DB can fail on web or if SQLite not configured—don’t block UI
// // //     try {
// // //       await chatDatabaseService.initializeDatabase();
// // //     } catch (e) {
// // //       console.warn("SQLite init failed; continuing without persistence:", e);
// // //     }

// // //     this.setupSocketListeners();

// // //     // Announce presence
// // //     socketService.emit("user_join", {
// // //       userId,
// // //       userName,
// // //       timestamp: new Date().toISOString(),
// // //     });
// // //   }

// // //   private setupSocketListeners(): void {
// // //     // New message from server -> show in UI immediately, then try to persist
// // //     socketService.on("new_message", async (message: ChatMessage) => {
// // //       this.notifyMessageListeners(message);
// // //       try {
// // //         await chatDatabaseService.saveMessage(message);
// // //       } catch (e) {
// // //         console.warn("saveMessage (incoming) failed:", e);
// // //       }
// // //     });

// // //     // Typing indicator
// // //     socketService.on("user_typing", (data: TypingUser) => {
// // //       this.typingListeners.forEach((cb) => cb(data));
// // //     });

// // //     // Delivery confirmation for our optimistic message
// // //     socketService.on(
// // //       "message_delivered",
// // //       async (data: {
// // //         tempId: string;
// // //         messageId: string;
// // //         timestamp: string;
// // //       }) => {
// // //         try {
// // //           await chatDatabaseService.updateMessageDeliveryStatus(
// // //             data.tempId,
// // //             data.messageId,
// // //             true
// // //           );
// // //         } catch (e) {
// // //           console.warn("updateMessageDeliveryStatus failed:", e);
// // //         }
// // //         this.deliveryListeners.forEach((cb) => cb(data.tempId, data.messageId));
// // //       }
// // //     );

// // //     // Room joined -> preload history into local DB (best effort)
// // //     socketService.on(
// // //       "room_joined",
// // //       async (data: {
// // //         roomId: string;
// // //         messages: ChatMessage[];
// // //         participants: ChatUser[];
// // //       }) => {
// // //         for (const m of data.messages) {
// // //           try {
// // //             await chatDatabaseService.saveMessage(m);
// // //           } catch (e) {
// // //             console.warn("saveMessage (history) failed:", e);
// // //           }
// // //         }
// // //       }
// // //     );
// // //   }

// // //   async joinRoom(roomId: string, roomName: string): Promise<void> {
// // //     this.currentRoomId = roomId;

// // //     try {
// // //       await chatDatabaseService.createOrUpdateRoom({
// // //         id: roomId,
// // //         name: roomName,
// // //         unreadCount: 0,
// // //         participants: [this.currentUserId!],
// // //       });
// // //     } catch (e) {
// // //       // ok to ignore for now
// // //     }

// // //     socketService.emit("join_room", {
// // //       roomId,
// // //       userId: this.currentUserId,
// // //       userName: this.currentUserName,
// // //     });
// // //   }

// // //   async sendMessage(text: string): Promise<void> {
// // //     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName) {
// // //       throw new Error("Not connected to a room");
// // //     }

// // //     const tempId = `temp_${Date.now()}_${Math.random()
// // //       .toString(36)
// // //       .slice(2, 9)}`;

// // //     // Optimistic message
// // //     const optimistic: ChatMessage = {
// // //       id: tempId, // temp id is used by the FlatList keyExtractor
// // //       tempId,
// // //       roomId: this.currentRoomId,
// // //       userId: this.currentUserId,
// // //       userName: this.currentUserName,
// // //       text,
// // //       timestamp: new Date().toISOString(),
// // //       delivered: false,
// // //       read: true,
// // //       type: "text",
// // //     };

// // //     // 1) Show it immediately
// // //     this.notifyMessageListeners(optimistic);

// // //     // 2) Try to persist (don't block UI)
// // //     try {
// // //       await chatDatabaseService.saveMessage(optimistic);
// // //     } catch (e) {
// // //       console.warn("saveMessage (optimistic) failed:", e);
// // //     }

// // //     // 3) Send to server
// // //     socketService.emit("send_message", {
// // //       roomId: this.currentRoomId,
// // //       message: {
// // //         tempId,
// // //         userId: this.currentUserId,
// // //         userName: this.currentUserName,
// // //         text,
// // //         type: "text",
// // //       },
// // //     });
// // //   }

// // //   startTyping(): void {
// // //     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName)
// // //       return;

// // //     socketService.emit("typing_start", {
// // //       roomId: this.currentRoomId,
// // //       userId: this.currentUserId,
// // //       userName: this.currentUserName,
// // //     });

// // //     if (this.typingTimeout) clearTimeout(this.typingTimeout);
// // //     this.typingTimeout = setTimeout(() => this.stopTyping(), 3000);
// // //   }

// // //   stopTyping(): void {
// // //     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName)
// // //       return;

// // //     socketService.emit("typing_stop", {
// // //       roomId: this.currentRoomId,
// // //       userId: this.currentUserId,
// // //       userName: this.currentUserName,
// // //     });

// // //     if (this.typingTimeout) {
// // //       clearTimeout(this.typingTimeout);
// // //       this.typingTimeout = null;
// // //     }
// // //   }

// // //   async getMessagesForRoom(
// // //     roomId: string,
// // //     limit = 50,
// // //     offset = 0
// // //   ): Promise<ChatMessage[]> {
// // //     try {
// // //       return await chatDatabaseService.getMessagesForRoom(
// // //         roomId,
// // //         limit,
// // //         offset
// // //       );
// // //     } catch {
// // //       return []; // if DB not available, just return empty history
// // //     }
// // //   }
// // //   async getAllRooms(): Promise<ChatRoom[]> {
// // //     try {
// // //       return await chatDatabaseService.getAllRooms();
// // //     } catch {
// // //       return [];
// // //     }
// // //   }

// // //   // Listener management
// // //   onMessage(cb: (m: ChatMessage) => void) {
// // //     this.messageListeners.push(cb);
// // //     return () =>
// // //       (this.messageListeners = this.messageListeners.filter((x) => x !== cb));
// // //   }
// // //   onTyping(cb: (t: TypingUser) => void) {
// // //     this.typingListeners.push(cb);
// // //     return () =>
// // //       (this.typingListeners = this.typingListeners.filter((x) => x !== cb));
// // //   }
// // //   onDelivery(cb: (tempId: string, messageId: string) => void) {
// // //     this.deliveryListeners.push(cb);
// // //     return () =>
// // //       (this.deliveryListeners = this.deliveryListeners.filter((x) => x !== cb));
// // //   }

// // //   private notifyMessageListeners(message: ChatMessage) {
// // //     this.messageListeners.forEach((cb) => cb(message));
// // //   }
// // // }

// // // export const chatService = new ChatService();

// // // services/chatService.ts
// // import { socketService } from "./socketService";
// // import { chatDatabaseService, ChatMessage, ChatRoom } from "./chatDatabase";

// // export interface TypingUser {
// //   userId: string;
// //   userName: string;
// //   isTyping: boolean;
// //   timestamp: string;
// // }

// // export interface ChatUser {
// //   userId: string;
// //   userName: string;
// //   socketId?: string;
// //   isOnline: boolean;
// // }

// // class ChatService {
// //   private currentUserId: string | null = null;
// //   private currentUserName: string | null = null;
// //   private currentRoomId: string | null = null;
// //   private typingTimeout: NodeJS.Timeout | null = null;

// //   // EXPLNTION***  --->> Arrays of callbacks so that the UI can "subscribe" to new events
// //   private messageListeners: ((message: ChatMessage) => void)[] = [];
// //   private typingListeners: ((typingUser: TypingUser) => void)[] = [];
// //   private deliveryListeners: ((tempId: string, messageId: string) => void)[] =
// //     [];

// //   async initialize(userId: string, userName: string): Promise<void> {
// //     this.currentUserId = userId;
// //     this.currentUserName = userName;

// //     // EXPLNTION***  --->> Make sure the socket is connected before doing anything
// //     await socketService.ensureConnected();

// //     // EXPLNTION***  --->> Try to set up the SQLite database.
// //     // On web it might fail (since SQLite is not available), so we catch and continue.
// //     try {
// //       await chatDatabaseService.initializeDatabase();
// //     } catch (e) {
// //       console.warn("SQLite init failed; continuing without persistence:", e);
// //     }

// //     // EXPLNTION***  --->> Set up socket event listeners (new messages, typing, delivery, etc.)
// //     this.setupSocketListeners();

// //     // EXPLNTION***  --->> Announce this user to the server so others see you as "online"
// //     socketService.emit("user_join", {
// //       userId,
// //       userName,
// //       timestamp: new Date().toISOString(),
// //     });
// //   }

// //   private setupSocketListeners(): void {
// //     // EXPLNTION***  --->> Server sends "new_message" whenever *anyone* posts
// //     socketService.on("new_message", async (message: ChatMessage) => {
// //       this.notifyMessageListeners(message); // update the UI immediately
// //       try {
// //         await chatDatabaseService.saveMessage(message); // save to SQLite for persistence
// //       } catch (e) {
// //         console.warn("saveMessage (incoming) failed:", e);
// //       }
// //     });

// //     // EXPLNTION***  --->> Typing indicators (someone else is typing)
// //     socketService.on("user_typing", (data: TypingUser) => {
// //       this.typingListeners.forEach((cb) => cb(data));
// //     });

// //     // EXPLNTION***  --->> Server confirms our optimistic message was delivered
// //     socketService.on(
// //       "message_delivered",
// //       async (data: {
// //         tempId: string;
// //         messageId: string;
// //         timestamp: string;
// //       }) => {
// //         try {
// //           await chatDatabaseService.updateMessageDeliveryStatus(
// //             data.tempId,
// //             data.messageId,
// //             true
// //           );
// //         } catch (e) {
// //           console.warn("updateMessageDeliveryStatus failed:", e);
// //         }
// //         this.deliveryListeners.forEach((cb) => cb(data.tempId, data.messageId));
// //       }
// //     );

// //     // EXPLNTION***  --->> When we join a room, server may send past messages (history)
// //     socketService.on(
// //       "room_joined",
// //       async (data: {
// //         roomId: string;
// //         messages: ChatMessage[];
// //         participants: ChatUser[];
// //       }) => {
// //         for (const m of data.messages) {
// //           try {
// //             await chatDatabaseService.saveMessage(m); // preload history
// //           } catch (e) {
// //             console.warn("saveMessage (history) failed:", e);
// //           }
// //         }
// //       }
// //     );
// //   }

// //   async joinRoom(roomId: string, roomName: string): Promise<void> {
// //     this.currentRoomId = roomId;

// //     // EXPLNTION***  --->> Create the room in SQLite if it doesn’t exist
// //     try {
// //       await chatDatabaseService.createOrUpdateRoom({
// //         id: roomId,
// //         name: roomName,
// //         unreadCount: 0,
// //         participants: [this.currentUserId!],
// //       });
// //     } catch (e) {
// //       // ok to ignore if DB fails
// //     }

// //     // EXPLNTION***  --->> Tell the server we want to join this room
// //     socketService.emit("join_room", {
// //       roomId,
// //       userId: this.currentUserId,
// //       userName: this.currentUserName,
// //     });
// //   }

// //   async sendMessage(text: string): Promise<void> {
// //     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName) {
// //       throw new Error("Not connected to a room");
// //     }

// //     // EXPLNTION***  --->> Generate a temporary ID so we can show the message
// //     // immediately before the server assigns a "real" ID
// //     const tempId = `temp_${Date.now()}_${Math.random()
// //       .toString(36)
// //       .slice(2, 9)}`;

// //     const optimistic: ChatMessage = {
// //       id: tempId, // EXPLNTION***  used by FlatList keyExtractor
// //       tempId,
// //       roomId: this.currentRoomId,
// //       userId: this.currentUserId,
// //       userName: this.currentUserName,
// //       text,
// //       timestamp: new Date().toISOString(),
// //       delivered: false, // EXPLNTION***  will become true when server confirms
// //       read: true, // EXPLNTION***  our own messages are always "read"
// //       type: "text",
// //     };

// //     // 1) EXPLNTION***  Show the message immediately in the UI
// //     this.notifyMessageListeners(optimistic);

// //     // 2) EXPLNTION***  Save to SQLite so it persists even if offline
// //     try {
// //       await chatDatabaseService.saveMessage(optimistic);
// //     } catch (e) {
// //       console.warn("saveMessage (optimistic) failed:", e);
// //     }

// //     // 3) EXPLNTION***  Send to the server (socketService will queue if offline)
// //     socketService.emit("send_message", {
// //       roomId: this.currentRoomId,
// //       message: {
// //         tempId,
// //         userId: this.currentUserId,
// //         userName: this.currentUserName,
// //         text,
// //         type: "text",
// //       },
// //     });
// //   }

// //   startTyping(): void {
// //     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName)
// //       return;

// //     socketService.emit("typing_start", {
// //       roomId: this.currentRoomId,
// //       userId: this.currentUserId,
// //       userName: this.currentUserName,
// //     });

// //     // EXPLNTION***  --->> Reset typing timer so if you stop typing it auto-stops after 3s
// //     if (this.typingTimeout) clearTimeout(this.typingTimeout);
// //     this.typingTimeout = setTimeout(() => this.stopTyping(), 3000);
// //   }

// //   stopTyping(): void {
// //     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName)
// //       return;

// //     socketService.emit("typing_stop", {
// //       roomId: this.currentRoomId,
// //       userId: this.currentUserId,
// //       userName: this.currentUserName,
// //     });

// //     if (this.typingTimeout) {
// //       clearTimeout(this.typingTimeout);
// //       this.typingTimeout = null;
// //     }
// //   }

// //   async getMessagesForRoom(
// //     roomId: string,
// //     limit = 50,
// //     offset = 0
// //   ): Promise<ChatMessage[]> {
// //     try {
// //       return await chatDatabaseService.getMessagesForRoom(
// //         roomId,
// //         limit,
// //         offset
// //       );
// //     } catch {
// //       return []; // EXPLNTION***  fallback if DB isn’t available
// //     }
// //   }

// //   async getAllRooms(): Promise<ChatRoom[]> {
// //     try {
// //       return await chatDatabaseService.getAllRooms();
// //     } catch {
// //       return [];
// //     }
// //   }

// //   // EXPLNTION*** --->> "onX" = lets UI subscribe to updates.
// //   // Returns a function that unsubscribes.
// //   onMessage(cb: (m: ChatMessage) => void) {
// //     this.messageListeners.push(cb);
// //     return () =>
// //       (this.messageListeners = this.messageListeners.filter((x) => x !== cb));
// //   }
// //   onTyping(cb: (t: TypingUser) => void) {
// //     this.typingListeners.push(cb);
// //     return () =>
// //       (this.typingListeners = this.typingListeners.filter((x) => x !== cb));
// //   }
// //   onDelivery(cb: (tempId: string, messageId: string) => void) {
// //     this.deliveryListeners.push(cb);
// //     return () =>
// //       (this.deliveryListeners = this.deliveryListeners.filter((x) => x !== cb));
// //   }

// //   private notifyMessageListeners(message: ChatMessage) {
// //     this.messageListeners.forEach((cb) => cb(message));
// //   }
// // }

// // export const chatService = new ChatService();
// // //

// // services/chatService.ts
// // -------------------------------------------------------------
// // ChatService: real-time chat + persistence + resilient send
// // -------------------------------------------------------------
// // What you get here:
// // 1) Optimistic UI updates (message shows immediately)
// // 2) SQLite persistence (history survives app restarts)
// // 3) App-level Outbox in AsyncStorage (messages re-send after
// //    offline periods or Expo reloads)
// // 4) Clean subscription API for your hook/UI
// // -------------------------------------------------------------

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { socketService } from "./socketService";
// import { chatDatabaseService, ChatMessage, ChatRoom } from "./chatDatabase";

// /** ---------- Shared types used across the app ---------- */
// export interface TypingUser {
//   userId: string;
//   userName: string;
//   isTyping: boolean;
//   timestamp: string;
// }
// export interface ChatUser {
//   userId: string;
//   userName: string;
//   socketId?: string;
//   isOnline: boolean;
// }

// /** ---------- Outbox (persisted retry queue) ---------- */
// /*
//   WHY an "Outbox" when socketService already queues?

//   - socketService queues "raw socket emits" (generic).
//   - This Outbox queues "chat-intent" messages with tempIds,
//     so we can **replay the exact send_message payload** the server expects,
//     even after an Expo reload or app restart.

//   TL;DR: double safety net, tied to your Chat domain.
// */
// type OutboxItem = {
//   tempId: string; // links optimistic UI message → server ACK
//   roomId: string;
//   text: string;
//   userId: string;
//   userName: string;
//   createdAt: string; // useful for debugging or sorting
// };
// const OUTBOX_KEY = "chatOutbox@v1";

// /** ---------- The service itself ---------- */
// class ChatService {
//   // We remember who we are and which room we’re in
//   private currentUserId: string | null = null;
//   private currentUserName: string | null = null;
//   private currentRoomId: string | null = null;
//   private typingTimeout: NodeJS.Timeout | null = null;

//   // Arrays of callbacks so the UI can "subscribe" to updates
//   private messageListeners: Array<(message: ChatMessage) => void> = [];
//   private typingListeners: Array<(typingUser: TypingUser) => void> = [];
//   private deliveryListeners: Array<
//     (tempId: string, messageId: string) => void
//   > = [];

//   // ---------------- Outbox helpers ----------------

//   // Read all pending items from AsyncStorage
//   private async readOutbox(): Promise<OutboxItem[]> {
//     try {
//       const raw = await AsyncStorage.getItem(OUTBOX_KEY);
//       return raw ? (JSON.parse(raw) as OutboxItem[]) : [];
//     } catch {
//       return [];
//     }
//   }

//   // Write full outbox array
//   private async writeOutbox(items: OutboxItem[]) {
//     try {
//       await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
//     } catch {
//       // Ignore write errors (dev-friendly). Worst case: we only lose retries.
//     }
//   }

//   // Add one item to the outbox
//   private async pushOutbox(item: OutboxItem) {
//     const items = await this.readOutbox();
//     items.push(item);
//     await this.writeOutbox(items);
//   }

//   // Remove a sent item by tempId (after server ACK)
//   private async removeFromOutbox(tempId: string) {
//     const items = await this.readOutbox();
//     const next = items.filter((i) => i.tempId !== tempId);
//     await this.writeOutbox(next);
//   }

//   // Attempt to emit everything in the outbox (in order)
//   private async flushOutbox() {
//     // If socket isn’t connected, do nothing now — we’ll try again on connect.
//     if (!socketService.isConnected()) return;

//     const items = await this.readOutbox();
//     if (items.length === 0) return;

//     // Emit each item exactly like sendMessage() would do
//     for (const it of items) {
//       socketService.emit("send_message", {
//         roomId: it.roomId,
//         message: {
//           tempId: it.tempId,
//           userId: it.userId,
//           userName: it.userName,
//           text: it.text,
//           type: "text",
//         },
//       });
//     }
//     // DO NOT clear the outbox here — we wait for "message_delivered"
//     // so we only remove items that were actually acknowledged.
//   }

//   // ---------------- Lifecycle ----------------

//   /**
//    * initialize(userId, userName)
//    * - Ensures socket is connected
//    * - Initializes SQLite (best effort on web)
//    * - Wires socket listeners
//    * - Announces presence to server
//    * - Flushes any pending Outbox items (if connected)
//    */
//   async initialize(userId: string, userName: string): Promise<void> {
//     this.currentUserId = userId;
//     this.currentUserName = userName;

//     // 1) Make sure the socket is up before anything else
//     await socketService.ensureConnected();

//     // 2) Set up the local DB (if available on this platform)
//     try {
//       await chatDatabaseService.initializeDatabase();
//     } catch (e) {
//       console.warn("SQLite init failed; continuing without persistence:", e);
//     }

//     // 3) Wire up all socket events we care about
//     this.setupSocketListeners();

//     // 4) Tell the server we’re online (so presence looks correct)
//     socketService.emit("user_join", {
//       userId,
//       userName,
//       timestamp: new Date().toISOString(),
//     });

//     // 5) After we’re connected, try to send anything stuck in Outbox
//     await this.flushOutbox();
//   }

//   /**
//    * setupSocketListeners()
//    * Register all listeners once. They:
//    * - Update UI immediately
//    * - Persist to DB (best effort)
//    * - Keep Outbox in sync (remove items when delivered)
//    */
//   private setupSocketListeners(): void {
//     // If we reconnect later (e.g., Wi-Fi returns), try flushing Outbox again
//     socketService.on("connect", async () => {
//       await this.flushOutbox();
//     });

//     // Any new message (ours or others) → update UI, then try to persist
//     socketService.on("new_message", async (message: ChatMessage) => {
//       this.notifyMessageListeners(message);
//       try {
//         await chatDatabaseService.saveMessage(message);
//       } catch (e) {
//         console.warn("saveMessage (incoming) failed:", e);
//       }
//     });

//     // Someone is typing (from server broadcast)
//     socketService.on("user_typing", (data: TypingUser) => {
//       this.typingListeners.forEach((cb) => cb(data));
//     });

//     // Server confirms a message we sent (maps tempId → real id)
//     socketService.on(
//       "message_delivered",
//       async (data: {
//         tempId: string;
//         messageId: string;
//         timestamp: string;
//       }) => {
//         // 1) Update DB delivered flag + replace tempId in storage
//         try {
//           await chatDatabaseService.updateMessageDeliveryStatus(
//             data.tempId,
//             data.messageId,
//             true
//           );
//         } catch (e) {
//           console.warn("updateMessageDeliveryStatus failed:", e);
//         }

//         // 2) Remove this item from the Outbox (it’s officially sent)
//         await this.removeFromOutbox(data.tempId);

//         // 3) Notify UI so it can swap tempId → real id in memory
//         this.deliveryListeners.forEach((cb) => cb(data.tempId, data.messageId));
//       }
//     );

//     // When joining a room, server may send a history snapshot—save it
//     socketService.on(
//       "room_joined",
//       async (data: {
//         roomId: string;
//         messages: ChatMessage[];
//         participants: ChatUser[];
//       }) => {
//         for (const m of data.messages) {
//           try {
//             await chatDatabaseService.saveMessage(m);
//           } catch (e) {
//             console.warn("saveMessage (history) failed:", e);
//           }
//         }
//         // If we queued while offline and join completes now, be extra sure we flush
//         await this.flushOutbox();
//       }
//     );
//   }

//   // ---------------- Room actions ----------------

//   /**
//    * joinRoom(roomId, roomName)
//    * - Records current room
//    * - Creates/updates the room locally (for list UI)
//    * - Tells the server to join that room
//    */
//   async joinRoom(roomId: string, roomName: string): Promise<void> {
//     this.currentRoomId = roomId;

//     // Best-effort local room record (OK if DB fails on web)
//     try {
//       await chatDatabaseService.createOrUpdateRoom({
//         id: roomId,
//         name: roomName,
//         unreadCount: 0,
//         participants: [this.currentUserId!],
//       });
//     } catch {
//       // no-op
//     }

//     // Join on the server so we start getting room events
//     socketService.emit("join_room", {
//       roomId,
//       userId: this.currentUserId,
//       userName: this.currentUserName,
//     });
//   }

//   // ---------------- Messaging ----------------

//   /**
//    * sendMessage(text)
//    * - Builds an optimistic message with a tempId
//    * - Updates UI immediately
//    * - Saves to DB for persistence
//    * - Adds a retry entry to Outbox
//    * - Emits over socket (socketService will queue if offline)
//    */
//   async sendMessage(text: string): Promise<void> {
//     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName) {
//       throw new Error("Not connected to a room");
//     }

//     // A tempId lets us replace this optimistic message when server ACKs
//     const tempId = `temp_${Date.now()}_${Math.random()
//       .toString(36)
//       .slice(2, 9)}`;

//     // Build the optimistic message (what your FlatList renders now)
//     const optimistic: ChatMessage = {
//       id: tempId, // used as key; replaced with real id later
//       tempId,
//       roomId: this.currentRoomId,
//       userId: this.currentUserId,
//       userName: this.currentUserName,
//       text,
//       timestamp: new Date().toISOString(),
//       delivered: false, // will flip to true on "message_delivered"
//       read: true, // our own message is read by us
//       type: "text",
//     };

//     // 1) Update UI immediately
//     this.notifyMessageListeners(optimistic);

//     // 2) Persist locally so history survives reloads
//     try {
//       await chatDatabaseService.saveMessage(optimistic);
//     } catch (e) {
//       console.warn("saveMessage (optimistic) failed:", e);
//     }

//     // 3) Add to Outbox BEFORE trying to emit (so a crash right now won’t lose it)
//     await this.pushOutbox({
//       tempId,
//       roomId: this.currentRoomId,
//       text,
//       userId: this.currentUserId,
//       userName: this.currentUserName,
//       createdAt: new Date().toISOString(),
//     });

//     // 4) Emit to server (socketService will also queue raw emits if offline)
//     socketService.emit("send_message", {
//       roomId: this.currentRoomId,
//       message: {
//         tempId,
//         userId: this.currentUserId,
//         userName: this.currentUserName,
//         text,
//         type: "text",
//       },
//     });
//   }

//   // ---------------- Typing indicators ----------------

//   startTyping(): void {
//     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName)
//       return;

//     socketService.emit("typing_start", {
//       roomId: this.currentRoomId,
//       userId: this.currentUserId,
//       userName: this.currentUserName,
//     });

//     // Auto-stop typing after 3s of inactivity
//     if (this.typingTimeout) clearTimeout(this.typingTimeout);
//     this.typingTimeout = setTimeout(() => this.stopTyping(), 3000);
//   }

//   stopTyping(): void {
//     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName)
//       return;

//     socketService.emit("typing_stop", {
//       roomId: this.currentRoomId,
//       userId: this.currentUserId,
//       userName: this.currentUserName,
//     });

//     if (this.typingTimeout) {
//       clearTimeout(this.typingTimeout);
//       this.typingTimeout = null;
//     }
//   }

//   // ---------------- Persistence API for UI ----------------

//   async getMessagesForRoom(
//     roomId: string,
//     limit = 50,
//     offset = 0
//   ): Promise<ChatMessage[]> {
//     try {
//       return await chatDatabaseService.getMessagesForRoom(
//         roomId,
//         limit,
//         offset
//       );
//     } catch {
//       return []; // web fallback if SQLite not available
//     }
//   }

//   async getAllRooms(): Promise<ChatRoom[]> {
//     try {
//       return await chatDatabaseService.getAllRooms();
//     } catch {
//       return [];
//     }
//   }

//   // ---------------- Subscriptions (used by useChat) ----------------

//   // UI subscribes to "new message" events from this service
//   onMessage(cb: (m: ChatMessage) => void) {
//     this.messageListeners.push(cb);
//     return () =>
//       (this.messageListeners = this.messageListeners.filter((x) => x !== cb));
//   }

//   // UI subscribes to "typing" events from this service
//   onTyping(cb: (t: TypingUser) => void) {
//     this.typingListeners.push(cb);
//     return () =>
//       (this.typingListeners = this.typingListeners.filter((x) => x !== cb));
//   }

//   // UI subscribes to "delivery" (tempId → messageId) events
//   onDelivery(cb: (tempId: string, messageId: string) => void) {
//     this.deliveryListeners.push(cb);
//     return () =>
//       (this.deliveryListeners = this.deliveryListeners.filter((x) => x !== cb));
//   }

//   // Helper to fan out a message to all message subscribers
//   private notifyMessageListeners(message: ChatMessage) {
//     this.messageListeners.forEach((cb) => cb(message));
//   }
// }

// export const chatService = new ChatService();

// Upadted ChatService with a caches foe Web -----
// services/chatService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { socketService } from "./socketService";
import { chatDatabaseService, ChatMessage, ChatRoom } from "./chatDatabase";

/** ---------------- Types ---------------- */
export interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}
export interface ChatUser {
  userId: string;
  userName: string;
  socketId?: string;
  isOnline: boolean;
}

/**
 * OutboxItem = minimal payload to retry a send if we went offline or reloaded
 * before the socket had a chance to flush.
 */
type OutboxItem = {
  tempId: string;
  roomId: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
};

const OUTBOX_KEY = "chatOutbox@v1";

/**
 * 🧠 NEW: simple per-room cache for the **Web** platform.
 * - Each room’s messages are stored under chatCache@room::<roomId>
 * - We store a *small* window (e.g. 200) so reloads show history even w/o SQLite
 */
const roomCacheKey = (roomId: string) => `chatCache@room::${roomId}`;
const ROOM_CACHE_CAP = 200; // keep last 200 messages per room

class ChatService {
  private currentUserId: string | null = null;
  private currentUserName: string | null = null;
  private currentRoomId: string | null = null;
  private typingTimeout: NodeJS.Timeout | null = null;

  // UI subscriptions
  private messageListeners: ((message: ChatMessage) => void)[] = [];
  private typingListeners: ((typingUser: TypingUser) => void)[] = [];
  private deliveryListeners: ((tempId: string, messageId: string) => void)[] =
    [];

  /** --------------- OUTBOX helpers (retries sends) --------------- */

  private async readOutbox(): Promise<OutboxItem[]> {
    try {
      const raw = await AsyncStorage.getItem(OUTBOX_KEY);
      return raw ? (JSON.parse(raw) as OutboxItem[]) : [];
    } catch {
      return [];
    }
  }
  private async writeOutbox(items: OutboxItem[]) {
    try {
      await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
    } catch {}
  }
  private async pushOutbox(item: OutboxItem) {
    const items = await this.readOutbox();
    items.push(item);
    await this.writeOutbox(items);
  }
  private async removeFromOutbox(tempId: string) {
    const items = await this.readOutbox();
    const next = items.filter((i) => i.tempId !== tempId);
    await this.writeOutbox(next);
  }
  private async flushOutbox() {
    if (!socketService.isConnected()) return;
    const items = await this.readOutbox();
    if (items.length === 0) return;

    for (const it of items) {
      socketService.emit("send_message", {
        roomId: it.roomId,
        message: {
          tempId: it.tempId,
          userId: it.userId,
          userName: it.userName,
          text: it.text,
          type: "text",
        },
      });
    }
    // NOTE: we do NOT clear here; we remove each tempId on ACK
  }

  /** --------------- WEB ROOM-CACHE helpers --------------- */
  // These are used only as a fallback when DB isn’t available (e.g., Web).

  private async cacheAppend(message: ChatMessage) {
    if (Platform.OS !== "web") return; // only needed on Web
    try {
      const key = roomCacheKey(message.roomId);
      const raw = await AsyncStorage.getItem(key);
      const list: ChatMessage[] = raw ? JSON.parse(raw) : [];
      list.push(message);
      // cap to last N for sanity
      const trimmed =
        list.length > ROOM_CACHE_CAP ? list.slice(-ROOM_CACHE_CAP) : list;
      await AsyncStorage.setItem(key, JSON.stringify(trimmed));
    } catch {}
  }

  private async cacheBulkAppend(roomId: string, msgs: ChatMessage[]) {
    if (Platform.OS !== "web" || msgs.length === 0) return;
    try {
      const key = roomCacheKey(roomId);
      const raw = await AsyncStorage.getItem(key);
      const list: ChatMessage[] = raw ? JSON.parse(raw) : [];
      const next = [...list, ...msgs];
      const trimmed =
        next.length > ROOM_CACHE_CAP ? next.slice(-ROOM_CACHE_CAP) : next;
      await AsyncStorage.setItem(key, JSON.stringify(trimmed));
    } catch {}
  }

  private async cacheLoad(roomId: string): Promise<ChatMessage[]> {
    if (Platform.OS !== "web") return [];
    try {
      const raw = await AsyncStorage.getItem(roomCacheKey(roomId));
      return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    } catch {
      return [];
    }
  }

  /** --------------- Lifecycle --------------- */

  async initialize(userId: string, userName: string): Promise<void> {
    this.currentUserId = userId;
    this.currentUserName = userName;

    // 1) Make sure socket is up
    await socketService.ensureConnected();

    // 2) Best-effort DB init (Web may not support SQLite)
    try {
      await chatDatabaseService.initializeDatabase();
    } catch (e) {
      console.warn("SQLite init failed; continuing without persistence:", e);
    }

    // 3) Wire socket listeners
    this.setupSocketListeners();

    // 4) Announce presence
    socketService.emit("user_join", {
      userId,
      userName,
      timestamp: new Date().toISOString(),
    });

    // 5) After initial connect, try to flush any pending sends
    await this.flushOutbox();
  }

  private setupSocketListeners(): void {
    // Reconnect → try flushing outbox again
    socketService.on("connect", async () => {
      await this.flushOutbox();
    });

    // New message from anyone (including ourselves echoed back)
    socketService.on("new_message", async (message: ChatMessage) => {
      // 1) Update UI immediately
      this.notifyMessageListeners(message);

      // 2) Persist to SQLite (best effort)
      try {
        await chatDatabaseService.saveMessage(message);
      } catch (e) {
        console.warn("saveMessage (incoming) failed:", e);
      }

      // 3) Also persist to Web cache so the browser can restore history on remount
      await this.cacheAppend(message);
    });

    // Typing indicator
    socketService.on("user_typing", (data: TypingUser) => {
      this.typingListeners.forEach((cb) => cb(data));
    });

    // Delivery ACK → flip delivered in DB + remove from outbox + notify UI
    socketService.on(
      "message_delivered",
      async (data: {
        tempId: string;
        messageId: string;
        timestamp: string;
      }) => {
        try {
          await chatDatabaseService.updateMessageDeliveryStatus(
            data.tempId,
            data.messageId,
            true
          );
        } catch (e) {
          console.warn("updateMessageDeliveryStatus failed:", e);
        }
        await this.removeFromOutbox(data.tempId);
        this.deliveryListeners.forEach((cb) => cb(data.tempId, data.messageId));
      }
    );

    // Room joined → preload history into DB and Web cache
    socketService.on(
      "room_joined",
      async (data: {
        roomId: string;
        messages: ChatMessage[];
        participants: ChatUser[];
      }) => {
        for (const m of data.messages) {
          try {
            await chatDatabaseService.saveMessage(m);
          } catch (e) {
            console.warn("saveMessage (history) failed:", e);
          }
        }
        await this.cacheBulkAppend(data.roomId, data.messages);
        await this.flushOutbox(); // if any queued sends existed, try again
      }
    );
  }

  /** --------------- Room --------------- */

  async joinRoom(roomId: string, roomName: string): Promise<void> {
    this.currentRoomId = roomId;

    // Create/update room locally (optional)
    try {
      await chatDatabaseService.createOrUpdateRoom({
        id: roomId,
        name: roomName,
        unreadCount: 0,
        participants: [this.currentUserId!],
      });
    } catch {}

    // Tell server we’re in this room
    socketService.emit("join_room", {
      roomId,
      userId: this.currentUserId,
      userName: this.currentUserName,
    });
  }

  /** --------------- Messaging --------------- */

  async sendMessage(text: string): Promise<void> {
    if (!this.currentRoomId || !this.currentUserId || !this.currentUserName) {
      throw new Error("Not connected to a room");
    }

    const tempId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;

    // Optimistic message for UI + persistence
    const optimistic: ChatMessage = {
      id: tempId, // used by FlatList keyExtractor
      tempId,
      roomId: this.currentRoomId,
      userId: this.currentUserId,
      userName: this.currentUserName,
      text,
      timestamp: new Date().toISOString(),
      delivered: false,
      read: true,
      type: "text",
    };

    // 1) UI immediately
    this.notifyMessageListeners(optimistic);

    // 2) Persist to SQLite (best effort)
    try {
      await chatDatabaseService.saveMessage(optimistic);
    } catch (e) {
      console.warn("saveMessage (optimistic) failed:", e);
    }

    // 3) Persist to Web cache so browser reloads can restore
    await this.cacheAppend(optimistic);

    // 4) Put into outbox BEFORE emit (so crash/reload won’t lose it)
    await this.pushOutbox({
      tempId,
      roomId: this.currentRoomId,
      text,
      userId: this.currentUserId,
      userName: this.currentUserName,
      createdAt: new Date().toISOString(),
    });

    // 5) Try to send over socket (will queue at socket layer if offline)
    socketService.emit("send_message", {
      roomId: this.currentRoomId,
      message: {
        tempId,
        userId: this.currentUserId,
        userName: this.currentUserName,
        text,
        type: "text",
      },
    });
  }

  /** --------------- Typing --------------- */

  startTyping(): void {
    if (!this.currentRoomId || !this.currentUserId || !this.currentUserName)
      return;

    socketService.emit("typing_start", {
      roomId: this.currentRoomId,
      userId: this.currentUserId,
      userName: this.currentUserName,
    });

    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => this.stopTyping(), 3000);
  }

  stopTyping(): void {
    if (!this.currentRoomId || !this.currentUserId || !this.currentUserName)
      return;

    socketService.emit("typing_stop", {
      roomId: this.currentRoomId,
      userId: this.currentUserId,
      userName: this.currentUserName,
    });

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }

  /** --------------- Persistence API for UI --------------- */

  async getMessagesForRoom(
    roomId: string,
    limit = 50,
    offset = 0
  ): Promise<ChatMessage[]> {
    // 1) Try SQLite first (iOS/Android, and maybe web if polyfilled)
    try {
      const rows = await chatDatabaseService.getMessagesForRoom(
        roomId,
        limit,
        offset
      );
      if (rows.length > 0) return rows;
    } catch {
      // ignore and try web cache
    }

    // 2) Web cache fallback (browser-only)
    if (Platform.OS === "web") {
      const cached = await this.cacheLoad(roomId);
      if (cached.length > 0) {
        // Respect limit/offset so your pagination keeps working
        const slice = cached.slice(
          Math.max(0, cached.length - (offset + limit)),
          cached.length - offset
        );
        return slice;
      }
    }

    // 3) (Optional) Server fallback if both local stores are empty.
    // This keeps the web tab useful even with no local persistence.
    try {
      const res = await fetch(
        `/api/chat/rooms/${encodeURIComponent(
          roomId
        )}/messages?limit=${limit}&offset=${offset}`
      );
      if (res.ok) {
        const data = await res.json();
        // expect { messages: ChatMessage[] }
        return Array.isArray(data.messages) ? data.messages : [];
      }
    } catch {
      /* ignore */
    }

    return [];
  }

  async getAllRooms(): Promise<ChatRoom[]> {
    try {
      return await chatDatabaseService.getAllRooms();
    } catch {
      return [];
    }
  }

  /** --------------- Subscriptions --------------- */

  onMessage(cb: (m: ChatMessage) => void) {
    this.messageListeners.push(cb);
    return () =>
      (this.messageListeners = this.messageListeners.filter((x) => x !== cb));
  }
  onTyping(cb: (t: TypingUser) => void) {
    this.typingListeners.push(cb);
    return () =>
      (this.typingListeners = this.typingListeners.filter((x) => x !== cb));
  }
  onDelivery(cb: (tempId: string, messageId: string) => void) {
    this.deliveryListeners.push(cb);
    return () =>
      (this.deliveryListeners = this.deliveryListeners.filter((x) => x !== cb));
  }

  private notifyMessageListeners(message: ChatMessage) {
    this.messageListeners.forEach((cb) => cb(message));
  }
}

export const chatService = new ChatService();
