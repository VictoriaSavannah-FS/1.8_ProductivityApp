import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
// use /Navigation => to  goBack() <<<
import { useNavigation } from "@react-navigation/native";
import SecureStorage from "../services/SecureStore";
import { Priority, Category, Task } from "../types/Tasks";
import CategoryPicker from "../components/CategoryPicker";
// import type { Category } from "../types/Tasks"; .

export default function AddTaskScreen() {
  const navigation = useNavigation<any>(); // nav << type checkc
  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // NEW: selected category & priority
  const [category, setCategory] = useState<Category>("Personal");
  const [priority, setPriority] = useState<Priority>("Medium");

  // storign values
  async function handleSave() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a task title.");
      return;
    }

    const newTask: Task = {
      id: String(Date.now()),
      title: title.trim(),
      description: description.trim(),
      // user choices --CATS picked
      priority,
      category,
      completed: false,
      createdAt: Date.now(),
    };
    // savign taks and new list ---
    const storedTasks = await SecureStorage.get("tasks");
    const current: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
    const updated = [newTask, ...current];

    await SecureStorage.save("tasks", JSON.stringify(updated));
    Alert.alert("Saved", "Your task was added.");
    navigation.goBack();
  }
  return (
    <View style={styles.container}>
      <View style={styles.form}>
        {/* Task title input---  */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          // passa values
          onChangeText={setTitle}
          placeholder="Enter task title..."
        />
        {/* Task Descrpt... */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description} //value
          onChangeText={setDescription} //state()
          placeholder="Enter task description..."
          multiline
          numberOfLines={4}
        />
        {/* CATS Pickeer (CAtegories) */}
        <Text style={styles.label}>Category</Text>
        <CategoryPicker
          value={category} // cat state
          onChange={setCategory} // update cat state()
        />

        {/* On Save do this... */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// stylesSheet ---------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
