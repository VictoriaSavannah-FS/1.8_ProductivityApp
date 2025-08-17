import React from "react";
import { View, Text, StyleSheet } from "react-native";

// defeine tppes/values exported
export type TypingUser = { userId: string; userName: string };

// props defiined ---
type Props = {
  typingUsers: TypingUser[]; //[] of TypingUSer objects
};

// ltyping indicators ----
export default function TypingIndicators({
  // type
  typingUsers,
}: Props) {
  // logic - if NO userInput > retyrn null / NO typing ---
  if (!typingUsers || typingUsers.length === 0) return null;

  // define new values and pass to TypingUser[]array w/ new value of userName - seperate w/ ","
  // Build a string of user names separated by commas****
  const names = typingUsers.map((u) => u.userName).join(", ");

  /** ---------- UI RENDERING / Layout / Desing  -----  */
  return (
    //render typing idicatior messge w/ new passed vlues of userNAmee ---
    <View style={[styles.row, styles.alignStart]}>
      <View style={styles.bubble}>
        <Text style={styles.text}>
          {names} {typingUsers.length === 1 ? "is" : "are"} typing...
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
