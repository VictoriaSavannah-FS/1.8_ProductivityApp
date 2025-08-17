// 2.3 -- updated to use Stylesheets

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";

// defiene Task-----
interface Task {
  id: string;
  title: string;
  completed: boolean;
  lastModifiedBy?: string; //2.8 featuer - whi canged it
  lastModifiedAt?: string; //2.8 Feature - when it was chanegd --
}

// Props expxted in this compoent
interface CollaborativeTaskItemProps {
  // task displayed
  task: Task;
  // /ID of current USer
  currentUserId: string;

  isLocked?: boolean; //2.8 feature
  lockedBy?: string; //2.8 feature

  // functions passed fir udpates . delete .locsk------
  onUpdate: (taskId: string, updates: any) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onRequestEditLock: (field: string) => Promise<boolean>;
  onReleaseEditLock: (field: string) => Promise<void>;
  // Dark mode -- feature/
  isDark?: boolean;
}

export const CollaborativeTaskItem: React.FC<CollaborativeTaskItemProps> = ({
  task,
  currentUserId,
  isLocked = false,
  lockedBy,
  onUpdate,
  onDelete,
  onRequestEditLock,
  onReleaseEditLock,
  isDark = false,
}) => {
  // Local Stete for EDITINF -- 2.8 feature
  const [isEditing, setIsEditing] = useState(false); //Editng Now?
  const [editText, setEditText] = useState(task.title); // Text in edit box
  const [hasEditLock, setHasEditLock] = useState(false); //OWn Lock?
  const inputRef = useRef<TextInput>(null); // refer=> focus input

  // USer Wants to EDIT  -------- handler 2.8 feature
  const handleStartEdit = async () => {
    // logic --> IF locked by other user --> BLOCK CURRENT USER
    if (isLocked && lockedBy !== currentUserId) {
      Alert.alert(
        "Task Being Edited",
        `This task is currently being edited by ${lockedBy}. Please try again later.`,
        [{ text: "OK" }]
      );
      return;
    }
    // try to grab Lock for TAKS TItle ----- 2.8 feature
    const lockObtained = await onRequestEditLock(`task_${task.id}_title`);
    if (lockObtained) {
      setHasEditLock(true); //Mark -> own lock
      setIsEditing(true); //chnge UI to edit mode
      setEditText(task.title); // laod curent text--> box
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      Alert.alert("Cannot Edit", "This task is being edited by another user.", [
        { text: "OK" },
      ]);
    }
  };
  // SAVIGN EDITS -------
  const handleSaveEdit = async () => {
    if (editText.trim() && editText !== task.title) {
      // only chnge --> TEXT changed + NOT EMPTY
      await onUpdate(task.id, { title: editText.trim() });
    }
    await handleCancelEdit(); // CLOSE EDIT mode -- 2.8 feature
  };

  // 2.8 feature -- CANEL eDIT MODE + Release LOCK = owned
  const handleCancelEdit = async () => {
    setIsEditing(false);
    setEditText(task.title); //reset ot OG----
    if (hasEditLock) {
      await onReleaseEditLock(`task_${task.id}_title`); // gIVE up Lock
      setHasEditLock(false);
    }
  };
  // TOGGLE complete STATS -----
  const handleToggleComplete = async () => {
    await onUpdate(task.id, { completed: !task.completed });
  };
  // DElete confirm STaTS
  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(task.id),
      },
    ]);
  };
  // 2.8 featuer --> WHO MODIFIED ==> showcase info nuder TASK
  const isModifiedByOther =
    task.lastModifiedBy && task.lastModifiedBy !== currentUserId;

  /** ---------- UI RENDERING / Layout / Desing  -----  */
  return (
    // 2. feature
    <View
      style={[
        styles.card,
        isDark ? styles.bgDark : styles.bgLight,
        styles.shadowSm,
        styles.border,
        // Highlight yellow border ==> locked by other user

        isLocked && lockedBy !== currentUserId
          ? isDark
            ? styles.borderYellow600
            : styles.borderYellow300
          : isDark
          ? styles.borderGray700
          : styles.borderGray100,
      ]}
    >
      {/* Lock indicator ->>> Show a "lock" warning if another user is editing */}
      {isLocked && lockedBy !== currentUserId && (
        <View style={[styles.row, styles.itemsCenter, styles.mb2]}>
          <View style={[styles.lockDot]} />
          <Text
            style={[
              styles.textXs,
              isDark ? styles.textYellow400 : styles.textYellow600,
            ]}
          >
            Being edited by {lockedBy}
          </Text>
        </View>
      )}
      {/* Main row with task text + actions */}
      <View style={[styles.row, styles.itemsCenter, styles.justifyBetween]}>
        <View style={[styles.flex1, styles.mr3]}>
          {isEditing ? (
            //2.8 feature If editing MODE=> input + save button
            <View style={[styles.row, styles.itemsCenter]}>
              <TextInput
                ref={inputRef}
                style={[
                  styles.input,
                  isDark ? styles.textWhite : styles.textGray800,
                  styles.inputUnderline,
                ]}
                value={editText}
                onChangeText={setEditText}
                onSubmitEditing={handleSaveEdit}
                onBlur={handleCancelEdit}
                multiline
                placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
              />
              <TouchableOpacity
                style={[styles.saveBtn]}
                onPress={handleSaveEdit}
              >
                <Text style={[styles.textWhite, styles.textSm]}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // IF NOT ==> normal TaskText-----
            <TouchableOpacity
              onLongPress={handleStartEdit} // lognPRess-EDIT
              onPress={handleToggleComplete} // ShortPRes+Toggle Cmplete STATS
              disabled={isLocked && lockedBy !== currentUserId} //blcoked==> other user
            >
              <Text
                style={[
                  styles.textBase,
                  task.completed
                    ? isDark
                      ? styles.textGray400
                      : styles.textGray500
                    : isDark
                    ? styles.textWhite
                    : styles.textGray800,
                  task.completed && styles.lineThrough, //usual strike=Done
                ]}
              >
                {task.title}
              </Text>

              {isModifiedByOther && (
                <Text style={[styles.textXs, styles.mt1, styles.textBlue]}>
                  Modified by {task.lastModifiedBy} •{" "}
                  {new Date(task.lastModifiedAt!).toLocaleTimeString()}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.row, styles.itemsCenter]}>
          <View
            style={[
              styles.statusCircle, // dot pill =>complete!:)
              task.completed ? styles.statusComplete : null, // green=> complete
              task.completed
                ? styles.statusCompleteBorder // greenBrder=> complete
                : isDark
                ? styles.borderGray600 // dark border theme
                : styles.borderGray300, // light border theme
            ]}
          >
            {task.completed && (
              <Text style={[styles.textWhite, styles.textXs]}>✓</Text>
              // checkmark inside pill when done
            )}
          </View>

          <TouchableOpacity
            onPress={handleDelete} // trash button =>>deletes task
            disabled={isLocked && lockedBy !== currentUserId} // 2.8 feature block delete if locked
            style={[styles.trashBtn]}
          >
            {/* red X / or trash emoji?? IDK yet ... */}
            <Text style={styles.textRed}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // containers
  card: {
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
  },
  bgLight: { backgroundColor: "#FFFFFF" },
  bgDark: { backgroundColor: "#1F2937" }, // gray-800
  shadowSm: {
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  border: { borderWidth: 1 },
  borderGray100: { borderColor: "#F3F4F6" },
  borderGray700: { borderColor: "#374151" },
  borderGray600: { borderColor: "#4B5563" },
  borderGray300: { borderColor: "#D1D5DB" },
  borderYellow300: { borderColor: "#FDE68A" },
  borderYellow600: { borderColor: "#D97706" },

  // layout helpers
  row: { flexDirection: "row" },
  itemsCenter: { alignItems: "center" },
  justifyBetween: { justifyContent: "space-between" },
  flex1: { flex: 1 },
  mr3: { marginRight: 12 },
  mb2: { marginBottom: 8 },
  mt1: { marginTop: 4 },

  // inputs / buttons
  input: { flex: 1, fontSize: 16, paddingBottom: 4 },
  inputUnderline: { borderBottomWidth: 1, borderBottomColor: "#3B82F6" },

  // save Buttn
  saveBtn: {
    marginLeft: 8,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  // text
  textWhite: { color: "#FFFFFF" },
  textGray800: { color: "#1F2937" },
  textGray500: { color: "#6B7280" },
  textGray400: { color: "#9CA3AF" },
  textBase: { fontSize: 16 },
  textSm: { fontSize: 14 },
  textXs: { fontSize: 12 },
  // info
  textBlue: { color: "#2563EB" },
  // error!!! ---
  textRed: { color: "#EF4444" },
  lineThrough: { textDecorationLine: "line-through" },

  // lock indicator ------ 2.8 feture**
  lockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F59E0B",
    marginRight: 8,
  },
  textYellow600: { color: "#D97706" },
  textYellow400: { color: "#F59E0B" },

  // status pill / dot
  statusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusComplete: { backgroundColor: "#22C55E" }, //green
  statusCompleteBorder: { borderColor: "#22C55E" }, //greenBrder

  // touch targets
  trashBtn: { padding: 8, borderRadius: 9999 },
});
