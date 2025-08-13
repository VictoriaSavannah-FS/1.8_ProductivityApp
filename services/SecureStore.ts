// secureStorage.ts
// save, get, and delete data
// web==> localStorage (
// On mobile ==> SecureStore

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

class SecureStorage {
  // Save data
  async save(key: string, value: string) {
    try {
      // check if on web ==>l.s.=> save data
      if (Platform.OS === "web") {
        localStorage.setItem(key, value);
      } else {
        // fallabck to mobiel--
        await SecureStore.setItemAsync(key, value);
      }
    } catch (err) {
      console.error("Error saving data:", err);
    }
  }

  // Get data -- type-check
  // tell where to fetch ddata from ---s
  async get(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (err) {
      // cathc any errors
      console.error("Error getting data:", err);
      return null;
    }
  }

  // Delete data
  async remove(key: string) {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (err) {
      console.error("Error deleting data:", err);
    }
  }
}

export default new SecureStorage();
