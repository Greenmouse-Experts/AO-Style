import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      user: undefined,
      items: [],
      cartMeta: undefined,

      addToCart: (item, cartId) => {
        if (!cartId) return;

        const existingItem = get().items.find((i) => i.cartId === cartId);

        const incomingQty = item.product?.quantity || 0;
        const incomingStyle = item.product?.style;

        if (existingItem) {
          // Update existing cart item
          set({
            items: get().items.map((i) =>
              i.cartId === cartId
                ? {
                    ...i,
                    product: {
                      ...i.product,
                      quantity: i.product?.quantity + incomingQty,
                      style: incomingStyle
                        ? {
                            ...(i.product?.style || {}),
                            ...incomingStyle,
                            measurement:
                              incomingStyle?.measurement ||
                              i.product?.style?.measurement ||
                              [],
                          }
                        : i.product?.style,
                      ...item.product,
                    },
                  }
                : i,
            ),
          });
        } else {
          // Add new item
          set({
            items: [
              ...get().items,
              {
                cartId,
                product: {
                  ...item.product,
                  quantity: incomingQty,
                },
              },
            ],
          });
        }
      },

      removeFromCart: (cartId) => {
        set({
          items: get().items.filter((i) => i.cartId !== cartId),
        });
      },

      getItemByCartId: (cartId) => {
        return get().items.find((i) => i.cartId === cartId);
      },

      updateQuantity: (cartId, newQty) => {
        set({
          items: get().items.map((i) =>
            i.cartId === cartId
              ? {
                  ...i,
                  product: {
                    ...i.product,
                    quantity: newQty,
                  },
                }
              : i,
          ),
        });
      },

      clearCart: () => set({ items: [], cartMeta: undefined }),

      setUser: (user) => set({ user }),

      replaceCart: ({ items, cartMeta, user }) =>
        set({
          items,
          cartMeta,
          user: user ?? get().user,
        }),

      logOut: () => set({ items: [], cartMeta: undefined, user: undefined }),
    }),
    {
      name: "cart-storage",
    },
  ),
);

// Register store with session manager for cleanup
if (typeof window !== "undefined") {
  if (!window.zustandStores) {
    window.zustandStores = [];
  }
  window.zustandStores.push(useCartStore);
}
