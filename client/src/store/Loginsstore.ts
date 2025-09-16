import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  username: string | null;
  password: string | null;

  setCredentials: (username: string, password: string) => void;
  clearCredentials: () => void;
  getUsername: () => string | null;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      username: null,
      password: null,

      setCredentials: (username, password) =>
        set({ username, password }),

      clearCredentials: () =>
        set({ username: null, password: null }),

      getUsername: () => get().username
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
