// import { socketService } from "./socketService";
// import { chatDatabaseService, ChatMessage, ChatRoom } from "./chatDatabase";
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
// class ChatService {
//   private currentUserId: string | null = null;
//   private currentUserName: string | null = null;
//   private currentRoomId: string | null = null;
//   private typingTimeout: NodeJS.Timeout | null = null;
//   // Event listeners
//   private messageListeners: ((message: ChatMessage) => void)[] = [];
//   private typingListeners: ((typingUser: TypingUser) => void)[] = [];
//   private presenceListeners: ((users: ChatUser[]) => void)[] = [];
//   private deliveryListeners: ((tempId: string, messageId: string) => void)[] =
//     [];
//   async initialize(userId: string, userName: string): Promise<void> {
//     this.currentUserId = userId;
//     this.currentUserName = userName;

//     await chatDatabaseService.initializeDatabase();
//     this.setupSocketListeners();

//     // Join user session
//     socketService.emit("user_join", {
//       userId,
//       userName,
//       timestamp: new Date().toISOString(),
//     });
//   }
//   private setupSocketListeners(): void {
//     // Handle new messages
//     socketService.on("new_message", (message: ChatMessage) => {
//       this.handleNewMessage(message);
//     });
//     // Handle typing indicators
//     socketService.on("user_typing", (data: TypingUser) => {
//       this.notifyTypingListeners(data);
//     });
//     // Handle message delivery confirmation
//     socketService.on(
//       "message_delivered",
//       (data: { tempId: string; messageId: string; timestamp: string }) => {
//         this.handleMessageDelivered(data.tempId, data.messageId);
//       }
//     );
//     // Handle room joined
//     socketService.on(
//       "room_joined",
//       async (data: {
//         roomId: string;
//         messages: ChatMessage[];
//         participants: ChatUser[];
//       }) => {
//         await this.handleRoomJoined(data);
//       }
//     );
//     // Handle user presence
//     socketService.on("user_joined_room", (data: ChatUser) => {
//       // Handle user joining room
//     });
//     socketService.on("user_left_room", (data: ChatUser) => {
//       // Handle user leaving room
//     });
//   }
//   async joinRoom(roomId: string, roomName: string): Promise<void> {
//     this.currentRoomId = roomId;

//     // Create/update room in local database
//     await chatDatabaseService.createOrUpdateRoom({
//       id: roomId,
//       name: roomName,
//       unreadCount: 0,
//       participants: [this.currentUserId!],
//     });

//     // Join room on server
//     socketService.emit("join_room", {
//       roomId,
//       userId: this.currentUserId,
//       userName: this.currentUserName,
//     });
//   }
//   async sendMessage(text: string): Promise<void> {
//     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName) {
//       throw new Error("Not connected to a room");
//     }
//     const tempId = `temp_${Date.now()}_${Math.random()
//       .toString(36)
//       .substr(2, 9)}`;
//     const message: ChatMessage = {
//       id: tempId, // Will be replaced when server confirms
//       tempId,
//       roomId: this.currentRoomId,
//       userId: this.currentUserId,
//       userName: this.currentUserName,
//       text,
//       timestamp: new Date().toISOString(),
//       delivered: false,
//       read: true, // Own messages are considered read
//       type: "text",
//     };
//     // Save optimistically to local database
//     await chatDatabaseService.saveMessage(message);

//     // Notify UI immediately
//     this.notifyMessageListeners(message);
//     // Send to server
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
//   startTyping(): void {
//     if (!this.currentRoomId || !this.currentUserId || !this.currentUserName)
//       return;
//     socketService.emit("typing_start", {
//       roomId: this.currentRoomId,
//       userId: this.currentUserId,
//       userName: this.currentUserName,
//     });
//     // Auto-stop typing after 3 seconds
//     if (this.typingTimeout) {
//       clearTimeout(this.typingTimeout);
//     }

//     this.typingTimeout = setTimeout(() => {
//       this.stopTyping();
//     }, 3000);
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
//   async getMessagesForRoom(
//     roomId: string,
//     limit: number = 50,
//     offset: number = 0
//   ): Promise<ChatMessage[]> {
//     return await chatDatabaseService.getMessagesForRoom(roomId, limit, offset);
//   }
//   async getAllRooms(): Promise<ChatRoom[]> {
//     return await chatDatabaseService.getAllRooms();
//   }
//   private async handleNewMessage(message: ChatMessage): Promise<void> {
//     // Save to local database
//     await chatDatabaseService.saveMessage(message);

//     // Notify UI
//     this.notifyMessageListeners(message);
//   }
//   private async handleMessageDelivered(
//     tempId: string,
//     messageId: string
//   ): Promise<void> {
//     // Update local database
//     await chatDatabaseService.updateMessageDeliveryStatus(
//       tempId,
//       messageId,
//       true
//     );

