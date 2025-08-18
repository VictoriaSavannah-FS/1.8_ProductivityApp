// // NEW UPDATED from 2.2 ----- CAHT ROOMS

// // server.js
// require("dotenv").config();

// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");

// const app = express();
// const server = http.createServer(app);

// // --- CORS / Origins ---
// const HOST_IP = process.env.HOST_IP || "10.10.127.34"; // set in .env if you want
// const ALLOWED_ORIGINS = [
//   "http://localhost:3000", // web dev
//   "http://localhost:19006", // Expo web
//   `exp://${HOST_IP}:19000`, // Expo Go on / Dynamic IP soi only have to update one IP
// ];

// // Express CORS
// app.use(
//   cors({
//     origin: ALLOWED_ORIGINS,
//     methods: ["GET", "POST"],
//     credentials: true,
//   })
// );
// app.use(express.json());

// // Socket.io (w/same CORS)
// const io = new Server(server, {
//   cors: {
//     origin: ALLOWED_ORIGINS,
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
//   transports: ["websocket", "polling"],
// });

// // ---- Simple health check (kept from your original) ----
// app.get("/health", (req, res) => {
//   res.json({
//     status: "OK",
//     // metaData/timestamp---
//     timestamp: new Date().toISOString(),
//     connections: io.engine.clientsCount,
//   });
// });

// // ===== In-memory chat state (resets on server restart) =====
// const chatRooms = new Map();
// // roomId -> { name, messages: [] array, participants: Map<socketId, user> }
// const userSessions = new Map();
// // socketId -> { userId, userName, currentRoomId, joinedAt }

// // Helper: create the room lazily the first time it’s used
// function getOrCreateRoom(roomId, name = roomId) {
//   if (!chatRooms.has(roomId)) {
//     chatRooms.set(roomId, {
//       id: roomId,
//       name,
//       messages: [], // array of { id, userId, text, ... }
//       participants: new Map(), // socketId -> { userId, userName }
//       lastActivityAt: new Date().toISOString(),
//     });
//   }
//   return chatRooms.get(roomId);
// }

// // ---- Chat API endpoints ----
// app.get("/api/chat/rooms", (req, res) => {
//   const rooms = Array.from(chatRooms.keys());
//   res.json({ rooms });
// });

// app.get("/api/chat/rooms/:roomId/messages", (req, res) => {
//   const { roomId } = req.params;
//   const limit = parseInt(req.query.limit) || 50;
//   const offset = parseInt(req.query.offset) || 0;

//   const roomData = chatRooms.get(roomId) || { messages: [] };
//   const messages = roomData.messages.slice(offset, offset + limit).reverse(); // most recent first

//   res.json({ messages, hasMore: offset + limit < roomData.messages.length });
// });

// // 2.8 FEATURE ---- CAHT ROOMS and REgsitry to track
// // --- Room registry for participants + presence
// const roomParticipants = new Map(); // roomId -> Map(userId -> {userId, userName, socketId, lastSeen})
// function getParticipants(roomId) {
//   if (!roomParticipants.has(roomId)) roomParticipants.set(roomId, new Map());
//   return roomParticipants.get(roomId);
// }
// /**
//  * ---- Socket.io events ---- ==========
//  */
// // helps users Identify themselves---- USer JOINS ---
// socket.on("user_join", ({ userId, userName }) => {
//   userSessions.set(socket.id, {
//     userId,
//     userName,
//     currentRoomId: null,
//     joinedAt: Date.now(),
//   });
// });

// // USER IS CONNECTED -----------
// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   // Optional: confirm connection (from your original)
//   socket.emit("connection_confirmed", {
//     socketId: socket.id,
//     timestamp: new Date().toISOString(),
//   });

//   // Basic ping/pong (from your original)
//   socket.on("ping", (data) => {
//     socket.emit("pong", { ...data, serverTimestamp: new Date().toISOString() });
//   });

//   // User joins with profile information
//   socket.on("user_join", (userData) => {
//     userSessions.set(socket.id, {
//       ...userData,
//       socketId: socket.id,
//       joinedAt: new Date().toISOString(),
//       isOnline: true,
//     });

//     socket.emit("user_joined", {
//       success: true,
//       user: userSessions.get(socket.id),
//     });
//   });

//   // JOIN a ---> CHAT ROOM
//   socket.on("join_room", (data) => {
//     const { roomId, userId, userName } = data;
//     socket.join(roomId);
//     /**if Chat has Room No room ID -> set room ID,
//      * add mesaages to []
//      * add USer to Mapp() - Begin Lsit
//      * typyingUSer: pass input to Set() to ref. fetch later*/
//     if (!chatRooms.has(roomId)) {
//       chatRooms.set(roomId, {
//         id: roomId,
//         messages: [],
//         participants: new Map(),
//         typingUsers: new Set(),
//       });
//     }
//     //
//     const room = chatRooms.get(roomId);
//     room.participants.set(userId, {
//       userId,
//       userName,
//       socketId: socket.id,
//       joinedAt: new Date().toISOString(),
//     });

//     // Send recent history to the joiner
//     const recentMessages = room.messages.slice(-20);
//     socket.emit("room_joined", {
//       roomId,
//       messages: recentMessages,
//       participants: Array.from(room.participants.values()),
//     });

