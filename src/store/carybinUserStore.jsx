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
