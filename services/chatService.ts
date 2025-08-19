// Upadted ChatService with a caches foe Web -----
// services/chatService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { socketService } from "./socketService";
import { chatDatabaseService, ChatMessage, ChatRoom } from "./chatDatabase";

/** ---------------- Types ---------------- */

// Defien tyoe: TypingUSer---
export interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}
// defien types => ChatUser--
export interface ChatUser {
  userId: string;
  userName: string;
  socketId?: string;
  isOnline: boolean;
}

/**2.6 OutboxItem =
 * OFFLINE storgae
 * helsp for offlien and dev reloads ---
 * types-----
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
/**stores variabel --
 * >>>  reference for store/fetch a chat outbox
 * = Storage key reference by:
 * lcalStorage
 * AsyncStorage
 * IndexedDB
 */

/**2.6 - save message per-room /cache stores for WEB PALTFORM
 * Stored under chatCache@room::<roomId>
 * will help reload a history even w/o SQLite
 */
const roomCacheKey = (roomId: string) => `chatCache@room::${roomId}`;
const ROOM_CACHE_CAP = 200; // keep last 200 messages per room

// defien Class / datd
class ChatService {
  // only these will have access
  private currentUserId: string | null = null;
  private currentUserName: string | null = null;
  private currentRoomId: string | null = null;
  private typingTimeout: NodeJS.Timeout | null = null;

  /** UI subscriptions --------------------
   * [] of functions -- Subscribers
   */
  // new messgae=> this wil be fetched to update
  private messageListeners: ((message: ChatMessage) => void)[] = [];
  // typing status=> callback this  fetched
  private typingListeners: ((typingUser: TypingUser) => void)[] = [];
  // wehn mssge delived => this wil be fectbed
  private deliveryListeners: ((tempId: string, messageId: string) => void)[] =
    [];

  /** --------------- OUTBOX helpers (retries sends) ---------------
   * USed when OFFLINE or mesage failsto sendn
   * A GLORFIED RETRY BUTTON Ssytem
   */

  //Fetch info from Loal storage => AsyncStorage
  private async readOutbox(): Promise<OutboxItem[]> {
    try {
      // use OTUBOX_KEY to fetch data
      const raw = await AsyncStorage.getItem(OUTBOX_KEY);
      // if DATA exists--> pass to new [] of outBox items
      return raw ? (JSON.parse(raw) as OutboxItem[]) : [];
    } catch {
      // ELSE return empty[]
      return [];
    }
  }
  // TAKE ARARY Out  OF outBOx
  private async writeOutbox(items: OutboxItem[]) {
    try {
      // save =>  storage as JSON str of data
      await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
    } catch {}
  }
  // UDPATE / ADD TO  outbox
  private async pushOutbox(item: OutboxItem) {
    const items = await this.readOutbox(); //curent data
    items.push(item); //add new ITEM == unset message . cause of offlien or failed to send
    await this.writeOutbox(items); // SAVE everythign
  }

  //REMOVE from OUTBOX / DELETE after Confirm
  private async removeFromOutbox(tempId: string) {
    const items = await this.readOutbox(); //read current
    const next = items.filter((i) => i.tempId !== tempId); //remove item by tempID
    await this.writeOutbox(next); //save update changes
  }

