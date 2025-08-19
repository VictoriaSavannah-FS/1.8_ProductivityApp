import * as SQLite from "expo-sqlite";

/**
 * Message shape we keep locally.
 * - `id` is the final server id (or a temp_* while waiting for ack)
 * - `mentions` is a list of usernames that were @mentioned
 */
export interface ChatMessage {
  id: string;
  tempId?: string | null;
  roomId: string; // REQUIRED: every message belongs to a room
  userId: string;
  userName: string;
  text: string;
  timestamp: string; // ISO string (we keep it simple)
  delivered: boolean; // 1 once the server acks
  read: boolean; // 1 once the user has read
  edited?: boolean; // NEW: true if text was edited
  editedAt?: string | null; // NEW: ISO time when it was edited
  type: "text" | "system" | "typing";
  mentions?: string[]; // NEW: usernames mentioned in this message
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  participants: string[]; // simple list we stringify to store
}

class ChatDatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  /**
   * Open (or create) the database and ensure our tables/indexes exist.
   * If you’re changing schema often during development, a quick trick is
   * to change the DB name (e.g. "chat-v2.db") to start fresh instead of
   * writing migrations right now.
   */
  async initializeDatabase(): Promise<void> {
    // --- migration helper (unchanged)
    const ensureChatMessagesColumns = async (db: SQLite.SQLiteDatabase) => {
      const cols = await db.getAllAsync(`PRAGMA table_info(chat_messages);`);
      const names = new Set((cols as any[]).map((c) => c.name as string));

      const add = async (sql: string) => {
        try {
          await db.execAsync(sql);
        } catch (e) {
          console.warn("Migration note:", e);
        }
      };

      if (!names.has("edited"))
        await add(
          `ALTER TABLE chat_messages ADD COLUMN edited INTEGER DEFAULT 0;`
        );
      if (!names.has("edited_at"))
        await add(`ALTER TABLE chat_messages ADD COLUMN edited_at TEXT;`);
      if (!names.has("mentions"))
        await add(`ALTER TABLE chat_messages ADD COLUMN mentions TEXT;`);
    };

    try {
      // 0) open once
      this.db = await SQLite.openDatabaseAsync("chat.db");

      // 1) rooms table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS chat_rooms (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          last_message TEXT,
          last_message_time TEXT,
          unread_count INTEGER DEFAULT 0,
          participants TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // 2) messages table (base schema). For existing installs this is a no-op.
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          temp_id TEXT,
          room_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          user_name TEXT NOT NULL,
          text TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          delivered INTEGER DEFAULT 0,
          read INTEGER DEFAULT 0,
          edited INTEGER DEFAULT 0,
          edited_at TEXT,
          mentions TEXT,
          type TEXT DEFAULT 'text',
          created_at TEXT NOT NULL,
          FOREIGN KEY (room_id) REFERENCES chat_rooms (id)
        );
      `);

      // 3) bring older DBs up-to-date
      await ensureChatMessagesColumns(this.db);

      // 4) indexes + housekeeping
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp
        ON chat_messages(room_id, timestamp DESC);
      `);
      await this.db.execAsync(`
        DELETE FROM chat_messages WHERE room_id IS NULL OR room_id = '';
      `);

      console.log("Chat database initialized successfully");
    } catch (error) {
      console.error("Chat database initialization error:", error);
      throw error;
    }
  }

  // --------------------
  // Rooms
  // --------------------

  /** Create or update a room row (simple UPSERT using INSERT OR REPLACE). */
  async createOrUpdateRoom(room: ChatRoom): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    try {
      const now = new Date().toISOString();
      await this.db.runAsync(
        `
        INSERT OR REPLACE INTO chat_rooms 
          (id, name, description, last_message, last_message_time, unread_count, participants, created_at, updated_at)
        VALUES 
          (?,  ?,    ?,           ?,            ?,                 ?,           ?,            ?,        ?)
        `,
        [
          room.id,
          room.name,
          room.description ?? "",
          room.lastMessage ?? "",
          room.lastMessageTime ?? "",
          room.unreadCount ?? 0,
          JSON.stringify(room.participants ?? []),
          now,
          now,
        ]
      );
    } catch (error) {
      console.error("Error creating/updating room:", error);
      throw error;
    }
  }

  /** Get all rooms, newest activity first (for a room list UI). */
  async getAllRooms(): Promise<ChatRoom[]> {
    if (!this.db) throw new Error("Database not initialized");
    try {
      const result = await this.db.getAllAsync(`
        SELECT * FROM chat_rooms 
        ORDER BY last_message_time DESC
      `);

      return result.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description ?? undefined,
        lastMessage: row.last_message ?? undefined,
        lastMessageTime: row.last_message_time ?? undefined,
        unreadCount: row.unread_count ?? 0,
        participants: JSON.parse(row.participants || "[]"),
      }));
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  }

  // --------------------
  // Messages
  // --------------------

  /**
   * Save/merge a message (UPSERT).
   * We do NOT persist "typing" events to the DB (they are transient).
   * For booleans (`delivered/read/edited`), we use MAX() so once it's 1
   * it never gets overwritten back to 0 by older payloads.
   */
  async saveMessage(message: ChatMessage): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    if (!message.roomId) throw new Error("message.roomId is required");

    // Don't store typing indicators locally; they are ephemeral UI events.
    if (message.type === "typing") return;

    try {
      const createdAt = new Date().toISOString();

      await this.db.runAsync(
        `
        INSERT INTO chat_messages
          (id, temp_id, room_id, user_id, user_name, text, timestamp,
           delivered, read, edited, edited_at, mentions, type, created_at)
        VALUES
          (?,  ?,       ?,       ?,       ?,         ?,    ?,
           ?,        ?,    ?,      ?,        ?,        ?,    ?)
        ON CONFLICT(id) DO UPDATE SET
          temp_id   = COALESCE(excluded.temp_id, chat_messages.temp_id),
          room_id   = excluded.room_id,
          user_id   = excluded.user_id,
          user_name = excluded.user_name,
          text      = excluded.text,
          timestamp = excluded.timestamp,
          delivered = MAX(chat_messages.delivered, excluded.delivered),
          read      = MAX(chat_messages.read,      excluded.read),
          edited    = MAX(chat_messages.edited,    excluded.edited),
          edited_at = COALESCE(excluded.edited_at, chat_messages.edited_at),
          mentions  = COALESCE(excluded.mentions,  chat_messages.mentions),
          type      = excluded.type
        `,
        [
          message.id,
          message.tempId ?? null,
          message.roomId,
          message.userId,
          message.userName,
          message.text,
          message.timestamp,
          message.delivered ? 1 : 0,
          message.read ? 1 : 0,
          message.edited ? 1 : 0,
          message.editedAt ?? null,
          message.mentions ? JSON.stringify(message.mentions) : null,
          message.type,
          createdAt,
        ]
      );

      // Keep room list in sync with the latest preview/time.
      await this.updateRoomLastMessage(
        message.roomId,
        message.text,
        message.timestamp
      );
    } catch (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  }

  /** Fetch messages for a room, newest first from SQL then reversed for display (oldest ➜ newest). */
  async getMessagesForRoom(
    roomId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    if (!this.db) throw new Error("Database not initialized");
    try {
      const rows = await this.db.getAllAsync(
        `
        SELECT * FROM chat_messages 
        WHERE room_id = ? 
        ORDER BY timestamp DESC 
        LIMIT ? OFFSET ?
        `,
        [roomId, limit, offset]
      );

      return rows
        .map((row: any) => ({
          id: row.id,
          tempId: row.temp_id ?? undefined,
          roomId: row.room_id,
          userId: row.user_id,
          userName: row.user_name,
          text: row.text,
          timestamp: row.timestamp,
          delivered: !!row.delivered,
          read: !!row.read,
          edited: !!row.edited,
          editedAt: row.edited_at ?? undefined,
          mentions: row.mentions
            ? (JSON.parse(row.mentions) as string[])
            : undefined,
          type: row.type as "text" | "system" | "typing",
        }))
        .reverse(); // oldest → newest for chat bubble rendering
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  /**
   * When the server confirms a message (temp ➜ real id),
   * we try to "rename" the row by setting id=realId.
   * If UNIQUE(id) collides (because the real row already exists),
   * we delete the temp row and just mark the real row as delivered.
   */
  async confirmDelivery(tempId: string, realId: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    try {
      await this.db.runAsync(
        `
        UPDATE chat_messages
           SET id = ?, delivered = 1, temp_id = NULL
         WHERE temp_id = ?
        `,
        [realId, tempId]
      );
    } catch {
      try {
        await this.db.runAsync(`DELETE FROM chat_messages WHERE temp_id = ?`, [
          tempId,
        ]);
        await this.db.runAsync(
          `UPDATE chat_messages SET delivered = 1 WHERE id = ?`,
          [realId]
        );
      } catch (inner) {
        console.error("confirmDelivery fallback failed:", inner);
        throw inner;
      }
    }
  }

  /** Mark a set of messages as read (and refresh the room's unread counter). */
  async markMessagesAsRead(
    roomId: string,
    messageIds: string[]
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    if (messageIds.length === 0) return;

    try {
      const placeholders = messageIds.map(() => "?").join(",");
      await this.db.runAsync(
        `
        UPDATE chat_messages 
           SET read = 1 
         WHERE room_id = ? AND id IN (${placeholders})
        `,
        [roomId, ...messageIds]
      );
      await this.updateUnreadCount(roomId);
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  }

  /**
   * Apply an edit coming from the server (via `message_edited` socket event).
   * This lets your list update immediately without waiting for a full refetch.
   */
  async markEdited(messageId: string, newText: string, editedAt: string) {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.runAsync(
      `
      UPDATE chat_messages
         SET text = ?, edited = 1, edited_at = ?
       WHERE id = ?
      `,
      [newText, editedAt, messageId]
    );
  }

  /** (Optional) simple text search inside a room. */
  async searchMessages(
    roomId: string,
    query: string,
    limit = 50
  ): Promise<ChatMessage[]> {
    if (!this.db) throw new Error("Database not initialized");
    const rows = await this.db.getAllAsync(
      `
      SELECT * FROM chat_messages
       WHERE room_id = ? AND text LIKE ?
       ORDER BY timestamp DESC
       LIMIT ?
      `,
      [roomId, `%${query}%`, limit]
    );
    return rows.map((row: any) => ({
      id: row.id,
      tempId: row.temp_id ?? undefined,
      roomId: row.room_id,
      userId: row.user_id,
      userName: row.user_name,
      text: row.text,
      timestamp: row.timestamp,
      delivered: !!row.delivered,
      read: !!row.read,
      edited: !!row.edited,
      editedAt: row.edited_at ?? undefined,
      mentions: row.mentions
        ? (JSON.parse(row.mentions) as string[])
        : undefined,
      type: row.type as "text" | "system" | "typing",
    }));
  }

  // --------------------
  // Internals (private helpers)
  // --------------------

  /** Keep the room list in sync with the latest preview + time. */
  private async updateRoomLastMessage(
    roomId: string,
    message: string,
    timestamp: string
  ): Promise<void> {
    await this.db!.runAsync(
      `
      UPDATE chat_rooms 
         SET last_message = ?, 
             last_message_time = ?, 
             updated_at = ?
       WHERE id = ?
      `,
      [message, timestamp, new Date().toISOString(), roomId]
    );
  }

  /** Recompute room unread count from its messages. */
  private async updateUnreadCount(roomId: string): Promise<void> {
    const row = await this.db!.getFirstAsync(
      `
      SELECT COUNT(*) AS unread_count 
        FROM chat_messages 
       WHERE room_id = ? AND read = 0
      `,
      [roomId]
    );
    const unreadCount = (row as any)?.unread_count ?? 0;

    await this.db!.runAsync(
      `
      UPDATE chat_rooms 
         SET unread_count = ? 
       WHERE id = ?
      `,
      [unreadCount, roomId]
    );
  }
}

export const chatDatabaseService = new ChatDatabaseService();

/** HAD to ask ChatGPT for this -
 * had to update the tables w/
 *  @ mentiosn and edits/edited text
 * BUT kept breakign code --> so apparently had to create a helper to reinitialze the table
 * ths is where teh schema was defiend ==> but chaneges/ updates broke that Scehma
 * Solution: the helper re-initialzes /relaosd the schema table
 * so now, new columsn and data ==> added to the table and renders again .*/