//     // Notify others
//     socket.to(roomId).emit("user_joined_room", {
//       userId,
//       userName,
//       timestamp: new Date().toISOString(),
//     });

//     console.log(`User ${userName} joined room ${roomId}`);
//   });

//   // // New message
//   // socket.on("send_message", (data) => {
//   //   const { roomId, message } = data;
//   //   const room = chatRooms.get(roomId);

//   //   if (!room) {
//   //     socket.emit("message_error", { error: "Room not found" });
//   //     return;
//   //   }

//   //   // const messageData = {
//   //   //   id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//   //   //   ...message,
//   //   //   timestamp: new Date().toISOString(),
//   //   //   deliveredTo: [],
//   //   //   readBy: [],
//   //   // };

//   //   // room.messages.push(messageData);
//   //   const messageData = {
//   //     id: `msg_${Date.now()}_${Math.floor(Math.random() * 7000)}`,
//   //     roomId, // ✅ include roomId
//   //     ...message, // tempId, userId, userName, text, type
//   //     timestamp: new Date().toISOString(),
//   //     deliveredTo: [],
//   //     readBy: [],
//   //   };

//   //   room.messages.push(messageData); // now history items have roomId too
//   //   io.to(roomId).emit("new_message", messageData);
//   //   socket.emit("message_delivered", {
//   //     tempId: message.tempId,
//   //     messageId: messageData.id,
//   //     timestamp: messageData.timestamp,
//   //   });
//   //   // Broadcast to room
//   //   io.to(roomId).emit("new_message", messageData);

//   //   // Confirm to sender (map tempId -> real id)
//   //   socket.emit("message_delivered", {
//   //     tempId: message.tempId,
//   //     messageId: messageData.id,
//   //     timestamp: messageData.timestamp,
//   //   });

//   //   console.log(
//   //     `Message sent in room ${roomId}:`,
//   //     (messageData.text || "").substring(0, 50)
//   //   );
//   // });
//   socket.on("send_message", (data) => {
//     const { roomId, message } = data;
//     const room = chatRooms.get(roomId);
//     if (!room) {
//       socket.emit("message_error", { error: "Room not found" });
//       return;
//     }

//     const messageData = {
//       id: `msg_${Date.now()}_${Math.floor(Math.random() * 7000)}`,
//       roomId, // keep roomId
//       ...message, // tempId, userId, userName, text, type
//       timestamp: new Date().toISOString(),
//       deliveredTo: [],
//       readBy: [],
//     };

//     room.messages.push(messageData);

//     // ✅ Broadcast ONCE to the room
//     io.to(roomId).emit("new_message", messageData);

//     // ✅ ACK ONCE (map tempId -> server id) if client sent a tempId
//     if (message.tempId) {
//       socket.emit("message_delivered", {
//         tempId: message.tempId,
//         messageId: messageData.id,
//         timestamp: messageData.timestamp,
//       });
//     }

//     console.log(
//       `Message sent in room ${roomId}:`,
//       (messageData.text || "").substring(0, 50)
//     );
//   });

//   // Typing indicators
//   socket.on("typing_start", ({ roomId, userId, userName }) => {
//     const room = chatRooms.get(roomId);
//     if (room) {
//       room.typingUsers.add(userId);
//       socket.to(roomId).emit("user_typing", {
//         userId,
//         userName,
//         isTyping: true,
//         timestamp: new Date().toISOString(),
//       });
//     }
//   });

//   socket.on("typing_stop", ({ roomId, userId, userName }) => {
//     const room = chatRooms.get(roomId);
//     if (room) {
//       room.typingUsers.delete(userId);
//       socket.to(roomId).emit("user_typing", {
//         userId,
//         userName,
//         isTyping: false,
//         timestamp: new Date().toISOString(),
//       });
//     }
//   });

//   // Read receipts
//   socket.on("mark_messages_read", ({ roomId, messageIds, userId }) => {
//     const room = chatRooms.get(roomId);
//     if (room) {
//       messageIds.forEach((messageId) => {
//         const m = room.messages.find((mm) => mm.id === messageId);
//         if (m && !m.readBy.includes(userId)) m.readBy.push(userId);
//       });

//       socket.to(roomId).emit("messages_read", {
//         messageIds,
//         userId,
//         timestamp: new Date().toISOString(),
//       });
//     }
//   });

//   // Disconnect
//   socket.on("disconnect", (reason) => {
//     console.log(`User disconnected: ${socket.id}, reason: ${reason}`);

//     // Remove from rooms
//     chatRooms.forEach((room, roomId) => {
//       const userToRemove = Array.from(room.participants.values()).find(
//         (p) => p.socketId === socket.id
//       );
//       if (userToRemove) {
//         room.participants.delete(userToRemove.userId);
//         room.typingUsers.delete(userToRemove.userId);
//         socket.to(roomId).emit("user_left_room", {
//           userId: userToRemove.userId,
//           userName: userToRemove.userName,
//           timestamp: new Date().toISOString(),
//         });
//       }
//     });

//     userSessions.delete(socket.id);
//   });
// });

