// // // // import { useState, useEffect, useCallback } from "react";
// // // // import { chatService, TypingUser } from "../services/chatService";
// // // // import { ChatMessage, ChatRoom } from "../services/chatDatabase";
// // // // export interface UseChatReturn {
// // // //   messages: ChatMessage[];
// // // //   typingUsers: TypingUser[];
// // // //   rooms: ChatRoom[];
// // // //   currentRoom: string | null;
// // // //   isLoading: boolean;
// // // //   sendMessage: (text: string) => Promise<void>;
// // // //   joinRoom: (roomId: string, roomName: string) => Promise<void>;
// // // //   startTyping: () => void;
// // // //   stopTyping: () => void;
// // // //   loadMoreMessages: () => Promise<void>;
// // // // }
// // // // export const useChat = (userId: string, userName: string): UseChatReturn => {
// // // //   const [messages, setMessages] = useState<ChatMessage[]>([]);
// // // //   const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
// // // //   const [rooms, setRooms] = useState<ChatRoom[]>([]);
// // // //   const [currentRoom, setCurrentRoom] = useState<string | null>(null);
// // // //   const [isLoading, setIsLoading] = useState(false);
// // // //   const [messageOffset, setMessageOffset] = useState(0);

// // // //   useEffect(() => {
// // // //     // passign userNAem ==> uiser IID

// // // //     initializeChat();
// // // //   }, [userId, userName]);
// // // //   const initializeChat = async () => {
// // // //     try {
// // // //       setIsLoading(true);
// // // //       await chatService.initialize(userId, userName);

// // // //       // Load existing rooms
// // // //       const existingRooms = await chatService.getAllRooms();
// // // //       setRooms(existingRooms);

// // // //       // Set up event listeners
// // // //       const unsubscribeMessage = chatService.onMessage((message) => {
// // // //         setMessages((prev) => {
// // // //           // Avoid duplicates
// // // //           const exists = prev.some(
// // // //             (m) => m.id === message.id || m.tempId === message.tempId
// // // //           );
// // // //           if (exists) {
// // // //             // Update existing message (e.g., delivery status)
// // // //             return prev.map((m) =>
// // // //               m.id === message.id || m.tempId === message.tempId ? message : m
// // // //             );
// // // //           }
// // // //           return [...prev, message];
// // // //         });
// // // //       });
// // // //       const unsubscribeTyping = chatService.onTyping((typingUser) => {
// // // //         setTypingUsers((prev) => {
// // // //           const filtered = prev.filter((u) => u.userId !== typingUser.userId);
// // // //           return typingUser.isTyping ? [...filtered, typingUser] : filtered;
// // // //         });
// // // //       });
// // // //       const unsubscribeDelivery = chatService.onDelivery(
// // // //         (tempId, messageId) => {
// // // //           setMessages((prev) =>
// // // //             prev.map((m) =>
// // // //               m.tempId === tempId
// // // //                 ? { ...m, id: messageId, delivered: true, tempId: undefined }
// // // //                 : m
// // // //             )
// // // //           );
// // // //         }
// // // //       );
// // // //       return () => {
// // // //         unsubscribeMessage();
// // // //         unsubscribeTyping();
// // // //         unsubscribeDelivery();
// // // //       };
// // // //     } catch (error) {
// // // //       console.error("Error initializing chat:", error);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };
// // // //   const joinRoom = useCallback(async (roomId: string, roomName: string) => {
// // // //     try {
// // // //       setIsLoading(true);
// // // //       await chatService.joinRoom(roomId, roomName);

// // // //       // Load messages for this room
// // // //       const roomMessages = await chatService.getMessagesForRoom(roomId);
// // // //       setMessages(roomMessages);
// // // //       setCurrentRoom(roomId);
// // // //       setMessageOffset(roomMessages.length);

// // // //       // Clear typing indicators when switching rooms
// // // //       setTypingUsers([]);
// // // //     } catch (error) {
// // // //       console.error("Error joining room:", error);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   }, []);
// // // //   const sendMessage = useCallback(async (text: string) => {
// // // //     try {
// // // //       await chatService.sendMessage(text);
// // // //     } catch (error) {
// // // //       console.error("Error sending message:", error);
// // // //     }
// // // //   }, []);
// // // //   const startTyping = useCallback(() => {
// // // //     chatService.startTyping();
// // // //   }, []);
// // // //   const stopTyping = useCallback(() => {
// // // //     chatService.stopTyping();
// // // //   }, []);
// // // //   const loadMoreMessages = useCallback(async () => {
// // // //     if (!currentRoom || isLoading) return;

