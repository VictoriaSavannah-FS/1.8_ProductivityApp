// Emits typing events and maintains a simple in-memory list of typing users.
// It also exposes a subscribe API the UI (or useChat hook) can use.

import { socketService } from "../socketService";

export type TypingUser = {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
};

type TypingListener = (users: TypingUser[]) => void;

class TypingService {
  private roomId: string | null = null;
  private me: { userId: string; userName: string } | null = null;
  private users: Record<string, TypingUser> = {};
  private listeners: TypingListener[] = [];
  private stopTimer: NodeJS.Timeout | null = null;

  init(me: { userId: string; userName: string }) {
    this.me = me;

    // From server: someone started/stopped typing
    socketService.on("user_typing", (data: TypingUser) => {
      if (!this.roomId) return;

      if (data.isTyping) {
        this.users[data.userId] = data;
      } else {
        delete this.users[data.userId];
      }
      this.notify();
    });
    // need to edit and adaptfor 2.8 -----
    // When joining a room, reset state
    socketService.on("room_joined", (_data: any) => {
      this.users = {};
      this.notify();
    });
  }

  setRoom(roomId: string) {
    this.roomId = roomId;
    this.users = {};
    this.notify();
  }

  startTyping() {
    if (!this.roomId || !this.me) return;

    socketService.emit("typing_start", {
      roomId: this.roomId,
      userId: this.me.userId,
      userName: this.me.userName,
    });

    // Auto stop if no further keypresses after 3s
    if (this.stopTimer) clearTimeout(this.stopTimer);
    this.stopTimer = setTimeout(() => this.stopTyping(), 3000);
  }

  stopTyping() {
    if (!this.roomId || !this.me) return;

    socketService.emit("typing_stop", {
      roomId: this.roomId,
      userId: this.me.userId,
      userName: this.me.userName,
    });
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
  }

  subscribe(cb: TypingListener): () => void {
    this.listeners.push(cb);
    cb(this.getAll());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  getAll(): TypingUser[] {
    return Object.values(this.users);
  }

  private notify() {
    const snapshot = this.getAll();
    this.listeners.forEach((l) => l(snapshot));
  }
}

export const typingService = new TypingService();