//     // Notify UI
//     this.notifyDeliveryListeners(tempId, messageId);
//   }
//   private async handleRoomJoined(data: {
//     roomId: string;
//     messages: ChatMessage[];
//     participants: ChatUser[];
//   }): Promise<void> {
//     // Save historical messages to local database
//     for (const message of data.messages) {
//       await chatDatabaseService.saveMessage(message);
//     }
//   }
//   // Event listener management
//   onMessage(callback: (message: ChatMessage) => void): () => void {
//     this.messageListeners.push(callback);
//     return () => {
//       this.messageListeners = this.messageListeners.filter(
//         (cb) => cb !== callback
//       );
//     };
//   }
//   onTyping(callback: (typingUser: TypingUser) => void): () => void {
//     this.typingListeners.push(callback);
//     return () => {
//       this.typingListeners = this.typingListeners.filter(
//         (cb) => cb !== callback
//       );
//     };
//   }
//   onDelivery(
//     callback: (tempId: string, messageId: string) => void
//   ): () => void {
//     this.deliveryListeners.push(callback);
//     return () => {
//       this.deliveryListeners = this.deliveryListeners.filter(
//         (cb) => cb !== callback
//       );
//     };
//   }
//   private notifyMessageListeners(message: ChatMessage): void {
//     this.messageListeners.forEach((callback) => callback(message));
//   }
//   private notifyTypingListeners(typingUser: TypingUser): void {
//     this.typingListeners.forEach((callback) => callback(typingUser));
//   }
//   private notifyDeliveryListeners(tempId: string, messageId: string): void {
//     this.deliveryListeners.forEach((callback) => callback(tempId, messageId));
//   }
// }
// export const chatService = new ChatService();
// //

// services/chatService.ts
import { socketService } from "./socketService";
import { chatDatabaseService, ChatMessage, ChatRoom } from "./chatDatabase";

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

class ChatService {
  private currentUserId: string | null = null;
  private currentUserName: string | null = null;
  private currentRoomId: string | null = null;
  private typingTimeout: NodeJS.Timeout | null = null;

  // Event listeners
  private messageListeners: ((message: ChatMessage) => void)[] = [];
  private typingListeners: ((typingUser: TypingUser) => void)[] = [];
  private deliveryListeners: ((tempId: string, messageId: string) => void)[] =
    [];

  // services/chatService.ts
  async initialize(userId: string, userName: string): Promise<void> {
    this.currentUserId = userId;
    this.currentUserName = userName;

    // MFIANLLY! Connected!
    await socketService.ensureConnected();

    // DB can fail on web or if SQLite not configured—don’t block UI
    try {
      await chatDatabaseService.initializeDatabase();
    } catch (e) {
      console.warn("SQLite init failed; continuing without persistence:", e);
    }

    this.setupSocketListeners();

    // Announce presence
    socketService.emit("user_join", {
      userId,
      userName,
      timestamp: new Date().toISOString(),
    });
  }

  private setupSocketListeners(): void {
    // New message from server -> show in UI immediately, then try to persist
    socketService.on("new_message", async (message: ChatMessage) => {
      this.notifyMessageListeners(message);
      try {
        await chatDatabaseService.saveMessage(message);
      } catch (e) {
        console.warn("saveMessage (incoming) failed:", e);
      }
    });

    // Typing indicator
    socketService.on("user_typing", (data: TypingUser) => {
      this.typingListeners.forEach((cb) => cb(data));
    });

    // Delivery confirmation for our optimistic message
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
        this.deliveryListeners.forEach((cb) => cb(data.tempId, data.messageId));
      }
    );

    // Room joined -> preload history into local DB (best effort)
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
      }
    );
  }

  async joinRoom(roomId: string, roomName: string): Promise<void> {
    this.currentRoomId = roomId;

    try {
      await chatDatabaseService.createOrUpdateRoom({
        id: roomId,
        name: roomName,
        unreadCount: 0,
        participants: [this.currentUserId!],
      });
    } catch (e) {
      // ok to ignore for now
    }

    socketService.emit("join_room", {
      roomId,
      userId: this.currentUserId,
      userName: this.currentUserName,
    });
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.currentRoomId || !this.currentUserId || !this.currentUserName) {
      throw new Error("Not connected to a room");
    }

    const tempId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;

    // Optimistic message
    const optimistic: ChatMessage = {
      id: tempId, // temp id is used by the FlatList keyExtractor
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

    // 1) Show it immediately
    this.notifyMessageListeners(optimistic);

    // 2) Try to persist (don't block UI)
    try {
      await chatDatabaseService.saveMessage(optimistic);
    } catch (e) {
      console.warn("saveMessage (optimistic) failed:", e);
    }

    // 3) Send to server
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

  async getMessagesForRoom(
    roomId: string,
    limit = 50,
    offset = 0
  ): Promise<ChatMessage[]> {
    try {
      return await chatDatabaseService.getMessagesForRoom(
        roomId,
        limit,
        offset
      );
    } catch {
      return []; // if DB not available, just return empty history
    }
  }
  async getAllRooms(): Promise<ChatRoom[]> {
    try {
      return await chatDatabaseService.getAllRooms();
    } catch {
      return [];
    }
  }

  // Listener management
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
