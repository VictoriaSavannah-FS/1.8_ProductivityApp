// import { useEffect, useState, useCallback } from "react";
// import { socketService } from "../services/socketService";
// export interface UseSocketReturn {
//   isConnected: boolean;
//   connectionError: string | null;
//   emit: (event: string, data?: any) => void;
//   lastPong: Date | null;
// }
// export const useSocket = (): UseSocketReturn => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectionError, setConnectionError] = useState<string | null>(null);
//   const [lastPong, setLastPong] = useState<Date | null>(null);
//   useEffect(() => {
//     // Connect when hook mounts
//     socketService.connect();
//     // Set up event listeners
//     socketService.on("connect", () => {
//       setIsConnected(true);
//       setConnectionError(null);
//     });
//     socketService.on("disconnect", () => {
//       setIsConnected(false);
//     });
//     socketService.on("connect_error", (error: any) => {
//       setConnectionError(error.message);
//       setIsConnected(false);
//     });
//     socketService.on("connection_confirmed", (data: any) => {
//       console.log("Connection confirmed:", data);
//     });
//     socketService.on("pong", (data: any) => {
//       setLastPong(new Date(data.serverTimestamp));
//     });
//     // Cleanup on unmount
//     return () => {
//       socketService.disconnect();
//     };
//   }, []);
//   const emit = useCallback((event: string, data?: any) => {
//     socketService.emit(event, data);
//   }, []);
//   return {
//     isConnected,
//     connectionError,
//     emit,
//     lastPong,
//   };
// };
// new updateed changes after IOS kept sayinh ==> DISCONNECTED
// hooks/useSocket.ts
import { useEffect, useState, useCallback } from "react";
import { socketService } from "../services/socketService";

export interface UseSocketReturn {
  isConnected: boolean;
  connectionError: string | null;
  emit: (event: string, data?: any) => void;
  lastPong: Date | null;
}

export const useSocket = (): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(
    socketService.isConnected()
  );
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastPong, setLastPong] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;

    // make sure we're connected (no-op if already connected)
    socketService.ensureConnected().catch(() => {
      /* ignore */
    });

    // sync initial state in case we attached after connect
    setIsConnected(socketService.isConnected());

    const handleConnect = () => mounted && setIsConnected(true);
    const handleDisconnect = () => mounted && setIsConnected(false);
    const handleError = (err: any) =>
      mounted &&
      (setConnectionError(err?.message ?? "error"), setIsConnected(false));
    const handlePong = (data: any) =>
      mounted && setLastPong(new Date(data.serverTimestamp));

    socketService.on("connect", handleConnect);
    socketService.on("disconnect", handleDisconnect);
    socketService.on("connect_error", handleError);
    socketService.on("pong", handlePong);

    return () => {
      mounted = false;
      // IMPORTANT: just remove listeners; do NOT disconnect the global socket
      socketService.off("connect", handleConnect);
      socketService.off("disconnect", handleDisconnect);
      socketService.off("connect_error", handleError);
      socketService.off("pong", handlePong);
    };
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketService.emit(event, data);
  }, []);

  return { isConnected, connectionError, emit, lastPong };
};
