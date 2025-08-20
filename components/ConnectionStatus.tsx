// 2.4 updated for offline support

// components/ConnectionStatus.tsx

import React, { useEffect, useState, memo } from "react"; // <-- add memo so we can export a memoized default
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import {
  connectionManager,
  ConnectionState,
  type ConnectionInfo,
  type QueuedOperation,
} from "../services/connectionManager";

/**
 * ConnectionStatus
 * Shows current connection state for the app:
 *  - Green ==> connected
 *  - Yellow => connecting/reconnecting
 *  - Red=> offline/disconnected
 *
 * Users => tap to expand → see more details (latency, last connected time, queued actions).
 * Includes a "Retry" button if the connection is broken.
 */

// NOTE: keep named export for flexibility if you're importing by name somewhere
export const ConnectionStatus: React.FC = () => {
  // Track current connection state (online/offline, latency, etc.)
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(
    connectionManager.getConnectionInfo() // start with snapshot from service
  );

  // Track any queued operations (things waiting to sync when back online)
  const [queuedOps, setQueuedOps] = useState<QueuedOperation[]>(
    connectionManager.getQueue ? connectionManager.getQueue() : []
  );

  // Track if the card is "expanded" / "collapsed" (summary only)
  const [isExpanded, setIsExpanded] = useState(false); //shows details

  // Animation value ->>fade card briefly whenever connection state changes
  const [fadeAnim] = useState(new Animated.Value(1));

  // Subscribe to changes from connectionManager
  useEffect(() => {
    // <-- guards in case these listeners are not implemented on a platform/mock
    const offConn =
      connectionManager.onConnectionChange?.(setConnectionInfo) ?? (() => {});
    const offQueue =
      connectionManager.onQueueChange?.(setQueuedOps) ?? (() => {});
    // cleanup when component unmounts
    return () => {
      offConn();
      offQueue();
    };
  }, []);

  // Flash animation whenever state flip
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [connectionInfo.state, fadeAnim]);

  // Pick background + dot colors based => current state
  const boxColors = (() => {
    switch (connectionInfo.state) {
      case ConnectionState.CONNECTED:
        return {
          // green/conncted
          box: styles.bgGreen,
          border: styles.borderGreen,
          dot: styles.dotGreen,
        };
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return {
          // yello->reconnecting
          box: styles.bgYellow,
          border: styles.borderYellow,
          dot: styles.dotYellow,
        };
      case ConnectionState.DISCONNECTED:
      case ConnectionState.FAILED:
        return {
          // red:notConnected
          box: styles.bgRed,
          border: styles.borderRed,
          dot: styles.dotRed,
        };
      default:
        return {
          box: styles.bgGray,
          border: styles.borderGray,
          dot: styles.dotGray,
        };
    }
  })();

  // Text shown under "Real-Time Status"
  const statusText = (() => {
    switch (connectionInfo.state) {
      case ConnectionState.CONNECTED:
        return queuedOps.length > 0
          ? `Connected • ${queuedOps.length} pending`
          : "Connected • Live sync active";
      case ConnectionState.CONNECTING:
        return "Connecting...";
      case ConnectionState.RECONNECTING:
        return `Reconnecting… (attempt ${connectionInfo.reconnectAttempt + 1})`;
      case ConnectionState.DISCONNECTED:
        return connectionInfo.isOnline ? "Disconnected" : "Offline";
      case ConnectionState.FAILED:
        return "Connection failed";
      default:
        return "Unknown status";
    }
  })();

  // Quick emoji indicator // might changes these --- idk yet. green
  const statusIcon =
    connectionInfo.state === ConnectionState.CONNECTED
      ? "🟢"
      : connectionInfo.state === ConnectionState.CONNECTING ||
        connectionInfo.state === ConnectionState.RECONNECTING
      ? "🟡"
      : connectionInfo.state === ConnectionState.DISCONNECTED ||
        connectionInfo.state === ConnectionState.FAILED
      ? "🔴"
      : "⚪";

  // Retry button action
  const handleRetry = () => {
    try {
      connectionManager.connect?.(); // <-- optional chaining so it won’t crash in mocks
    } catch {}
  };

  // Turn raw number latency ==> friendly text / convert
  // had to loook this up -- idk
  const formatLatency = (lat?: number) => {
    if (!lat && lat !== 0) return "Unknown";
    if (lat < 100) return `${lat}ms (Excellent)`;
    if (lat < 300) return `${lat}ms (Good)`;
    if (lat < 1000) return `${lat}ms (Fair)`;
    return `${lat}ms (Poor)`;
  };

  /** ---------- UI RENDERING / Layout / Desing  -----  */
  return (
    // Wrap with animated opacity (so it flashes on state changes)
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsExpanded((v) => !v)} // tap => expand/collapse
        style={[styles.card, boxColors.box, boxColors.border]}
      >
        {/* Header row (icon + text + retry button) */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.icon}>{statusIcon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Real-Time Status</Text>
              <Text style={styles.subtitle}>{statusText}</Text>
            </View>
          </View>

          {/* Retry only shows when disconnected/failed */}
          {(connectionInfo.state === ConnectionState.DISCONNECTED ||
            connectionInfo.state === ConnectionState.FAILED) && (
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Small dot in top-right corner */}
        <View style={[styles.statusDot, boxColors.dot]} />

        {/* Extra details (only when expanded) */}
        {isExpanded && (
          <View style={styles.details}>
            {/* Online/offline status */}
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Network</Text>
              <Text style={styles.detailVal}>
                {connectionInfo.isOnline ? "Online" : "Offline"}
              </Text>
            </View>

            {/* Latency (only if provided by connectionManager) */}
            {"latency" in connectionInfo && connectionInfo.latency != null && (
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Latency</Text>
                <Text style={styles.detailVal}>
                  {formatLatency(connectionInfo.latency)}
                </Text>
              </View>
            )}

            {/* Last time we were connected+MetaDAta */}
            {connectionInfo.lastConnected && (
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Last Connected</Text>
                <Text style={styles.detailVal}>
                  {connectionInfo.lastConnected.toLocaleTimeString()}
                </Text>
              </View>
            )}

            {/* Show queued operations ==> things waiting to sync */}
            {queuedOps.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.pendingTitle}>Pending Operations</Text>
                {queuedOps.slice(0, 3).map((op) => (
                  <Text key={op.id} style={styles.pendingItem}>
                    • {op.operation.type} (retry {op.retryCount}/{op.maxRetries}
                    )
                  </Text>
                ))}
                {/* If more than 3 queued, show "...and more" */}
                {queuedOps.length > 3 && (
                  <Text style={styles.pendingMore}>
                    …and {queuedOps.length - 3} more
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// DEFAULT EXPORT (memoized) so you can `import ConnectionStatus from "..."`
export default memo(ConnectionStatus); // <-- this is the main fix for import mismatches

/** ---------- UI STYLES Layout / Desing  -----  */
const styles = StyleSheet.create({
  // Card container
  card: {
    position: "relative",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },

  // Header row (status icon, title, text, retry)
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  icon: { fontSize: 18, marginRight: 8 },
  title: { fontWeight: "600", color: "#111827", marginBottom: 2 },
  subtitle: { color: "#4B5563", fontSize: 13 },

  // Top-right colored dot
  statusDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Retry button styling
  retryBtn: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  retryBtnText: { color: "white", fontWeight: "600", fontSize: 12 },

  // Expanded details block
  details: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailKey: { color: "#6B7280", fontSize: 13 },
  detailVal: { color: "#111827", fontSize: 13 },

  // Pending operations list
  pendingTitle: {
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    fontSize: 13,
  },
  pendingItem: { color: "#4B5563", fontSize: 12 },
  pendingMore: { color: "#6B7280", fontSize: 12 },

  // Background / BTNS STATS conection -----
  bgGreen: { backgroundColor: "#DCFCE7" }, // green-100
  borderGreen: { borderColor: "#BBF7D0" },
  dotGreen: { backgroundColor: "#22C55E" },

  bgYellow: { backgroundColor: "#FEF9C3" }, // yellow-100
  borderYellow: { borderColor: "#FDE68A" },
  dotYellow: { backgroundColor: "#F59E0B" },

  bgRed: { backgroundColor: "#FEE2E2" }, // red-100
  borderRed: { borderColor: "#FCA5A5" },
  dotRed: { backgroundColor: "#EF4444" },

  bgGray: { backgroundColor: "#F3F4F6" }, // gray-100
  borderGray: { borderColor: "#E5E7EB" },
  dotGray: { backgroundColor: "#9CA3AF" },
});