// // // //     try {
// // // //       setIsLoading(true);
// // // //       const olderMessages = await chatService.getMessagesForRoom(
// // // //         currentRoom,
// // // //         20,
// // // //         messageOffset
// // // //       );

// // // //       if (olderMessages.length > 0) {
// // // //         setMessages((prev) => [...olderMessages, ...prev]);
// // // //         setMessageOffset((prev) => prev + olderMessages.length);
// // // //       }
// // // //     } catch (error) {
// // // //       console.error("Error loading more messages:", error);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   }, [currentRoom, messageOffset, isLoading]);
// // // //   return {
// // // //     messages,
// // // //     typingUsers,
// // // //     rooms,
// // // //     currentRoom,
// // // //     isLoading,
// // // //     sendMessage,
// // // //     joinRoom,
// // // //     startTyping,
// // // //     stopTyping,
// // // //     loadMoreMessages,
// // // //   };
// // // // };

// // // import { useState, useEffect, useCallback, useRef } from "react";
// // // import { useFocusEffect } from "@react-navigation/native";
// // // import { chatService, TypingUser } from "../services/chatService";
// // // import { ChatMessage, ChatRoom } from "../services/chatDatabase";

// // // export interface UseChatReturn {
// // //   messages: ChatMessage[];
// // //   typingUsers: TypingUser[];
// // //   rooms: ChatRoom[];
// // //   currentRoom: string | null;
// // //   isLoading: boolean;
// // //   sendMessage: (text: string) => Promise<void>;
// // //   joinRoom: (roomId: string, roomName: string) => Promise<void>;
// // //   startTyping: () => void;
// // //   stopTyping: () => void;
// // //   loadMoreMessages: () => Promise<void>;
// // // }

// // // export const useChat = (userId: string, userName: string): UseChatReturn => {
// // //   const [messages, setMessages] = useState<ChatMessage[]>([]);
// // //   const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
// // //   const [rooms, setRooms] = useState<ChatRoom[]>([]);
// // //   const [currentRoom, setCurrentRoom] = useState<string | null>(null);
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [messageOffset, setMessageOffset] = useState(0);

// // //   // We’ll keep any “unsubscribe” functions returned by chatService.onX handlers here
// // //   const unsubsRef = useRef<Array<() => void>>([]);

// // //   // Helper to remove all listeners we registered in this hook
// // //   const removeAllListeners = () => {
// // //     unsubsRef.current.forEach((fn) => {
// // //       try {
// // //         fn();
// // //       } catch {}
// // //     });
// // //     unsubsRef.current = [];
// // //   };

// // //   useEffect(() => {
// // //     // Wrap async work in an IIFE; the effect itself can’t be async
// // //     (async () => {
// // //       setIsLoading(true);

// // //       // 1) Initialize the chat layer (opens socket, sets identity, primes DB, etc.)
// // //       await chatService.initialize(userId, userName);

// // //       // 2) Load existing rooms
// // //       const existingRooms = await chatService.getAllRooms();
// // //       setRooms(existingRooms);

// // //       // 3) Wire real-time listeners and store their "unsubscribe" callbacks
// // //       removeAllListeners(); // make sure we don't double-register on re-renders

// // //       const offMessage = chatService.onMessage((message) => {
// // //         setMessages((prev) => {
// // //           // De-dup by id or tempId (optimistic -> server-ack)
// // //           const exists = prev.some(
// // //             (m) => m.id === message.id || m.tempId === message.tempId
// // //           );
// // //           if (exists) {
// // //             return prev.map((m) =>
// // //               m.id === message.id || m.tempId === message.tempId ? message : m
// // //             );
// // //           }
// // //           return [...prev, message];
// // //         });
// // //       });

// // //       const offTyping = chatService.onTyping((typingUser) => {
// // //         setTypingUsers((prev) => {
// // //           const filtered = prev.filter((u) => u.userId !== typingUser.userId);
// // //           return typingUser.isTyping ? [...filtered, typingUser] : filtered;
// // //         });
// // //       });

// // //       const offDelivery = chatService.onDelivery((tempId, messageId) => {
// // //         setMessages((prev) =>
// // //           prev.map((m) =>
// // //             m.tempId === tempId
// // //               ? { ...m, id: messageId, delivered: true, tempId: undefined }
// // //               : m
// // //           )
// // //         );
// // //       });

