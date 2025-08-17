// // // 2.3 colla/service

// // import { socketService } from "../socketService";
// // // import { socketService } from "./socketService";

// // // import Conncetion maanebagerr from coenntionManagerr
// // import { connectionManager, ConnectionState } from "../connectionManager";

// // export interface CollaborativeOperation {
// //   type: "SET_VALUE" | "UPDATE_TASK" | "ADD_TASK" | "DELETE_TASK";
// //   path?: string;
// //   value?: any;
// //   taskId?: string;
// //   task?: any;
// //   updates?: any;
// //   userId: string;
// //   clientId?: string;
// // }
// // export interface Participant {
// //   userId: string;
// //   userName: string;
// //   isActive: boolean;
// //   cursor?: { x: number; y: number };
// //   selection?: { start: number; end: number };
// //   lastActivity: string;
// // }
// // export interface EditLock {
// //   field: string;
// //   userId: string;
// //   userName: string;
// // }
// // export interface CollaborativeState {
// //   tasks: { [taskId: string]: any };
// //   [key: string]: any;
// // }
// // class CollaborativeService {
// //   private currentUserId: string | null = null;
// //   private currentRoomId: string | null = null;
// //   private localState: CollaborativeState = { tasks: {} };
// //   private pendingOperations: CollaborativeOperation[] = [];
// //   private isConnected: boolean = false;
// //   // Event listeners
// //   private stateListeners: ((state: CollaborativeState) => void)[] = [];
// //   private participantListeners: ((participants: Participant[]) => void)[] = [];
// //   private lockListeners: ((locks: EditLock[]) => void)[] = [];
// //   private presenceListeners: ((userId: string, presence: any) => void)[] = [];
// //   async initialize(userId: string, roomId: string): Promise<void> {
// //     this.currentUserId = userId;
// //     this.currentRoomId = roomId;

// //     this.setupSocketListeners();

// //     // Join collaborative room
// //     socketService.emit("join_collaborative_room", {
// //       roomId,
// //       userId,
// //       userName: "User " + userId, // You'd get this from user profile
// //     });
// //   }
// //   private setupSocketListeners(): void {
// //     // Handle initial state sync
// //     socketService.on(
// //       "collaborative_state_sync",
// //       (data: {
// //         roomId: string;
// //         sharedState: CollaborativeState;
// //         operationHistory: CollaborativeOperation[];
// //         participants: Participant[];
// //         activeEditors: { [field: string]: EditLock };
// //       }) => {
// //         this.localState = { ...data.sharedState };
// //         this.isConnected = true;

// //         // Apply any pending operations
// //         this.flushPendingOperations();

// //         // Notify listeners
// //         this.notifyStateListeners();
// //         this.notifyParticipantListeners(data.participants);
// //         this.notifyLockListeners(Object.values(data.activeEditors));
// //       }
// //     );
// //     // Handle operations from other users
// //     socketService.on(
// //       "operation_applied",
// //       (data: {
// //         operation: CollaborativeOperation;
// //         sharedState: CollaborativeState;
// //       }) => {
// //         // Don't apply operations from ourselves
// //         if (data.operation.userId !== this.currentUserId) {
// //           this.localState = { ...data.sharedState };
// //           this.notifyStateListeners();
// //         }
// //       }
// //     );
// //     // Handle participant updates
// //     socketService.on(
// //       "participants_updated",
// //       (data: { participants: Participant[] }) => {
// //         this.notifyParticipantListeners(data.participants);
// //       }
// //     );
// //     // Handle field locking
// //     socketService.on("field_locked", (data: EditLock) => {
// //       // Update UI to show field is being edited
// //       this.notifyLockListeners([data]);
// //     });
// //     socketService.on(
// //       "field_unlocked",
// //       (data: { field: string; userId: string }) => {
// //         // Update UI to show field is available
// //         this.notifyLockListeners([]);
// //       }
// //     );
// //     // Handle presence updates
// //     socketService.on(
// //       "presence_updated",
// //       (data: { userId: string; presenceData: any; timestamp: string }) => {
// //         this.notifyPresenceListeners(data.userId, data.presenceData);
// //       }
// //     );
// //     // Handle connection state
// //     socketService.on("connect", () => {
// //       this.isConnected = true;
// //       this.flushPendingOperations();
// //     });
// //     socketService.on("disconnect", () => {
// //       this.isConnected = false;
// //     });
// //   }
// //   // Public API for making collaborative changes
// //   async updateTask(taskId: string, updates: any): Promise<void> {
// //     const operation: CollaborativeOperation = {
// //       type: "UPDATE_TASK",
// //       taskId,
// //       updates,
// //       userId: this.currentUserId!,
// //       clientId: this.generateClientId(),
// //     };
// //     // Apply optimistically to local state
// //     this.applyOperationLocally(operation);

