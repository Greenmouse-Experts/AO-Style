import { create } from "zustand";

export const useCarybinUserStore = create((set) => ({
  carybinUser: null,

  setCaryBinUser: (user) => {
    set({ carybinUser: user });
  },

  logOut: () => {
    set({ carybinUser: null });
  },
}));

// Register store with session manager for cleanup
if (typeof window !== "undefined") {
  if (!window.zustandStores) {
    window.zustandStores = [];
  }
  window.zustandStores.push(useCarybinUserStore);
}