// // //       unsubsRef.current = [offMessage, offTyping, offDelivery];
// // //       setIsLoading(false);
// // //     })();

// // //     // IMPORTANT: we only remove listeners on unmount.
// // //     // We do NOT disconnect the socket here—keep it alive across screens.
// // //     return () => {
// // //       removeAllListeners();
// // //     };
// // //   }, [userId, userName]);

// // //   // When the screen gains focus (you navigate back to it),
// // //   // reload messages for the current room from storage so UI repopulates.
// // //   useFocusEffect(
// // //     useCallback(() => {
// // //       let active = true;
// // //       (async () => {
// // //         if (!currentRoom) return;
// // //         const saved = await chatService.getMessagesForRoom(currentRoom);
// // //         if (active) {
// // //           setMessages(saved);
// // //           setMessageOffset(saved.length);
// // //           setTypingUsers([]);
// // //         }
// // //       })();
// // //       return () => {
// // //         active = false;
// // //       };
// // //     }, [currentRoom])
// // //   );

// // //   const joinRoom = useCallback(async (roomId: string, roomName: string) => {
// // //     try {
// // //       setIsLoading(true);

// // //       // Tell the server we’re in this room
// // //       await chatService.joinRoom(roomId, roomName);

// // //       // Load the latest messages for the room from persistence
// // //       const roomMessages = await chatService.getMessagesForRoom(roomId);
// // //       setMessages(roomMessages);
// // //       setCurrentRoom(roomId);
// // //       setMessageOffset(roomMessages.length);

// // //       // Reset typing indicators on room switch
// // //       setTypingUsers([]);
// // //     } catch (error) {
// // //       console.error("Error joining room:", error);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   }, []);

// // //   const sendMessage = useCallback(async (text: string) => {
// // //     try {
// // //       await chatService.sendMessage(text);
// // //     } catch (error) {
// // //       console.error("Error sending message:", error);
// // //     }
// // //   }, []);

// // //   const startTyping = useCallback(() => {
// // //     chatService.startTyping();
// // //   }, []);

// // //   const stopTyping = useCallback(() => {
// // //     chatService.stopTyping();
// // //   }, []);

// // //   const loadMoreMessages = useCallback(async () => {
// // //     if (!currentRoom || isLoading) return;
// // //     try {
// // //       setIsLoading(true);
// // //       const older = await chatService.getMessagesForRoom(
// // //         currentRoom,
// // //         20,
// // //         messageOffset
// // //       );
// // //       if (older.length > 0) {
// // //         setMessages((prev) => [...older, ...prev]);
// // //         setMessageOffset((prev) => prev + older.length);
// // //       }
// // //     } catch (error) {
// // //       console.error("Error loading more messages:", error);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   }, [currentRoom, messageOffset, isLoading]);

// // //   return {
// // //     messages,
// // //     typingUsers,
// // //     rooms,
// // //     currentRoom,
// // //     isLoading,
// // //     sendMessage,
// // //     joinRoom,
// // //     startTyping,
// // //     stopTyping,
// // //     loadMoreMessages,
// // //   };
// // // };

// // // hooks/useChat.ts
// // import { useState, useEffect, useCallback, useRef } from "react";
// // import { useFocusEffect } from "@react-navigation/native";
// // import { chatService, TypingUser } from "../services/chatService";
// // import { ChatMessage, ChatRoom } from "../services/chatDatabase";

// // /** What the hook gives back to screens */
// // export interface UseChatReturn {
// //   messages: ChatMessage[];
// //   typingUsers: TypingUser[];
// //   rooms: ChatRoom[];
// //   currentRoom: string | null;
// //   isLoading: boolean;
// //   sendMessage: (text: string) => Promise<void>;
// //   joinRoom: (roomId: string, roomName: string) => Promise<void>;
// //   startTyping: () => void;
// //   stopTyping: () => void;
// //   loadMoreMessages: () => Promise<void>;
// // }

