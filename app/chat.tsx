import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  FlatList,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import cusotm hooks for chatScreen
import MessageList from "../components/chatUI/MessageList";
import MessageInput from "../components/chatUI/MessageInput";
import TypingIndicators from "../components/chatUI/TypingIndicators";
import PresenceStatus from "../components/chatUI/PresenceStatus";

// hooks for chat+Stastus idicators
import { useChat } from "../hooks/useChat";
import type { ChatMessage } from "../services/chatDatabase";
import { useIdentity } from "../hooks/useIdentity";

export default function ChatScreen() {
  // get userInfo (id,naem) IF identity ready
  const { userId, userName, ready } = useIdentity();
  // stete formessge inputText
  const [text, setText] = useState("");
  // FlatList -> userRef -> references lsit so we can scrool
  const listRef = useRef<FlatList<ChatMessage>>(null);

  /** useChat Hook
   * Gives all chat features
   * provides cchat data
   * messg in chat
   * typingUsers:which usesr is Typing
   * joinRoom: fuction to joim chat room (WILL NEED UPDATE THIS for CHAT ROOM FEATURES)
   * sendMEsage: fucntion -> ensd meassage
   * startTuping: function trigegrs to show status of "I'm tyoping.."
   * stopTyping: "fuction to trigger/stop typing + alert..
   * */
  const {
    messages,
    typingUsers,
    joinRoom,
    sendMessage,
    startTyping,
    stopTyping,
  } = useChat(userId ?? "", userName ?? "Anonymous"); //tager userID for userNaem of not deafult -> Anonymous name

  // whenuser identity => READY -> Join general chat room
  useEffect(() => {
    // wait for Identiy
    if (!ready) return;
    // if ready -> add user to general Caht
    joinRoom("general", "General Chat");
  }, [ready, joinRoom]); //

  // e/a time "messages change" -->  auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages]); // fetch new mesasges

  // SEND HANDLER ----
  const handleSend = async () => {
    // if NO text --> don't send
    if (!text.trim()) return;
    // send chat through useChat --
    await sendMessage(text.trim());
    setText(""); //clear input lsit e/a time
    stopTyping(); // reset user to not typign
  };

  // WAiting for User Identity to be ready ^^^ useIdentity()
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
  /** ---------- UI RENDERING / Layout / Desing  -----  */
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Sho Room name + # Users live  */}
      <PresenceStatus
        roomName="General Chat"
        online={true}
        participantsCount={2} //need up make dynamic to reflect users ***
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        {/* makes sure keyboard doesn’t cover input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex1}
        ></KeyboardAvoidingView>
        {/* RENDER actul Chat mesages  */}
        <View style={styles.flex1}>
          <MessageList
            ref={listRef}
            messages={messages as ChatMessage[]}
            currentUserId={userId}
          />
        </View>
        {/* shows "UserX..." whn typeig  */}
        <TypingIndicators typingUsers={typingUsers} />
        {/* Input section / text input and sedn bttn for mssgse  */}
        <MessageInput
          value={text}
          onChangeText={(t) => {
            // when typeing tigger stop/startTypign handlers
            setText(t);
            if (t && t.trim().length > 0) startTyping();
            else stopTyping();
          }}
          // trigger handlers----
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