// // 2.3 | COLLABORRATIVEE STATE MANAEGEMNT / PRESENCE INDICATORS
// // Collaborative state storage
// const collaborativeRooms = new Map();
// const userPresence = new Map();
// // Collaborative state management
// class CollaborativeRoom {
//   constructor(roomId) {
//     this.roomId = roomId;
//     this.sharedState = {};
//     this.participants = new Map();
//     this.activeEditors = new Map(); // field -> userId
//     this.operationHistory = [];
//     this.lastOperationId = 0;
//   }
//   addParticipant(userId, userName, socketId) {
//     this.participants.set(userId, {
//       userId,
//       userName,
//       socketId,
//       cursor: null,
//       selection: null,
//       lastActivity: new Date().toISOString(),
//       isActive: true,
//     });
//   }
//   removeParticipant(userId) {
//     this.participants.delete(userId);
//     // Remove any active edits by this user
//     for (const [field, editorId] of this.activeEditors.entries()) {
//       if (editorId === userId) {
//         this.activeEditors.delete(field);
//       }
//     }
//   }
//   applyOperation(operation) {
//     const opId = ++this.lastOperationId;
//     const timestampedOp = {
//       ...operation,
//       id: opId,
//       timestamp: new Date().toISOString(),
//     };
//     // Apply operation to shared state
//     this.updateSharedState(timestampedOp);

//     // Store in history for new clients
//     this.operationHistory.push(timestampedOp);

//     // Keep only last 100 operations
//     if (this.operationHistory.length > 100) {
//       this.operationHistory = this.operationHistory.slice(-100);
//     }
//     return timestampedOp;
//   }
//   updateSharedState(operation) {
//     const { type, path, value, userId } = operation;

//     switch (type) {
//       case "SET_VALUE":
//         this.setNestedValue(this.sharedState, path, value);
//         break;
//       case "UPDATE_TASK":
//         if (!this.sharedState.tasks) this.sharedState.tasks = {};
//         this.sharedState.tasks[operation.taskId] = {
//           ...this.sharedState.tasks[operation.taskId],
//           ...operation.updates,
//           lastModifiedBy: userId,
//           lastModifiedAt: operation.timestamp,
//         };
//         break;
//       case "ADD_TASK":
//         if (!this.sharedState.tasks) this.sharedState.tasks = {};
//         this.sharedState.tasks[operation.taskId] = operation.task;
//         break;
//       case "DELETE_TASK":
//         if (this.sharedState.tasks) {
//           delete this.sharedState.tasks[operation.taskId];
//         }
//         break;
//     }
//   }
//   setNestedValue(obj, path, value) {
//     const keys = path.split(".");
//     const lastKey = keys.pop();
//     const target = keys.reduce((current, key) => {
//       if (!current[key]) current[key] = {};
//       return current[key];
//     }, obj);
//     target[lastKey] = value;
//   }
//   startEditing(userId, field) {
//     const currentEditor = this.activeEditors.get(field);
//     if (currentEditor && currentEditor !== userId) {
//       return { success: false, currentEditor };
//     }

//     this.activeEditors.set(field, userId);
//     return { success: true };
//   }
//   stopEditing(userId, field) {
//     if (this.activeEditors.get(field) === userId) {
//       this.activeEditors.delete(field);
//     }
//   }
//   updatePresence(userId, presenceData) {
//     const participant = this.participants.get(userId);
//     if (participant) {
//       Object.assign(participant, presenceData, {
//         lastActivity: new Date().toISOString(),
//         isActive: true,
//       });
//     }
//   }
//   getActiveEditors() {
//     const activeEdits = {};
//     for (const [field, userId] of this.activeEditors.entries()) {
//       const user = this.participants.get(userId);
//       if (user) {
//         activeEdits[field] = {
//           userId,
//           userName: user.userName,
//           startedAt: user.lastActivity,
//         };
//       }
//     }
//     return activeEdits;
//   }
//   getParticipantsList() {
//     return Array.from(this.participants.values()).map((p) => ({
//       userId: p.userId,
//       userName: p.userName,
//       isActive: p.isActive,
//       cursor: p.cursor,
//       selection: p.selection,
//       lastActivity: p.lastActivity,
//     }));
//   }
// }
// // Socket.io collaborative event handlers
// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.id}`);
//   // Join collaborative room
//   socket.on("join_collaborative_room", async (data) => {
//     const { roomId, userId, userName } = data;

//     socket.join(roomId);

//     // Get or create collaborative room
//     if (!collaborativeRooms.has(roomId)) {
//       collaborativeRooms.set(roomId, new CollaborativeRoom(roomId));
//     }

//     const room = collaborativeRooms.get(roomId);
//     room.addParticipant(userId, userName, socket.id);

//     // Send current state to new participant
//     socket.emit("collaborative_state_sync", {
//       roomId,
//       sharedState: room.sharedState,
//       operationHistory: room.operationHistory.slice(-20), // Last 20 operations
//       participants: room.getParticipantsList(),
//       activeEditors: room.getActiveEditors(),
//     });

//     // Notify others of new participant
//     socket.to(roomId).emit("participant_joined", {
//       userId,
//       userName,
//       timestamp: new Date().toISOString(),
//     });