// // /**
// //  * useChat
// //  * - Sets up/tears down real-time listeners once for a given user
// //  * - Keeps local UI state (messages, typing indicators, rooms)
// //  * - Reads/writes persistent chat history via chatService/chatDatabase
// //  * - On screen focus, reloads messages from storage so web won’t “forget”
// //  */
// // export const useChat = (userId: string, userName: string): UseChatReturn => {
// //   /** ----- UI state the screen will render ----- */
// //   const [messages, setMessages] = useState<ChatMessage[]>([]);
// //   const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
// //   const [rooms, setRooms] = useState<ChatRoom[]>([]);
// //   const [currentRoom, setCurrentRoom] = useState<string | null>(null);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [messageOffset, setMessageOffset] = useState(0); // for pagination

// //   /**
// //    * We’ll store any “unsubscribe” functions returned by chatService.onX(...)
// //    * in a ref so we can remove them on unmount (and avoid double-binding).
// //    */
// //   const unsubsRef = useRef<Array<() => void>>([]);

// //   /** Small helper to remove all listeners we registered from this hook */
// //   const removeAllListeners = () => {
// //     unsubsRef.current.forEach((off) => {
// //       try {
// //         off();
// //       } catch {}
// //     });
// //     unsubsRef.current = [];
// //   };

// //   /**
// //    * 1) One-time setup for this user:
// //    *    - initialize chat layer (opens socket, identifies user, primes DB)
// //    *    - fetch known rooms
// //    *    - bind real-time listeners (message, typing, delivery ack)
// //    *
// //    * NOTE: We DO NOT disconnect the socket in this hook; the socket is app-wide.
// //    * We only remove the event listeners we added.
// //    */
// //   useEffect(() => {
// //     let cancelled = false;

// //     (async () => {
// //       setIsLoading(true);

// //       // a) make sure chat infrastructure is ready (socket + db + identity)
// //       await chatService.initialize(userId, userName);
// //       if (cancelled) return;

// //       // b) load any rooms we know about (for a room picker UI, etc.)
// //       const existingRooms = await chatService.getAllRooms();
// //       if (cancelled) return;
// //       setRooms(existingRooms);

// //       // c) avoid double listeners if effect re-runs
// //       removeAllListeners();

// //       // d) MESSAGE stream — de-dupe by id/tempId (optimistic -> server ack)
// //       const offMessage = chatService.onMessage((message) => {
// //         setMessages((prev) => {
// //           const exists = prev.some(
// //             (m) => m.id === message.id || m.tempId === message.tempId
// //           );
// //           if (exists) {
// //             // replace the existing copy (e.g., update delivered flag)
// //             return prev.map((m) =>
// //               m.id === message.id || m.tempId === message.tempId ? message : m
// //             );
// //           }
// //           return [...prev, message];
// //         });
// //       });

// //       // e) TYPING indicators — keep a tiny set of who’s typing
// //       const offTyping = chatService.onTyping((typingUser) => {
// //         setTypingUsers((prev) => {
// //           const others = prev.filter((u) => u.userId !== typingUser.userId);
// //           return typingUser.isTyping ? [...others, typingUser] : others;
// //         });
// //       });

// //       // f) DELIVERY ACK — server maps tempId -> real message id
// //       const offDelivery = chatService.onDelivery((tempId, messageId) => {
// //         setMessages((prev) =>
// //           prev.map((m) =>
// //             m.tempId === tempId
// //               ? { ...m, id: messageId, delivered: true, tempId: undefined }
// //               : m
// //           )
// //         );
// //       });

// //       // remember these so we can unbind later
// //       unsubsRef.current = [offMessage, offTyping, offDelivery];

// //       setIsLoading(false);
// //     })();

// //     // cleanup on unmount or deps change
// //     return () => {
// //       cancelled = true;
// //       removeAllListeners(); // remove listeners added above
// //       // (socket stays alive; other screens may still use it)
// //     };
// //   }, [userId, userName]);

// //   /**
// //    * 2) When the screen comes back into focus (you navigate back here),
// //    *    re-hydrate messages for the current room from persistent storage.
// //    *    This fixes the “web loses messages when navigating away” problem.
// //    */
// //   useFocusEffect(
// //     useCallback(() => {
// //       let active = true;

// //       (async () => {
// //         if (!currentRoom) return;
// //         const saved = await chatService.getMessagesForRoom(currentRoom);
// //         if (!active) return;

// //         setMessages(saved);
// //         setMessageOffset(saved.length);
// //         setTypingUsers([]); // clear any stale typing badges
// //       })();

// //       return () => {
// //         active = false;
// //       };
// //     }, [currentRoom])
// //   );

