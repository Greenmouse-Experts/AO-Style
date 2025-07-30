import { create } from "zustand";

export const useCarybinAdminUserStore = create((set) => ({
  carybinAdminUser: null,

  setCaryBinAdminUser: (user) => {
    set({ carybinAdminUser: user });
  },

  logOut: () => {
    set({ carybinAdminUser: null });
  },
}));

// Register store with session manager for cleanup
if (typeof window !== "undefined") {
  if (!window.zustandStores) {
    window.zustandStores = [];
  }
  window.zustandStores.push(useCarybinAdminUserStore);
}
