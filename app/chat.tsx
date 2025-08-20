/** LET's TRY THS AGAIN ------------- */

// screens/ChatScreen.tsx
// UPDATED w/ channel list + unread badges + focus reload
// Stores chat history and re-hydrates when you come back to the tab

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  FlatList,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
//logic when Focus on screen
import { useFocusEffect, useRoute } from "@react-navigation/native";

//cahtUI imports
import MessageList from "../components/chatUI/MessageList";
import MessageInput from "../components/chatUI/MessageInput";
import TypingIndicators from "../components/chatUI/TypingIndicators";
import PresenceStatus from "../components/chatUI/PresenceStatus";
// -- NEW compoent for chatRoom List
// -->> FIX: correct path to where you actually placed ChannelList
import ChannelList from "../components/chatUI/ChannelList";

// Hooks ---- chat + identity
import { useChat } from "../hooks/useChat";
import type { ChatMessage } from "../services/chatDatabase";
import { useIdentity } from "../hooks/useIdentity";

// // HElper Function for @Mentions to render & pass userNAem
// function parseMentions(text: string) {
//   // sercah @ mention
//   const regex = /(@\w+)/g;
//   const parts: { text: string; isMention: boolean }[] = [];
//   let lastIndex = 0;
//   let match;
//   // if matches the search@naem
//   while ((match = regex.exec(text)) !== null) {
//     if (match.index > lastIndex) {
//       parts.push({
//         text: text.slice(lastIndex, match.index),
//         isMention: false,
//       });
//     }
//     parts.push({ text: match[0], isMention: true });
//     lastIndex = regex.lastIndex;
//   }
//   if (lastIndex < text.length) {
//     parts.push({ text: text.slice(lastIndex), isMention: false });
//   }
//   return parts;
// }