// //   /**
// //    * joinRoom
// //    * - Tells the server we’re in a specific room (for targeted events)
// //    * - Loads latest history for that room from storage (so UI has messages
// //    *   even before new real-time events arrive)
// //    */
// //   const joinRoom = useCallback(async (roomId: string, roomName: string) => {
// //     try {
// //       setIsLoading(true);

// //       await chatService.joinRoom(roomId, roomName);

// //       const roomMessages = await chatService.getMessagesForRoom(roomId);
// //       setMessages(roomMessages);
// //       setCurrentRoom(roomId);
// //       setMessageOffset(roomMessages.length);
// //       setTypingUsers([]);
// //     } catch (error) {
// //       console.error("Error joining room:", error);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   }, []);

// //   /**
// //    * sendMessage
// //    * - chatService handles optimistic insert + persistence + socket emit
// //    * - If offline, your socketService queues the emit and it will flush later
// //    */
// //   const sendMessage = useCallback(async (text: string) => {
// //     try {
// //       await chatService.sendMessage(text);
// //     } catch (error) {
// //       console.error("Error sending message:", error);
// //     }
// //   }, []);

// //   /** Start/stop typing indicators for the current user */
// //   const startTyping = useCallback(() => {
// //     chatService.startTyping();
// //   }, []);
// //   const stopTyping = useCallback(() => {
// //     chatService.stopTyping();
// //   }, []);

// //   /**
// //    * loadMoreMessages
// //    * - Simple pagination: fetch older messages (limit=20) starting at current offset,
// //    *   then prepend them to the list.
// //    */
// //   const loadMoreMessages = useCallback(async () => {
// //     if (!currentRoom || isLoading) return;

// //     try {
// //       setIsLoading(true);

// //       const older = await chatService.getMessagesForRoom(
// //         currentRoom,
// //         20, // limit
// //         messageOffset // offset
// //       );

// //       if (older.length > 0) {
// //         // prepend older history above what’s already shown
// //         setMessages((prev) => [...older, ...prev]);
// //         setMessageOffset((prev) => prev + older.length);
// //       }
// //     } catch (error) {
// //       console.error("Error loading more messages:", error);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   }, [currentRoom, messageOffset, isLoading]);

// //   /** What the screen gets to use */
// //   return {
// //     messages,
// //     typingUsers,
// //     rooms,
// //     currentRoom,
// //     isLoading,
// //     sendMessage,
// //     joinRoom,
// //     startTyping,
// //     stopTyping,
// //     loadMoreMessages,
// //   };
// // };

// // hooks/useChat.ts
// import { useState, useEffect, useCallback, useRef } from "react";
// import { useFocusEffect } from "@react-navigation/native";
// import { chatService, TypingUser } from "../services/chatService";
// import { ChatMessage, ChatRoom } from "../services/chatDatabase";

// /** What the hook gives back to screens */
// export interface UseChatReturn {
//   messages: ChatMessage[];
//   typingUsers: TypingUser[];
//   rooms: ChatRoom[];
//   currentRoom: string | null;
//   isLoading: boolean;
//   sendMessage: (text: string) => Promise<void>;
//   joinRoom: (roomId: string, roomName: string) => Promise<void>;
//   startTyping: () => void;
//   stopTyping: () => void;
//   loadMoreMessages: () => Promise<void>;
//   /** 👶 NEW: lets a screen explicitly reload history from persistence */
//   reloadMessages: (roomId?: string) => Promise<void>;
// }

// /**
//  * useChat
//  * - Sets up/tears down real-time listeners once for a given user
//  * - Keeps local UI state (messages, typing indicators, rooms)
//  * - Reads/writes persistent chat history via chatService/chatDatabase
//  * - On screen focus, reloads messages from storage so web won’t “forget”
//  */
// export const useChat = (userId: string, userName: string): UseChatReturn => {
//   /** ----- UI state the screen will render ----- */
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
//   const [rooms, setRooms] = useState<ChatRoom[]>([]);
//   const [currentRoom, setCurrentRoom] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [messageOffset, setMessageOffset] = useState(0); // for pagination

//   /**
//    * We’ll store any “unsubscribe” functions returned by chatService.onX(...)
//    * in a ref so we can remove them on unmount (and avoid double-binding).
//    */
//   const unsubsRef = useRef<Array<() => void>>([]);

