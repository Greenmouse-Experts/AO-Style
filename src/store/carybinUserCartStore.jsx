import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      user: undefined,
      items: [],
      cartMeta: undefined,

      addToCart: (item) => {
        const productId = item.product?.id;
        if (!productId) return;

        const incomingQty = item.product?.quantity || 1;

        const existingItem = get().items.find(
          (i) => i.product?.id === productId
        );

        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.product?.id === productId
                ? {
                    ...i,
                    product: {
                      ...i.product,
                      ...item.product,
                      quantity: i.product?.quantity + item.product?.quantity,
                    },
                    style: {
                      ...i.style,
                      ...item.style,
                      measurement:
                        item.style?.measurement || i.style?.measurement,
                    },
                  }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                ...item,
                product: {
                  ...item.product,
                  quantity: incomingQty,
                },
              },
            ],
          });
        }
      },

      removeFromCart: (productId) => {
        set({
          items: get().items.filter((i) => i.product?.id !== productId),
        });
      },

      getItemByProductId: (productId) => {
        return get().items.find((i) => i.product?.id === productId);
      },

      updateQuantity: (productId, newQty) => {
        set({
          items: get().items.map((i) =>
            i.product?.id === productId
              ? {
                  ...i,
                  product: {
                    ...i.product,
                    quantity: newQty,
                  },
                }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [], cartMeta: undefined }),

      setUser: (user) => set({ user }),

      replaceCart: ({ items, cartMeta, user }) => {
        set({
          items,
          cartMeta,
          user: user ?? get().user,
        });
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
