// 2.3 CollabIndicatorrs
// updated to use Styleshsests insttead
// components/PresenceIndicators.tsx
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Participant } from "/Users/savannahcv/08 Dev-ConnectedDevices-App/01 Week 1 /ProductivityApp/ProductivityApp/services/collabServices/collaborativeService";
// import { Participant } from "../services/collaborativeService";

interface PresenceIndicatorsProps {
  participants: Participant[];
  currentUserId: string;
  /** DamrMode -- fe*/
  isDark?: boolean;
}

export const PresenceIndicators: React.FC<PresenceIndicatorsProps> = ({
  participants,
  currentUserId,
  isDark = false,
}) => {
  // filter out curen tuser =>. only show other ACTIVE users - 2.8 feature
  const activeParticipants = participants.filter(
    (p) => p.userId !== currentUserId && p.isActive
  );

  // map userID => AvatarColor =>last digit of ID -> pick color indx
  // pretty cool --- i never thougt about this ...
  const avatarBg = (userId: string) => {
    const colors = [
      "#EF4444", // red-500
      "#3B82F6", // blue-500
      "#22C55E", // green-500
      "#EAB308", // yellow-500
      "#A855F7", // purple-500
      "#EC4899", // pink-500
      "#6366F1", // indigo-500
      "#F59E0B", // orange-500
    ];
    const index = parseInt(userId.slice(-1), 10); //take last char as character
    return colors[isNaN(index) ? 0 : index % colors.length];
  };
  // get useInitials (max 2 letters)
  const getInitials = (userName: string): string =>
    userName
      .trim()
      .split(/\s+/)
      .map((n) => n[0] ?? "")
      .join("")
      .slice(0, 2) //limt to 2 ltters
      .toUpperCase();

  // show fallback card if NO collaborators/ live users - 2.8 feature?
  if (activeParticipants.length === 0) {
    /** ---------- UI RENDERING / Layout / Desing  -----  */

    return (
      <View
        style={[
          styles.card,
          isDark ? styles.cardDarkMuted : styles.cardLightMuted,
          styles.p3,
          styles.mb4,
        ]}
      >
        <Text
          style={[
            styles.textSm,
            isDark ? styles.textGray400 : styles.textGray600,
            styles.textCenter,
          ]}
        >
          It's lonely in here... looks like you're working alone...
        </Text>
      </View>
    );
  }

  /** ---------- UI RENDERING / Layout / Desing  -----  */

  return (
    <View
      style={[
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        styles.p4,
        styles.mb4,
        styles.border,
        isDark ? styles.borderGray700 : styles.borderGray200,
      ]}
    >
      {/* header */}
      <View
        style={[
          styles.row,
          styles.itemsCenter,
          styles.justifyBetween,
          styles.mb3,
        ]}
      >
        <Text
          style={[
            styles.fontSemibold,
            isDark ? styles.textWhite : styles.textGray800,
          ]}
        >
          Active Collaborators
        </Text>
        {/* online coutn */}
        <View style={[styles.row, styles.itemsCenter]}>
          <View
            style={[
              styles.dot,
              { backgroundColor: "#22C55E" }, // green-500
              styles.mr2,
            ]}
          />
          <Text
            style={[
              styles.textSm,
              isDark ? styles.textGray400 : styles.textGray600,
            ]}
          >
            {activeParticipants.length} online
          </Text>
        </View>
      </View>

      {/* avatars -row ---*/}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.row]}>
          {activeParticipants.map((p, i) => (
            <View
              key={p.userId}
              style={[
                styles.itemsCenter,
                i < activeParticipants.length - 1 && styles.mr3,
              ]}
            >
              <View
                style={[
                  styles.avatar,
                  styles.roundedFull,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.mb1,
                  { backgroundColor: avatarBg(p.userId) },
                ]}
              >
                <Text
                  style={[styles.textWhite, styles.fontSemibold, styles.textSm]}
                >
                  {getInitials(p.userName)}
                </Text>
              </View>
              {/* userNAmes */}
              <Text
                numberOfLines={1}
                style={[
                  styles.textXs,
                  isDark ? styles.textGray400 : styles.textGray600,
                  styles.maxW64,
                  styles.textCenter,
                ]}
              >
                {p.userName}
              </Text>
              {/* last Active TIme---  */}
              <Text
                style={[
                  styles.textXs,
                  isDark ? styles.textGray500 : styles.textGray400,
                ]}
              >
                {new Date(p.lastActivity).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // layout helpers
  row: { flexDirection: "row" },
  itemsCenter: { alignItems: "center" },
  justifyBetween: { justifyContent: "space-between" },
  justifyCenter: { justifyContent: "center" },
  textCenter: { textAlign: "center" },

  // spacers
  p3: { padding: 12 },
  p4: { padding: 16 },
  mb1: { marginBottom: 4 },
  mb3: { marginBottom: 12 },
  mb4: { marginBottom: 16 },
  mr2: { marginRight: 8 },
  mr3: { marginRight: 12 },

  // cards (light/dark)
  card: { borderRadius: 12 },
  cardLight: { backgroundColor: "#FFFFFF" },
  cardDark: { backgroundColor: "#1F2937" }, // gray-800
  cardLightMuted: { backgroundColor: "#F3F4F6" }, // gray-100
  cardDarkMuted: { backgroundColor: "#1F2937" }, // gray-800

  // borders
  border: { borderWidth: 1 },
  borderGray200: { borderColor: "#E5E7EB" },
  borderGray700: { borderColor: "#374151" },

  // text
  fontSemibold: { fontWeight: "600" },
  textWhite: { color: "#FFFFFF" },
  textGray800: { color: "#1F2937" },
  textGray600: { color: "#4B5563" },
  textGray500: { color: "#6B7280" },
  textGray400: { color: "#9CA3AF" },
  textSm: { fontSize: 14 },
  textXs: { fontSize: 12 },

  // misc
  dot: { width: 8, height: 8, borderRadius: 4 },
  avatar: { width: 40, height: 40 },
  roundedFull: { borderRadius: 9999 },
  maxW64: { maxWidth: 64 },
});
