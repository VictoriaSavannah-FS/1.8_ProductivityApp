import * as SecureStore from "expo-secure-store";
const isWeb = typeof window !== "undefined";

// sets fallback to localstorage if on web and uses SecStore on mobile

// storiug data in key:value pairs and type-cehcking

export async function saveValue(key: string, value: string) {
  // SAvign VAlues--
  // Logic = IF web --> run browser
  //  IF on Web -> use LocalStorage
  if (isWeb) localStorage.setItem(key, value);
  // If mobile --> use SsecureStore
  else await SecureStore.setItemAsync(key, value);
}

// Gettign values
export async function getValue(key: string) {
  // Logic=  IF on Web -> use LocalStorage
  if (isWeb) return localStorage.getItem(key) ?? null;
  // If mobile --> use SsecureStore and fetch stored data/value
  return await SecureStore.getItemAsync(key);
}
