// // components/ChannelList.tsx
// // import React {memo, useCallback} from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   Platform,
//   ListRenderItem,
// } from "react-native";
// import { ChatRoom } from "../../services/chatDatabase";
// import { memo, useCallback } from "react";

// // DEfine Props for this sCreen
// type Props = {
//   rooms: ChatRoom[]; // array of cahtRooms
//   currentRoom: string | null; // trck LiveStatus
//   unread: Record<string, number>; // combine RoomID => unread Counter **
//   // WHEN USER TAPS ---sa
//   // cAllBAck Function-->  define what happpnes--> user taps Room -- recieve RoomID and ANme
//   onSelectRoom: (roomId: string, roomName: string) => void; // returns nothing (void)
// };

// /** Channel List --
//  * Render Horizontal List of BUTTONS for e/a Room
//  * Show small UNREAD badge when UNREaD Messgaes exist --> from: unread: Record<string, number>;
//  * VISUAL CUE for USer --> Highlight CURRENT ACTIVE/LIVE ROOM
//  */
// export default function ChannelList({
//   rooms,
//   currentRoom,
//   unread,
//   onSelectRoom,
// }: Props) {
//   // Prevent unnecessary re-joins of the same room
//   const handlePress = useCallback(
//     (roomId: string, roomName?: string) => {
//       if (currentRoom === roomId) return; // <-- ADD: no-op if already active
//       onSelectRoom(roomId, roomName ?? roomId);
//     },
//     [currentRoom, onSelectRoom]
//   );

//   // RENDER e/a Button --> label and Live badge IF LIVE
//   // define the props/varaibles => will be ref. inside render
//   const renderItem: ListRenderItem<ChatRoom> = ({ item }) => {
//     // render the Live STAT + count badge -- unread messages
//     const isActive = currentRoom === item.id;
//     const count = unread[item.id] ?? 0;

//     // update! RENDER & Pass the LIVE users Count @ Rooms
//     const onlineCount = Array.isArray(item.participants)
//       ? item.participants.length
//       : 0; // start@0

//     // --------- UI RENDER --------------------
//     return (
//       <TouchableOpacity
//         accessibilityRole="button"
//         accessibilityLabel={`Open ${item.name ?? item.id} channel`}
//         // style array: base + conditional active style
//         style={[styles.btn, isActive && styles.btnActive]}
//         // call parent callback w/ roomId + name ==> else => use id
//         onPress={() => onSelectRoom(item.id, item.name ?? item.id)}
//       >
//         {/* label/tile */}
//         <Text style={[styles.btnTxt, isActive && styles.btnTxtActive]}>
//           {/* if no name -> fallback to ID */}
//           {item.name ?? item.id}
//         </Text>

//         {/* NEW: LIVE => online count dot (UI-only) -> rendr live user/perRoom */}
//         {onlineCount > 0 && (
//           <View style={styles.dotWrap}>
//             <View style={styles.dot} />
//             <Text
//               style={[styles.onlineTxt, isActive && styles.onlineTxtActive]}
//             >
//               {onlineCount}
//             </Text>
//           </View>
//         )}

//         {/* Only show badge when UNREAD messages exist */}
//         {count > 0 && (
//           <View style={styles.badge}>
//             <Text style={styles.badgeTxt}>
//               {/* if count > 50 => "50+" else show actual number */}
//               {count > 50 ? "50+" : String(count)}
//             </Text>
//           </View>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   // --------- LIST  UI RENDER --------------------
//   return (
//     // render FlatList and pass data/props to render
//     <View style={styles.listContainer}>
//       <FlatList
//         data={rooms} // pass the rooms[] -> ChatRooms / Props
//         keyExtractor={(r) => r.id} //get unique key = room.id
//         renderItem={renderItem} // calls function / render e/a room
//         horizontal // RN feature -> horizontal scrolling list
//         showsHorizontalScrollIndicator={false} // removes indicator
//         contentContainerStyle={styles.listContent}
//       />
//     </View>
//   );
// }

// // ----- UI sTYLES
// const styles = StyleSheet.create({
//   // List ---
//   listContainer: {
//     paddingVertical: 8,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderBottomColor: "#E5E7EB",
//     backgroundColor: "#FFFFFF",
//   },

//   // List content
//   listContent: {
//     paddingHorizontal: 12,
//     // web
//     gap: 8,
//     // ioS
//     marginRight: 8,
//   },

//   // --- buttons - styles --------
//   btn: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: Platform.OS === "ios" ? 8 : 6,
//     borderRadius: 16,
//     backgroundColor: "#F3F4F6", // gray-100
//     // fallback spacing for native
//     //gap => web
//     marginRight: 8,
//   },

//   // button Active
//   btnActive: {
//     backgroundColor: "#1D4ED8", // blue-700
//   },

//   btnTxt: {
//     fontSize: 14,
//     color: "#111827", // gray-900
//   },

//   btnTxtActive: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//   },

//   // unRead badge thingy ----
//   badge: {
//     marginLeft: 8,
//     minWidth: 18,
//     paddingHorizontal: 6,
//     height: 18,
//     borderRadius: 9,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#EF4444", // red-500
//   },

