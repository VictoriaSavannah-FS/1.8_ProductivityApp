// import React from "react";
// import { View, Text } from "react-native";
// interface TaskSyncStatusProps {
//   syncStatus: "synced" | "pending" | "failed" | "conflict";
//   size?: "small" | "normal";
// }
// export const TaskSyncStatus: React.FC<TaskSyncStatusProps> = ({
//   syncStatus,
//   size = "normal",
// }) => {
//   const getStatusInfo = () => {
//     switch (syncStatus) {
//       case "synced":
//         return {
//           icon: "✅",
//           text: "Synced",
//           color: "text-green-600 dark:text-green-400",
//         };
//       case "pending":
//         return {
//           icon: "⏳",
//           text: "Syncing...",
//           color: "text-yellow-600 dark:text-yellow-400",
//         };
//       case "failed":
//         return {
//           icon: "❌",
//           text: "Sync failed",
//           color: "text-red-600 dark:text-red-400",
//         };
//       case "conflict":
//         return {
//           icon: "⚠️",
//           text: "Conflict",
//           color: "text-orange-600 dark:text-orange-400",
//         };
//       default:
//         return {
//           icon: "❓",
//           text: "Unknown",
//           color: "text-gray-600 dark:text-gray-400",
//         };
//     }
//   };
//   const info = getStatusInfo();
//   const textSize = size === "small" ? "text-xs" : "text-sm";
//   return (
//     <View className="flex-row items-center">
//       <Text className={`${textSize} mr-1`}>{info.icon}</Text>
//       <Text className={`${textSize} ${info.color}`}>{info.text}</Text>
//     </View>
//   );
// };

// 2.4 Converrrted to StyleSheet
import React from "react";
import { View, Text, StyleSheet } from "react-native";

/** Define the props->Input->  component can receive
 * syncStatus = the current status of syncing
 * size = optional size for text ("small" or "normal") */

interface TaskSyncStatusProps {
  syncStatus: "synced" | "pending" | "failed" | "conflict";
  size?: "small" | "normal";
}

// Cmponent ==>that shows sync status
export const TaskSyncStatus: React.FC<TaskSyncStatusProps> = ({
  syncStatus,
  size = "normal",
}) => {
  // helper function => based on syncStatus value defiend @ top
  // return an "info object" (emoji/text/ style color)
  const getStatusInfo = () => {
    switch (syncStatus) {
      case "synced":
        return {
          icon: "✅",
          text: "Synced",
          color: styles.synced, //green
        };
      case "pending":
        return {
          icon: "⏳",
          text: "Syncing...",
          color: styles.pending, //yellow
        };
      case "failed":
        return {
          icon: "❌",
          text: "Sync failed",
          color: styles.failed, //red
        };
      case "conflict":
        return {
          icon: "⚠️",
          text: "Conflict",
          color: styles.conflict,
        };
      // fallback ->> IF unexpected value comes in
      default:
        return {
          icon: "❓",
          text: "Unknown",
          color: styles.unknown,
        };
    }
  };
  // Call helper==> get back the info object
  const info = getStatusInfo();
  const textSize = size === "small" ? styles.textSmall : styles.textNormal;

  /** ---------- UI RENDERING / Layout / Desing  -----  */
  return (
    // Outer container==> puts icon/text ==> horix. row
    <View style={styles.container}>
      {/* Emoji icon  w/ r-margin */}
      <Text style={[textSize, styles.icon]}>{info.icon}</Text>
      {/* Status text w/ matching color */}
      <Text style={[textSize, info.color]}>{info.text}</Text>
    </View>
  );
};
/** ---------- UI stles / Layout / Desing  -----  */
const styles = StyleSheet.create({
  container: {
    flexDirection: "row", //el @ sideby Side
    alignItems: "center", //vErt. align
  },

  icon: {
    marginRight: 4,
  },
  // smallTxt
  textSmall: {
    fontSize: 12,
  },
  // nrmlTxt

  textNormal: {
    fontSize: 14,
  },
  // STATS layotu /colro
  synced: {
    color: "#16a34a", // green-600
  },
  pending: {
    color: "#ca8a04", // yellow-600
  },
  failed: {
    color: "#dc2626", // red-600
  },
  conflict: {
    color: "#ea580c", // orange-600
  },
  unknown: {
    color: "#4b5563", // gray-600
  },
});
