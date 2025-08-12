//Hoemscreen Nav

import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

// defien fliter
// need to add the others here...
type Filter = "all" | "open" | "done";

export default function Index({ navigation }: any) {
  // chck type
  // define Fitlers useState
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  // logic
  async function refresh() {
    setTasks(await listTasks());
  }
  useEffect(() => {
    const unsub = navigation.addListener("focus", refresh);
    return unsub;
  }, [navigation]);
  // https://react.dev/reference/react/useMemo
  //https://www.w3schools.com/react/react_usememo.asp --- doublechcck
  const data = useMemo(() => {
    // logic to handle when to return values. ..
  }, [tasks, filter]);
  // deledte taskss / confirmation
  const confirmDelete = (id: string) =>
    Alert.alert("Delete task?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        // onPres btn action
        onPress: async () => {
          await removeTask(id);
          refresh();
        },
      },
    ]);

  return (
    <View style={styles.container}>
      {/* toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.filters}>
          {(["all", "open", "done"] as Filter[]).map((f) => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)}>
              <Text
                style={[styles.filter, filter === f && styles.filterActive]}
              >
                {f.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Text style={styles.link}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("AddTask")}>
            <Text style={styles.link}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<EmptyState label="No tasks yet" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={async () => {
              await toggleTask(item.id);
              refresh();
            }}
          >
            <View style={styles.left}>
              <View />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.title, item.completed ? styles.done : null]}
                >
                  {item.title}
                </Text>
                <Text style={styles.desc} numberOfLines={1}>
                  {item.description}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => confirmDelete(item.id)}>
              <Text style={styles.del}>🗑️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
// useing stylesheet indtead of Nativewidn...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  filters: { flexDirection: "row", gap: 12 },
  filter: { color: "#6b7280", fontWeight: "600" },
  filterActive: { color: "#111827", textDecorationLine: "underline" },
  link: { color: "#2563EB", fontWeight: "700" },
  item: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: { flexDirection: "row", gap: 12, alignItems: "center", flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: { fontWeight: "700" },
  done: { color: "#9CA3AF", textDecorationLine: "line-through" },
  desc: { color: "#6B7280", marginTop: 2 },
  del: { fontSize: 18 },
});

// // import React, { useEffect } from "react";
// import { View, Text, FlatList, Alert } from "react-native";
// import { Link } from "expo-router";
// // import { styled } from "nativewind";
// import { useTasks } from "../hooks/useTasks";
// import { useBreakpoint } from "../hooks/useBreakpoints";
// import databaseService from "../services/database";
// import Button from "../components/Buttons";
// import Card from "../components/Card";
// // const StyledView = styled(View);
// // const StyledText = styled(Text);
// // const StyledFlatList = styled(FlatList);
// export default function TasksScreen() {
//   const { tasks, loading, error, deleteTask, updateTask } = useTasks();
//   const breakpoint = useBreakpoint();
//   useEffect(() => {
//     databaseService.init().catch(console.error);
//   }, []);
//   const handleToggleComplete = async (id: number, completed: boolean) => {
//     try {
//       await updateTask(id, { completed: !completed });
//     } catch (error) {
//       Alert.alert("Error", "Failed to update task");
//     }
//   };
//   const handleDeleteTask = async (id: number) => {
//     Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await deleteTask(id);
//           } catch (error) {
//             Alert.alert("Error", "Failed to delete task");
//           }
//         },
//       },
//     ]);
//   };
//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case "high":
//         return "text-red-600";
//       case "medium":
//         return "text-yellow-600";
//       case "low":
//         return "text-green-600";
//       default:
//         return "text-gray-600";
//     }
//   };
//   const getNumColumns = () => {
//     switch (breakpoint) {
//       case "xl":
//         return 3;
//       case "lg":
//         return 2;
//       default:
//         return 1;
//     }
//   };
//   const renderTask = ({ item }) => (
//     <StyledView className={`flex-1 ${getNumColumns() > 1 ? "mx-1" : ""} mb-3`}>
//       <Card variant="elevated">
//         <StyledView className="flex-row justify-between items-start mb-2">
//           <StyledText
//             className={`flex-1 text-lg font-semibold ${
//               item.completed ? "line-through text-gray-500" : "text-gray-900"
//             }`}
//           >
//             {item.title}
//           </StyledText>
//           <StyledText className="text-2xl ml-2">
//             {item.completed ? "✅" : "⭕"}
//           </StyledText>
//         </StyledView>

//         <StyledText className="text-gray-600 mb-3">
//           {item.description}
//         </StyledText>

//         <StyledView className="flex-row justify-between items-center">
//           <StyledText
//             className={`text-sm font-medium ${getPriorityColor(item.priority)}`}
//           >
//             {item.priority.toUpperCase()}
//           </StyledText>

//           <StyledView className="flex-row space-x-2">
//             <Button
//               title={item.completed ? "Undo" : "Complete"}
//               onPress={() => handleToggleComplete(item.id, item.completed)}
//               variant="outline"
//               size="sm"
//             />
//             <Button
//               title="Delete"
//               onPress={() => handleDeleteTask(item.id)}
//               variant="secondary"
//               size="sm"
//             />
//           </StyledView>
//         </StyledView>
//       </Card>
//     </StyledView>
//   );
//   if (loading) {
//     return (
//       <StyledView className="flex-1 justify-center items-center bg-gray-50">
//         <StyledText className="text-lg text-gray-600">
//           Loading tasks...
//         </StyledText>
//       </StyledView>
//     );
//   }
//   if (error) {
//     return (
//       <StyledView className="flex-1 justify-center items-center bg-gray-50 px-4">
//         <StyledText className="text-lg text-red-600 text-center">
//           Error: {error}
//         </StyledText>
//       </StyledView>
//     );
//   }
//   return (
//     <StyledView className="flex-1 bg-gray-50">
//       <StyledFlatList
//         data={tasks}
//         renderItem={renderTask}
//         keyExtractor={(item) => item.id?.toString() || ""}
//         numColumns={getNumColumns()}
//         key={getNumColumns()} // Force re-render when columns change
//         contentContainerStyle={{ padding: 16 }}
//         ListEmptyComponent={
//           <StyledView className="flex-1 justify-center items-center pt-20">
//             <StyledText className="text-xl font-bold text-gray-600 mb-2">
//               No tasks yet!
//             </StyledText>
//             <StyledText className="text-gray-500 text-center">
//               Create your first task to get started.
//             </StyledText>
//           </StyledView>
//         }
//       />

//       <StyledView className="p-4">
//         <Link href="/add-task" asChild>
//           <Button title="+ Add Task" onPress={() => {}} fullWidth />
//         </Link>
//       </StyledView>
//     </StyledView>
//   );
// }
// // app/index.tsx
// // import { View, Text, Pressable } from "react-native";
// // import { Link } from "expo-router";

// // export default function Index() {
// //   return (
// //     <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
// //       <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 16 }}>
// //         Hello 👋 Expo is running.
// //       </Text>

// //       <Link href="/add-task" asChild>
// //         <Pressable
// //           style={{
// //             backgroundColor: "#007AFF",
// //             padding: 14,
// //             borderRadius: 10,
// //             alignItems: "center",
// //           }}
// //         >
// //           <Text style={{ color: "white", fontWeight: "700" }}>
// //             Go to Add Task
// //           </Text>
// //         </Pressable>
// //       </Link>
// //     </View>
// //   );
// // }
