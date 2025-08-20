// // hooks/useChat.ts
// import { useState, useEffect, useCallback, useRef } from "react";
// import { useFocusEffect } from "@react-navigation/native";
// import { chatService, TypingUser } from "../services/chatService";
// import { ChatMessage, ChatRoom } from "../services/chatDatabase";

// /** Props passed -->  screens */
// export interface UseChatReturn {
//   messages: ChatMessage[]; //[]of mesages
//   typingUsers: TypingUser[]; // [] usersType stat
//   rooms: ChatRoom[]; //[] RoomList
//   currentRoom: string | null; //currentRoom else null
//   isLoading: boolean; //SPinner....
//   sendMessage: (text: string) => Promise<void>;
//   joinRoom: (roomId: string, roomName: string) => Promise<void>;
//   startTyping: () => void;
//   stopTyping: () => void;
//   loadMoreMessages: () => Promise<void>;
//   /** relaods messg from storge */
//   reloadMessages: () => Promise<void>;
//   /**2.8 : unread badge counts per room (e.g., { general: 3, dev: 1 }) */
//   unread: Record<string, number>;
//   // 2.8 - live sokcet Status to pass the PressenceSTatus
//   isConnected: boolean;
// }

// // DEFINE HOOOKK ------------
// // takes 2 arg. userId:typeString+userName:trypeString
// // returns object of Type X => UseChatReturn*
// export const useChat = (userId: string, userName: string): UseChatReturn => {
//   /** ----- UI state the screen will render ----- */

//   // shw ALL messg in CURRENT chaht --
//   // 1=[] of curent msesages
//   // 2=fucntion-> updates mesgesa []
//   const [messages, setMessages] = useState<ChatMessage[]>([]);

//   //[]track of who is typing / udpates
//   const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

//   // [] stoers list of Rooms
//   const [rooms, setRooms] = useState<ChatRoom[]>([]);

//   // Track Room user is @
//   // start=null
//   // fucntion=> swtich Rooms
//   const [currentRoom, setCurrentRoom] = useState<string | null>(null);

//   //LoadingState - spinner
//   const [isLoading, setIsLoading] = useState(false);
//   // Paginatiion for Message loads --
//   // start@ adn go form there /..
//   const [messageOffset, setMessageOffset] = useState(0); // for pagination

//   /** 2.8 --> coutner for unRead mesages / updates badge **
//    * tranks unread msges in e/a room
//    *
//    * ex: [OGChat:4, XChat:1] */
//   const [unread, setUnread] = useState<Record<string, number>>({});

//   // 2.8 -- update Live Conxt status / presence Dot/bttn
//   const [isConnected, setIsConnected] = useState<boolean>(false); // NEW-----

//   // crEates a contaier/box to store values for later use
//   const currentRoomRef = useRef<string | null>(null);

//   // e/a currentRoom State cahnges/updates ==> store value to REf ^^
//   useEffect(() => {
//     currentRoomRef.current = currentRoom;
//   }, [currentRoom]); // will keep consistent/updated

//   /** New Ref to store [] of functions =. from Hook
//    * updates the state of fucntiosn
//    *e/a funct. ==> in [] = an unsubscribe/cleanup funct. => returned by Props : chatService.onMessage(...), onTyping(...)
//    */
//   const unsubsRef = useRef<Array<() => void>>([]);

//   /** Helper=> removes all listeners in hook */
//   const removeAllListeners = () => {
//     // stores to Ref^^^
//     unsubsRef.current.forEach((off) => {
//       // trycsth block--
//       try {
//         off(); //call e/a unsubrcibe safely
//       } catch {} //ignore (e) so it don'st block rest of code
//     });
//     // Clear List / reset -> NOT undo / double/clean
//     unsubsRef.current = []; //important!!
//   };

//   /**
//    * START CHAT -----
//    * render/ laod lsit of Rooms
//    * setuo message lsiteners / for state
//    * keep messgs up to date w/ id/timstmpt
//    */

//   // start @ mount
//   useEffect(() => {
//     let cancelled = false; //sTOP work if unmounts while loading evryhtig else in Asunc

//     // Async START -- PRep run/rednr/fetch conenctions
//     (async () => {
//       setIsLoading(true); //Laoding state ------

