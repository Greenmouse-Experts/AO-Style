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

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  style_product_id: string | null;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  product: {
    id: string;
    business_id: string;
    category_id: string;
    creator_id: string;
    name: string;
    sku: string;
    description: string;
    gender: string;
    tags: any[];
    price: string;
    original_price: string;
    currency: string;
    type: string;
    status: string;
    approval_status: string;
    published_at: string | null;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    creator: {
      id: string;
      name: string;
      role: {
        id: string;
        name: string;
      };
      profile: {
        id: string;
        user_id: string;
        profile_picture: string;
        address: string;
        bio: string | null;
        date_of_birth: string | null;
        gender: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        country: string;
        state: string;
        country_code: string;
        approved_by_admin: string | null;
        years_of_experience: string | null;
        measurement: string | null;
        coordinates: {
          latitude: string;
          longitude: string;
        };
      };
    };
    fabric: {
      id: string;
      product_id: string;
      market_id: string;
      weight_per_unit: string;
      location: any;
      local_name: string;
      manufacturer_name: string;
      material_type: string;
      alternative_names: string;
      fabric_texture: string;
      feel_a_like: string;
      quantity: number;
      minimum_yards: string;
      available_colors: string;
      fabric_colors: string;
      photos: string[];
      video_url: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    style: string | null;
  };
}
interface ItemMap {
  item: OrderItem;
  setItem: (data: any) => void;
}

export const useItemMap = create(
  persist<ItemMap>(
    (set) => ({
      item: undefined,
      setItem: (data: any) => set({ item: data }),
    }),
    {
      name: "item-map-storage", // Choose a unique name for your storage
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
