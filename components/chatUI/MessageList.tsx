// reusable component --> shows chat meegaes in a list (FlatLsit)
/**Pass props from Chat DB
 * CurrentUSerID: spefcific / unique ID;s to users
 * onEndReached?: callback to Laod older messages when scrollign up
 *
 *  RENDERING USER DATA ------
 */

import React, { forwardRef } from "react";
import { View, Text, FlatList, StyleSheet, ListRenderItem } from "react-native";
// importign the ChatMessage seervice -TYpe logic pass props
import type { ChatMessage } from "../../services/chatDatabase";

//PRops componet will aceppt ----
type Props = {
  // array of mesage from DB
  messages: ChatMessage[];
  // ID of 'logged in" user ----
  currentUserId: string;
  onEndReached?: () => void; //callback whn @ top to laod old mssgs
};

/**
 * forwardRef:
 * We wrap this component in `forwardRef` so the PARENT can directly access
 * FlatList methods. Example: after sending/receiving a msg, parent can call
 * `ref.current?.scrollToEnd()` to scroll to the latest message.
 */

const MessageList = forwardRef<FlatList<ChatMessage>, Props>(
  ({ messages, currentUserId, onEndReached }, ref) => {
    /**
     * renderItem = fcntion--> renders e/a row -> chat list
     * - Decides how each message looks depending on WHO sent it (USer)
     */

    const renderItem: ListRenderItem<ChatMessage> = ({ item }) => {
      // chhecks if messge ==> from curerntUSer (who's is it)
      const isOwn = item.userId === currentUserId;

      /** ---------- UI RENDERING / Layout / Desing  -----  */
      return (
        <View style={[styles.row, isOwn ? styles.alignEnd : styles.alignStart]}>
          {!isOwn && <Text style={styles.sender}>{item.userName}</Text>}
          {/* show render NAME only if not own mmsge */}
          <View
            style={[
              // logx - If/then change color to mat /!match
              styles.bubble,
              isOwn ? styles.bubbleOwn : styles.bubbleOther,
              isOwn ? styles.brOwn : styles.brOther,
            ]}
          >
            {/* Mesage Text .... */}
            <Text style={isOwn ? styles.textOwn : styles.textOther}>
              {item.text}
            </Text>

            {/* metaData for e/a user for real0-time stamp udpate on chat -- */}
            <View style={styles.metaRow}>
              <Text style={isOwn ? styles.metaOwn : styles.metaOther}>
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              {isOwn && (
                // update IF delivered orr NOT --- THE og checkmarks ----
                <Text style={[styles.metaOwn, styles.tick]}>
                  {item.delivered ? "✓✓" : "✓"}
                </Text>
              )}
            </View>
          </View>
        </View>
      );
    };

    return (
      <FlatList
        ref={ref as any} //TS type chcekign
        // we dienfed FlatList as useRef @ parent so we can fetch/callback here
        data={messages} //[] of mesages from props
        keyExtractor={(m) => m.id} //e/a mssg -> unique key
        renderItem={renderItem} //hwo to render e/a mssg row
        contentContainerStyle={styles.listContent} // Styles
        // Laod older comemtns -------
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        style={styles.list}
      />
    );
  }
);

export default MessageList;

/**  UI STYLES ---------------------------------- */
const styles = StyleSheet.create({
  list: { flex: 1, paddingHorizontal: 16 },
  listContent: { paddingVertical: 16 },

  // mesaesges layout
  row: { marginBottom: 12, width: "100%" },
  // Right-own mssges
  alignEnd: { alignItems: "flex-end" },
  // left-received mssges
  alignStart: { alignItems: "flex-start" },

  // received design
  sender: {
    fontSize: 12,

    // color: "red",
    color: "#6B7280",

    marginBottom: 4,
    marginLeft: 8,
  },

  // Messg buble ---:)
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  // Messg Dsings . colors ----
  bubbleOwn: {
    // backgroundColor: "#3B82F6"
    backgroundColor: "green",
  },
  bubbleOther: {
    // backgroundColor: "#E5E7EB"
    backgroundColor: "gold",
  },
  brOwn: { borderBottomRightRadius: 6 },
  brOther: { borderBottomLeftRadius: 6 },

  textOwn: { color: "#FFFFFF", fontSize: 16 },
  textOther: { color: "#1F2937", fontSize: 16 },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  // Light blue metadata
  metaOwn: { fontSize: 12, color: "#DBEAFE" },
  // Grey metadata
  metaOther: { fontSize: 12, color: "#6B7280" },
  tick: { marginLeft: 8 }, // Spacing before ✓/✓✓ ??
});