//       //Rev up teh Caht System -> sokcet/db, identity
//       await chatService.initialize(userId, userName);
//       if (cancelled) return; //stop if compoent unmoutns

//       // Fetches all Rooms availbles
//       const existingRooms = await chatService.getAllRooms();
//       if (cancelled) return; //stop if compoent unmoutns

//       setRooms(existingRooms); //update State^^

//       // cleanup! gets rid of lsitners so NO double subs
//       removeAllListeners();

//       //Wait for MEssages-> use CahtSErvices-> onMessage
//       const offMessage = chatService.onMessage((message) => {
//         //update setMEesage state()
//         setMessages((prev) => {
//           // check in new messg => exists in []
//           const exists = prev.some(
//             // check mssg => by id or tempID => checks both to make sure no duplciates
//             (m) => m.id === message.id || m.tempId === message.tempId
//           );
//           // IF ALRADY in [] --> replace w. NEW MESSG
//           if (exists) {
//             return prev.map((m) =>
//               m.id === message.id || m.tempId === message.tempId ? message : m
//             );
//           }
//           // IF NEW messga => add @ end
//           return [...prev, message];
//         });

//         // Update coutner based on latest status
//         setUnread((prev) => {
//           // check prev/altest state

//           // use purrentRoomRef** to knwo which current Room user is IN
//           const activeRoom = currentRoomRef.current;
//           // IF user NOT IN ROOM yet or mssg in antoheor room
//           if (!activeRoom || message.roomId !== activeRoom) {
//             //read prev state
//             const next = { ...prev };
//             // lookup unredad Count for roomID and add to it --< update it!
//             next[message.roomId] = (next[message.roomId] ?? 0) + 1;
//             return next; //retun updates ->new if updated or NO change / OG
//           }
//           return prev; // no change if message==> for curent active room
//         });
//       });

//       // TYPING indicators -- TYPING STATUS " X is Typing..."
//       const offTyping = chatService.onTyping((typingUser) => {
//         // uses chatService=onTypin => start/stop
//         // prev; list of prev. user typing
//         setTypingUsers((prev) => {
//           // update [] of users typing**
//           const others = prev.filter((u) => u.userId !== typingUser.userId);
//           // filter old list and remov entry for this user =userID ==> prevents duplictes
//           return typingUser.isTyping ? [...others, typingUser] : others; // only add them user is they're still typing...
//         });
//       });

//       // Update / ACK — server maps tempId -> real message id
//       const offDelivery = chatService.onDelivery((tempId, messageId) => {
//         // chatService-> onbDelivary STATUS
//         setMessages((prev) =>
//           // server saves tempId and
//           // update state-- create new [] from old one
//           prev.map(
//             (m) =>
//               // check e/a mssg for duplicates / no repeats---
//               m.tempId === tempId
//                 ? {
//                     ...m,
//                     id: messageId, // id=>realID
//                     //status upadte=> true delivered!- yay!
//                     delivered: true,
//                     //clear tempID - jsut incase
//                     tempId: undefined,
//                   }
//                 : m //not match=> return / no change
//           )
//         );
//       });
//       /** NEW: live connection status for PresenceStatus dot */
//       // @ts-ignore
//       // const offConn = chatService.onConnection((connected: boolean) => {
//       //   setIsConnected(connected);
//       // });

//       /** NEW: server-side message edits => update row immediately */
//       // @ts-ignore
//       const offEdited = chatService.onEdited((payload) => {
//         // payload: { messageId, newText, editedAt }
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.id === payload.messageId
//               ? {
//                   ...m,
//                   text: payload.newText,
//                   edited: true,
//                   editedAt: payload.editedAt,
//                 }
//               : m
//           )
//         );
//       });

//       /** NEW: room presence updates => keep participant counts in rooms[] */
//       // @ts-ignore
//       const offPresence = chatService.onRoomPresence(({ roomId, members }) => {
//         setRooms((prev) =>
//           prev.map((r) =>
//             r.id === roomId
//               ? {
//                   ...r,
//                   participants: members?.map((m: any) => m.userName) ?? [],
//                 }
//               : r
//           )
//         );
//       });
//       // // saves functiosn to ref leter--
//       // unsubsRef.current = [
//       //   offMessage,
//       //   offTyping,
//       //   offDelivery,
//       //   offConn,
//       //   offEdited,
//       //   offPresence,
//       // ];
//       // // saves functiosn to ref leter--
//       // unsubsRef.current = [offMessage, offTyping, offDelivery];

