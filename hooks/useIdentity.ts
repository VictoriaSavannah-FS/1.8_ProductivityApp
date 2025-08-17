// hooks/useIdentity.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import SecureStorage from "../services/SecureStore";

const NAME_KEY = "user_name";

export function useIdentity() {
  // stable, random-per-tab user id (just for demo)
  const [userId] = useState(
    () => `user_${Math.random().toString(36).slice(2, 10)}`
  );
  const [userName, setUserName] = useState<string>("Anonymous");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStorage.get(NAME_KEY);
        if (saved) setUserName(saved);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const updateUserName = useCallback(async (name: string) => {
    await SecureStorage.save(NAME_KEY, name.trim());
    setUserName(name.trim() || "Anonymous");
  }, []);

  return { userId, userName, ready, updateUserName };
}
