import React from "react";
import { View, Text, StyleSheet } from "react-native";

// defeine tppes/values exported
export type TypingUser = { userId: string; userName: string };

// props defiined ---
type Props = {
  typingUsers: TypingUser[]; //[] of TypingUSer objects
  currentUserId?: string;
};

// ltyping indicators ----
export default function TypingIndicators({
  // type
  typingUsers,
  currentUserId,
}: Props) {
  // logic - if NO userInput > retyrn null / NO typing ---
  if (!typingUsers || typingUsers.length === 0) return null;

  // filter out the current user so you don't see "You are typing..."
  const others = typingUsers.filter((u) => u.userId !== currentUserId);

  // if filtering leaves nothing, show nothing
  if (others.length === 0) return null;

  // define new values and pass to TypingUser[]array w/ new value of userName - seperate w/ ","
  // Build a string of user names separated by commas****
  // - dedupe names just in case the same user fires multiple events
  const uniqueNames = Array.from(
    new Set(others.map((u) => (u.userName || "Someone").trim()))
  );
  const names = uniqueNames.join(", ");

  const verb = uniqueNames.length === 1 ? "is" : "are";

  /** ---------- UI RENDERING / Layout / Desing  -----  */
  return (
    //render typing idicatior messge w/ new passed vlues of userNAmee ---
    <View style={[styles.row, styles.alignStart]}>
      <View style={styles.bubble}>
        <Text style={styles.text}>
          {names} {verb} typing...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // full width row+bottom spacing
  row: { marginBottom: 12, width: "100%" },
  // bbule @ left---
  alignStart: { alignItems: "flex-start" },

  //  cahtBubble LAyout / design
  bubble: {
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: "75%",
  },
  // textStyle
  text: { color: "#4B5563", fontSize: 14 },
});