//     // Broadcast updated participant list
//     io.to(roomId).emit("participants_updated", {
//       participants: room.getParticipantsList(),
//     });
//   });
//   // Handle collaborative operations
//   socket.on("collaborative_operation", (data) => {
//     const { roomId, operation } = data;
//     const room = collaborativeRooms.get(roomId);

//     if (!room) {
//       socket.emit("operation_error", { error: "Room not found" });
//       return;
//     }
//     // Apply operation and get timestamped version
//     const processedOperation = room.applyOperation(operation);

//     // Broadcast to all clients in room
//     io.to(roomId).emit("operation_applied", {
//       operation: processedOperation,
//       sharedState: room.sharedState,
//     });

//     console.log(
//       `Operation applied in room ${roomId}:`,
//       processedOperation.type
//     );
//   });
//   // Handle editing lock requests
//   socket.on("request_edit_lock", (data) => {
//     const { roomId, field, userId } = data;
//     const room = collaborativeRooms.get(roomId);

//     if (!room) {
//       socket.emit("edit_lock_response", {
//         success: false,
//         error: "Room not found",
//       });
//       return;
//     }
//     const result = room.startEditing(userId, field);

//     socket.emit("edit_lock_response", {
//       success: result.success,
//       field,
//       currentEditor: result.currentEditor,
//     });
//     if (result.success) {
//       // Notify others that this field is being edited
//       socket.to(roomId).emit("field_locked", {
//         field,
//         userId,
//         userName: room.participants.get(userId)?.userName,
//       });
//     }
//   });
//   // Handle editing unlock
//   socket.on("release_edit_lock", (data) => {
//     const { roomId, field, userId } = data;
//     const room = collaborativeRooms.get(roomId);

//     if (room) {
//       room.stopEditing(userId, field);

//       // Notify others that field is available
//       socket.to(roomId).emit("field_unlocked", {
//         field,
//         userId,
//       });
//     }
//   });
//   // Handle presence updates (cursor position, selection, etc.)
//   socket.on("update_presence", (data) => {
//     const { roomId, userId, presenceData } = data;
//     const room = collaborativeRooms.get(roomId);

//     if (room) {
//       room.updatePresence(userId, presenceData);

//       // Broadcast presence update to others
//       socket.to(roomId).emit("presence_updated", {
//         userId,
//         presenceData,
//         timestamp: new Date().toISOString(),
//       });
//     }
//   });
//   // Handle user going idle/active
//   socket.on("user_activity_change", (data) => {
//     const { roomId, userId, isActive } = data;
//     const room = collaborativeRooms.get(roomId);

//     if (room) {
//       const participant = room.participants.get(userId);
//       if (participant) {
//         participant.isActive = isActive;
//         participant.lastActivity = new Date().toISOString();

//         // Broadcast activity change
//         socket.to(roomId).emit("user_activity_updated", {
//           userId,
//           isActive,
//           timestamp: participant.lastActivity,
//         });
//       }
//     }
//   });
//   // Handle disconnection
//   socket.on("disconnect", (reason) => {
//     console.log(`User disconnected: ${socket.id}, reason: ${reason}`);

//     // Remove user from all collaborative rooms
//     collaborativeRooms.forEach((room, roomId) => {
//       const userToRemove = Array.from(room.participants.values()).find(
//         (p) => p.socketId === socket.id
//       );

//       if (userToRemove) {
//         room.removeParticipant(userToRemove.userId);

//         // Notify others of participant leaving
//         socket.to(roomId).emit("participant_left", {
//           userId: userToRemove.userId,
//           userName: userToRemove.userName,
//           timestamp: new Date().toISOString(),
//         });
//         // Broadcast updated participant list
//         socket.to(roomId).emit("participants_updated", {
//           participants: room.getParticipantsList(),
//         });
//         // Broadcast unlocked fields
//         socket.to(roomId).emit("user_fields_unlocked", {
//           userId: userToRemove.userId,
//         });
//       }
//     });
//   });
// });
// // ---- Start server ----
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`Socket.io ready for chat connections`);
//   console.log("Allowed origins:", ALLOWED_ORIGINS);
// });

// // Updated for Queued / Offline handlign
// server.js

/**
 *  Real-time chat
 *  Collab PResence (demo server)
 *  In-memory storage only ---> clears e/a time @ restart)
 *  CORS set for local dev (web + Expo Go/iOS)
 * =-=-=-=-=-=-=-=-- 2.8 feastusrs | Update -=-=-=-==-=--=-
 *  Socket.io rooms per chat channel ** 2.8 feature
 *  Includes Option A feature:
 * - message editing
 */

require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// --- CORS / Origins --> edit HOST_IP in .env w/ IP ---
const HOST_IP = process.env.HOST_IP || "10.10.127.34";
const ALLOWED_ORIGINS = [
  "http://localhost:3000", // Next.js / CRA web
  "http://localhost:19006", // Expo web (metro web port)
  `exp://${HOST_IP}:19000`, // Expo Go app on device
];

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

// --- Socket.io --> folowing same CORS rules to be able to connext to server ---
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// ---- Simple health check / can helpt troubleshoot *----
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
  });
});

/**  In-memory state ------------------
 * Resets e/a @ server restart
 *  npm run dev =======================================================*/