//   badgeTxt: {
//     color: "#FFFFFF",
//     fontSize: 12,
//     fontWeight: "700",
//   },

//   // --- LIVE USERS STATS---
//   //  small dot + number cluster
//   dotWrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginLeft: 8,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: "#10B981", // teal-500
//     marginRight: 4,
//   },
//   onlineTxt: {
//     fontSize: 12,
//     color: "#374151", // gray-700
//     fontWeight: "600",
//   },
//   onlineTxtActive: {
//     color: "#FFFFFF",
//   },
// });

// components/ChannelList.tsx
import React, { memo, useCallback } from "react"; // <-- FIX: correct React import (and include memo,useCallback once)
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  ListRenderItem,
} from "react-native";
import { ChatRoom } from "../../services/chatDatabase";

// DEfine Props for this sCreen
type Props = {
  rooms: ChatRoom[]; // array of cahtRooms
  currentRoom: string | null; // trck LiveStatus
  unread: Record<string, number>; // combine RoomID => unread Counter **
  // WHEN USER TAPS ---
  // cAllBAck Function-->  define what happpnes--> user taps Room -- recieve RoomID and ANme
  onSelectRoom: (roomId: string, roomName: string) => void; // returns nothing (void)
};

/** Channel List --
 * Render Horizontal List of BUTTONS for e/a Room
 * Show small UNREAD badge when UNREaD Messgaes exist --> from: unread: Record<string, number>;
 * VISUAL CUE for USer --> Highlight CURRENT ACTIVE/LIVE ROOM
 */
function ChannelList({ rooms, currentRoom, unread, onSelectRoom }: Props) {
  // Prevent unnecessary re-joins of the same room
  const handlePress = useCallback(
    (roomId: string, roomName?: string) => {
      if (currentRoom === roomId) return; // <-- no-op if already active
      onSelectRoom(roomId, roomName ?? roomId);
    },
    [currentRoom, onSelectRoom]
  );

  // RENDER e/a Button --> label and Live badge IF LIVE
  // define the props/varaibles => will be ref. inside render
  const renderItem: ListRenderItem<ChatRoom> = ({ item }) => {
    // render the Live STAT + count badge -- unread messages
    const isActive = currentRoom === item.id;
    const count = unread[item.id] ?? 0;

    // update! RENDER & Pass the LIVE users Count @ Rooms
    const onlineCount = Array.isArray(item.participants)
      ? item.participants.length
      : 0; // start@0

    // --------- UI RENDER --------------------
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.name ?? item.id} channel`}
        // style array: base + conditional active style
        style={[styles.btn, isActive && styles.btnActive]}
        // call parent callback w/ roomId + name ==> else => use id
        // onPress={() => onSelectRoom(item.id, item.name ?? item.id)} // <-- OLD
        onPress={() => handlePress(item.id, item.name)} // <-- USE handlePress to avoid re-join
      >
        {/* label/tile */}
        <Text style={[styles.btnTxt, isActive && styles.btnTxtActive]}>
          {/* if no name -> fallback to ID */}
          {item.name ?? item.id}
        </Text>

        {/* NEW: LIVE => online count dot (UI-only) -> rendr live user/perRoom */}
        {onlineCount > 0 && (
          <View style={styles.dotWrap}>
            <View style={styles.dot} />
            <Text
              style={[styles.onlineTxt, isActive && styles.onlineTxtActive]}
            >
              {onlineCount}
            </Text>
          </View>
        )}

        {/* Only show badge when UNREAD messages exist */}
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>
              {/* if count > 50 => "50+" else show actual number */}
              {count > 50 ? "50+" : String(count)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // --------- LIST  UI RENDER --------------------
  return (
    // render FlatList and pass data/props to render
    <View style={styles.listContainer}>
      <FlatList
        data={rooms || []} // pass the rooms[] -> ChatRooms / Props  // <-- guard against undefined
        keyExtractor={(r) => r.id} //get unique key = room.id
        renderItem={renderItem} // calls function / render e/a room
        horizontal // RN feature -> horizontal scrolling list
        showsHorizontalScrollIndicator={false} // removes indicator
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

export default memo(ChannelList); // <-- memo to avoid re-renders when props unchanged

// ----- UI sTYLES
const styles = StyleSheet.create({
  // List ---
  listContainer: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },

  // List content
  listContent: {
    paddingHorizontal: 12,
    // web
    gap: 8,
    // ioS
    marginRight: 8,
  },

  // --- buttons - styles --------
  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 8 : 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6", // gray-100
    // fallback spacing for native
    //gap => web
    marginRight: 8,
  },

  // button Active
  btnActive: {
    backgroundColor: "#1D4ED8", // blue-700
  },

  btnTxt: {
    fontSize: 14,
    color: "#111827", // gray-900
  },

  btnTxtActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // unRead badge thingy ----
  badge: {
    marginLeft: 8,
    minWidth: 18,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444", // red-500
  },

  badgeTxt: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // --- LIVE USERS STATS---
  //  small dot + number cluster
  dotWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981", // teal-500
    marginRight: 4,
  },
  onlineTxt: {
    fontSize: 12,
    color: "#374151", // gray-700
    fontWeight: "600",
  },
  onlineTxtActive: {
    color: "#FFFFFF",
  },
});