// //     // Send to server or queue if offline
// //     if (this.isConnected) {
// //       socketService.emit("collaborative_operation", {
// //         roomId: this.currentRoomId,
// //         operation,
// //       });
// //     } else {
// //       this.pendingOperations.push(operation);
// //     }
// //   }
// //   async addTask(taskId: string, task: any): Promise<void> {
// //     const operation: CollaborativeOperation = {
// //       type: "ADD_TASK",
// //       taskId,
// //       task: {
// //         ...task,
// //         createdBy: this.currentUserId,
// //         createdAt: new Date().toISOString(),
// //       },
// //       userId: this.currentUserId!,
// //       clientId: this.generateClientId(),
// //     };
// //     this.applyOperationLocally(operation);

// //     if (this.isConnected) {
// //       socketService.emit("collaborative_operation", {
// //         roomId: this.currentRoomId,
// //         operation,
// //       });
// //     } else {
// //       this.pendingOperations.push(operation);
// //     }
// //   }
// //   async deleteTask(taskId: string): Promise<void> {
// //     const operation: CollaborativeOperation = {
// //       type: "DELETE_TASK",
// //       taskId,
// //       userId: this.currentUserId!,
// //       clientId: this.generateClientId(),
// //     };
// //     this.applyOperationLocally(operation);

// //     if (this.isConnected) {
// //       socketService.emit("collaborative_operation", {
// //         roomId: this.currentRoomId,
// //         operation,
// //       });
// //     } else {
// //       this.pendingOperations.push(operation);
// //     }
// //   }
// //   // Edit locking for preventing conflicts
// //   async requestEditLock(field: string): Promise<boolean> {
// //     return new Promise((resolve) => {
// //       socketService.emit("request_edit_lock", {
// //         roomId: this.currentRoomId,
// //         field,
// //         userId: this.currentUserId,
// //       });
// //       // Listen for response
// //       const handleResponse = (data: {
// //         success: boolean;
// //         field: string;
// //         currentEditor?: string;
// //       }) => {
// //         if (data.field === field) {
// //           socketService.off("edit_lock_response", handleResponse);
// //           resolve(data.success);
// //         }
// //       };
// //       socketService.on("edit_lock_response", handleResponse);
// //     });
// //   }
// //   async releaseEditLock(field: string): Promise<void> {
// //     socketService.emit("release_edit_lock", {
// //       roomId: this.currentRoomId,
// //       field,
// //       userId: this.currentUserId,
// //     });
// //   }
// //   // Presence management
// //   updatePresence(presenceData: {
// //     cursor?: { x: number; y: number };
// //     selection?: any;
// //   }): void {
// //     socketService.emit("update_presence", {
// //       roomId: this.currentRoomId,
// //       userId: this.currentUserId,
// //       presenceData,
// //     });
// //   }
// //   setUserActivity(isActive: boolean): void {
// //     socketService.emit("user_activity_change", {
// //       roomId: this.currentRoomId,
// //       userId: this.currentUserId,
// //       isActive,
// //     });
// //   }
// //   // State management
// //   getState(): CollaborativeState {
// //     return this.localState;
// //   }
// //   private applyOperationLocally(operation: CollaborativeOperation): void {
// //     switch (operation.type) {
// //       case "UPDATE_TASK":
// //         if (!this.localState.tasks) this.localState.tasks = {};
// //         this.localState.tasks[operation.taskId!] = {
// //           ...this.localState.tasks[operation.taskId!],
// //           ...operation.updates,
// //           lastModifiedBy: operation.userId,
// //           lastModifiedAt: new Date().toISOString(),
// //         };
// //         break;
// //       case "ADD_TASK":
// //         if (!this.localState.tasks) this.localState.tasks = {};
// //         this.localState.tasks[operation.taskId!] = operation.task;
// //         break;
// //       case "DELETE_TASK":
// //         if (this.localState.tasks) {
// //           delete this.localState.tasks[operation.taskId!];
// //         }
// //         break;
// //     }

// //     this.notifyStateListeners();
// //   }
// //   private flushPendingOperations(): void {
// //     const operations = [...this.pendingOperations];
// //     this.pendingOperations = [];

// //     operations.forEach((operation) => {
// //       socketService.emit("collaborative_operation", {
// //         roomId: this.currentRoomId,
// //         operation,
// //       });
// //     });
// //   }
// //   private generateClientId(): string {
// //     return `${this.currentUserId}_${Date.now()}_${Math.random()
// //       .toString(36)
// //       .substr(2, 9)}`;
// //   }
// //   // Event listener management
// //   onStateChange(callback: (state: CollaborativeState) => void): () => void {
// //     this.stateListeners.push(callback);
// //     return () => {
// //       this.stateListeners = this.stateListeners.filter((cb) => cb !== callback);
// //     };
// //   }
// //   onParticipantsChange(
// //     callback: (participants: Participant[]) => void
// //   ): () => void {
// //     this.participantListeners.push(callback);
// //     return () => {
// //       this.participantListeners = this.participantListeners.filter(
// //         (cb) => cb !== callback
// //       );
// //     };
// //   }
// //   onLocksChange(callback: (locks: EditLock[]) => void): () => void {
// //     this.lockListeners.push(callback);
// //     return () => {
// //       this.lockListeners = this.lockListeners.filter((cb) => cb !== callback);
// //     };
// //   }
// //   onPresenceChange(
// //     callback: (userId: string, presence: any) => void
// //   ): () => void {
// //     this.presenceListeners.push(callback);
// //     return () => {
// //       this.presenceListeners = this.presenceListeners.filter(
// //         (cb) => cb !== callback
// //       );
// //     };
// //   }
// //   private notifyStateListeners(): void {
// //     this.stateListeners.forEach((callback) => callback(this.localState));
// //   }
// //   private notifyParticipantListeners(participants: Participant[]): void {
// //     this.participantListeners.forEach((callback) => callback(participants));
// //   }
// //   private notifyLockListeners(locks: EditLock[]): void {
// //     this.lockListeners.forEach((callback) => callback(locks));
// //   }
// //   private notifyPresenceListeners(userId: string, presence: any): void {
// //     this.presenceListeners.forEach((callback) => callback(userId, presence));
// //   }
// // }
// // export const collaborativeService = new CollaborativeService();