//       setIsLoading(false); //ayscn @ end.. no more laod stae
//     })();

//     // CLEaN UP @ mount ----
//     return () => {
//       cancelled = true; //stop all satet updates
//       removeAllListeners(); // remove listeners added above
//     };
//   }, [userId, userName]); // Rerun IF identity CHAnges ---

//   /** reloadMessages() -------------
//    * - Read latest messages in room @ Screen Focus
//    */
//   const reloadMessages = useCallback(async () => {
//     if (!currentRoom) return; // no room selected yet
//     // load lsit
//     const saved = await chatService.getMessagesForRoom(currentRoom);
//     setMessages(saved);
//     setMessageOffset(saved.length);
//     setTypingUsers([]); // update/cahneg Typing Status
//   }, [currentRoom]);

//   /**2.6 -- > FOcus & Reload all previus Messgaes
//    */
//   useFocusEffect(
//     useCallback(() => {
//       let active = true; //chesck if we're still on scren

//       (async () => {
//         if (!currentRoom) return; //no room -> no meed to Reload

//         // fetch saved CahtMeesags of room =. DB/cache
//         const saved = await chatService.getMessagesForRoom(currentRoom);
//         if (!active) return; //IF user left--> befroe fetch - cancel -HALT!

//         setMessages(saved); //pass mssg-> state-> to render
//         setMessageOffset(saved.length); //part of Paginatin--> helsp trak # of mesage for screen rendering
//         setTypingUsers([]); // clear typing [] cue--> "x typoing..."
//       })();

//       return () => {
//         active = false;
//         // if USER LEAVES (rude...) before render -> DO NOT udpate states
//       };
//     }, [currentRoom]) //take it from the top when currentRoom cahnges --
//   );

//   /*** JOIN ROOM  ---------
//    * - 2.8  resets room => unread Counter @ 0
//    */
//   const joinRoom = useCallback(async (roomId: string, roomName: string) => {
//     try {
//       setIsLoading(true);

//       await chatService.joinRoom(roomId, roomName); //tell serverv RoomChat

//       const roomMessages = await chatService.getMessagesForRoom(roomId);
//       // show msg list
//       setMessages(roomMessages); //update render from DB data
//       setCurrentRoom(roomId); //Make active ROom
//       setMessageOffset(roomMessages.length);
//       setTypingUsers([]);

//       // REsET coutner -> User IN ROOM now---
//       setUnread((u) => ({ ...u, [roomId]: 0 }));
//     } catch (error) {
//       // catch erreor
//       console.error("Error joining room:", error);
//     } finally {
//       setIsLoading(false); //loading state
//     }
//   }, []);

//   /**2.6 - sendMessage
//    *  chatService create new local messg w/ tempID
//    * - stays locally / emit to SErver = online
//    * - If offline==>  socketService queues
//    */
//   const sendMessage = useCallback(async (text: string) => {
//     try {
//       /** 2.8: pass "@mentions" so server can emit "mention" events */
//       const mentions = (text.match(/@([a-zA-Z0-9_]+)/g) || []).map((t) =>
//         t.slice(1)
//       ); // NEW
//       await chatService.sendMessage(text);
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   }, []);

//   /** Start/stop Typing = Status/indicators For current user */
//   const startTyping = useCallback(() => {
//     chatService.startTyping(); //emit/send to server
//   }, []);
//   const stopTyping = useCallback(() => {
//     chatService.stopTyping();
//   }, []);

//   /** PAGINATION==>  loadMoreMessages*/
//   const loadMoreMessages = useCallback(async () => {
//     if (!currentRoom || isLoading) return;
//     // Fetch older messages
//     try {
//       setIsLoading(true);
//       // Max =20 @ offSEt ==> add new @ ends
//       const older = await chatService.getMessagesForRoom(
//         currentRoom,
//         20, // limit
//         messageOffset // offset
//       );

//       if (older.length > 0) {
//         // add old history b4 new ones -- UI / like in text messages
//         setMessages((prev) => [...older, ...prev]);
//         setMessageOffset((prev) => prev + older.length);
//       }
//     } catch (error) {
//       console.error("Error loading more messages:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [currentRoom, messageOffset, isLoading]);

