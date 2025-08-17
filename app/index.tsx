// THIS IS THE NEW UPDATED VERSION WITH REALTIME FEAUTURES SOCKET.IO
/** HOMEPAGE / LANIDG PAGE ---------
 * - Render Tasks / fetch from SecureStoer DB
 * - renders Tasks Lists / tName/ tDescript./ ColorPcker dot
 * - render filters for e/a Tasks (PErsoanl|Work|health)
 * - Toggle fucntion  (done/opne)
 * - Show Nav basr to other screesn
 * - Connection status ** Socekt.io
 * -
 */

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
// Task Types import -- for TS check data
import type { Category, Task } from "../types/Tasks";
// Color Dot -- render dot color -> e/a task based on priority ** need to fix---
import { priorityColor } from "../constants/colors";
//ref. SecStrg DB
import SecureStorage from "../services/SecureStore";

// 2.1-4 Exrcsie: REal-time features -> Socket.io --> Conenction status and
import { ConnectionStatus } from "../components/ConnectionStatus";
//  Socket.io --> coennction status, handlers and useSocket Hook
import { useSocket } from "../hooks/useSocket";

// NAvBAr Prop type - any*
type Props = NativeStackScreenProps<any, any>;
// NAv Bar Filter buttons -> newStates (new task lsi)rendered
type Filter = "all" | "open" | "done";
// Nav Bar CAtegory filter bttns -> perso/wrk/hlth
type CategoryFilter = "All" | "Personal" | "Work" | "Health";

