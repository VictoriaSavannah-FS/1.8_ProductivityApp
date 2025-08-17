import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

// Props=> "input" needs
type Props = {
  value: string; //curernt text in input
  onChangeText: (t: string) => void; //fuction -> updates text
  onSend: () => void; //fucntion when "send" bttn pressed
  onStartTyping?: () => void; //when user types
  onStopTyping?: () => void; //user stops typing
};

export default function MessageInput({
  value,
  onChangeText,
  onSend,
  onStartTyping,
  onStopTyping,
}: Props) {
  // only values neeededd (gets rid of spaces) -> send bttn logix
  const trimmed = value.trim();

  /** ---------- UI RENDERING / Layout / Desing  -----  */
  return (
    // rendering and passign props
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {/* text/ input fields-- */}
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          value={value}
          //   onChange -> actio/logic
          onChangeText={(t) => {
            // update text on trigger
            onChangeText(t); //trigger
            if (t.length > 0) onStartTyping?.();
            else onStopTyping?.();
          }}
          onBlur={onStopTyping}
          multiline
          maxLength={1000}
        />
        {/* Sedn button */}
        <TouchableOpacity
          style={[styles.sendBtn, !trimmed && styles.sendBtnDisabled]}
          onPress={onSend}
          disabled={!trimmed}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
/**  UI STYLES ---------------------------------- */
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  // input.button layotu
  row: { flexDirection: "row", alignItems: "flex-end" },

  //  textinput layout design....
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#F3F4F6",
    color: "#111827",
  },
  // Sedn btnn-----
  sendBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { backgroundColor: "#9CA3AF" },
  sendText: { color: "#FFFFFF", fontWeight: "600", paddingHorizontal: 4 },
});