export default function ChatScreen() {
  // NEW: read optional params from navigation (lets parent pass currentUser / room)
  // -->> SAFER: guard if params are missing
  const route = useRoute<any>();
  const params = (route && (route as any).params) || {};
  const overrideUser = params.currentUser; // { id, userName } if provided

  const initialRoomId = params.roomId ?? "general";
  const initialRoomName = params.roomName ?? "The OG Chat Space 💬";

  // gets userInfo (id,name) IF identity ready - from userIdentity Hook
  const { userId: idFromHook, userName: nameFromHook, ready } = useIdentity();
  // allow override from navigation OR fallback to identity hook
  const userId = overrideUser?.id ?? idFromHook;
  const userName = overrideUser?.userName ?? nameFromHook ?? "Anonymous";

  // store user Text inputs to useState
  // setText = update w/new
  const [text, setText] = useState("");

  // FlatList REF ==> will point chat mssgs
  const listRef = useRef<FlatList<ChatMessage>>(null);
  // Type<param> = TS ref type
  //init val = null until list mounts

  /**
   * use useChat Hook ----------------
   * takes values to refernce
   */
  const {
    messages, //msg to render
    typingUsers, // who
    // ROOMS ---- 2.8 feature
    rooms, //lsit of Rooms/channels
    currentRoom, //curent room ID
    unread, // map() roomID for unreadCount *ChannelList badge**
    joinRoom, // roomId,roomName ==> when user joins Room + load data

    // text input -> hnadles optimistc insert/local persistence/socket emit
    sendMessage,
    // cahneg Typing Status / update userse + typeingSTate
    startTyping,
    stopTyping,
    // Pull msessg stored ==> State @ screen focus
    reloadMessages,

    //  useChat is Live-check
    isConnected, // <-- dynamic socket state wired from chatService.onConnection
  } = useChat(userId ?? "", userName ?? "Anonymous"); //send user id to back to Hook
  //-=> if userId || userName = null/undefined --> fallBk deault :Anonymous
  // ✅ prevents re-joining loops
  const joinedOnce = useRef(false);

  /**
   * Join a default room ==> AFTET once identity is Status : ready.
   * Server => target correct Room
   * Load initial history from DB -- pull msessages
   */
  useEffect(() => {
    if (!ready || !userId) return;
    if (currentRoom === initialRoomId) return; //prevent dupe join
    // Pick a def_ GEn. cahtRoom (now dynamic via initialRoomId/name)
    // joinRoom(initialRoomId, initialRoomName);
  }, [ready, userId, joinRoom, initialRoomId, initialRoomName]);

  /** 2.6 -- PERSISTENCE STORAGE
   *  IF SCREEN == visible again => Laod messgs from stoarge
   *  store/queue offlien messges
   */
  useFocusEffect(
    useCallback(() => {
      if (!ready || !userId) return; // identity not ready yet
      if (joinedOnce.current) return;
      joinRoom("general", "The OG Chat Space 💬");
      joinedOnce.current = true;

      reloadMessages(); // reads from SQLite/Async and sets state
    }, [ready, userId, joinRoom, reloadMessages])
  );

  // shows recent mssgse laoded ---
  useEffect(() => {
    if (messages.length > 0) {
      const t = setTimeout(
        // scrolls chatlist @ bttom
        () => listRef.current?.scrollToEnd({ animated: true }),
        80
      );
      return () => clearTimeout(t);
    }
  }, [messages]);

  /**
   * SEND MESSAGE -------
   */
  const handleSend = async () => {
    // no sned on EMPTY===
    if (!text.trim()) return;
    // invode Servide tp SEND mssge --
    await sendMessage(text.trim());
    setText(""); //claer's input@send
    stopTyping(); //updates=user stopped typing
  };

  /** LOADING Spineer ---------
   *  @ load happening ==> show a spinner
   * IF app NOTN ready . laoed yet
   * Id userID NOT yet
   */
  if (!ready || !userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.flex1, styles.center]}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  // UPDATES HEADER w/ Room Name ----
  const currentRoomName =
    // look through [] and pass name || else deafulte name or pass "-"
    rooms.find((r) => r.id === currentRoom)?.name ??
    currentRoom ??
    "The Chat Space...💬";

  // --- need to update wiith Dyanics usser Coutn ----- 2.8
  // pull from the room object if you store participants there
  const participantsCount =
    rooms.find((r) => r.id === currentRoom)?.participants?.length ?? 0; //o not 1

  /** ---------- UI ---------- */
  return (
    // <SafeAreaView style={styles.safeArea}>
    //   {/* 2.8: Improt CahnelLIst w/bttutn */}
    //   <ChannelList
    //     rooms={rooms}
    //     currentRoom={currentRoom}
    //     unread={unread}
    //     // When User taps roomBttn -> join that room
    //     onSelectRoom={(roomId, roomName) => joinRoom(roomId, roomName)}
    //   />

    //   {/* Header
    //   - Room name
    //   - dynamic USers's online  */}
    //   <PresenceStatus
    //     roomName={currentRoomName}
    //     online={isConnected} // <-- dynamic
    //     participantsCount={participantsCount} // <-- dynamic
    //   />

    //   <KeyboardAvoidingView
    //     behavior={Platform.OS === "ios" ? "padding" : "height"}
    //     style={styles.flex1}
    //   >
    //     {/* Chat list */}
    //     <View style={styles.flex1}>
    //       <MessageList
    //         ref={listRef}
    //         messages={messages as ChatMessage[]}
    //         currentUserId={userId}
    //       />
    //     </View>

    //     {/* Show @Mentions
    //     {messages.map((msg, i) => (
    //       <Text key={i} style={{ color: "white" }}>
    //         {parseMentions(msg.text).map((part, j) => (
    //           <Text
    //             key={j}
    //             style={{
    //               color: part.isMention ? "dodgerblue" : "white",
    //               fontWeight: part.isMention ? "bold" : "normal",
    //             }}
    //           >
    //             {part.text}
    //           </Text>
    //         ))}
    //       </Text>
    //     ))} */}

    //     {/* “UserX is typing…” */}
    //     <TypingIndicators typingUsers={typingUsers} />
    //     {/* Input row */}
    //     <MessageInput
    //       value={text}
    //       onChangeText={(t) => {
    //         // Toggle typing indicator @ stop/start
    //         setText(t);
    //         if (t && t.trim().length > 0) startTyping();
    //         else stopTyping();
    //       }}
    //       onSend={handleSend}
    //       onStartTyping={startTyping}
    //       onStopTyping={stopTyping}
    //     />
    //   </KeyboardAvoidingView>
    // </SafeAreaView>
    <SafeAreaView style={styles.safeArea}>
      {/* 2.8: Improt CahnelLIst w/bttutn */}
      <ChannelList
        rooms={rooms}
        currentRoom={currentRoom}
        unread={unread}
        // When User taps roomBttn -> join that room
        onSelectRoom={(roomId, roomName) => joinRoom(roomId, roomName)}
      />

      {/* Header
      - Room name
      - dynamic USers's online  */}
      <PresenceStatus
        roomName={currentRoomName}
        online={isConnected} // <-- dynamic
        participantsCount={participantsCount} // <-- dynamic
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        {/* Chat list */}
        <View style={styles.flex1}>
          <MessageList
            ref={listRef}
            messages={messages as ChatMessage[]}
            currentUserId={userId}
          />
        </View>

        {/* “UserX is typing…” */}
        <TypingIndicators typingUsers={typingUsers} />

        {/* Input row */}
        <MessageInput
          value={text}
          onChangeText={(t) => {
            // Toggle typing indicator @ stop/start
            setText(t);
            if (t && t.trim().length > 0) startTyping();
            else stopTyping();
          }}
          onSend={handleSend}
          onStartTyping={startTyping}
          onStopTyping={stopTyping}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**  UI STYLES ---------------------------------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // take up full height/width
    backgroundColor: "#F9FAFB",
  },
  //"fill space" -> stretch/ fill all available space
  flex1: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
});
// /** LET's TRY THS AGAIN ------------- */

