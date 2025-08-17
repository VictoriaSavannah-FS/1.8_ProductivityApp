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
import { useIdentity } from "../hooks/useIdentity";

// KEY for sotring theme prefernces in sEcureStorsage DB -- STILL NEED TO ADD this featuer / would be cool to add
const THEME_KEY = "theme"; // "light" | "dark"

export default function SettingsScreen() {
  // custom hook -> provices current USerNAme and fuction to updte it
  const { userName, updateUserName } = useIdentity();
  // helps track alst save -> dispaly 'saved" --
  const [savedAt, setSavedAt] = useState<number | null>(null);
  //Local state for input NAME field
  const [name, setName] = useState("");
  // DArk Mdoe tooglle --> NEED TO Udpate / work on this next week??
  const [darkMode, setDarkMode] = useState(false);
  //trcks Save status / toggles SAVE Bttn enable/disable and Shwos the "Saving.."
  const [saving, setSaving] = useState(false);

  // Load inputs from identity + sec.Storge dB on SCreen Mount
  useEffect(() => {
    // set tesxt input to--> suer's name
    setName(userName ?? "");
    // run async to laod saved theme from storage  <--- need tO WOKR on this next weekk
    (async () => {
      try {
        const savedTheme = await SecureStorage.get(THEME_KEY);
        //if FOUND --> set darkMode based on saved value
        if (savedTheme) setDarkMode(savedTheme === "dark");
      } catch (e) {
        console.warn("Failed to load theme", e);
      }
    })();
  }, [userName]); // Rerun if userName changes **

  // CAlled / invoke when "SAVE" button pressed -> triggers
  async function onSave() {
    try {
      setSaving(true); // dispaly "Saving..."

      //updates identity and pass new value
      await updateUserName(name);
      // SAve theme choise to SecureStorge DB
      await SecureStorage.save(THEME_KEY, darkMode ? "dark" : "light");
      // update / aer USer
      Alert.alert("Saved", "Your preferences were saved.");

      // SVED TIME / STATUS + ALETRT USER----
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    } catch {
      // atch any errors + alert
      Alert.alert("Error", "Could not save settings.");
    } finally {
      // stop showign "Saving/.."
      setSaving(false);
    }
  }

  //Called @ Press to Reset Defluat bttn
  async function onReset() {
    try {
      //CLear out userNAme and Theme Reset to default
      setName("");
      setDarkMode(false);
      // update Identity w/ blacnk = Anynomous
      await updateUserName("");
      // sAve restse theme
      await SecureStorage.save(THEME_KEY, "light");
      // alert+show cofnig changes
      Alert.alert("Reset", "Settings restored to defaults.");
    } catch {
      Alert.alert("Error", "Could not reset settings.");
    }
  }
  /** ---------- UI RENDERING / Layout / Desing  -----  */
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Settings</Text>

      {/* NAme Input  */}
      <Text style={styles.label}>Your name</Text>
      <TextInput
        style={styles.input}
        value={name}
        placeholder="Enter your name"
        // vlaue
        onChangeText={setName}
        autoCapitalize="words"
        returnKeyType="done"
      />
      {/* Damrmode toogle -- work on drk mode theme */}
      <View style={styles.row}>
        <Text style={styles.label}>Dark mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>
      {/* SAVE BUTTN */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onSave}
        disabled={saving}
      >
        <Text style={styles.primaryText}>{saving ? "Saving..." : "Save"}</Text>
        {/* Alert/pop-up */}
        {savedAt && (
          <Text
            style={{
              textAlign: "center",
              marginTop: 8,

              color: "white",
              // color: "#16A34A"
            }}
          >
            Saved ✓
          </Text>
        )}
      </TouchableOpacity>
      {/* RESET to DFLT BUTTON */}
      <TouchableOpacity style={styles.secondaryBtn} onPress={onReset}>
        <Text style={styles.secondaryText}>Reset to defaults</Text>
      </TouchableOpacity>
      {/* LIE sTATE FEATURE ---> shows prevw line that it's live  */}
      <View style={{ marginTop: 24 }}>
        <Text
          style={{
            color: "#6B7280",
          }}
        >
          Preview: Hello {name ? name : "there"} — Theme:{" "}
          {darkMode ? "Dark" : "Light"}
        </Text>
      </View>
    </View>
  );
}
/**  UI STYLES ---------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  h1: { fontSize: 22, fontWeight: "800", marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },

  //  Txt Inut / labels
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
