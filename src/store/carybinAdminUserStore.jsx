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
