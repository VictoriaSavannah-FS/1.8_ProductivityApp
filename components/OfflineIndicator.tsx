// // 2.4 offline indicator

// import React, { useState, useEffect } from "react";
// import { View, Text, Animated } from "react-native";
// import {
//   connectionManager,
//   ConnectionState,
// } from "../services/connectionManager";
// export const OfflineIndicator: React.FC = () => {
//   const [isOffline, setIsOffline] = useState(false);
//   const [slideAnim] = useState(new Animated.Value(-100));
//   useEffect(() => {
//     const unsubscribe = connectionManager.onConnectionChange((info) => {
//       const shouldShow =
//         info.state === ConnectionState.DISCONNECTED ||
//         info.state === ConnectionState.FAILED ||

//       if (shouldShow !== isOffline) {
//         setIsOffline(shouldShow);

//         Animated.timing(slideAnim, {
//           toValue: shouldShow ? 0 : -100,
//           duration: 300,
//           useNativeDriver: true,
//         }).start();
//       }
//     });
//     return unsubscribe;
//   }, [isOffline, slideAnim]);
//   return (
//     <Animated.View
//       className="absolute top-0 left-0 right-0 bg-red-500 z-50"
//       style={{
//         transform: [{ translateY: slideAnim }],
//       }}
//     >
//       <View className="px-4 py-2 flex-row items-center justify-center">
//         <Text className="text-white text-sm font-medium">
//           📱 No internet connection • Changes will sync when online
//         </Text>
//       </View>
//     </Animated.View>
//   );
// };

// 2.4 updated for stykeesheeets
import React, { useEffect, useState } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import {
  connectionManager,
  ConnectionState,
} from "../services/connectionManager";

/**
 * OfflineIndicator
 * - Shows a red banner at the top when device loses internet
 * - Slides down when offline, slides up when back online
 */
export const OfflineIndicator: React.FC = () => {
  // track whether device is offline or not
  const [isOffline, setIsOffline] = useState(false);
  // creates an animation value that controls slide position
  // starts @ -100px (hidden above the screen) ---- had to look up ----
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // listen for connection changes (connected / disconnected)
    const unsubscribe = connectionManager.onConnectionChange((info) => {
      // check if we should show banner (DISCONNECTED, FAILED, or !online)

      const shouldShow =
        info.state === ConnectionState.DISCONNECTED ||
        info.state === ConnectionState.FAILED ||
        !info.isOnline;
      // only UPDATE if Value CAHNEGD -----
      if (shouldShow !== isOffline) {
        setIsOffline(shouldShow);
        // aniamte banned --> slide DOwn if OFLLINE / UP=>connecte/online
        Animated.timing(slideAnim, {
          toValue: shouldShow ? 0 : -100, //0=visisble/ -100 = hidden** cool!!
          duration: 300, //ani. speed
          useNativeDriver: true, // apparentely better performance----
        }).start();
      }
    });

    // alwaasy gotta clean up those listenrs! @ component unmount
    return unsubscribe;
  }, [isOffline, slideAnim]);
  /** ---------- UI RENDERING / Layout / Desing  -----  */
  return (
    <Animated.View
      // use both static styles + animated transform
      style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
      pointerEvents="none" // let touches -> through if it overlays UI
    >
      <View style={styles.inner}>
        <Text style={styles.text}>
          📱 No internet connection • Changes will sync when online
        </Text>
      </View>
    </Animated.View>
  );
};
/** ---------- UI stles / Layout / Desing  -----  */

const styles = StyleSheet.create({
  // full-width bar pinned to the top of the screen
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ef4444", // red-500
    zIndex: 50, //  always stay above other content
  },
  // inner container w/ padding + centered layout
  inner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  // readable white text =better visibilyt
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