  //RETRY BUTTOM -- will rety to resnd items in outbox again
  private async flushOutbox() {
    // chekc if sokcet is connected == RUN only on CONNCT
    if (!socketService.isConnected()) return;
    const items = await this.readOutbox(); //read all curent items
    if (items.length === 0) return; //if NO item return / no change

    // Loop through itesm and REtRY to SEND them w/ socketSEervice.emit
    for (const it of items) {
      // serviceSocket
      socketService.emit("send_message", {
        // send to roomID and send ot it
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

  /** --------------- WEB ONLY ROOM-CACHE helpers --------------- */
  // These are used only as a fallback when DB not availbel =>  Web
  // lightwietg fallabck -- helsp restore recent Hsitory

  private async cacheAppend(message: ChatMessage) {
    // define platform
    if (Platform.OS !== "web") return; // only needed on Web
    try {
      // ADd to per-Room cache
      const key = roomCacheKey(message.roomId); //look @ roomID
      const raw = await AsyncStorage.getItem(key); //get curent cached lsit
      const list: ChatMessage[] = raw ? JSON.parse(raw) : []; //fetch [] or empty
      list.push(message);

      // LIMITs the amount of item in caceh/ CAPS it
      const trimmed =
        list.length > ROOM_CACHE_CAP ? list.slice(-ROOM_CACHE_CAP) : list;
      await AsyncStorage.setItem(key, JSON.stringify(trimmed)); //saves new lsit=?JSOn str. => saves to same key n AsyncSotrage
    } catch {} //avoid crashesif soemthign goes wrong
  }

  //ADD new Message to Room History ---------
  private async cacheBulkAppend(roomId: string, msgs: ChatMessage[]) {
    // run ONLy on Web and ONLY if MESSG EXISTS----
    if (Platform.OS !== "web" || msgs.length === 0) return;
    try {
      const key = roomCacheKey(roomId); //uniq Key for e/a chatRoom
      const raw = await AsyncStorage.getItem(key); //get cached mssgs from room

      // fetch curent []lsit of use emptyu []
      const list: ChatMessage[] = raw ? JSON.parse(raw) : [];
      const next = [...list, ...msgs];
      const trimmed =
        // CAP list---
        next.length > ROOM_CACHE_CAP ? next.slice(-ROOM_CACHE_CAP) : next;
      // save new CAPPED lsist and send to storae
      await AsyncStorage.setItem(key, JSON.stringify(trimmed));
    } catch {}
  }

  // GET LAST SAVED Lsit
  private async cacheLoad(roomId: string): Promise<ChatMessage[]> {
    // run ONLy on Web---
    if (Platform.OS !== "web") return [];
    try {
      // fetch cahced data ----
      const raw = await AsyncStorage.getItem(roomCacheKey(roomId));
      // return lsit or emty []
      return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    } catch {
      return []; //ELSE return emtpty[]
    }
  }

  /** --------------- Lifecycle --------------- */

  // START UP for CHAT SERVICE ----------
  async initialize(userId: string, userName: string): Promise<void> {
    // save curent userID + Naem
    this.currentUserId = userId;
    this.currentUserName = userName;

    // 1) Make sure socket is up = conncted
    await socketService.ensureConnected();

    // IF NOT ==> save locallaly or run w.out
    try {
      await chatDatabaseService.initializeDatabase();
    } catch (e) {
      // notify BUT continue = no crash
      console.warn("SQLite init failed; continuing without persistence:", e);
    }

    // 3) Wire socket listeners
    this.setupSocketListeners();

    // 4) Announce presence ==
    // sends a u_j event through socket to updateed server and Otehr Users
    socketService.emit("user_join", {
      // WHo it is....when,,,
      userId,
      userName,
      timestamp: new Date().toISOString(),
    });

    //after connet --> any mmsgs typed  => soted in OutBox wiht be sent
    await this.flushOutbox();
  }
  //CONNECT Socket events to Action ----
  private setupSocketListeners(): void {
    // Reconnect => try flushing outbox again
    socketService.on("connect", async () => {
      await this.flushOutbox();
    });

    // New message STATUS UPADTE
    //  from anyone (including ourselves echoed back)
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

    // Typing indicator Stat
    socketService.on("user_typing", (data: TypingUser) => {
      this.typingListeners.forEach((cb) => cb(data));
    });

    // Delivery ACK /Update
    socketService.on(
      "message_delivered",
      async (data: {
        tempId: string;
        messageId: string;
        timestamp: string;
        // timestamp: boolean;
      }) => {
        try {
          // come bakc to doublechck why RED -- arguemtn types? / order
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

    // ----- ---- Room joined
    // fetch message history into DB and Web cache
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

    // Create/update room locally
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
    // take msge text from user
    // checks if SUEr is LOGGED IN and IN ROOM
    if (!this.currentRoomId || !this.currentUserId || !this.currentUserName) {
      throw new Error("Not connected to a room");
    }

    // CREATE TEMP ID ---
    const tempId = `temp_${Date.now()}_${Math.random()
      // radnom string
      .toString(12)
      .slice(2, 9)}`;

    // Optimistic message for UI + persistence
    const optimistic: ChatMessage = {
      id: tempId, // key for Flatlsit
      tempId, //temp ID
      roomId: this.currentRoomId, // where mssge gooes
      userId: this.currentUserId, // WHO snt it
      userName: this.currentUserName, //SENDER naem
      text, // messge sent --
      timestamp: new Date().toISOString(), // wehn
      delivered: false, //not confrim YET bt server
      read: true, // local user see own msg as read
      type: "text", //type
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

    // 4) Put into outbox BEFORE emit
    // taht way incase  crash/reload ==> won’t lose it
    await this.pushOutbox({
      tempId,
      roomId: this.currentRoomId,
      text,
      userId: this.currentUserId,
      userName: this.currentUserName,
      createdAt: new Date().toISOString(),
    });

    // 5) Try to send over socket
    // Fallback--> will queue at socket layer if offline
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
  // typing idicator
  startTyping(): void {
    // make sure user IN ac CHAT room  and  logged in--
    if (!this.currentRoomId || !this.currentUserId || !this.currentUserName)
      return;

    // tryogn sendign through over Socket
    socketService.emit("typing_start", {
      roomId: this.currentRoomId,
      userId: this.currentUserId,
      userName: this.currentUserName,
    });
    //Timing out Timwer --
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    // checks if One laready --> if YES => clears it s

    // STARTS new Timeout timer @3secs
    this.typingTimeout = setTimeout(
      () =>
        // user SToppped typying // UI indicator
        this.stopTyping(),
      3000
    );
  }

  stopTyping(): void {
    // make sure user IN ac CHAT room  and  logged in--
    if (!this.currentRoomId || !this.currentUserId || !this.currentUserName)
      return;

    //tryogn sendign through over Socket
    socketService.emit("typing_stop", {
      roomId: this.currentRoomId,
      userId: this.currentUserId,
      userName: this.currentUserName,
    });
    // Timeout timer chekcand reset to 0 => stopped typimg
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
