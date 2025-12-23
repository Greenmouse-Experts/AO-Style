import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../../services/CarybinBaseUrl";
import CustomTable from "../../../../../components/CustomTable";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
interface LogisticsOrdersResponse {
  statusCode: number;
  data: LogisticsOrder[];
  count: number;
}

interface LogisticsOrder {
  id: string;
  user_id: string;
  status:
    | "PAID"
    | "DISPATCHED_TO_AGENT"
    | "IN_TRANSIT"
    | "SHIPPED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED";
  total_amount: string;
  payment_id: string;
  metadata: {
    image?: string;
  } | null;
  first_leg_logistics_agent_id: string | null;
  logistics_agent_id: string | null;
  tailor_delivery_code: string | null;
  user_delivery_code: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  payment: Payment;
  user: User;
  order_items: OrderItem[];
  logistics_agent: LogisticsAgent | null;
}

interface Payment {
  id: string;
  user_id: string;
  purchase_type: string;
  purchase_id: string | null;
  amount: string;
  discount_applied: string;
  payment_status: string;
  transaction_id: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  billing_at_payment: any;
  billing_id: string | null;
  interval: string | null;
  currency: string;
  auto_renew: boolean;
  is_renewal: boolean;
  is_upgrade: boolean;
  metadata: any[];
  purchase: Purchase;
  transaction_type: string | null;
  order_id: string | null;
}

interface Purchase {
  items: PurchaseItem[];
  coupon_id: string | null;
  tax_amount: number;
  coupon_code: string | null;
  coupon_type: string | null;
  coupon_value: number | null;
  delivery_fee: number;
}

interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  created_at: string;
  product_id: string;
  purchase_type: string;
  vendor_amount: number;
  vendor_charge: {
    fabric_vendor_fee: number;
    fashion_designer_fee: number;
  };
}

interface User {
  id: string;
  email: string;
  phone: string;
  profile: UserProfile;
}

interface UserProfile {
  id: string;
  user_id: string;
  profile_picture: string | null;
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
  approved_by_admin: any;
  years_of_experience: number | null;
  measurement: Measurement | null;
  coordinates: {
    latitude: string;
    longitude: string;
  };
}

interface Measurement {
  full_body: {
    height: number;
    height_unit: string;
    dress_length: number;
    dress_length_unit: string;
  };
  lower_body: {
    trouser_length: number;
    hip_circumference: number;
    knee_circumference: number;
    thigh_circumference: number;
    trouser_length_unit: string;
    waist_circumference: number;
    hip_circumference_unit: string;
    knee_circumference_unit: string;
    thigh_circumference_unit: string;
    waist_circumference_unit: string;
  };
  upper_body: {
    sleeve_length: number;
    shoulder_width: number;
    bust_circumference: number;
    sleeve_length_unit: string;
    bicep_circumference: number;
    shoulder_width_unit: string;
    waist_circumference: number;
    armhole_circumference: number;
    bust_circumference_unit: string;
    bicep_circumference_unit: string;
    waist_circumference_unit: string;
    armhole_circumference_unit: string;
  };
}

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
  product: Product;
}

interface Product {
  id: string;
  business_id: string;
  category_id: string;
  creator_id: string;
  name: string;
  sku: string;
  description: string;
  gender: string;
  tags: string[];
  price: string;
  original_price: string;
  currency: string;
  type: "FABRIC" | "STYLE";
  status: string;
  approval_status: string;
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  creator: Creator;
  fabric: Fabric | null;
  style: Style | null;
}

interface Creator {
  id: string;
  name: string;
  role: {
    id: string;
    role_id: string;
  };
  profile: UserProfile;
}

interface Fabric {
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
}

