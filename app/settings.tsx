//settings page willgo here

//Need to be able to suter Prefersnces for Users
// NAme / Theme -->dark mode!!! ****

/// app/screens/Settings.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import SecureStorage from "../services/SecureStore";

const NAME_KEY = "user_name";
const THEME_KEY = "theme"; // "light" | "dark"

export default function SettingsScreen() {
  // defien states to
  const [name, setName] = useState(""); //save user pref.
  // save the Values ---- dark theme
  const [darkMode, setDarkMode] = useState(false); //true=darkMode
  // useState deefien values----
  const [saving, setSaving] = useState(false); ///saving status---

  // Load / useState to pass and store values
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       // upon load -- take values and store them ---- namee + theme
  //       const savedName = await getValue(NAME_KEY);
  //       const savedTheme = await getValue(THEME_KEY);
  //       // logic --> if exist --> pass new value---
  //       if (savedName) setName(savedName);
  //       if (savedTheme) setDarkMode(savedTheme === "dark");
  //     } catch (e) {
  //       // ftruy-catch block for fallback---
  //       console.warn("Failed to load settings", e);
  //     }
  //   })();
  //   // laod once upon mmount ---
  // }, []);

  useEffect(() => {
    (async () => {
      try {
        const savedName = await SecureStorage.get(NAME_KEY);
        const savedTheme = await SecureStorage.get(THEME_KEY);
        if (savedName) setName(savedName);
        if (savedTheme) setDarkMode(savedTheme === "dark");
      } catch (e) {
        console.warn("Failed to load settings", e);
      }
    })();
  }, []);
  // Save curernt settings to Storage-------
  // async function onSave() {
  //   // try-cath blck
  //   try {
  //     // dwefien wht state wee're in --> setSSaving mode = Mode
  //     setSaving(true);
  //     // save the name --> store
  //     // trm()-> removes spaces b4 / after name -----
  //     await saveValue(NAME_KEY, name.trim());
  //     // save the theme choice ----
  //     await saveValue(THEME_KEY, darkMode ? "dark" : "light");
  //     // if succes --> show Saved mssge
  //     Alert.alert("Saved", "Your settings were saved.");
  //   } catch (e) {
  //     // fallback if Error --> savings not saved---
  //     Alert.alert("Error", "Could not save settings.");
  //   } finally {
  //     //stops laod and reesests setSavign stae back to flase
  //     setSaving(false);
  //   }
  // }

  async function onSave() {
    try {
      setSaving(true);
      await SecureStorage.save(NAME_KEY, name.trim());
      await SecureStorage.save(THEME_KEY, darkMode ? "dark" : "light");
      Alert.alert("Saved", "Your preferences were saved.");
    } catch {
      Alert.alert("Error", "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }
  // REST BTN ---> restre sesttings back to normal / orginal settingss
  // async function onReset() {
  //   try {
  //     // change statea back to deflt values - empty/NA naem
  //     setName("");
  //     // back to deflt theme/light
  //     setDarkMode(false);
  //     // pass the new chanegs to storage ---
  //     await saveValue(NAME_KEY, "");
  //     await saveValue(THEME_KEY, "light");
  //   } catch (e) {
  //     // catch if reset failss---

  //     Alert.alert("Error", "Could not reset settings.");
  //   }
  // }
  async function onReset() {
    try {
      setName("");
      setDarkMode(false);
      await SecureStorage.save(NAME_KEY, "");
      await SecureStorage.save(THEME_KEY, "light");
      Alert.alert("Reset", "Settings restored to defaults.");
    } catch {
      Alert.alert("Error", "Could not reset settings.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Settings</Text>

      <Text style={styles.label}>Your name</Text>
      <TextInput
        style={styles.input}
        // value to pass ----- name
        value={name}
        placeholder="Enter your name"
        onChangeText={setName}
        autoCapitalize="words"
        returnKeyType="done"
      />
      {/* THEME -change display--- */}

      <View style={styles.row}>
        <Text style={styles.label}>Dark mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onSave}
        disabled={saving}
      >
        <Text style={styles.primaryText}>{saving ? "Saving..." : "Save"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onReset}>
        <Text style={styles.secondaryText}>Reset to defaults</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 24 }}>
        <Text style={{ color: "#6B7280" }}>
          {/* inline loigic 
          pass uyser name if value is givng and passe their naem for more cutomized effect-> fallback to "there" standard/defalut if value not found */}
          Preview: Hello {name ? name : "there"} — Theme:{" "}
          {darkMode ? "Dark" : "Light"}
        </Text>
      </View>
    </View>
  );
}

// styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  h1: { fontSize: 22, fontWeight: "800", marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
  },
  row: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  // bttn ---styles
  primaryBtn: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  primaryText: { color: "white", fontWeight: "800" },
  secondaryBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  secondaryText: { color: "#111827", fontWeight: "700" },
});
