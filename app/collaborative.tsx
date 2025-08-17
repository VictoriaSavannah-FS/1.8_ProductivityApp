// UPDATE WITH new troubleshoot w/ the addEventLiistener
// 2.3 collab page
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  AppState,
  Platform,
} from "react-native";
// RealTime states / hook
import { useCollaborative } from "../hooks/useCollaborative";
// SHow --> who's online**
import { PresenceIndicators } from "../components/collab/PresenceIndicators";
//TaskRow UI --
import { CollaborativeTaskItem } from "../components/collab/CollaborativeTaskItem";

//WILL update for 2.8 CAHT ROOMS and Dynamics users
// GEt from login/Auth???
const CURRENT_USER_ID = "user_123";
const ROOM_ID = "shared_tasks";

export default function CollaborativeTasksScreen() {
  // Local state: Input field --> net taksTitle
  const [newTaskTitle, setNewTaskTitle] = useState("");
  // Loading Status --> show new task is beign added ---
  const [isAddingTask, setIsAddingTask] = useState(false);

  const isDark = false; // NEED to Add Dark thesm featuer  **** PRetend goes here ....

  /**COLLAB Faetuer from hoook
   * sharedState: render live* Sahred Task List
   * participants: list people connected //2.8 - UI / DATA
   * editLocks: trks USER editg Task //2.8 featrues -UI /DATA
   * isConnected: Connetion  STatus ->connected or NOT ->Server
   * ----- FUCNTIonS
   * updateTask: Fucntion -> updates existing task
   * addTask:add new task
   * deleteTask:delete task
   * requestEditLock: ask to Edit Taks//2.8 -- UI/DATA
   * releaseEditLock: Release editinf lcok when Done // 2.8 UI/DATA
   * setUserActivity:mark self as ACtive or NOT // 2.8 UI/DATA
   */
  const {
    sharedState,
    participants,
    editLocks,
    isConnected,
    updateTask,
    addTask,
    deleteTask,
    requestEditLock,
    releaseEditLock,
    setUserActivity,
  } = useCollaborative(CURRENT_USER_ID, ROOM_ID);

  // Track user activity in a cross-platform way -------------------
  useEffect(() => {
    // fucntiosn to update State
    const handleActive = () => setUserActivity(true); // if user Active/back
    const handleInactive = () => setUserActivity(false); //user left/inactive

    // IF RUnningn on WEB ----
    if (Platform.OS === "web") {
      // Web: use focus/blur
      window.addEventListener("focus", handleActive); // tab/web open =active
      window.addEventListener("blur", handleInactive); //tb/web closed =>inactive
      return () => {
        // cleanUp listners when componetn onmounts
        window.removeEventListener("focus", handleActive);
        window.removeEventListener("blur", handleInactive);
      };
    }

    // IF RUNNIGN ON IOS / PHONE -------------------
    else {
      //use ReactNAtice AppsTet (foreground/Background)
      const sub = AppState.addEventListener("change", (state) => {
        setUserActivity(state === "active"); //App is foregroudn = opened => active
      });
      // set initial state on mount
      setUserActivity(AppState.currentState === "active");
      // CleanUp (rmoves lsitners -> compoent unmounts )
      return () => sub.remove();
    }
  }, [setUserActivity]);

  /** ADD NEW COLLABORATIVE TASKS ------------  */

  const handleAddTask = async () => {
    //ignore empty/already adding
    if (!newTaskTitle.trim() || isAddingTask) return;

    setIsAddingTask(true);
    try {
      // Give task=ID (timestamp+string)
      const taskId = `task_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 11)}`;
      // SEDN Task --> SERVER (cureernly shred state ^^ for 2.8 feature  ---)
      await addTask(taskId, {
        id: taskId,
        title: newTaskTitle.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      });
      // clear imput after Add ----
      setNewTaskTitle("");
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert("Error", "Failed to add task. Please try again.");
    } finally {
      setIsAddingTask(false);
    }
  };

  // 2.8 FEATURE ---> CEHK IF TAKS taks is locked ofer editing+who / user
  const getEditLockInfo = (taskId: string) => {
    const lock = editLocks.find((l) => l.field === `task_${taskId}_title`);
    return { isLocked: !!lock, lockedBy: lock?.userName };
  };
  // sharedState.tas k==> become array [] adn srot by new task first @ top
  const tasks = Object.values(sharedState.tasks || {}).sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  //Task Row render -------------------------------------------
  const renderTask = ({ item }: { item: any }) => {
    const lockInfo = getEditLockInfo(item.id);
    return (
      <CollaborativeTaskItem
        task={item}
        currentUserId={CURRENT_USER_ID}
        isLocked={lockInfo.isLocked}
        lockedBy={lockInfo.lockedBy}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onRequestEditLock={requestEditLock}
        onReleaseEditLock={releaseEditLock}
      />
    );
  };
  /** ---------- UI RENDERING / Layout / Desing  -----  */
  return (
    <SafeAreaView
      style={[styles.safeArea, isDark ? styles.bgDark : styles.bgLight]}
    >
      <View style={styles.container}>
        <Text
          style={[styles.title, isDark ? styles.textWhite : styles.textGray800]}
        >
          Collaborative Tasks
        </Text>

        {/* Connection Status
         * GReen = connected
         * RED - NOT  */}
        <View
          style={[
            // logic ->Connection statsus
            styles.statusBox,
            isConnected
              ? isDark
                ? styles.statusGreenDarkBg
                : styles.statusGreenBg
              : isDark
              ? styles.statusRedDarkBg
              : styles.statusRedBg,
          ]}
        >
          <View style={styles.rowCenter}>
            {/* DOT Status--- */}
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConnected ? "#22c55e" : "#ef4444" },
              ]}
            />
            {/* Sastus TEXT */}
            <Text
              style={[
                styles.statusText,
                isConnected
                  ? isDark
                    ? styles.textGreen300
                    : styles.textGreen700
                  : isDark
                  ? styles.textRed300
                  : styles.textRed700,
              ]}
            >
              {isConnected ? "Live collaboration active" : "Connecting..."}
            </Text>
          </View>
        </View>

        {/* PresenceIndicators --- USEr's coonected  */}
        <PresenceIndicators
          participants={participants}
          currentUserId={CURRENT_USER_ID}
        />

        {/* Row Task Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              isDark ? styles.inputDark : styles.inputLight,
            ]}
            placeholder="Add a collaborative task..."
            placeholderTextColor="#9CA3AF"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={handleAddTask}
            editable={!isAddingTask}
          />
          {/* ADD" bttn trigger -- only active when typeing/ input */}
          <TouchableOpacity
            style={[
              styles.addBtn,
              isAddingTask || !newTaskTitle.trim()
                ? styles.addBtnDisabled
                : styles.addBtnEnabled,
            ]}
            onPress={handleAddTask}
            disabled={isAddingTask || !newTaskTitle.trim()}
          >
            {isAddingTask ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.textWhite, styles.textBase]}>Add</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Task List -- Render Task list || empty[]=noen */}
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text
                style={[
                  styles.emptyText,
                  isDark ? styles.textGray400 : styles.textGray500,
                ]}
              >
                No Collab-Tasks yet.{"\n"}Add one to get started!
              </Text>
            </View>
          }
        />

        {/* FOOTER --> DAta: Task#/Pnding/Users --- Edit sTyles */}
        <View
          style={[
            styles.summaryBox,
            isDark ? styles.summaryDarkBg : styles.summaryLightBg,
          ]}
        >
          <Text
            style={[
              styles.summaryText,
              isDark ? styles.textBlue300 : styles.textBlue700,
            ]}
          >
            {/* 2.8 Fearure --> pass dynamic values = userse  */}
            {/* logic / rednign the ampunt of Tasks active/USer */}
            {tasks.length} total tasks •{" "}
            {tasks.filter((t: any) => !t.completed).length} pending
            {isConnected && participants.length > 0 && (
              <Text style={isDark ? styles.textGreen400 : styles.textGreen600}>
                {" "}
                • {participants.length + 1} collaborators
              </Text>
            )}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // layout
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
  },

  // backgrounds
  bgLight: { backgroundColor: "#F9FAFB" },
  bgDark: { backgroundColor: "#111827" },

  // text
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 32,
  },
  textWhite: { color: "#FFFFFF" },
  textGray800: { color: "#1F2937" },

  // status box
  statusBox: { borderRadius: 10, padding: 12, marginBottom: 16 },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 14, fontWeight: "600" },
  statusGreenBg: { backgroundColor: "#DCFCE7" },
  statusGreenDarkBg: { backgroundColor: "rgba(6,95,70,0.2)" },
  statusRedBg: { backgroundColor: "#FEE2E2" },
  statusRedDarkBg: { backgroundColor: "rgba(127,29,29,0.2)" },
  textGreen700: { color: "#047857" },
  textGreen300: { color: "#86EFAC" },
  textRed700: { color: "#B91C1C" },
  textRed300: { color: "#FCA5A5" },

  // input row
  inputRow: { flexDirection: "row", marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 8,
  },
  inputLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    color: "#111827",
  },
  inputDark: {
    backgroundColor: "#1F2937",
    borderColor: "#4B5563",
    color: "#FFFFFF",
  },

  addBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnEnabled: { backgroundColor: "#3B82F6" },
  addBtnDisabled: { backgroundColor: "#9CA3AF" },
  textBase: { fontSize: 16 },

  // list
  listContent: { paddingBottom: 24 },

  // empty
  emptyWrap: { alignItems: "center", paddingVertical: 32 },
  emptyText: { textAlign: "center" },
  textGray500: { color: "#6B7280" },
  textGray400: { color: "#9CA3AF" },

  // summary
  summaryBox: { borderRadius: 10, padding: 16, marginTop: 16 },
  summaryLightBg: { backgroundColor: "#EFF6FF" },
  summaryDarkBg: { backgroundColor: "rgba(30,58,138,0.2)" },
  summaryText: { textAlign: "center", fontSize: 14, fontWeight: "600" },
  textBlue700: { color: "#1D4ED8" },
  textBlue300: { color: "#93C5FD" },
  textGreen600: { color: "#16A34A" },
  textGreen400: { color: "#4ADE80" },
});
