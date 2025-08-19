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

/**Gloabl USER MAP -- store user lie/left status ------------
 * when user is online
 * store/track last seen
 * find user / filter by @mention"
 *  */

/** Store userID
 * APrams: Ref
 *  uName, sokcets
 * last seen: num
 * rooms: set<str>
 */
const users = new Map();
// Romm IS -> set<userId>
const roomMembers = new Map();
// MAP to indexUsernames
const usernameIndex = new Map();

function updateRoomPresence(roomId) {
  // fetch userId's from rM line in Room => to get roomId else=> empty[]
  const memberIDs = Array.from(roomMembers.get(roomId) ?? []);

  const status = memberIDs.map((userId) => {
    const u = users.get(userId);
    return {
      userId,
      userName: u?.userName ?? "Unknown... THE GHOST",
      isOnline: (u.sockets.size ?? 0) > 0,
      lastSeen: u?.lastSeen ?? Date.now(),
    };
  });
  io.to(roomId).emit("room_presences", { roomId, members: status });
}
function updateRoomCount() {
  // jsut updatses the # of users in a given RoomChannel
  const counts = {};
  for (const [roomId, set] of roomMembers) counts[roomId] = set.size;
  io.emit("room_counts", counts);
}
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
  let currentUserId = null; //trasck e/a socket cnntion

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
    // fro when user regsiters
    currentUserId = userId;

    // track global user record (multi-socket)
    const u = users.get(userId) ?? {
      userId,
      userName,
      sockets: new Set(),
      lastSeen: Date.now(),
      rooms: new Set(),
    };
    u.userName = userName;
    u.sockets.add(socket.id);
    // index update ---
    users.set(userId, u);
    usernameIndex.set(userName, u);

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

    //  UPDATE SEssoin REcord SAVE ==> Track what room user is in
    const sess = userSessions.get(socket.id) || { userId, userName };
    userSessions.set(socket.id, { ...sess, currentRoomId: roomId });

    // 2.8: global membership sets ---------
    const u = users.get(userId) ?? {
      userId,
      userName,
      sockets: new Set(),
      lastSeen: Date.now(),
      rooms: new Set(),
    };
    // updated new values
    u.userName = userName;
    u.rooms.add(roomId);
    users.set(userId, u);
    //if they renamed earlier, this keeps current name
    usernameIndex.set(userName, u);
    // updates room status set----
    const set = roomMembers.get(roomId) ?? new Set();
    set.add(userId);
    roomMembers.set(roomId, set);

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
    // 2.8 ---- Dynamics broadcast/Status presence + counts Udpates
    updateRoomPresence(roomId);
    updateRoomCount();
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
    //@mention----ensurs metions user, status and mesg
    if (message.mentions?.length) {
      const payload = {
        roomId,
        messageId: messageData.id,
        from: messageData.userName,
        text: messageData.text,
        timestamp: messageData.timestamp,
      };

      for (const name of message.mentions) {
        const u = usernameIndex.get(name);
        if (!u || u.sockets.size === 0) continue;
        for (const sid of u.sockets) io.to(sid).emit("mention", payload);
      }
    }
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

    // figure out the userId for this socket
    const sess = userSessions.get(socket.id);
    const userId = sess?.userId ?? currentUserId;
    if (!userId) {
      // still clear session & collab state
      leaveCurrentRoom(socket);
      userSessions.delete(socket.id);
      (global.__collabRooms || new Map()).forEach((room, roomId) => {
        const p = Array.from(room.participants.values()).find(
          (x) => x.socketId === socket.id
        );
        if (p) {
          // remove user form given chatRoomId
          room.removeParticipant(p.userId);
          socket.to(roomId).emit("participant_left", {
            userId: p.userId,
            userName: p.userName,
            timestamp: new Date().toISOString(),
          });
          // sedn to socekt
          socket.to(roomId).emit("participants_updated", {
            participants: room.getParticipantsList(),
          });
          socket.to(roomId).emit("user_fields_unlocked", { userId: p.userId });
        }
      });
      return;
    }

    const u = users.get(userId);
    if (u) {
      // remove this socket from ==> user’s active sockets
      u.sockets.delete(socket.id);

      // if no active sockets remain==> mark OFFLINE
      if (u.sockets.size === 0) {
        u.lastSeen = Date.now();

        for (const rid of u.rooms) {
          // Get rid of roomMem
          const set = roomMembers.get(rid);
          if (set) {
            set.delete(userId);
            if (set.size === 0) roomMembers.delete(rid);
          }
          // update presence & counts per room
          updateRoomPresence(rid);
          updateRoomCount();

          // update w/  "left" message
          io.to(rid).emit("new_message", {
            id: `sys_${Date.now()}`,
            roomId: rid,
            userId: "system",
            userName: "System",
            text: `${u.userName} left..till we meet again...`,
            timestamp: new Date().toISOString(),
            delivered: true,
            read: false,
            type: "system",
          });
        }
      }
    }

    // clean Users & rset for new Room
    leaveCurrentRoom(socket);

    // drop session record
    userSessions.delete(socket.id);

    // collaborative rooms cleanup
    (global.__collabRooms || new Map()).forEach((room, roomId) => {
      const userToRemove = Array.from(room.participants.values()).find(
        (p) => p.socketId === socket.id
      );
      if (userToRemove) {
        // remove USer who left from list
        room.removeParticipant(userToRemove.userId);
        socket.to(roomId).emit("participant_left", {
          userId: userToRemove.userId,
          userName: userToRemove.userName,
          timestamp: new Date().toISOString(),
        });
        socket.to(roomId).emit("participants_updated", {
          participants: room.getParticipantsList(),
        });
        socket
          .to(roomId)
          .emit("user_fields_unlocked", { userId: userToRemove.userId });
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