//   /** Small helper to remove all listeners we registered from this hook */
//   const removeAllListeners = () => {
//     unsubsRef.current.forEach((off) => {
//       try {
//         off();
//       } catch {}
//     });
//     unsubsRef.current = [];
//   };

//   /**
//    * 1) One-time setup for this user:
//    *    - initialize chat layer (opens socket, identifies user, primes DB)
//    *    - fetch known rooms
//    *    - bind real-time listeners (message, typing, delivery ack)
//    *
//    * NOTE: We DO NOT disconnect the socket in this hook; the socket is app-wide.
//    * We only remove the event listeners we added.
//    */
//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       setIsLoading(true);

//       // a) make sure chat infrastructure is ready (socket + db + identity)
//       await chatService.initialize(userId, userName);
//       if (cancelled) return;

//       // b) load any rooms we know about (for a room picker UI, etc.)
//       const existingRooms = await chatService.getAllRooms();
//       if (cancelled) return;
//       setRooms(existingRooms);

//       // c) avoid double listeners if effect re-runs
//       removeAllListeners();

//       // d) MESSAGE stream — de-dupe by id/tempId (optimistic -> server ack)
//       const offMessage = chatService.onMessage((message) => {
//         setMessages((prev) => {
//           const exists = prev.some(
//             (m) => m.id === message.id || m.tempId === message.tempId
//           );
//           if (exists) {
//             // replace the existing copy (e.g., update delivered flag)
//             return prev.map((m) =>
//               m.id === message.id || m.tempId === message.tempId ? message : m
//             );
//           }
//           return [...prev, message];
//         });
//       });

//       // e) TYPING indicators — keep a tiny set of who’s typing
//       const offTyping = chatService.onTyping((typingUser) => {
//         setTypingUsers((prev) => {
//           const others = prev.filter((u) => u.userId !== typingUser.userId);
//           return typingUser.isTyping ? [...others, typingUser] : others;
//         });
//       });

//       // f) DELIVERY ACK — server maps tempId -> real message id
//       const offDelivery = chatService.onDelivery((tempId, messageId) => {
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.tempId === tempId
//               ? { ...m, id: messageId, delivered: true, tempId: undefined }
//               : m
//           )
//         );
//       });

//       // remember these so we can unbind later
//       unsubsRef.current = [offMessage, offTyping, offDelivery];

//       setIsLoading(false);
//     })();

//     // cleanup on unmount or deps change
//     return () => {
//       cancelled = true;
//       removeAllListeners(); // remove listeners added above
//       // (socket stays alive; other screens may still use it)
//     };
//   }, [userId, userName]);

//   /**
//    * 👶 NEW helper: reloadMessages
//    * - Purpose: explicitly reload the current room’s history from the local DB.
//    * - Why: when a screen unmounts/remounts, React state resets, but your DB persists.
//    * - How: read from chatService (SQLite/Async) and repopulate local state.
//    * - Usage: call without args to reload the *current* room, or pass a roomId.
//    */
//   const reloadMessages = useCallback(
//     async (roomIdParam?: string) => {
//       const roomId = roomIdParam ?? currentRoom;
//       if (!roomId) return; // nothing to reload yet

//       try {
//         setIsLoading(true);
//         const saved = await chatService.getMessagesForRoom(roomId);
//         setMessages(saved);
//         setMessageOffset(saved.length); // keep pagination in sync
//         setTypingUsers([]); // ditch any stale typing badges
//       } catch (e) {
//         console.error("reloadMessages failed:", e);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [currentRoom]
//   );

//   /**
//    * 2) When the screen comes back into focus (you navigate back here),
//    *    re-hydrate messages for the current room from persistent storage.
//    *    This fixes the “web loses messages when navigating away” problem.
//    */
//   useFocusEffect(
//     useCallback(() => {
//       let active = true;

//       (async () => {
//         if (!currentRoom) return;
//         const saved = await chatService.getMessagesForRoom(currentRoom);
//         if (!active) return;

//         setMessages(saved);
//         setMessageOffset(saved.length);
//         setTypingUsers([]); // clear any stale typing badges
//       })();

//       return () => {
//         active = false;
//       };
//     }, [currentRoom])
//   );

//   /**
//    * joinRoom
//    * - Tells the server we’re in a specific room (for targeted events)
//    * - Loads latest history for that room from storage (so UI has messages
//    *   even before new real-time events arrive)
//    */
//   const joinRoom = useCallback(async (roomId: string, roomName: string) => {
//     try {
//       setIsLoading(true);

