import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  // Add other user properties as needed
}

interface TempStore {
  user: User | undefined;
  setUser: (data: User) => void;
}

export const useTempStore = create(
  persist<TempStore>(
    (set) => ({
      user: undefined,
      setUser: (data: User) => set({ user: data }),
    }),
    {
      name: "temp-storage", // Choose a unique name for your storage
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
