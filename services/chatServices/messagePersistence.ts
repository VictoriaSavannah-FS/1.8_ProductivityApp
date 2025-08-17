// Lightweight wrapper around your SQLite layer so the rest of the app
// can call a tiny, stable API for message reads/writes.

import { chatDatabaseService, type ChatMessage } from "../chatDatabase";

export type MessagePersistenceAPI = {
  init: () => Promise<void>;
  save: (msg: ChatMessage) => Promise<void>;
  getForRoom: (
    roomId: string,
    limit?: number,
    offset?: number
  ) => Promise<ChatMessage[]>;
  markDelivered: (tempId: string, messageId: string) => Promise<void>;
  markRead: (roomId: string, messageIds: string[]) => Promise<void>;
};

export const messagePersistence: MessagePersistenceAPI = {
  async init() {
    await chatDatabaseService.initializeDatabase();
  },

  async save(msg) {
    await chatDatabaseService.saveMessage(msg);
  },

  async getForRoom(roomId, limit = 50, offset = 0) {
    return chatDatabaseService.getMessagesForRoom(roomId, limit, offset);
  },

  async markDelivered(tempId, messageId) {
    await chatDatabaseService.updateMessageDeliveryStatus(
      tempId,
      messageId,
      true
    );
  },

  async markRead(roomId, messageIds) {
    if (messageIds.length === 0) return;
    await chatDatabaseService.markMessagesAsRead(roomId, messageIds);
  },
};
// doubleec-check chatDatabase.ts for that prrop