// // updated with the off;ien Supporrt ==> colllaborrative feature
// // 2.3 collab/service (enhanced with connection manager + local DB stubs)

// import { socketService } from "../socketService";
// import { connectionManager, ConnectionState } from "../connectionManager";
// import { chatDatabaseService } from "../chatDatabase"; // initialize DB before use

// // ---- Types (unchanged) ------------------------------------------------------
// export interface CollaborativeOperation {
//   type: "SET_VALUE" | "UPDATE_TASK" | "ADD_TASK" | "DELETE_TASK";
//   path?: string;
//   value?: any;
//   taskId?: string;
//   task?: any;
//   updates?: any;
//   userId: string;
//   clientId?: string; // local id to track confirmations/retries
// }

// export interface Participant {
//   userId: string;
//   userName: string;
//   isActive: boolean;
//   cursor?: { x: number; y: number };
//   selection?: { start: number; end: number };
//   lastActivity: string;
// }

// export interface EditLock {
//   field: string;
//   userId: string;
//   userName: string;
// }

// export interface CollaborativeState {
//   tasks: { [taskId: string]: any };
//   [key: string]: any;
// }

// // ---- Service ----------------------------------------------------------------
// class CollaborativeService {
//   private currentUserId: string | null = null;
//   private currentRoomId: string | null = null;

//   // local working copy of shared state for instant UI
//   private localState: CollaborativeState = { tasks: {} };

//   // queue for “fire later” when offline (legacy)
//   private pendingOperations: CollaborativeOperation[] = [];

//   // map of ops we’ve sent but not yet confirmed by server
//   private pendingOpMap: Map<string, CollaborativeOperation> = new Map();

//   private isConnected = false;

//   // Event listeners
//   private stateListeners: ((state: CollaborativeState) => void)[] = [];
//   private participantListeners: ((participants: Participant[]) => void)[] = [];
//   private lockListeners: ((locks: EditLock[]) => void)[] = [];
//   private presenceListeners: ((userId: string, presence: any) => void)[] = [];

//   // --- Bootstrapping ---------------------------------------------------------
//   async initialize(userId: string, roomId: string): Promise<void> {
//     this.currentUserId = userId;
//     this.currentRoomId = roomId;

//     // Ensure SQLite is ready (rooms/messages etc.)
//     await chatDatabaseService.initializeDatabase();

//     // Socket + connection lifecycle listeners
//     this.setupSocketListeners();
//     this.setupConnectionListeners();

//     // Establish transport via connection manager (handles retries/backoff)
//     await connectionManager.connect();

//     // If connected right away, join room now
//     if (connectionManager.isConnected()) {
//       this.joinRoom();
//     }
//   }

//   // Subscribe to connection state changes so we can re-join after drops
//   private setupConnectionListeners(): void {
//     connectionManager.onConnectionChange((info) => {
//       this.isConnected = info.state === ConnectionState.CONNECTED;

//       if (info.state === ConnectionState.CONNECTED && this.currentRoomId) {
//         // Rejoin the collaborative room after reconnection
//         this.joinRoom();

//         // Flush any locally queued operations
//         this.flushPendingOperations();
//       }
//     });
//   }

//   // Tell server we want into this room
//   private joinRoom(): void {
//     if (!this.currentRoomId || !this.currentUserId) return;

//     socketService.emit("join_collaborative_room", {
//       roomId: this.currentRoomId,
//       userId: this.currentUserId,
//       userName: "User " + this.currentUserId, // TODO: pull from profile
//     });
//   }

//   // --- Socket listeners ------------------------------------------------------
//   private setupSocketListeners(): void {
//     // Initial state sync when we (re)join
//     socketService.on(
//       "collaborative_state_sync",
//       (data: {
//         roomId: string;
//         sharedState: CollaborativeState;
//         operationHistory: CollaborativeOperation[];
//         participants: Participant[];
//         activeEditors: { [field: string]: EditLock };
//       }) => {
//         this.localState = { ...data.sharedState };
//         this.isConnected = true;