// // screens/ChatScreen.tsx
// // UPDATED w/ channel list + unread badges + focus reload
// // Stores chat history and re-hydrates when you come back to the tab

// import React, { useEffect, useRef, useState, useCallback } from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   // FlatList,        // <-- not used in this version (MessageList handles the list)
//   View,
//   ActivityIndicator,
//   // Text,            // <-- not used (mention rendering moved into MessageList)
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// //logic when Focus on screen
// import { useFocusEffect, useRoute } from "@react-navigation/native";

// //cahtUI imports
// import MessageList from "../components/chatUI/MessageList";
// import MessageInput from "../components/chatUI/MessageInput";
// import TypingIndicators from "../components/chatUI/TypingIndicators";
// import PresenceStatus from "../components/chatUI/PresenceStatus";
// // -- NEW compoent for chatRoom List
// // -->> FIX: correct path to where you actually placed ChannelList
// import ChannelList from "../components/chatUI/ChannelList";

// // Hooks ---- chat + identity
// import { useChat } from "../hooks/useChat";
// import type { ChatMessage } from "../services/chatDatabase";
// import { useIdentity } from "../hooks/useIdentity";

// // // HElper Function for @Mentions to render & pass userNAem
// // (We render mentions inside MessageList now to avoid double-render)

// /** IMPORTANT:
//  * For the demo, keep both clients in the SAME room.
//  * Using route params can put each device in a different channel
//  * and makes it look like a "one-sided" chat.
//  */

// export default function ChatScreen() {
//   // NEW: read optional params from navigation (lets parent pass currentUser / room)
//   // -->> SAFER: guard if params are missing
//   const route = useRoute<any>();
//   const params = (route && (route as any).params) || {};
//   const overrideUser = params.currentUser; // { id, userName } if provided

//   // Force SAME room for the assignment demo  ------------------------ //
//   const initialRoomId = "general"; // <-- force “general” so both clients share the channel
//   const initialRoomName = "The OG Chat Space 💬"; // <-- keep friendly name
//   // (If you want route-based rooms later, swap these for params.* again.)

//   // gets userInfo (id,name) IF identity ready - from userIdentity Hook
//   const { userId: idFromHook, userName: nameFromHook, ready } = useIdentity();
//   // allow override from navigation OR fallback to identity hook
//   const userId = overrideUser?.id ?? idFromHook;
//   const userName = overrideUser?.userName ?? nameFromHook ?? "Anonymous";

//   // store user Text inputs to useState
//   // setText = update w/new
//   const [text, setText] = useState("");

//   // FlatList REF ==> will point chat mssgs
//   const listRef = useRef<any>(null); // <-- forwardRef from MessageList, use `any` to avoid RN generic friction
//   // Type<param> = TS ref type
//   //init val = null until list mounts

//   /**
//    * use useChat Hook ----------------
//    * takes values to refernce
//    */
//   const {
//     messages, //msg to render
//     typingUsers, // who
//     // ROOMS ---- 2.8 feature
//     rooms, //lsit of Rooms/channels
//     currentRoom, //curent room ID
//     unread, // map() roomID for unreadCount *ChannelList badge**
//     joinRoom, // roomId,roomName ==> when user joins Room + load data

//     // text input -> hnadles optimistc insert/local persistence/socket emit
//     sendMessage,
//     // cahneg Typing Status / update userse + typeingSTate
//     startTyping,
//     stopTyping,
//     // Pull msessg stored ==> State @ screen focus
//     reloadMessages,

//     //  useChat is Live-check
//     isConnected, // <-- dynamic socket state wired from chatService.onConnection