//  chatRooms map:
//    roomId -> {
//      id, name, messages: [],
//      participants: Map<userId -> {userId,userName,socketId,joinedAt}>,
//      typingUsers: Set<userId>,
//      lastActivityAt
//    }

const chatRooms = new Map();

/**
 * userSessions map:
 *   socketId -> { userId, userName, socketId, currentRoomId, joinedAt, isOnline }
 */
const userSessions = new Map();

// --- Helper: create a room IF NOT exist yet ---
function getOrCreateRoom(roomId, name = roomId) {
  if (!chatRooms.has(roomId)) {
    chatRooms.set(roomId, {
      id: roomId,
      name,
      messages: [], // array of messg objects
      participants: new Map(), // userId -> participant info
      typingUsers: new Set(), // quick lookup for typing indicators
      lastActivityAt: new Date().toISOString(),
    });
  }
  return chatRooms.get(roomId);
}

// --- Helper: LEAVE RoomX --> socket is currently in ---
function leaveCurrentRoom(socket) {
  // session Room
  const sess = userSessions.get(socket.id);
  if (!sess || !sess.currentRoomId) return;

  const room = chatRooms.get(sess.currentRoomId);
  if (room) {
    // find User in ROOM == matches this socket
    const removed = Array.from(room.participants.values()).find(
      (p) => p.socketId === socket.id
    );
    if (removed) {
      room.participants.delete(removed.userId);
      room.typingUsers.delete(removed.userId);

      // NOTIFY this userID LEFT -----
      socket.to(room.id).emit("user_left_room", {
        userId: removed.userId,
        userName: removed.userName,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // SHOW --> currentRoomId on the session
  userSessions.set(socket.id, { ...sess, currentRoomId: null });
}

/** REST API for messages =>debugging/pagination demos*?
 *  =======================================================*/

// API GET | GET ROOM =============
// @ given route ---
app.get("/api/chat/rooms", (req, res) => {
  const rooms = Array.from(chatRooms.keys());
  res.json({ rooms });
});

/** API GET
 * ROom ID
 * MEssge fetchede = MAx 50
 * oofset: how far into list "skip" befoer grabbign a messg
 * pagination -> Limit/ MAx
 */
app.get("/api/chat/rooms/:roomId/messages", (req, res) => {
  const { roomId } = req.params; //  get frm Dynamic URL (:roomId)
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const room = chatRooms.get(roomId) || { messages: [] };
  //fetch roomId from in-memory chatRoom Map()
  // IF NOT EXIT -> fallbackto emoty room []
  const messages = room.messages.slice(offset, offset + limit).reverse(); //grabs mesges based on limit+offset
  // reverse()=> flips order to see most RECENT first

  res.json({ messages, hasMore: offset + limit < room.messages.length }); //snd back response
  // mssges=>[] of mesgges jsut grabbed
  // hasMore: boolean value ==> teslls frontend if more mesages stull to load ----
});

/** Socket.io — ONE connection handler
 *REALTIME caht/collab STARTS HERE =====e
 */

//  CONNECTION HDNLER

io.on("connection", (socket) => {
  //eveytime user connetes ==> give them unique ID
  console.log(`User connected: ${socket.id}`);

  // confirmation of Connection!! :)
  socket.emit("connection_confirmed", {
    socketId: socket.id, //unique ID
    timestamp: new Date().toISOString(), // timesTamps
  });

  // Basic ping/pong test -----
  /**Client send PING
   * SERVER rsponds PONG
   */
  socket.on("ping", (data) => {
    socket.emit("pong", { ...data, serverTimestamp: new Date().toISOString() });
  });

  /**   -=-=-=-- PRESENCE TRCKING  -=-=-=-=-=  */
  // USER_JOIN ==> USer Identity and PResence
  socket.on("user_join", ({ userId, userName }) => {
    // when users join -> they pass theur userId adn userNAme
    userSessions.set(socket.id, {
      // server Storse it in ==> Mat(userSEssoins) => keyed by socket.io
      userId,
      userName,
      socketId: socket.id,
      currentRoomId: null,
      joinedAt: new Date().toISOString(), // time @ add
      isOnline: true, // Online / not
    });

    // Confirmation => server to USer -> they know they're registered or not
    socket.emit("user_joined", {
      success: true, // registered Good! :)
      user: userSessions.get(socket.id), // stored Info
    });
  });

  /* Join / leave rooms
  -  user choooes WHCHI ROOM to join 
  - 
  -----------------------*/
  socket.on("join_room", ({ roomId, userId, userName }) => {
    // If user => already in a room ==> LEAVE
    leaveCurrentRoom(socket);

    // Ensure the ROOM exists
    const room = getOrCreateRoom(roomId, roomId);
    // Join Room--> via Socket.io -> to new Room channel
    socket.join(roomId);

    // TRACK User in Room
    room.participants.set(userId, {
      userId,
      userName,
      socketId: socket.id,
      joinedAt: new Date().toISOString(), //timestanp
    });

    //  UPDATE SEssoin REc ==> Track what room user is in
    const sess = userSessions.get(socket.id) || { userId, userName };
    userSessions.set(socket.id, { ...sess, currentRoomId: roomId });

    // Splice()=> send 20 last mesages ==> new USer joined
    const recentMessages = room.messages.slice(-20);
    socket.emit("room_joined", {
      roomId,
      messages: recentMessages,
      participants: Array.from(room.participants.values()),
    });

    // Sends UPADTE on NEW user to all curent users
    socket.to(roomId).emit("user_joined_room", {
      userId,
      userName,
      timestamp: new Date().toISOString(), //timestmp
    });

    console.log(`User ${userName} joined room ${roomId}`);
  });

  /* New message
  - if user sends NEW message 
   -------------------------*/
  socket.on("send_message", ({ roomId, message }) => {
    // user sends MESSAG / BUT NO ROOM
    const room = chatRooms.get(roomId);
    if (!room) {
      // FAIL cathc
      socket.emit("message_error", { error: "Room not found" });
      return;
    }

    // Compose the server-side message object *****
    const messageData = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 8000)}`,
      roomId,
      ...message, // tempId, userId, userName, text, type
      timestamp: new Date().toISOString(), //timesatmo for SErevr to track
      deliveredTo: [],
      readBy: [],
    };
    // SAsve --> in Memory room
    room.messages.push(messageData);
    room.lastActivityAt = messageData.timestamp;

    // NOTIFY /UPDATE all Once
    io.to(roomId).emit("new_message", messageData);

    // send ACKNOWLEDMENT / ACK --> confirmation back to OG user and can swap tempId w/ real id
    //mark as "delivrd"
    if (message.tempId) {
      socket.emit("message_delivered", {
        tempId: message.tempId,
        messageId: messageData.id,
        timestamp: messageData.timestamp,
      });
    }
    // cosnle log - track room ID/ mesage
    console.log(
      `Message sent in room ${roomId}:`,
      (messageData.text || "").slice(0, 50)
    );
  });

  /* -------- EDIT MESSAGE ------- 2.8 features --- */

  // Client emits: { roomId, messageId, newText, editorId }
  // USer wnat ot EDit it
  socket.on("edit_message", ({ roomId, messageId, newText, editorId }) => {
    const room = chatRooms.get(roomId);
    // chekc if Room exists
    if (!room) return;

    // chekc if Messga exists
    const idx = room.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) return;

    const msg = room.messages[idx];

    // Guard: author-only edit ----- ONLY OG user can EDIT
    if (msg.userId !== editorId) return;
    // ceck for ID mathc for EDIT Auth

    msg.text = newText;
    msg.edited = true;
    msg.editedAt = new Date().toISOString();

    //UPDATE edit so all USERS +  update UI
    io.to(roomId).emit("message_edited", {
      roomId,
      messageId,
      newText,
      editedAt: msg.editedAt, //timspt
      editedBy: editorId, //who
    });
  });

  /**
   * Typing indicators
   * trcak user typing
   * notify othesr in Room -> if user is trypung
   *  */

  // Wehn typing stert - TRACK
  socket.on("typing_start", ({ roomId, userId, userName }) => {
    // chat room / exists/Not
    const room = chatRooms.get(roomId);
    if (!room) return;
    // inside Room -> User ID => is Typing
    room.typingUsers.add(userId);

    // ==> notify all other users
    socket.to(roomId).emit("user_typing", {
      userId,
      userName,
      isTyping: true,
      timestamp: new Date().toISOString(),
    });
  });

  // Typing STOP
  socket.on("typing_stop", ({ roomId, userId, userName }) => {
    // chat room / exists/Not
    const room = chatRooms.get(roomId);
    if (!room) return;
    // remove from Set
    room.typingUsers.delete(userId);
    socket.to(roomId).emit("user_typing", {
      userId,
      userName,
      isTyping: false, // this changes
      timestamp: new Date().toISOString(),
    });
  });

  /**  Read receipts
   * - SErver -> Client
   * - Cleint -> notify server that "MEsage are read by me"
   * - save t Memory => notify others --> 2nd ✓✓
   * ------------------------- */

  socket.on("mark_messages_read", ({ roomId, messageIds, userId }) => {
    // chek cahtRoom ID / Exists
    const room = chatRooms.get(roomId);
    if (!room) return; //quite if no room exuits

    // MessageId -->target messge read

    messageIds.forEach((messageId) => {
      // loop through --> e/a mssg--> mesg[]
      const m = room.messages.find((mm) => mm.id === messageId);
      //IF mssg EXIST && usrID not in readBy ==> then add their userID to Messge readyu List
      if (m && !m.readBy.includes(userId)) m.readBy.push(userId); //who reead it" List
    });

    // I'm stillla little confused about thsi...... ??
    // Upadte all in /chatRoom and who read it--
    socket.to(roomId).emit("messages_read", {
      messageIds,
      userId,
      timestamp: new Date().toISOString(),
    });
  });

  // =======================================================
  // Collaborative State
  //  -- 2.3 presence editor code
  // how uesrs will interact b/w e/a other/ be able to See/Edit =======================================================

  /**
   * defien and Keep all the Shared collab Rooms
   * Saved to ==> one Gloabl MAp()
   * key = roomID
   * Value = a CollaborativeRoom isntance
   *
   * */

  const collaborativeRooms = global.__collabRooms || new Map();
  global.__collabRooms = collaborativeRooms;

  class CollaborativeRoom {
    constructor(roomId) {
      this.roomId = roomId;
      // the OG Doc --> shared Data Model
      this.sharedState = {};

      // userID -> {name,socketId, presence}
      this.participants = new Map();

      //fieldNAme -> userID ==> this will be the Lock**
      this.activeEditors = new Map();
      // last N operations for replay/sync
      this.operationHistory = [];
      // incrementing id for Operation----
      this.lastOperationId = 0;
    }

    // when user joints --> store who they are and PResence selsector----
    addParticipant(userId, userName, socketId) {
      this.participants.set(userId, {
        userId,
        userName,
        socketId, //how to reach them w/ thier ID
        cursor: null, //pressence info
        selection: null, //pressence info
        lastActivity: new Date().toISOString(),
        isActive: true,
      });
    }

    removeParticipant(userId) {
      this.participants.delete(userId);
      // Free any edit locks held by this user
      for (const [field, editorId] of this.activeEditors.entries()) {
        if (editorId === userId) this.activeEditors.delete(field);
      }
    }

    // CAHNGE to Shared STATE ----
    // Operation ==> any small chaneg like
    // - set value / update task
    applyOperation(operation) {
      // assign/ give operation ID
      const opId = ++this.lastOperationId;
      const timestampedOp = {
        ...operation,
        id: opId,
        timestamp: new Date().toISOString(),
      };

      // Apply OpID ^^^
      this.updateSharedState(timestampedOp);
      // stoe for later sync
      this.operationHistory.push(timestampedOp);

      // Store cahnegs -> inot a histyr log
      if (this.operationHistory.length > 100) {
        this.operationHistory = this.operationHistory.slice(-100);
      }
      return timestampedOp;
    }
    //Store Operations cahnesg / udpates to a "History Log" so New users who join can cathc Up
    updateSharedState(operation) {
      // values =chnages
      const { type, path, value, userId } = operation;
      // function decides --> basedon type of OP.
      switch (type) {
        // what type of udpate - Set_VAlUE/UPDATE_TASK_ADD_TASK_DELETE_TASK

        case "SET_VALUE":
          // updates specific fild in SharedState---
          this.setNestedValue(this.sharedState, path, value);
          break;

        case "UPDATE_TASK": //"live EDit"w/history"
          // Makes sure TASKS EXIST isnde SharedState
          if (!this.sharedState.tasks) this.sharedState.tasks = {}; //if NOT exist -> create {}
          this.sharedState.tasks[operation.taskId] = {
            // find task by id
            ...this.sharedState.tasks[operation.taskId],
            ...operation.updates, //update w/ new data--
            lastModifiedBy: userId, // WHO changed Last
            lastModifiedAt: operation.timestamp, // WHEN/ timstamps
          };
          break;
        // Add brand new Tas to sharedSTate
        case "ADD_TASK":
          // Makes sure Task EXISTS
          if (!this.sharedState.tasks) this.sharedState.tasks = {};
          this.sharedState.tasks[operation.taskId] = operation.task;
          break;
        //Deldete task by ID
        case "DELETE_TASK":
          // check if TASK exists
          if (this.sharedState.tasks) {
            delete this.sharedState.tasks[operation.taskId];
          }
          break;
      }
    }
    /** HELPERS ---> help pass/acess values
     * -------------------------------*/
    // helsp acces deep nested values
    setNestedValue(obj, path, value) {
      //  sets a value deep inside an object using a dot path like "profile.name".
      const keys = path.split(".");
      const lastKey = keys.pop();
      const target = keys.reduce((current, key) => {
        if (!current[key]) current[key] = {};
        return current[key];
      }, obj);
      target[lastKey] = value;
    }
    // Provides the user EDIT LOCK -----
    startEditing(userId, field) {
      // edit lock for a filed -- so No 2 USers edit same thing @ once
      const currentEditor = this.activeEditors.get(field);
      if (currentEditor && currentEditor !== userId) {
        return { success: false, currentEditor };
      }
      this.activeEditors.set(field, userId);
      return { success: true };
    }
    //TAKES of EDIT LOCK
    stopEditing(userId, field) {
      // release lock IF --> user =same who holds lock
      if (this.activeEditors.get(field) === userId) {
        // chekcs user = mathch
        this.activeEditors.delete(field);
      }
    }
    // UPDATES live PResences
    // - ursoer/position/selection/active...
    updatePresence(userId, presenceData) {
      const participant = this.participants.get(userId);
      if (participant) {
        Object.assign(participant, presenceData, {
          lastActivity: new Date().toISOString(), //update lastActivity
          isActive: true,
        });
      }
    }

    // REurns who is EDITING & WAHT fie;d currenlty***
    getActiveEditors() {
      const activeEdits = {};
      // lopp through MAp(useID's)
      for (const [field, uid] of this.activeEditors.entries()) {
        // look up USer
        const user = this.participants.get(uid);
        if (user) {
          // Retrn -> obectk / data/info
          activeEdits[field] = {
            userId: uid,
            userName: user.userName,
            startedAt: user.lastActivity,
          };
        }
      }
      return activeEdits;
    }

    // LOOPS through ALL curentl USE's in ChatROom _ thier PResence
    getParticipantsList() {
      return Array.from(this.participants.values()).map((p) => ({
        userId: p.userId,
        userName: p.userName,
        isActive: p.isActive, //presence
        cursor: p.cursor, // presnce
        selection: p.selection, //prence
        lastActivity: p.lastActivity,
      }));
    }
  }
  // JOINT CHT ROOM ------------------------------
  socket.on("join_collaborative_room", ({ roomId, userId, userName }) => {
    socket.join(roomId);
    if (!collaborativeRooms.has(roomId)) {
      //create the RoomModel
      collaborativeRooms.set(roomId, new CollaborativeRoom(roomId));
    }

    const room = collaborativeRooms.get(roomId);
    room.addParticipant(userId, userName, socket.id); //trck use in Room mode

    // send all data/info to REnder @ load/
    socket.emit("collaborative_state_sync", {
      roomId,
      sharedState: room.sharedState, //curent doc/board state
      // operationHistory: room.operationHistory.slice(-20),// last 20 Operations
      participants: room.getParticipantsList(), //Curerent Users
      activeEditors: room.getActiveEditors(), //fileds that are LOCKED -----
    });

    // Update USERS / otehrs somone joinec! :) yaa!
    socket.to(roomId).emit("participant_joined", {
      userId,
      userName,
      timestamp: new Date().toISOString(),
    });
    // update all w/ new user List
    io.to(roomId).emit("participants_updated", {
      participants: room.getParticipantsList(),
    });
  });
  // update serverv and add to hstory---
  socket.on("collaborative_operation", ({ roomId, operation }) => {
    const room = collaborativeRooms.get(roomId);
    if (!room) {
      socket.emit("operation_error", { error: "Room not found" });
      return;
    }

    //update w/ processed Operatin o---> and UPdate shared STate to all user in ChatRoom**
    const processed = room.applyOperation(operation);
    io.to(roomId).emit("operation_applied", {
      operation: processed,
      sharedState: room.sharedState,
    });
  });

  // Locsk certani fields ----s
  socket.on("request_edit_lock", ({ roomId, field, userId }) => {
    // defien sheich room to lock/fileds for ----
    const room = collaborativeRooms.get(roomId);
    if (!room) {
      // respond to requester only----
      socket.emit("edit_lock_response", {
        success: false,
        error: "Room not found",
      });
      return;
    }
    // Gives LOSCKS if avail.
    const result = room.startEditing(userId, field);
    socket.emit("edit_lock_response", {
      success: result.success,
      field,
      currentEditor: result.currentEditor, //WHO holds - IF DENIED!
    });
    //filed lock res/
    if (result.success) {
      socket.to(roomId).emit("field_locked", {
        // update other sure field is lock ------
        field,
        userId,
        userName: room.participants.get(userId)?.userName,
      });
    }
  });
  // emot when doen - update
  socket.on("release_edit_lock", ({ roomId, field, userId }) => {
    const room = collaborativeRooms.get(roomId);
    if (!room) return;
    room.stopEditing(userId, field); // relese the LCOK if ownde---
    socket.to(roomId).emit("field_unlocked", { field, userId }); //update otehr users**
  });

  // update Presernces on screns (curso, slections )
  socket.on("update_presence", ({ roomId, userId, presenceData }) => {
    const room = collaborativeRooms.get(roomId);
    if (!room) return;

    room.updatePresence(userId, presenceData); //merge curosre/selction presence
    socket.to(roomId).emit("presence_updated", {
      // update to otehr users
      userId,
      presenceData,
      timestamp: new Date().toISOString(),
    });
  });

  // meot/update if idle/active tronsitioni s
  socket.on("user_activity_change", ({ roomId, userId, isActive }) => {
    const room = collaborativeRooms.get(roomId);
    if (!room) return;
    const p = room.participants.get(userId);
    if (p) {
      p.isActive = isActive;
      p.lastActivity = new Date().toISOString();
      socket.to(roomId).emit("user_activity_updated", {
        userId,
        isActive,
        timestamp: p.lastActivity,
      });
    }
  });

  // -------------------------
  // Disconnect cleanup
  // -------------------------
  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    // Leave chat room properly
    leaveCurrentRoom(socket);
    userSessions.delete(socket.id); //clrea identy record

    // Remove from any collaborative rooms
    (global.__collabRooms || new Map()).forEach((room, roomId) => {
      const userToRemove = Array.from(room.participants.values()).find(
        (p) => p.socketId === socket.id
      );
      if (userToRemove) {
        // drop presencesc and Lock edis----
        room.removeParticipant(userToRemove.userId);
        socket.to(roomId).emit("participant_left", {
          // update other Users===========
          userId: userToRemove.userId,
          userName: userToRemove.userName,
          timestamp: new Date().toISOString(),
        });
        socket.to(roomId).emit("participants_updated", {
          participants: room.getParticipantsList(),
        });
        socket.to(roomId).emit("user_fields_unlocked", {
          userId: userToRemove.userId,
        });
      }
    });
  });
});

// ---- Start server ----
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io ready for chat connections`);
  console.log("Allowed origins:", ALLOWED_ORIGINS);
});