//         // Apply any ops we created while offline
//         this.flushPendingOperations();

//         // Notify UI
//         this.notifyStateListeners();
//         this.notifyParticipantListeners(data.participants);
//         this.notifyLockListeners(Object.values(data.activeEditors));
//       }
//     );

//     // When another client (or us, echoed) applies an op and server returns new state
//     socketService.on(
//       "operation_applied",
//       (data: {
//         operation: CollaborativeOperation;
//         sharedState: CollaborativeState;
//       }) => {
//         // If it was our operation, we still want to update to server’s canonical state,
//         // but confirmation handling happens via 'operation_confirmed' below.
//         this.localState = { ...data.sharedState };
//         this.notifyStateListeners();
//       }
//     );

//     // Presence/participants
//     socketService.on(
//       "participants_updated",
//       (data: { participants: Participant[] }) => {
//         this.notifyParticipantListeners(data.participants);
//       }
//     );
//     socketService.on("field_locked", (data: EditLock) => {
//       this.notifyLockListeners([data]);
//     });
//     socketService.on(
//       "field_unlocked",
//       (_data: { field: string; userId: string }) => {
//         this.notifyLockListeners([]);
//       }
//     );
//     socketService.on(
//       "presence_updated",
//       (data: { userId: string; presenceData: any; timestamp: string }) => {
//         this.notifyPresenceListeners(data.userId, data.presenceData);
//       }
//     );

//     // Basic connect/disconnect for safety (connectionManager is primary source)
//     socketService.on("connect", () => {
//       this.isConnected = true;
//     });
//     socketService.on("disconnect", () => {
//       this.isConnected = false;
//     });

//     // ✅ New: server confirms operations we sent (success/failure)
//     socketService.on(
//       "operation_confirmed",
//       (data: { clientId: string; success: boolean }) => {
//         const op = this.pendingOpMap.get(data.clientId);
//         if (!op) return;

//         this.pendingOpMap.delete(data.clientId);

//         if (data.success) {
//           // Mark synced in local cache & DB
//           this.markOperationSynced(op).catch((e) =>
//             console.warn("markOperationSynced error:", e)
//           );
//         } else {
//           // Optional: retry/backoff/rollback UX
//           this.handleOperationFailure(op);
//         }
//       }
//     );

//     // ✅ New: explicit conflict notification from server
//     socketService.on(
//       "sync_conflict",
//       (data: {
//         operation: CollaborativeOperation;
//         serverState: CollaborativeState;
//       }) => {
//         this.handleSyncConflict(data.operation, data.serverState);
//       }
//     );
//   }

//   // --- Public API: operations ------------------------------------------------
//   async updateTask(taskId: string, updates: any): Promise<void> {
//     const operation: CollaborativeOperation = {
//       type: "UPDATE_TASK",
//       taskId,
//       updates,
//       userId: this.currentUserId!,
//       clientId: this.generateClientId(),
//     };

//     // 1) Optimistic update for snappy UI
//     this.applyOperationLocally(operation);

//     // 2) Persist op locally so it survives app restarts while offline
//     await this.saveOperationLocally(operation);

//     // 3) Try to deliver now, else queue via connectionManager
//     if (connectionManager.isConnected()) {
//       this.sendOperation(operation);
//     } else {
//       this.queueOperation(operation);
//     }
//   }

//   async addTask(taskId: string, task: any): Promise<void> {
//     const operation: CollaborativeOperation = {
//       type: "ADD_TASK",
//       taskId,
//       task: {
//         ...task,
//         createdBy: this.currentUserId,
//         createdAt: new Date().toISOString(),
//         syncStatus: "pending", // flag for UI (e.g., clock/badge)
//       },
//       userId: this.currentUserId!,
//       clientId: this.generateClientId(),
//     };

//     this.applyOperationLocally(operation);
//     await this.saveOperationLocally(operation);

//     if (connectionManager.isConnected()) {
//       this.sendOperation(operation);
//     } else {
//       this.queueOperation(operation);
//     }
//   }

//   async deleteTask(taskId: string): Promise<void> {
//     const operation: CollaborativeOperation = {
//       type: "DELETE_TASK",
//       taskId,
//       userId: this.currentUserId!,
//       clientId: this.generateClientId(),
//     };

//     // “Soft delete” locally so we can sync later if offline
//     if (this.localState.tasks[taskId]) {
//       this.localState.tasks[taskId].deleted = true;
//       this.localState.tasks[taskId].syncStatus = "pending";
//     }
//     this.notifyStateListeners();

//     await this.saveOperationLocally(operation);

//     if (connectionManager.isConnected()) {
//       this.sendOperation(operation);
//     } else {
//       this.queueOperation(operation);
//     }
//   }

//   // --- Delivery helpers ------------------------------------------------------
//   private sendOperation(operation: CollaborativeOperation): void {
//     socketService.emit("collaborative_operation", {
//       roomId: this.currentRoomId,
//       operation,
//     });
//     // Track it so we can clear when server confirms
//     if (operation.clientId)
//       this.pendingOpMap.set(operation.clientId, operation);
//   }