//   /** What Screen gets to use */
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
//     reloadMessages,
//     // provde unRead MAp() ==> for Channelist => upadte badges
//     unread,
//     isConnected,
//   };
// };

// hooks / useChat.ts;
import { useState, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { chatService, TypingUser } from "../services/chatService";
import { ChatMessage, ChatRoom } from "../services/chatDatabase";

/** Props passed -->  screens */
export interface UseChatReturn {
  messages: ChatMessage[]; //[]of mesages
  typingUsers: TypingUser[]; // [] usersType stat
  rooms: ChatRoom[]; //[] RoomList
  currentRoom: string | null; //currentRoom else null
  isLoading: boolean; //SPinner....
  sendMessage: (text: string) => Promise<void>;
  joinRoom: (roomId: string, roomName: string) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  loadMoreMessages: () => Promise<void>;
  /** relaods messg from storge */
  reloadMessages: () => Promise<void>;
  /**2.8 : unread badge counts per room (e.g., { general: 3, dev: 1 }) */
  unread: Record<string, number>;
  // 2.8 - live sokcet Status to pass the PressenceSTatus
  isConnected: boolean;
}

// DEFINE HOOOKK ------------
// takes 2 arg. userId:typeString+userName:trypeString
// returns object of Type X => UseChatReturn*
export const useChat = (userId: string, userName: string): UseChatReturn => {
  /** ----- UI state the screen will render ----- */

  // shw ALL messg in CURRENT chaht --
  // 1=[] of curent msesages
  // 2=fucntion-> updates mesgesa []
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  //[]track of who is typing / udpates
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  // [] stoers list of Rooms
  const [rooms, setRooms] = useState<ChatRoom[]>([]);

  // Track Room user is @
  // start=null
  // fucntion=> swtich Rooms
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  //LoadingState - spinner
  const [isLoading, setIsLoading] = useState(false);
  // Paginatiion for Message loads --
  // start@ adn go form there /..
  const [messageOffset, setMessageOffset] = useState(0); // for pagination

  /** 2.8 --> coutner for unRead mesages / updates badge **
   * tranks unread msges in e/a room
   *
   * ex: [OGChat:4, XChat:1] */
  const [unread, setUnread] = useState<Record<string, number>>({});

  // 2.8 -- update Live Conxt status / presence Dot/bttn
  const [isConnected, setIsConnected] = useState<boolean>(false); // NEW-----

  // crEates a contaier/box to store values for later use
  const currentRoomRef = useRef<string | null>(null);

  // e/a currentRoom State cahnges/updates ==> store value to REf ^^
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]); // will keep consistent/updated

  /** New Ref to store [] of functions =. from Hook
   * updates the state of fucntiosn
   *e/a funct. ==> in [] = an unsubscribe/cleanup funct. => returned by Props : chatService.onMessage(...), onTyping(...)
   */
  const unsubsRef = useRef<Array<() => void>>([]);

  /** Helper=> removes all listeners in hook */
  const removeAllListeners = () => {
    // stores to Ref^^^
    unsubsRef.current.forEach((off) => {
      // trycsth block--
      try {
        off(); //call e/a unsubrcibe safely
      } catch {} //ignore (e) so it don'st block rest of code
    });
    // Clear List / reset -> NOT undo / double/clean
    unsubsRef.current = []; //important!!
  };

  /**
   * START CHAT -----
   * render/ laod lsit of Rooms
   * setuo message lsiteners / for state
   * keep messgs up to date w/ id/timstmpt
   */

  // start @ mount
  useEffect(() => {
    let cancelled = false; //sTOP work if unmounts while loading evryhtig else in Asunc

    // Async START -- PRep run/rednr/fetch conenctions
    (async () => {
      setIsLoading(true); //Laoding state ------

      //Rev up teh Caht System -> sokcet/db, identity
      await chatService.initialize(userId, userName);
      if (cancelled) return; //stop if compoent unmoutns

      // Fetches all Rooms availbles
      const existingRooms = await chatService.getAllRooms();
      if (cancelled) return; //stop if compoent unmoutns

      // FIX: if nothing in DB yet, seed some defaults so ChannelList shows on first run
      if (!existingRooms || existingRooms.length === 0) {
        setRooms([
          { id: "general", name: "General", unreadCount: 0, participants: [] },
          { id: "dev", name: "Development", unreadCount: 0, participants: [] },
          { id: "tea", name: "The Tea", unreadCount: 0, participants: [] },
        ] as ChatRoom[]);
      } else {
        setRooms(existingRooms); //update State^^
      }

      // cleanup! gets rid of lsitners so NO double subs
      removeAllListeners();

      //Wait for MEssages-> use CahtSErvices-> onMessage
      const offMessage = chatService.onMessage((message) => {
        //update setMEesage state()
        setMessages((prev) => {
          // check in new messg => exists in []
          const exists = prev.some(
            // check mssg => by id or tempID => checks both to make sure no duplciates
            (m) => m.id === message.id || m.tempId === message.tempId
          );
          // IF ALRADY in [] --> replace w. NEW MESSG
          if (exists) {
            return prev.map((m) =>
              m.id === message.id || m.tempId === message.tempId ? message : m
            );
          }
          // IF NEW messga => add @ end
          return [...prev, message];
        });

        // Update coutner based on latest status
        setUnread((prev) => {
          // check prev/altest state
          const activeRoom = currentRoomRef.current;
          // FIX: do not count your own outgoing messages as unread in other rooms
          if (message.userId === userId) return prev;

          // use purrentRoomRef** to knwo which current Room user is IN
          // IF user NOT IN ROOM yet or mssg in antoheor room
          if (!activeRoom || message.roomId !== activeRoom) {
            //read prev state
            const next = { ...prev };
            // lookup unredad Count for roomID and add to it --< update it!
            next[message.roomId] = (next[message.roomId] ?? 0) + 1;
            // Optional bump if "@mention" targets me
            const mentionedMe =
              Array.isArray((message as any).mentions) &&
              (message as any).mentions.some(
                (h: string) => h.toLowerCase() === userName?.toLowerCase()
              );
            if (mentionedMe) next[message.roomId] = next[message.roomId] + 1;
            return next; //retun updates ->new if updated or NO change / OG
          }
          return prev; // no change if message==> for curent active room
        });
      });

      // TYPING indicators -- TYPING STATUS " X is Typing..."
      const offTyping = chatService.onTyping((typingUser) => {
        // uses chatService=onTypin => start/stop
        // prev; list of prev. user typing
        setTypingUsers((prev) => {
          // update [] of users typing**
          const others = prev.filter((u) => u.userId !== typingUser.userId);
          // filter old list and remov entry for this user =userID ==> prevents duplictes
          return typingUser.isTyping ? [...others, typingUser] : others; // only add them user is they're still typing...
        });
      });

      // Update / ACK — server maps tempId -> real message id
      const offDelivery = chatService.onDelivery((tempId, messageId) => {
        // chatService-> onbDelivary STATUS
        setMessages((prev) =>
          // server saves tempId and
          // update state-- create new [] from old one
          prev.map(
            (m) =>
              // check e/a mssg for duplicates / no repeats---
              m.tempId === tempId
                ? {
                    ...m,
                    id: messageId, // id=>realID
                    //status upadte=> true delivered!- yay!
                    delivered: true,
                    //clear tempID - jsut incase
                    tempId: undefined,
                  }
                : m //not match=> return / no change
          )
        );
      });

      /** NEW: live connection status for PresenceStatus dot */
      // FIX: actually subscribe + store unsubscribe
      const offConn = chatService.onConnection((connected: boolean) => {
        setIsConnected(connected);
      });

      /** NEW: server-side message edits => update row immediately */
      const offEdited = chatService.onEdited((payload) => {
        // payload: { messageId, newText, editedAt }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === payload.messageId
              ? {
                  ...m,
                  text: payload.newText,
                  edited: true,
                  editedAt: payload.editedAt,
                }
              : m
          )
        );
      });

      /** NEW: room presence updates => keep participant counts in rooms[] */
      const offPresence = chatService.onRoomPresence(({ roomId, members }) => {
        setRooms((prev) =>
          prev.map((r) =>
            r.id === roomId
              ? {
                  ...r,
                  // store names for now ==> will match UI
                  participants: members?.map((m: any) => m.userName) ?? [],
                }
              : r
          )
        );
      });

      // saves functiosn to ref leter--
      unsubsRef.current = [
        offMessage,
        offTyping,
        offDelivery,
        offConn, // FIX: keep connection listener
        offEdited, // FIX: keep edited listener
        offPresence, // FIX: keep presence listener
      ];

      setIsLoading(false); //ayscn @ end.. no more laod stae
    })();

    // CLEaN UP @ mount ----
    return () => {
      cancelled = true; //stop all satet updates
      removeAllListeners(); // remove listeners added above
    };
  }, [userId, userName]); // Rerun IF identity CHAnges ---

  /** reloadMessages() -------------
   * - Read latest messages in room @ Screen Focus
   */
  const reloadMessages = useCallback(async () => {
    if (!currentRoom) return; // no room selected yet
    // load lsit
    const saved = await chatService.getMessagesForRoom(currentRoom);
    setMessages(saved);
    setMessageOffset(saved.length);
    setTypingUsers([]); // update/cahneg Typing Status
  }, [currentRoom]);

  /**2.6 -- > FOcus & Reload all previus Messgaes
   */
  useFocusEffect(
    useCallback(() => {
      let active = true; //chesck if we're still on scren

      (async () => {
        if (!currentRoom) return; //no room -> no meed to Reload

        // fetch saved CahtMeesags of room =. DB/cache
        const saved = await chatService.getMessagesForRoom(currentRoom);
        if (!active) return; //IF user left--> befroe fetch - cancel -HALT!

        setMessages(saved); //pass mssg-> state-> to render
        setMessageOffset(saved.length); //part of Paginatin--> helsp trak # of mesage for screen rendering
        setTypingUsers([]); // clear typing [] cue--> "x typoing..."
      })();

      return () => {
        active = false;
        // if USER LEAVES (rude...) before render -> DO NOT udpate states
      };
    }, [currentRoom]) //take it from the top when currentRoom cahnges --
  );

  /*** JOIN ROOM  ---------
   * - 2.8  resets room => unread Counter @ 0
   */
  const joinRoom = useCallback(
    async (roomId: string, roomName: string) => {
      if (currentRoom === roomId) return;
      try {
        setIsLoading(true);

        await chatService.joinRoom(roomId, roomName); //tell serverv RoomChat

        const roomMessages = await chatService.getMessagesForRoom(roomId);
        // show msg list
        setMessages(roomMessages); //update render from DB data
        setCurrentRoom(roomId); //Make active ROom
        setMessageOffset(roomMessages.length);
        setTypingUsers([]);

        // REsET coutner -> User IN ROOM now---
        setUnread((u) => ({ ...u, [roomId]: 0 }));
      } catch (error) {
        // catch erreor
        console.error("Error joining room:", error);
      } finally {
        setIsLoading(false); //loading state
      }
    },
    [currentRoom]
  );

  /**2.6 - sendMessage
   *  chatService create new local messg w/ tempID
   * - stays locally / emit to SErver = online
   * - If offline==>  socketService queues
   */
  const sendMessage = useCallback(async (text: string) => {
    try {
      /** NOTE: chatService.sendMessage() already parses "@mentions" internally via parseMentions() */
      await chatService.sendMessage(text);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, []);

  /** Start/stop Typing = Status/indicators For current user */
  const startTyping = useCallback(() => {
    chatService.startTyping(); //emit/send to server
  }, []);
  const stopTyping = useCallback(() => {
    chatService.stopTyping();
  }, []);

  /** PAGINATION==>  loadMoreMessages*/
  const loadMoreMessages = useCallback(async () => {
    if (!currentRoom || isLoading) return;
    // Fetch older messages
    try {
      setIsLoading(true);
      // Max =20 @ offSEt ==> add new @ ends
      const older = await chatService.getMessagesForRoom(
        currentRoom,
        20, // limit
        messageOffset // offset
      );

      if (older.length > 0) {
        // add old history b4 new ones -- UI / like in text messages
        setMessages((prev) => [...older, ...prev]);
        setMessageOffset((prev) => prev + older.length);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom, messageOffset, isLoading]);

  /** What Screen gets to use */
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
    reloadMessages,
    // provde unRead MAp() ==> for Channelist => upadte badges
    unread,
    isConnected,
  };
};