/**FUCNTION  -------------------------------------- */
export default function Index({ navigation }: Props) {
  /**State
   * Task: all tasks / MAster Lsit-- List fertched from Storage
   * Fitler: based on Filter appleid -> redner new List
   * Category: based on CAtFilter appleid -> redner new list
   */

  const [tasks, setTasks] = useState<Task[]>([]);
  // filter tab choosen ---
  const [filter, setFilter] = useState<Filter>("all");
  // filtrer for CATs
  const [catFilter, setCatFilter] = useState<CategoryFilter>("All");

  /** NEW: socketHook
   * isConnected: socket is connected
   * emit: helper --> sends events to the server*/
  const { isConnected, emit } = useSocket();

  /** DATA LOADING  -------------
   *  Read tasks from SecrueStorage DB ==> psuh to setTasks()state
   * IF NOTHING stored yet --> fallBAck to empty []
   */

  async function refresh() {
    const storedTasks = await SecureStorage.get("tasks");
    setTasks(storedTasks ? JSON.parse(storedTasks) : []);
  }

  // laod tasks on mount and when screen is in FOCUS
  useEffect(() => {
    //init. fetch on 1st render / on mount
    refresh();
    /**
     * Focus Screen fucntion: when user nav. away and retunrs --> refetch to reflelct any chnges
     * addListener; "focus"=eevnt fires when the screen becomes active again
     * "refresh" => calls back the function to refetch data refresh();
     */

    return navigation.addListener("focus", refresh);
    // run useEffcet one on mount + e/a time "navigation" changes ==>only when necessesary
  }, [navigation]);

  /**LIST FILTERING --------
   * create filtered lists e/a task/filter/catFilter change --
   * useMemo:React Hook --> helps exc. function and sotres return values and next renders check if values have changed
   * useMemo: helps avoid recalculting on unrelated re-renders
   */
  const filtered = useMemo(() => {
    // starts w/ FUll list--
    let list = tasks;
    //Apply completion filter --- logic
    if (filter === "open") list = list.filter((t) => !t.completed);
    if (filter === "done") list = list.filter((t) => t.completed);
    // Apply catFIlter IF NOT ALL (All => nothign hppns)
    if (catFilter !== "All") {
      list = list.filter((t) => t.category === (catFilter as Category));
    }
    return list;
  }, [tasks, filter, catFilter]);

  /** RETUNR ACTIONS | DELETE | TOGGLE  */
  // confirm delete | If cofirmed -> Remove and save changes
  const confirmDelete = (id: string) => {
    // alert pop up/ cofirm --
    Alert.alert("Delete task?", "This action cannot be undone.", [
      // cancel -> do notihng / no change----
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          // Make new Array [] w/out the matchign task.id
          const updatedTasks = tasks.filter((task) => task.id !== id);
          //update the DB wi new changes / new version of tasks lists -> w/out the deleted one
          await SecureStorage.save("tasks", JSON.stringify(updatedTasks));

          /**NEW: Updated LIVE emit IF connected
           * let the server/others know we delted this oen task
           * which task
           * @time*/
          if (isConnected) {
            emit("task_deleted", {
              taskId: id,
              timestamp: new Date().toISOString(),
            });
          }
          // fetch new lsit w/ removed one gone
          refresh();
        },
      },
    ]);
  };

  // toggle complete based on task.id -> save to DB and update new lsit and live udpated
  const toggleTask = async (id: string) => {
    // target task.id -> create a new array [] with the task.id targeted flipped
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    // save new array into Storage DB
    await SecureStorage.save("tasks", JSON.stringify(updated));
    // NEW: emit update --> if Connected --> "taks_updated' event
    const toggled = updated.find((t) => t.id === id);
    // logic and conditions met --> updated reltime server w/ id+complet status + time
    if (isConnected && toggled) {
      emit("task_updated", {
        taskId: id,
        completed: toggled.completed,
        timestamp: new Date().toISOString(),
      });
    }
    // fetch new lsit w/ toggle status --> help kepp state in sync
    refresh();
  };

  /** LSIT RENDERING ------ VISUALS ------------------------*/
  // how e/a row (task) renders / behaves in Lsit
  const renderItem = ({ item }: { item: Task }) => (
    // Pressing ROW toggles COMPLETE status --> toggleTask
    <TouchableOpacity style={styles.item} onPress={() => toggleTask(item.id)}>
      <View style={styles.itemLeft}>
        <View
          style={[
            // Priortiry dot - color depnds on item.priority** need to update this nxt week <-=====
            styles.dot,
            { backgroundColor: priorityColor(item.priority) },
          ]}
        />
        {/* CATEGORY Pill --> grey gatfory label */}
        <View style={styles.catPill}>
          <Text style={styles.catText}>{item.category}</Text>
        </View>
        {/* render:Task: title + taskDEscription */}
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, item.completed && styles.completed]}>
            {item.title}
          </Text>
          <Text style={styles.desc} numberOfLines={1}>
            {item.description}
          </Text>
        </View>
      </View>
      {/* TRash Icon : DELEDTE Cofnrim dlaog */}
      <TouchableOpacity onPress={() => confirmDelete(item.id)}>
        <Text style={styles.delete}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
  /** ---------- UI RENDERING / Layout / Desing  -----  */
  return (
    <View style={styles.container}>
      {/* NEW: Connection status ***  */}
      <View style={styles.statusWrap}>
        <ConnectionStatus />
      </View>

      {/* Top Navbar w/ filters and nav links */}
      <View style={styles.toolbar}>
        {/* complete sTatus fliter bttns ---  */}
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
          {/* chatRoom */}
          <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
            <Text style={styles.link}>Chat</Text>
          </TouchableOpacity>
          {/* CollabRoom */}
          <TouchableOpacity onPress={() => navigation.navigate("Collab")}>
            <Text style={styles.link}>CollabTasks</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category filter */}
      <View style={[styles.filters, styles.catFilters]}>
        {(["All", "Personal", "Work", "Health"] as CategoryFilter[]).map(
          (c) => (
            <TouchableOpacity key={c} onPress={() => setCatFilter(c)}>
              <Text
                style={[
                  styles.catFilter,
                  catFilter === c && styles.catFilterActive,
                ]}
              >
                {c.toUpperCase()}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Task list Redeneirng  ------ */}
      <FlatList
        data={filtered} //filterd []
        keyExtractor={(t) => t.id} // unique key
        renderItem={renderItem} // rowRedner
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}
/**  UI STYLES ---------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  //NEW: small wrapper for Connection status-card aligns w/ current layout
  // matches ToolBar padding--
  statusWrap: { paddingHorizontal: 16, paddingTop: 12 },

  toolbar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    // backgroundColor: "grey",
  },
  // Horiz. aer used bby filters rows
  filters: { flexDirection: "row", gap: 14 },
  filter: {
    fontWeight: "600",

    color: "#6b7280",
  },
  filterActive: {
    color: "purple",
    // color: "#111827",
    textDecorationLine: "underline",
  },
  link: {
    fontWeight: "700",

    color: "#2563EB",
    // color: "red",
  },

  // TASKS rOW -----
  item: {
    // backgroundColor: "#fff",
    backgroundColor: "pink",

    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // Dots/Pill Texts ---- Left iside elements----
  itemLeft: { flexDirection: "row", gap: 12, alignItems: "center", flex: 1 },
  // DOts -priotiy
  dot: {
    width: 14,
    height: 14,
    borderRadius: 5,
    marginTop: 2,
  },
  // tEXt styles
  title: { fontSize: 16, fontWeight: "700" },
  completed: { textDecorationLine: "line-through", color: "red" },
  desc: { color: "#6B7280", marginTop: 2 },
  delete: { fontSize: 18 },

  // Category pill
  catPill: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  catText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
  },

  // Category filter row
  catFilters: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  catFilter: { fontWeight: "600", color: "#6b7280" },
  catFilterActive: { color: "#2563EB", textDecorationLine: "underline" },
});

// can add :emit("task_created", { task: newTask, timestamp: new Date().toISOString() }); for Taks / new ones created --- REMEMEBER to add maybe add this new featue>?? next week??
