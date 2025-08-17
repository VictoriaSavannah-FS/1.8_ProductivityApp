import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  roomName?: string; //2,8 Feature ----
  online: boolean; //connection online/offline
  participantsCount?: number; //#of users online - 2.8 feature
  error?: string | null; //cath errres
};

export default function PresenceStatus({
  // --> default values for props if none are passed in --> fallBackk values
  roomName = "General Chat",
  online,
  participantsCount = 1,
  error,
}: Props) {
  /** ---------- UI RENDERING / Layout / Desing  -----  */
  return (
    <View style={styles.container}>
      {/* Top row->the roomTitle + status dot */}
      <View style={styles.topRow}>
        <Text style={styles.title}>{roomName}</Text>
        {/* StatusDot --> turns green = online |  red=offline */}
        <View
          style={[
            styles.dot,
            { backgroundColor: online ? "#22C55E" : "#EF4444" },
          ]}
        />
      </View>
      {/* Subtitle | TOP --> connectionStAT + #live Users */}
      <Text style={styles.sub}>
        {online ? "Connected" : "Disconnected"} · {participantsCount} online
      </Text>
      {/*  {/* If ->  error => throw in red text */}
      {!!error && <Text style={styles.err}>Error: {error}</Text>}
    </View>
  );
}
/** ---------- UI sTYLES -----  */
const styles = StyleSheet.create({
  // container
  container: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  // lYOUT for top row (title/stats dot)
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  // text
  title: { fontWeight: "600", color: "#1F2937" },
  // stst cirlce
  dot: { width: 10, height: 10, borderRadius: 5 },
  // subText
  sub: { color: "#6B7280", marginTop: 4, fontSize: 12 },
  // erro messge
  err: { color: "#EF4444", marginTop: 6, fontSize: 12 },
});