//   private queueOperation(operation: CollaborativeOperation): void {
//     // Let the connection manager persist/flush later (you can implement storage there)
//     connectionManager.queueOperation({
//       type: "collaborative_operation",
//       data: { roomId: this.currentRoomId, operation },
//     });

//     // Keep legacy in-memory queue too (flushed on state sync)
//     this.pendingOperations.push(operation);
//   }

//   // Persist the op locally (so you can replay after app restart)
//   private async saveOperationLocally(
//     operation: CollaborativeOperation
//   ): Promise<void> {
//     try {
//       // TODO: store in a tiny "operations" table or alongside tasks with a queue
//       // await operationDatabase.saveOperation(operation);
//     } catch (error) {
//       console.error("Error saving operation locally:", error);
//     }
//   }

//   // Mark the thing as synced in local cache (and DB if you store a flag)
//   private async markOperationSynced(
//     operation: CollaborativeOperation
//   ): Promise<void> {
//     if (operation.type === "UPDATE_TASK" || operation.type === "ADD_TASK") {
//       const task = this.localState.tasks[operation.taskId!];
//       if (task) {
//         task.syncStatus = "synced";
//         // Optional: persist the synced flag to DB
//         await this.saveOperationLocally(operation);
//       }
//     }
//     this.notifyStateListeners();
//   }

//   private handleOperationFailure(operation: CollaborativeOperation): void {
//     console.error("Operation failed:", operation);
//     if (operation.taskId && this.localState.tasks[operation.taskId]) {
//       this.localState.tasks[operation.taskId].syncStatus = "failed";
//     }
//     this.notifyStateListeners();
//   }

//   private handleSyncConflict(
//     _operation: CollaborativeOperation,
//     serverState: CollaborativeState
//   ): void {
//     // Simple policy: server wins; replace local and notify.
//     // (You can implement field-level merge/OT later.)
//     this.localState = { ...serverState };
//     this.notifyStateListeners();
//   }

//   // --- Local state ops -------------------------------------------------------
//   getState(): CollaborativeState {
//     return this.localState;
//   }

//   private applyOperationLocally(operation: CollaborativeOperation): void {
//     switch (operation.type) {
//       case "UPDATE_TASK": {
//         if (!this.localState.tasks) this.localState.tasks = {};
//         this.localState.tasks[operation.taskId!] = {
//           ...this.localState.tasks[operation.taskId!],
//           ...operation.updates,
//           lastModifiedBy: operation.userId,
//           lastModifiedAt: new Date().toISOString(),
//         };
//         break;
//       }
//       case "ADD_TASK": {
//         if (!this.localState.tasks) this.localState.tasks = {};
//         this.localState.tasks[operation.taskId!] = operation.task;
//         break;
//       }
//       case "DELETE_TASK": {
//         if (this.localState.tasks) {
//           delete this.localState.tasks[operation.taskId!];
//         }
//         break;
//       }
//       case "SET_VALUE": {
//         // optional generic path setter if you use it
//         break;
//       }
//     }
//     this.notifyStateListeners();
//   }

//   // Legacy in-memory flush (still useful right after state_sync)
//   private flushPendingOperations(): void {
//     const ops = [...this.pendingOperations];
//     this.pendingOperations = [];
//     ops.forEach((operation) => this.sendOperation(operation));
//   }

//   private generateClientId(): string {
//     return `${this.currentUserId}_${Date.now()}_${Math.random()
//       .toString(36)
//       .slice(2, 11)}`;
//   }

//   // --- Event listener management --------------------------------------------
//   onStateChange(callback: (state: CollaborativeState) => void): () => void {
//     this.stateListeners.push(callback);
//     return () => {
//       this.stateListeners = this.stateListeners.filter((cb) => cb !== callback);
//     };
//   }

//   onParticipantsChange(
//     callback: (participants: Participant[]) => void
//   ): () => void {
//     this.participantListeners.push(callback);
//     return () => {
//       this.participantListeners = this.participantListeners.filter(
//         (cb) => cb !== callback
//       );
//     };
//   }

//   onLocksChange(callback: (locks: EditLock[]) => void): () => void {
//     this.lockListeners.push(callback);
//     return () => {
//       this.lockListeners = this.lockListeners.filter((cb) => cb !== callback);
//     };
//   }

//   onPresenceChange(
//     callback: (userId: string, presence: any) => void
//   ): () => void {
//     this.presenceListeners.push(callback);
//     return () => {
//       this.presenceListeners = this.presenceListeners.filter(
//         (cb) => cb !== callback
//       );
//     };
//   }

//   private notifyStateListeners(): void {
//     this.stateListeners.forEach((cb) => cb(this.localState));
//   }

//   private notifyParticipantListeners(participants: Participant[]): void {
//     this.participantListeners.forEach((cb) => cb(participants));
//   }

//   private notifyLockListeners(locks: EditLock[]): void {
//     this.lockListeners.forEach((cb) => cb(locks));
//   }