//       await chatService.joinRoom(roomId, roomName);

//       const roomMessages = await chatService.getMessagesForRoom(roomId);
//       setMessages(roomMessages);
//       setCurrentRoom(roomId);
//       setMessageOffset(roomMessages.length);
//       setTypingUsers([]);
//     } catch (error) {
//       console.error("Error joining room:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   /**
//    * sendMessage
//    * - chatService handles optimistic insert + persistence + socket emit
//    * - If offline, your socketService queues the emit and it will flush later
//    */
//   const sendMessage = useCallback(async (text: string) => {
//     try {
//       await chatService.sendMessage(text);
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   }, []);

//   /** Start/stop typing indicators for the current user */
//   const startTyping = useCallback(() => {
//     chatService.startTyping();
//   }, []);
//   const stopTyping = useCallback(() => {
//     chatService.stopTyping();
//   }, []);

//   /**
//    * loadMoreMessages
//    * - Simple pagination: fetch older messages (limit=20) starting at current offset,
//    *   then prepend them to the list.
//    */
//   const loadMoreMessages = useCallback(async () => {
//     if (!currentRoom || isLoading) return;

//     try {
//       setIsLoading(true);

//       const older = await chatService.getMessagesForRoom(
//         currentRoom,
//         20, // limit
//         messageOffset // offset
//       );

//       if (older.length > 0) {
//         // prepend older history above what’s already shown
//         setMessages((prev) => [...older, ...prev]);
//         setMessageOffset((prev) => prev + older.length);
//       }
//     } catch (error) {
//       console.error("Error loading more messages:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [currentRoom, messageOffset, isLoading]);

//   /** What the screen gets to use */
//   return {
//     messages,
//     typingUsers,
//     rooms,
//     currentRoom,
//     isLoading,
//     sendMessage,
//     joinRoom,
//     startTyping,
//     stopTyping,
//     loadMoreMessages,
//     reloadMessages, // 👶 NEW: exposed to screens
//   };
// };

// LET's TRY THIS ONE >......// hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { chatService, TypingUser } from "../services/chatService";
import { ChatMessage, ChatRoom } from "../services/chatDatabase";

/** What the hook gives back to screens */
export interface UseChatReturn {
  messages: ChatMessage[];
  typingUsers: TypingUser[];
  rooms: ChatRoom[];
  currentRoom: string | null;
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  joinRoom: (roomId: string, roomName: string) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  loadMoreMessages: () => Promise<void>;
  /** 👇 NEW: lets a screen re-hydrate messages from persistent storage on demand */
  reloadMessages: () => Promise<void>;
}

/**
 * useChat
 * - Sets up/tears down real-time listeners once for a given user
 * - Keeps local UI state (messages, typing indicators, rooms)
 * - Reads/writes persistent chat history via chatService/chatDatabase
 * - On screen focus, reloads messages from storage so web won’t “forget”
 */
