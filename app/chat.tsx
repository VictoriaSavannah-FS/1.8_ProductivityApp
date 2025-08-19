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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
//logic when Focus on screen
import { useFocusEffect } from "@react-navigation/native";

//cahtUI imports
import MessageList from "../components/chatUI/MessageList";
import MessageInput from "../components/chatUI/MessageInput";
import TypingIndicators from "../components/chatUI/TypingIndicators";
import PresenceStatus from "../components/chatUI/PresenceStatus";
// -- NEW compoent for chatRoom List
import ChannelList from "../components/chatUI/ChannelList";

// Hooks ---- chat + identity
import { useChat } from "../hooks/useChat";
import type { ChatMessage } from "../services/chatDatabase";
import { useIdentity } from "../hooks/useIdentity";
// Wil create Live caht Stats - user/ connetxted --- 2.8
// import { XX } from "../services/chatService";

export default function ChatScreen() {
  // gets userInfo (id,name) IF identity ready - from userIdentity Hook
  const { userId, userName, ready } = useIdentity();

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
  } = useChat(userId ?? "", userName ?? "Anonymous"); //send user id to back to Hook
  //?-=> if userId || userName = null/undefined --> fallBk deault :Anonymous

  /**
   * Join a default room ==> AFTET once identity is Status : ready.
   * Server => target correct Room
   * Load initial history from DB -- pull msessages
   */
  useEffect(() => {
    if (!ready || !userId) return;
    // Pick a def_ GEn. cahtRoom
    joinRoom("general", "The OG Chat Space 💬");
  }, [ready, userId, joinRoom]);

  /** 2.6 -- PERSISTENCE STORAGE
   *  IF SCREEN == visible again => Laod messgs from stoarge
   *  store/queue offlien messges
   */
  useFocusEffect(
    useCallback(() => {
      if (!ready || !userId) return; // identity not ready yet
      reloadMessages(); // reads from SQLite/Async and sets state
    }, [ready, userId, reloadMessages])
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

  /** ---------- UI ---------- */
  return (
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
        online={true} // need to update w/ dynamic Stat -- 2.8
        // --- need to update wiith Dyanics usser Coutn ----- 2.8
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
