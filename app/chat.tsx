// import React, { useEffect, useRef, useState } from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   FlatList,
//   View,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// // Import cusotm hooks for chatScreen
// import MessageList from "../components/chatUI/MessageList";
// import MessageInput from "../components/chatUI/MessageInput";
// import TypingIndicators from "../components/chatUI/TypingIndicators";
// import PresenceStatus from "../components/chatUI/PresenceStatus";

// // hooks for chat+Stastus idicators
// import { useChat } from "../hooks/useChat";
// import type { ChatMessage } from "../services/chatDatabase";
// import { useIdentity } from "../hooks/useIdentity";

// export default function ChatScreen() {
//   // get userInfo (id,naem) IF identity ready
//   const { userId, userName, ready } = useIdentity();
//   // stete formessge inputText
//   const [text, setText] = useState("");
//   // FlatList -> userRef -> references lsit so we can scrool
//   const listRef = useRef<FlatList<ChatMessage>>(null);

//   /** useChat Hook
//    * Gives all chat features
//    * provides cchat data
//    * messg in chat
//    * typingUsers:which usesr is Typing
//    * joinRoom: fuction to joim chat room (WILL NEED UPDATE THIS for CHAT ROOM FEATURES)
//    * sendMEsage: fucntion -> ensd meassage
//    * startTuping: function trigegrs to show status of "I'm tyoping.."
//    * stopTyping: "fuction to trigger/stop typing + alert..
//    * */
//   const {
//     messages,
//     typingUsers,
//     joinRoom,
//     sendMessage,
//     startTyping,
//     stopTyping,
//   } = useChat(userId ?? "", userName ?? "Anonymous"); //tager userID for userNaem of not deafult -> Anonymous name

//   // whenuser identity => READY -> Join general chat room
//   useEffect(() => {
//     // wait for Identiy
//     if (!ready) return;
//     // if ready -> add user to general Caht
//     joinRoom("general", "General Chat");
//   }, [ready, joinRoom]); //

//   // e/a time "messages change" -->  auto-scroll to bottom
//   useEffect(() => {
//     if (messages.length > 0) {
//       setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
//     }
//   }, [messages]); // fetch new mesasges

//   // SEND HANDLER ----
//   const handleSend = async () => {
//     // if NO text --> don't send
//     if (!text.trim()) return;
//     // send chat through useChat --
//     await sendMessage(text.trim());
//     setText(""); //clear input lsit e/a time
//     stopTyping(); // reset user to not typign
//   };

//   // WAiting for User Identity to be ready ^^^ useIdentity()
//   if (!ready || !userId) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View
//           style={[
//             styles.flex1,
//             { justifyContent: "center", alignItems: "center" },
//           ]}
//         >
//           <ActivityIndicator />
//         </View>
//       </SafeAreaView>
//     );
//   }
//   /** ---------- UI RENDERING / Layout / Desing  -----  */
//   return (
//     <SafeAreaView style={styles.safeArea}>
//       {/* Sho Room name + # Users live  */}
//       <PresenceStatus
//         roomName="General Chat"
//         online={true}
//         participantsCount={2} //need up make dynamic to reflect users ***
//       />
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.flex1}
//       >
//         {/* makes sure keyboard doesn’t cover input */}
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={styles.flex1}
//         ></KeyboardAvoidingView>
//         {/* RENDER actul Chat mesages  */}
//         <View style={styles.flex1}>
//           <MessageList
//             ref={listRef}
//             messages={messages as ChatMessage[]}
//             currentUserId={userId}
//           />
//         </View>
//         {/* shows "UserX..." whn typeig  */}
//         <TypingIndicators typingUsers={typingUsers} />
//         {/* Input section / text input and sedn bttn for mssgse  */}
//         <MessageInput
//           value={text}
//           onChangeText={(t) => {
//             // when typeing tigger stop/startTypign handlers
//             setText(t);
//             if (t && t.trim().length > 0) startTyping();
//             else stopTyping();
//           }}
//           // trigger handlers----
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
//   //"fill space" -> stretch/ fill all availble space
//   flex1: {
//     flex: 1,
//   },
// });
// UPDATED w. corerc useEffcet that saves the chat even afetr I leave the page/ tab a-- stores the chat hustory
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  FlatList,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native"; // 👈 needed to run logic when screen gains focus

// Import cusotm hooks for chatScreen
import MessageList from "../components/chatUI/MessageList";
import MessageInput from "../components/chatUI/MessageInput";
import TypingIndicators from "../components/chatUI/TypingIndicators";
import PresenceStatus from "../components/chatUI/PresenceStatus";

// chat + identity
import { useChat } from "../hooks/useChat";
import type { ChatMessage } from "../services/chatDatabase";
import { useIdentity } from "../hooks/useIdentity";

export default function ChatScreen() {
  // 1. get userInfo (id,naem) IF identity ready
  const { userId, userName, ready } = useIdentity();

  // 2. Local input state
  const [text, setText] = useState("");

  // 3. FlatList ref so we can auto-scroll to bottom on new messages
  const listRef = useRef<FlatList<ChatMessage>>(null);

  /**
   * 4) useChat gives us:
   *    - messages: what to render
   *    - typingUsers: who’s typing
   *    - joinRoom/sendMessage/startTyping/stopTyping: actions
   *    - reloadMessages: 👈 NEW helper that re-hydrates history from storage
   *                      when the screen gains focus (so web doesn’t “forget”)
   */
  const {
    messages,
    typingUsers,
    joinRoom,
    sendMessage,
    startTyping,
    stopTyping,
    // NEED to make sure your useChat returns this -- headache@@!!
    reloadMessages,
    // (optional) you can also pull out isLoading if you want a spinner
    // isLoading,
  } = useChat(userId ?? "", userName ?? "Anonymous");

  /**
   * 5) Join a room once identity is ready.
   *    This tells the server which room to target and loads initial history from DB.
   */
  useEffect(() => {
    if (!ready || !userId) return;
    joinRoom("general", "General Chat");
  }, [ready, userId, joinRoom]);

  /**
   * 6) When this screen becomes visible again (after navigating away-and-back),
   *    reload the room’s messages from persistent storage.
   *    This is the key fix for “web loses messages when navigating”.
   */
  useFocusEffect(
    useCallback(() => {
      // If identity/room hasn’t been established yet, do nothing.
      if (!ready || !userId) return;

      // Pull from SQLite (native) or return [] (web) — either way the hook handles it.
      reloadMessages();

      // no cleanup needed; reloadMessages just reads from storage
    }, [ready, userId, reloadMessages])
  );

  /**
   * 7) Whenever messages change, scroll to bottom so the newest are visible.
   *    (Small timeout lets the list finish its layout first.)
   */
  useEffect(() => {
    if (messages.length > 0) {
      const t = setTimeout(
        () => listRef.current?.scrollToEnd({ animated: true }),
        80
      );
      return () => clearTimeout(t);
    }
  }, [messages]);

  /**
   * 8) Send handler: optimistic add + persist + emit are handled in chatService.
   *    We just call it, clear the input, and stop typing.
   */
  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(text.trim());
    setText("");
    stopTyping();
  };

  /** 9) While we’re still figuring out identity, show a spinner */
  if (!ready || !userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
            styles.flex1,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  /** ---------- UI ---------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header: shows room name + a static “online” for now (replace with real counts later) */}
      <PresenceStatus
        roomName="General Chat"
        online={true}
        participantsCount={2}
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
            // As you type, toggle typing indicator
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
  //"fill space" -> stretch/ fill all availble space
  flex1: {
    flex: 1,
  },
});