export const useChat = (userId: string, userName: string): UseChatReturn => {
  /** ----- UI state the screen will render ----- */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageOffset, setMessageOffset] = useState(0); // for pagination

  /**
   * We’ll store any “unsubscribe” functions returned by chatService.onX(...)
   * in a ref so we can remove them on unmount (and avoid double-binding).
   */
  const unsubsRef = useRef<Array<() => void>>([]);

  /** Small helper to remove all listeners we registered from this hook */
  const removeAllListeners = () => {
    unsubsRef.current.forEach((off) => {
      try {
        off();
      } catch {}
    });
    unsubsRef.current = [];
  };

  /**
   * 1) One-time setup for this user:
   *    - initialize chat layer (opens socket, identifies user, primes DB)
   *    - fetch known rooms
   *    - bind real-time listeners (message, typing, delivery ack)
   *
   * NOTE: We DO NOT disconnect the socket in this hook; the socket is app-wide.
   * We only remove the event listeners we added.
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);

      // a) make sure chat infrastructure is ready (socket + db + identity)
      await chatService.initialize(userId, userName);
      if (cancelled) return;

      // b) load any rooms we know about (for a room picker UI, etc.)
      const existingRooms = await chatService.getAllRooms();
      if (cancelled) return;
      setRooms(existingRooms);

      // c) avoid double listeners if effect re-runs
      removeAllListeners();

      // d) MESSAGE stream — de-dupe by id/tempId (optimistic -> server ack)
      const offMessage = chatService.onMessage((message) => {
        setMessages((prev) => {
          const exists = prev.some(
            (m) => m.id === message.id || m.tempId === message.tempId
          );
          if (exists) {
            // replace the existing copy (e.g., update delivered flag)
            return prev.map((m) =>
              m.id === message.id || m.tempId === message.tempId ? message : m
            );
          }
          return [...prev, message];
        });
      });

      // e) TYPING indicators — keep a tiny set of who’s typing
      const offTyping = chatService.onTyping((typingUser) => {
        setTypingUsers((prev) => {
          const others = prev.filter((u) => u.userId !== typingUser.userId);
          return typingUser.isTyping ? [...others, typingUser] : others;
        });
      });

      // f) DELIVERY ACK — server maps tempId -> real message id
      const offDelivery = chatService.onDelivery((tempId, messageId) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.tempId === tempId
              ? { ...m, id: messageId, delivered: true, tempId: undefined }
              : m
          )
        );
      });

      // remember these so we can unbind later
      unsubsRef.current = [offMessage, offTyping, offDelivery];

      setIsLoading(false);
    })();

    // cleanup on unmount or deps change
    return () => {
      cancelled = true;
      removeAllListeners(); // remove listeners added above
      // (socket stays alive; other screens may still use it)
    };
  }, [userId, userName]);

  /**
   * 👇 NEW helper
   * reloadMessages()
   * - Reads the latest messages for the *current* room from persistent storage
   * - Useful when a screen re-gains focus or after a hard reload/dev refresh
   */
  const reloadMessages = useCallback(async () => {
    if (!currentRoom) return; // no room selected yet
    const saved = await chatService.getMessagesForRoom(currentRoom);
    setMessages(saved);
    setMessageOffset(saved.length);
    setTypingUsers([]); // clear any stale typing badges
  }, [currentRoom]);

  /**
   * 2) When the screen comes back into focus (you navigate back here),
   *    re-hydrate messages for the current room from persistent storage.
   *    This fixes the “web loses messages when navigating away” problem.
   */
  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        if (!currentRoom) return;
        const saved = await chatService.getMessagesForRoom(currentRoom);
        if (!active) return;

        setMessages(saved);
        setMessageOffset(saved.length);
        setTypingUsers([]); // clear any stale typing badges
      })();

      return () => {
        active = false;
      };
    }, [currentRoom])
  );

  /**
   * joinRoom
   * - Tells the server we’re in a specific room (for targeted events)
   * - Loads latest history for that room from storage (so UI has messages
   *   even before new real-time events arrive)
   */
  const joinRoom = useCallback(async (roomId: string, roomName: string) => {
    try {
      setIsLoading(true);

      await chatService.joinRoom(roomId, roomName);

      const roomMessages = await chatService.getMessagesForRoom(roomId);
      setMessages(roomMessages);
      setCurrentRoom(roomId);
      setMessageOffset(roomMessages.length);
      setTypingUsers([]);
    } catch (error) {
      console.error("Error joining room:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * sendMessage
   * - chatService handles optimistic insert + persistence + socket emit
   * - If offline, your socketService queues the emit and it will flush later
   */
  const sendMessage = useCallback(async (text: string) => {
    try {
      await chatService.sendMessage(text);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, []);

  /** Start/stop typing indicators for the current user */
  const startTyping = useCallback(() => {
    chatService.startTyping();
  }, []);
  const stopTyping = useCallback(() => {
    chatService.stopTyping();
  }, []);

  /**
   * loadMoreMessages
   * - Simple pagination: fetch older messages (limit=20) starting at current offset,
   *   then prepend them to the list.
   */
  const loadMoreMessages = useCallback(async () => {
    if (!currentRoom || isLoading) return;

    try {
      setIsLoading(true);

      const older = await chatService.getMessagesForRoom(
        currentRoom,
        20, // limit
        messageOffset // offset
      );

      if (older.length > 0) {
        // prepend older history above what’s already shown
        setMessages((prev) => [...older, ...prev]);
        setMessageOffset((prev) => prev + older.length);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom, messageOffset, isLoading]);

  /** What the screen gets to use */
  return {
    messages,
    typingUsers,
    rooms,
    currentRoom,
    isLoading,
    sendMessage,
    joinRoom,
    startTyping,
    stopTyping,
    loadMoreMessages,
    reloadMessages, // 👈 NEW
  };
};
