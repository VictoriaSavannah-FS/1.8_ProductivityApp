export default {
  expo: {
    name: "TaskManager",
    slug: "task-manager",
    // ... existing config
    extra: {
      socketUrl:
        process.env.EXPO_PUBLIC_SOCKET_URL || "http://192.168.1.100:3001",
    },
  },
};