//   private notifyPresenceListeners(userId: string, presence: any): void {
//     this.presenceListeners.forEach((cb) => cb(userId, presence));
//   }
// }

// export const collaborativeService = new CollaborativeService();

// update to fix the ios issue

// updated with the off;ien Supporrt ==> colllaborrative feature
// 2.3 collab/service (enhanced with connection manager + local DB stubs)

import { socketService } from "../socketService";
import { connectionManager, ConnectionState } from "../connectionManager";
import { chatDatabaseService } from "../chatDatabase"; // initialize DB before use

// ---- Types (unchanged) ------------------------------------------------------
export interface CollaborativeOperation {
  type: "SET_VALUE" | "UPDATE_TASK" | "ADD_TASK" | "DELETE_TASK";
  path?: string;
  value?: any;
  taskId?: string;
  task?: any;
  updates?: any;
  userId: string;
  clientId?: string; // local id to track confirmations/retries
}

export interface Participant {
  userId: string;
  userName: string;
  isActive: boolean;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  lastActivity: string;
}

export interface EditLock {
  field: string;
  userId: string;
  userName: string;
}

export interface CollaborativeState {
  tasks: { [taskId: string]: any };
  [key: string]: any;
}

// ---- Service ----------------------------------------------------------------
class CollaborativeService {
  private currentUserId: string | null = null;
  private currentRoomId: string | null = null;

  // local working copy of shared state for instant UI
  private localState: CollaborativeState = { tasks: {} };

  // queue for “fire later” when offline (legacy)
  private pendingOperations: CollaborativeOperation[] = [];

  // map of ops we’ve sent but not yet confirmed by server
  private pendingOpMap: Map<string, CollaborativeOperation> = new Map();

  private isConnected = false;

  // Event listeners
  private stateListeners: ((state: CollaborativeState) => void)[] = [];
  private participantListeners: ((participants: Participant[]) => void)[] = [];
  private lockListeners: ((locks: EditLock[]) => void)[] = [];
  private presenceListeners: ((userId: string, presence: any) => void)[] = [];

  // --- Bootstrapping ---------------------------------------------------------
  async initialize(userId: string, roomId: string): Promise<void> {
    this.currentUserId = userId;
    this.currentRoomId = roomId;

    // Ensure SQLite is ready (rooms/messages etc.)
    await chatDatabaseService.initializeDatabase();

    // Socket + connection lifecycle listeners
    this.setupSocketListeners();
    this.setupConnectionListeners();

    // Establish transport via connection manager (handles retries/backoff)
    await connectionManager.connect();

    // If connected right away, join room now
    if (connectionManager.isConnected()) {
      this.joinRoom();
    }
  }

  // Subscribe to connection state changes so we can re-join after drops
  private setupConnectionListeners(): void {
    connectionManager.onConnectionChange((info) => {
      this.isConnected = info.state === ConnectionState.CONNECTED;

      if (info.state === ConnectionState.CONNECTED && this.currentRoomId) {
        // Rejoin the collaborative room after reconnection
        this.joinRoom();

        // Flush any locally queued operations
        this.flushPendingOperations();
      }
    });
  }

  // Tell server we want into this room
  private joinRoom(): void {
    if (!this.currentRoomId || !this.currentUserId) return;

    socketService.emit("join_collaborative_room", {
      roomId: this.currentRoomId,
      userId: this.currentUserId,
      userName: "User " + this.currentUserId, // TODO: pull from profile
    });
  }

  // --- Socket listeners ------------------------------------------------------
  private setupSocketListeners(): void {
    // Initial state sync when we (re)join
    socketService.on(
      "collaborative_state_sync",
      (data: {
        roomId: string;
        sharedState: CollaborativeState;
        operationHistory: CollaborativeOperation[];
        participants: Participant[];
        activeEditors: { [field: string]: EditLock };
      }) => {
        this.localState = { ...data.sharedState };
        this.isConnected = true;

        // Apply any ops we created while offline
        this.flushPendingOperations();

        // Notify UI
        this.notifyStateListeners();
        this.notifyParticipantListeners(data.participants);
        this.notifyLockListeners(Object.values(data.activeEditors));
      }
    );

    // When another client (or us, echoed) applies an op and server returns new state
    socketService.on(
      "operation_applied",
      (data: {
        operation: CollaborativeOperation;
        sharedState: CollaborativeState;
      }) => {
        // If it was our operation, we still want to update to server’s canonical state,
        // but confirmation handling happens via 'operation_confirmed' below.
        this.localState = { ...data.sharedState };
        this.notifyStateListeners();
      }
    );

    // Presence/participants
    socketService.on(
      "participants_updated",
      (data: { participants: Participant[] }) => {
        this.notifyParticipantListeners(data.participants);
      }
    );
    socketService.on("field_locked", (data: EditLock) => {
      this.notifyLockListeners([data]);
    });
    socketService.on(
      "field_unlocked",
      (_data: { field: string; userId: string }) => {
        this.notifyLockListeners([]);
      }
    );
    socketService.on(
      "presence_updated",
      (data: { userId: string; presenceData: any; timestamp: string }) => {
        this.notifyPresenceListeners(data.userId, data.presenceData);
      }
    );

    // Basic connect/disconnect for safety (connectionManager is primary source)
    socketService.on("connect", () => {
      this.isConnected = true;
    });
    socketService.on("disconnect", () => {
      this.isConnected = false;
    });

    // ✅ New: server confirms operations we sent (success/failure)
    socketService.on(
      "operation_confirmed",
      (data: { clientId: string; success: boolean }) => {
        const op = this.pendingOpMap.get(data.clientId);
        if (!op) return;

        this.pendingOpMap.delete(data.clientId);

        if (data.success) {
          // Mark synced in local cache & DB
          this.markOperationSynced(op).catch((e) =>
            console.warn("markOperationSynced error:", e)
          );
        } else {
          // Optional: retry/backoff/rollback UX
          this.handleOperationFailure(op);
        }
      }
    );

    // ✅ New: explicit conflict notification from server
    socketService.on(
      "sync_conflict",
      (data: {
        operation: CollaborativeOperation;
        serverState: CollaborativeState;
      }) => {
        this.handleSyncConflict(data.operation, data.serverState);
      }
    );
  }