interface Style {
  id: string;
  product_id: string;
  estimated_sewing_time: number;
  minimum_fabric_qty: string;
  location: any;
  photos: string[];
  video_url: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface LogisticsAgent {
  id: string;
  name: string;
  profile: UserProfile;
}
export default function LogisticsOrdersHandled({ id }: { id: string }) {
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const orders = useQuery<LogisticsOrdersResponse>({
    queryKey: ["logistis", id, currentStatus],
    queryFn: async () => {
      // Fetch all orders without filtering by logistics_agent_id on the backend
      // We'll filter on the frontend based on first_leg_logistics_agent_id and logistics_agent_id
      let resp = await CaryBinApi.get("/orders/fetch", {
        params: {
          ...(currentStatus.trim() ? { status: currentStatus } : {}),
        },
      });
      return resp.data;
    },
  });
  const nav = useNavigate();
  if (orders.isLoading) {
    return (
      <div
        className="min-h-96 flex flex-col items-center justify-center p-8"
        data-theme="nord"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <div className="absolute inset-0 loading loading-spinner loading-lg text-primary opacity-30 animate-ping"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-base-content">
              Loading Orders
            </h3>
            <p className="text-sm text-base-content/70 mt-1">
              Fetching order data...
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (orders.isError) {
    return (
      <div
        className="min-h-96 flex flex-col items-center justify-center p-8"
        data-theme="nord"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-error">
              Failed to Load Orders
            </h3>
            <p className="text-sm text-base-content/70 mt-1">
              Something went wrong while fetching order data. Please try again.
            </p>
          </div>
          <button
            className="btn btn-error btn-outline"
            onClick={() => orders.refetch()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Filter orders based on the requirements:
  // 1. Exclude orders that don't have both first_leg_logistics_agent_id AND logistics_agent_id
  // 2. For orders with either ID, show only if it matches the viewed agent's ID
  const filteredData = orders.data?.data?.filter((order) => {
    // Exclude if both IDs are missing/null
    if (!order.first_leg_logistics_agent_id && !order.logistics_agent_id) {
      return false;
    }
    // Show if either ID matches the viewed agent's ID
    return (
      order.first_leg_logistics_agent_id === id ||
      order.logistics_agent_id === id
    );
  }) || [];

  // Apply status filter if needed
  const data = currentStatus.trim()
    ? filteredData.filter((order) => order.status === currentStatus)
    : filteredData;

  interface column {
    key: string;
    label: string;
    render: (value: any, row: LogisticsOrder) => React.ReactNode;
  }
  const columns: column[] = [
    {
      key: "id",
      label: "id",
      render: (_, item) => {
        // Format order ID: first 12 characters without hyphens, all uppercase
        const formattedId = item.id
          .replace(/-/g, "")
          .slice(0, 12)
          .toUpperCase();
        return (
          <span
            className="bg-transparent w-[120px] line-clamp-1 overflow-ellipsis"
            data-theme="nord"
          >
            {formattedId}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (_, item) => {
        if (item.status.toLocaleLowerCase() == "paid") {
          return (
            <div className="badge badge-success badge-soft">
              {item.status.replaceAll("_", " ")}
            </div>
          );
        }
        return (
          <div className="badge badge-primary badge-soft">
            {item.status.replaceAll("_", " ")}
          </div>
        );
      },
    },
    // {
    //   key: "amount",
    //   label: "Amount",
    //   render: (_, item) => {
    //     return <>{item.total_amount}</>;
    //   },
    // },
    {
      key: "location",
      label: "location",
      render: (_, item) => {
        return <>{item.user.profile.address}</>;
      },
    },
    // {
    //   key: "logistic",
    //   label: "logistic ID",
    //   render: (_, item) => {
    //     return <>{item?.logistics_agent_id || "N/A"}</>;
    //   },
    // },
    {
      key: "items",
      label: "items",
      render: (_, item) => {
        return <>{item.order_items.length}</>;
      },
    },
  ];
  const actions = [
    {
      key: "view",
      label: "View",
      action: (item: any) => nav(`/admin/logistics/orders-details/${item.id}`),
    },
  ];
  const status = [
    {
      key: "",
      label: "All",
    },
    {
      key: "DELIVERED",
      label: "Delivered",
    },
    {
      key: "IN_TRANSIT",
      label: "In Transit",
    },
  ] as const;
  return (
    <div className="flex flex-col" data-theme="nord">
      <h2 className="my-2 text-xl font-bold mb-4">Orders Handled</h2>
      <div className="flex gap-2">
        <div role="tablist" className="tabs tabs-lift">
          {status.map((item) => (
            <a
              role="tab"
              className={`tab ${item.key === currentStatus ? "tab-active" : ""}`}
              key={item.key}
              onClick={() => setCurrentStatus(item.key)}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="badge my-auto badge-primary badge-soft">
          count: {data.length}
        </div>
      </div>
      <CustomTable data={data} columns={columns} actions={actions} />
    </div>
  );
}
