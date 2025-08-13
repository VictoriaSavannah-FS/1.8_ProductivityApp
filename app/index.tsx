import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { Task } from "../types/Tasks";
import { priorityColor } from "../constants/colors";
import SecureStorage from "../services/SecureStore";

type Props = NativeStackScreenProps<any, any>;
type Filter = "all" | "open" | "done";

export default function Index({ navigation }: Props) {
  // all tasks -- List them--
  const [tasks, setTasks] = useState<Task[]>([]);
  // filter tab choosen ---
  const [filter, setFilter] = useState<Filter>("all");

  // Load tasks ==> storage
  async function refresh() {
    const storedTasks = await SecureStorage.get("tasks");
    // nothing or null-> empty ---
    setTasks(storedTasks ? JSON.parse(storedTasks) : []);
  }
  // laod once on mouunt---
  useEffect(() => {
    refresh(); // run right away
    return navigation.addListener("focus", refresh); // also run on focus
  }, [navigation]);

  //new lsit on filter -------
  /*useMemo:only reruns if values cahnge upon filter slection*/
  const filtered = useMemo(() => {
    // logic if.else returrn tasks
    if (filter === "all") return tasks;
    if (filter === "open") return tasks.filter((t) => !t.completed);

    return tasks.filter((t) => t.completed);
  }, [tasks, filter]);

  // dialog/pop up to CONFRIM selection ----

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Delete task?", // Title /top of the alert
      "This action cannot be undone.", // Message under the title--- styled
      [
        //  Cancel buttin--
        {
          text: "Cancel", // Bttn label
          style: "cancel", // Makes it look like a safe/cancel option
        },

        // Delete btn ---
        {
          text: "Delete",
          style: "destructive", // red style/colro

          // RUN --> only if the user taps "Delete"
          onPress: async () => {
            // Remove task === same ID from the list
            const updatedTasks = tasks.filter((task) => task.id !== id);

            // Save ==> NEWW Task list => storage
            await SecureStorage.save("tasks", JSON.stringify(updatedTasks));

            // Reload new tasks lsit from storage ==> scren shes new chanh=ges
            refresh();
          },
        },
      ]
    );
  };
  // TOGGLE feature --
  // Flip completed 2 not completed==? then save

  const toggleTask = async (id: string) => {
    // Go through all the tasks and create a NEW updated list
    const updated = tasks.map((t) => {
      //slected task =id
      if (t.id === id) {
        // Return flipped value

        return {
          ...t,
          completed: !t.completed,
        };
      } else {
        // If NOT selcted=notign chages
        return t;
      }
    });

    // Save new upadteed taks list
    await SecureStorage.save("tasks", JSON.stringify(updated));

    // Reload new tastk list
    refresh();
  };

  // Render task row ---
  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity style={styles.item} onPress={() => toggleTask(item.id)}>
      <View style={styles.itemLeft}>
        {/* coloreds = priority (High/Medium/Low) */}
        <View
          style={[
            styles.dot,
            { backgroundColor: priorityColor(item.priority) },
          ]}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, item.completed && styles.completed]}>
            {item.title}
          </Text>
          <Text style={styles.desc} numberOfLines={1}>
            {item.description}
          </Text>
        </View>
      </View>

      {/* trash button */}
      <TouchableOpacity onPress={() => confirmDelete(item.id)}>
        <Text style={styles.delete}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top toolbar with filters and navigation links */}
      <View style={styles.toolbar}>
        {/* Filter buttons */}
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

        {/* Links to Settings/AddTask screens */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Text style={styles.link}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("AddTask")}>
            <Text style={styles.link}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Task list */}
      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  toolbar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  filters: { flexDirection: "row", gap: 14 },
  filter: { fontWeight: "600", color: "#6b7280" },
  filterActive: { color: "#111827", textDecorationLine: "underline" },
  link: { fontWeight: "700", color: "#2563EB" },
  item: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemLeft: { flexDirection: "row", gap: 12, alignItems: "center", flex: 1 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 5,
    marginTop: 2,
  },
  title: { fontSize: 16, fontWeight: "700" },
  completed: { textDecorationLine: "line-through", color: "#9CA3AF" },
  desc: { color: "#6B7280", marginTop: 2 },
  delete: { fontSize: 18 },
});