  // --- Public API: operations ------------------------------------------------
  async updateTask(taskId: string, updates: any): Promise<void> {
    const operation: CollaborativeOperation = {
      type: "UPDATE_TASK",
      taskId,
      updates,
      userId: this.currentUserId!,
      clientId: this.generateClientId(),
    };

    // 1) Optimistic update for snappy UI
    this.applyOperationLocally(operation);

    // 2) Persist op locally so it survives app restarts while offline
    await this.saveOperationLocally(operation);

    // 3) Try to deliver now, else queue via connectionManager
    if (connectionManager.isConnected()) {
      this.sendOperation(operation);
    } else {
      this.queueOperation(operation);
    }
  }

  async addTask(taskId: string, task: any): Promise<void> {
    const operation: CollaborativeOperation = {
      type: "ADD_TASK",
      taskId,
      task: {
        ...task,
        createdBy: this.currentUserId,
        createdAt: new Date().toISOString(),
        syncStatus: "pending", // flag for UI (e.g., clock/badge)
      },
      userId: this.currentUserId!,
      clientId: this.generateClientId(),
    };

    this.applyOperationLocally(operation);
    await this.saveOperationLocally(operation);

    if (connectionManager.isConnected()) {
      this.sendOperation(operation);
    } else {
      this.queueOperation(operation);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    const operation: CollaborativeOperation = {
      type: "DELETE_TASK",
      taskId,
      userId: this.currentUserId!,
      clientId: this.generateClientId(),
    };

    // “Soft delete” locally so we can sync later if offline
    if (this.localState.tasks[taskId]) {
      this.localState.tasks[taskId].deleted = true;
      this.localState.tasks[taskId].syncStatus = "pending";
    }
    this.notifyStateListeners();

    await this.saveOperationLocally(operation);

    if (connectionManager.isConnected()) {
      this.sendOperation(operation);
    } else {
      this.queueOperation(operation);
    }
  }

  // --- NEW: Presence management (public API) ---------------------------------
  // These were in your old class; adding them here fixes setUserActivity/updatePresence undefined.
  public updatePresence(presenceData: {
    cursor?: { x: number; y: number };
    selection?: any;
  }): void {
    if (!this.currentRoomId || !this.currentUserId) return; // guard if not init
    socketService.emit("update_presence", {
      roomId: this.currentRoomId,
      userId: this.currentUserId,
      presenceData,
    });
  }

  public setUserActivity(isActive: boolean): void {
    if (!this.currentRoomId || !this.currentUserId) return; // guard if not init
    socketService.emit("user_activity_change", {
      roomId: this.currentRoomId,
      userId: this.currentUserId,
      isActive,
    });
  }

  // --- NEW: Edit locking (public API) ----------------------------------------
  // Your hook calls these; re-introduce them on the active class.
  public async requestEditLock(field: string): Promise<boolean> {
    if (!this.currentRoomId || !this.currentUserId) return false;
    return new Promise((resolve) => {
      socketService.emit("request_edit_lock", {
        roomId: this.currentRoomId,
        field,
        userId: this.currentUserId,
      });
      const handleResponse = (data: {
        success: boolean;
        field: string;
        currentEditor?: string;
      }) => {
        if (data.field === field) {
          socketService.off("edit_lock_response", handleResponse);
          resolve(data.success);
        }
      };
      socketService.on("edit_lock_response", handleResponse);
    });
  }

  public async releaseEditLock(field: string): Promise<void> {
    if (!this.currentRoomId || !this.currentUserId) return;
    socketService.emit("release_edit_lock", {
      roomId: this.currentRoomId,
      field,
      userId: this.currentUserId,
    });
  }

  // --- Delivery helpers ------------------------------------------------------
  private sendOperation(operation: CollaborativeOperation): void {
    socketService.emit("collaborative_operation", {
      roomId: this.currentRoomId,
      operation,
    });
    // Track it so we can clear when server confirms
    if (operation.clientId)
      this.pendingOpMap.set(operation.clientId, operation);
  }

  private queueOperation(operation: CollaborativeOperation): void {
    // Let the connection manager persist/flush later (you can implement storage there)
    connectionManager.queueOperation({
      type: "collaborative_operation",
      data: { roomId: this.currentRoomId, operation },
    });

    // Keep legacy in-memory queue too (flushed on state sync)
    this.pendingOperations.push(operation);
  }

  // Persist the op locally (so you can replay after app restart)
  private async saveOperationLocally(
    operation: CollaborativeOperation
  ): Promise<void> {
    try {
      // TODO: store in a tiny "operations" table or alongside tasks with a queue
      // await operationDatabase.saveOperation(operation);
    } catch (error) {
      console.error("Error saving operation locally:", error);
    }
  }

  // Mark the thing as synced in local cache (and DB if you store a flag)
  private async markOperationSynced(
    operation: CollaborativeOperation
  ): Promise<void> {
    if (operation.type === "UPDATE_TASK" || operation.type === "ADD_TASK") {
      const task = this.localState.tasks[operation.taskId!];
      if (task) {
        task.syncStatus = "synced";
        // Optional: persist the synced flag to DB
        await this.saveOperationLocally(operation);
      }
    }
    this.notifyStateListeners();
  }

  private handleOperationFailure(operation: CollaborativeOperation): void {
    console.error("Operation failed:", operation);
    if (operation.taskId && this.localState.tasks[operation.taskId]) {
      this.localState.tasks[operation.taskId].syncStatus = "failed";
    }
    this.notifyStateListeners();
  }

  private handleSyncConflict(
    _operation: CollaborativeOperation,
    serverState: CollaborativeState
  ): void {
    // Simple policy: server wins; replace local and notify.
    // (You can implement field-level merge/OT later.)
    this.localState = { ...serverState };
    this.notifyStateListeners();
  }

  // --- Local state ops -------------------------------------------------------
  getState(): CollaborativeState {
    return this.localState;
  }

  private applyOperationLocally(operation: CollaborativeOperation): void {
    switch (operation.type) {
      case "UPDATE_TASK": {
        if (!this.localState.tasks) this.localState.tasks = {};
        this.localState.tasks[operation.taskId!] = {
          ...this.localState.tasks[operation.taskId!],
          ...operation.updates,
          lastModifiedBy: operation.userId,
          lastModifiedAt: new Date().toISOString(),
        };
        break;
      }
      case "ADD_TASK": {
        if (!this.localState.tasks) this.localState.tasks = {};
        this.localState.tasks[operation.taskId!] = operation.task;
        break;
      }
      case "DELETE_TASK": {
        if (this.localState.tasks) {
          delete this.localState.tasks[operation.taskId!];
        }
        break;
      }
      case "SET_VALUE": {
        // optional generic path setter if you use it
        break;
      }
    }
    this.notifyStateListeners();
  }

  // Legacy in-memory flush (still useful right after state_sync)
  private flushPendingOperations(): void {
    const ops = [...this.pendingOperations];
    this.pendingOperations = [];
    ops.forEach((operation) => this.sendOperation(operation));
  }

  private generateClientId(): string {
    return `${this.currentUserId}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 11)}`;
  }

  // --- Event listener management --------------------------------------------
  onStateChange(callback: (state: CollaborativeState) => void): () => void {
    this.stateListeners.push(callback);
    return () => {
      this.stateListeners = this.stateListeners.filter((cb) => cb !== callback);
    };
  }

  onParticipantsChange(
    callback: (participants: Participant[]) => void
  ): () => void {
    this.participantListeners.push(callback);
    return () => {
      this.participantListeners = this.participantListeners.filter(
        (cb) => cb !== callback
      );
    };
  }

  onLocksChange(callback: (locks: EditLock[]) => void): () => void {
    this.lockListeners.push(callback);
    return () => {
      this.lockListeners = this.lockListeners.filter((cb) => cb !== callback);
    };
  }

  onPresenceChange(
    callback: (userId: string, presence: any) => void
  ): () => void {
    this.presenceListeners.push(callback);
    return () => {
      this.presenceListeners = this.presenceListeners.filter(
        (cb) => cb !== callback
      );
    };
  }

  private notifyStateListeners(): void {
    this.stateListeners.forEach((cb) => cb(this.localState));
  }

  private notifyParticipantListeners(participants: Participant[]): void {
    this.participantListeners.forEach((cb) => cb(participants));
  }

  private notifyLockListeners(locks: EditLock[]): void {
    this.lockListeners.forEach((cb) => cb(locks));
  }

  private notifyPresenceListeners(userId: string, presence: any): void {
    this.presenceListeners.forEach((cb) => cb(userId, presence));
  }
}

export const collaborativeService = new CollaborativeService();
// Some code adapted with AI assistance, modified for this project