//     // <-- wire pagination back up so older history loads properly
//     loadMoreMessages, // <-- ADDED back in
//   } = useChat(userId ?? "", userName ?? "Anonymous"); //send user id to back to Hook
//   //?-=> if userId || userName = null/undefined --> fallBk deault :Anonymous

//   /**
//    * Join a default room ==> AFTET once identity is Status : ready.
//    * Server => target correct Room
//    * Load initial history from DB -- pull msessages
//    */
//   useEffect(() => {
//     if (!ready || !userId) return;
//     // Pick a def_ GEn. cahtRoom (now dynamic via initialRoomId/name)
//     joinRoom(initialRoomId, initialRoomName);
//   }, [ready, userId, joinRoom, initialRoomId, initialRoomName]);

//   /** 2.6 -- PERSISTENCE STORAGE
//    *  IF SCREEN == visible again => Laod messgs from stoarge
//    *  store/queue offlien messges
//    */
//   useFocusEffect(
//     useCallback(() => {
//       if (!ready || !userId) return; // identity not ready yet
//       reloadMessages(); // reads from SQLite/Async and sets state
//     }, [ready, userId, reloadMessages])
//   );

//   // shows recent mssgse laoded ---
//   useEffect(() => {
//     if (messages.length > 0) {
//       const t = setTimeout(
//         // scrolls chatlist @ bttom
//         () => listRef.current?.scrollToEnd?.({ animated: true }), // <-- safe optional call
//         80
//       );
//       return () => clearTimeout(t);
//     }
//   }, [messages]);

//   /**
//    * SEND MESSAGE -------
//    */
//   const handleSend = async () => {
//     // no sned on EMPTY===
//     if (!text.trim()) return;
//     // invode Servide tp SEND mssge --
//     await sendMessage(text.trim());
//     setText(""); //claer's input@send
//     stopTyping(); //updates=user stopped typing
//   };

//   /** LOADING Spineer ---------
//    *  @ load happening ==> show a spinner
//    * IF app NOTN ready . laoed yet
//    * Id userID NOT yet
//    */
//   if (!ready || !userId) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={[styles.flex1, styles.center]}>
//           <ActivityIndicator />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // UPDATES HEADER w/ Room Name ----
//   const currentRoomName =
//     // look through [] and pass name || else deafulte name or pass "-"
//     rooms.find((r) => r.id === currentRoom)?.name ??
//     currentRoom ??
//     "The Chat Space...💬";

//   // --- need to update wiith Dyanics usser Coutn ----- 2.8
//   // pull from the room object if you store participants there
//   const participantsCount =
//     rooms.find((r) => r.id === currentRoom)?.participants?.length ?? 0; //o not 1

//   /** ---------- UI ---------- */
//   return (
//     <SafeAreaView style={styles.safeArea}>
//       {/* 2.8: Improt CahnelLIst w/bttutn */}
//       <ChannelList
//         rooms={rooms}
//         currentRoom={currentRoom}
//         unread={unread}
//         // When User taps roomBttn -> join that room
//         onSelectRoom={(roomId, roomName) => joinRoom(roomId, roomName)}
//       />

//       {/* Header
//       - Room name
//       - dynamic USers's online  */}
//       <PresenceStatus
//         roomName={currentRoomName}
//         online={isConnected} // <-- dynamic
//         participantsCount={participantsCount} // <-- dynamic
//       />

//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.flex1}
//       >
//         {/* Chat list */}
//         <View style={styles.flex1}>
//           <MessageList
//             ref={listRef}
//             messages={messages as ChatMessage[]}
//             currentUserId={userId}
//             onEndReached={loadMoreMessages} // <-- pagination hook back in
//           />
//         </View>

//         {/* “UserX is typing…” */}
//         <TypingIndicators
//           typingUsers={typingUsers}
//           currentUserId={userId} // <-- NEW: so we don't show our own name
//         />

//         {/* Input row */}
//         <MessageInput
//           value={text}
//           onChangeText={(t) => {
//             // Toggle typing indicator @ stop/start
//             setText(t);
//             if (t && t.trim().length > 0) startTyping();
//             else stopTyping();
//           }}
//           onSend={handleSend}
//           onStartTyping={startTyping}
//           onStopTyping={stopTyping}
//         />
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// /**  UI STYLES ---------------------------------- */
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1, // take up full height/width
//     backgroundColor: "#F9FAFB",
//   },
//   //"fill space" -> stretch/ fill all available space
//   flex1: { flex: 1 },
//   center: { justifyContent: "center", alignItems: "center" },
// });
