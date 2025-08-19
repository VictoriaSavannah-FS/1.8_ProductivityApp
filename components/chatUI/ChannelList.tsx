// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   Platform,
// } from "react-native";

// // import { ChatRoom } from "/Users/savannahcv/08 Dev-ConnectedDevices-App/01 Week 1 /ProductivityApp/ProductivityApp/services/chatDatabase";

// import { ChatRoom } from "../../services/chatDatabase";

// // DEfine Props for this sCreen
// type Props = {
//   rooms: ChatRoom[]; // array of cahtRooms
//   currentRoom: string | null; //trck LiveStatus
//   unread: Record<string, number>; //combien Room+ID => unread Counter **
//   //   WHEN USER TAPS ---
//   // cAllBAck Function-->  define what happpnes--> user taps Room -- recieve RoomID and ANme
//   onSelectRoom: (
//     // trypes/what they are --
//     roomId: string,
//     roomName: string
//   ) => void;
// };

// /**Channel List --
//  * REdner Horizonatl Lsit of BUTTONS for e/a Room
//  * Show small UNREAD badge when UNREaD Messgaes exist --> from: unread: Record<string, number>;
//  * --> Code snippet: unread: [roomId] > 0 ]
//  * VISUAL CUE for USer --> Highlight CURRENT ACTIVE/LIVE ROOM
//  * */

// export default function ChannelList({
//   // expoprt Props prev. defined
//   rooms,
//   currentRoom,
//   unread,
//   onSelectRoom,
// }: Props);

// // RENDER e/a Button --> label and Live badge IF LIVE
// // defien the props/varaibles => will be ref. insdie for Render-- type:teypRecived/object
// const renderItem = ({ item }: { item: ChatRoom }) => {
//   // redenr the Live STAT + cooutn badge --_ urnread messgse
//   const isActive = currentRoom === item.id;
//   const count = unread[item.id] ?? 0;

//   //    --------- UI RENDER --------------------
//   return (
//     <TouchableOpacity
//       // type/tyles
//       style={styles.[styles.btn, isActive && styles.btnActive]}
//       onPress={()=>onSelectRoom(item.id, item.name ?? item.id )}

//     >
//       {/* label/tile */}
//       <Text
//       style={[styles.btnTxt, isActive & styles.btnTxtActive]}
//       >
//         {/* passs Props --> IF no name = nulll --> fallbakc to USE ID*/}
//         {item.name ?? item.id}
//       </Text>
//       {/* Only  show this --> when unRead message Exists ELSE - NOT at all  */}
//       {count > 0 && (
//         <View style={styles.badge} >
//             <Text style={styles.badgeTxt}>
//                 {/* if count > 50 => "50+" else || <50 ==> show string(coutn/ actual # -->  */}
//                 {count > 50 ? "50+" : String(count)}
//                 </Text>

//         </View>

//       )}

//     </TouchableOpacity>
//   );
//    //    --------- LIST  UI RENDER --------------------
//    return(
// // redner FlatList adn pass data/prosp to render
//         <View style={styles.listContainer}>

//         < FlatList
//             data={rooms} //pass the rooms [] -> CahtRooms / Props
//             // extrct room id --- REctKey=roomID
//             keyExtractor={(r)=> r.id}
//             // calls fucntion / render e/a room
//             renderItem={renderItem}
//             horizontal //jsut RN featyre -> Horizontal scroooling lsit (deflt_)
//             // l->r instead! cool!
//             showsHorizontalScrollIndicator= {false} //removes inidcator
//             contentContainerStyle={styles.listContent}//jsut style, bro..
//         />
//         </View>
//    );
// };

// // ----- UI sTYLES

// const styles = StyleSheet.create({
// // Lsit ---

//     listContainer: {
//       paddingVertical: 8,
//       borderBottomWidth: StyleSheet.hairlineWidth,
//       borderBottomColor: "#E5E7EB",
//       backgroundColor: "#FFFFFF",
//     },

//     // Lsit contetn
//     listContent: {
//       paddingHorizontal: 12,
//       gap: 8,
//     },
//  //--- buttons - styles --------
//     btn: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: 12,
//       paddingVertical: Platform.OS === "ios" ? 8 : 6,
//       borderRadius: 16,
//       backgroundColor: "#F3F4F6", // gray-100
//       marginRight: 8, // fallback spacing for native (in case gap isn’t supported)
//     },
// // bttn Active
//     btnActive: {
//       backgroundColor: "#1D4ED8", // blue-700
//     },

//     btnTxt: {
//       fontSize: 14,
//       color: "#111827", // gray-900
//     },
//     btnTxtActive: {
//       color: "#FFFFFF",
//       fontWeight: "600",
//     },
//     // unRead badge thingy ----
//     badge: {
//       marginLeft: 8,
//       minWidth: 18,
//       paddingHorizontal: 6,
//       height: 18,
//       borderRadius: 9,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: "#EF4444", // red-500
//     },
//     badgeTxt: {
//       color: "#FFFFFF",
//       fontSize: 12,
//       fontWeight: "700",
//     },

// });

// components/ChannelList.tsx
import React from "react";
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
export default function ChannelList({
  rooms,
  currentRoom,
  unread,
  onSelectRoom,
}: Props) {
  // RENDER e/a Button --> label and Live badge IF LIVE
  // define the props/varaibles => will be ref. inside render
  const renderItem: ListRenderItem<ChatRoom> = ({ item }) => {
    // render the Live STAT + count badge -- unread messages
    const isActive = currentRoom === item.id;
    const count = unread[item.id] ?? 0;

    // --------- UI RENDER --------------------
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.name ?? item.id} channel`}
        // style array: base + conditional active style
        style={[styles.btn, isActive && styles.btnActive]}
        // call parent callback w/ roomId + name ==> else => use id
        onPress={() => onSelectRoom(item.id, item.name ?? item.id)}
      >
        {/* label/tile */}
        <Text style={[styles.btnTxt, isActive && styles.btnTxtActive]}>
          {/* if no name -> fallback to ID */}
          {item.name ?? item.id}
        </Text>

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
        data={rooms} // pass the rooms[] -> ChatRooms / Props
        keyExtractor={(r) => r.id} //get unique key = room.id
        renderItem={renderItem} // calls function / render e/a room
        horizontal // RN feature -> horizontal scrolling list
        showsHorizontalScrollIndicator={false} // removes indicator
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

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
});
