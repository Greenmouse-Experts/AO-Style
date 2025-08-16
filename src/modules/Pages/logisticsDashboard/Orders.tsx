import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import CustomTable from "../../../components/CustomTable";
interface VendorCharge {
  fabric_vendor_fee: number;
  fashion_designer_fee: number;
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
  vendor_charge: VendorCharge;
}

interface Purchase {
  items: PurchaseItem[];
  coupon_id: null;
  coupon_type: null;
  coupon_value: null;
}

interface Payment {
  id: string;
  user_id: string;
  purchase_type: string;
  purchase_id: null;
  amount: string;
  discount_applied: string;
  payment_status: string;
  transaction_id: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  billing_at_payment: null;
  billing_id: null;
  interval: null;
  currency: string;
  auto_renew: boolean;
  is_renewal: boolean;
  is_upgrade: boolean;
  metadata: null;
  purchase: Purchase;
  transaction_type: null;
  order_id: null;
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

interface UserProfile {
  id: string;
  user_id: string;
  profile_picture: string;
  address: string;
  bio: string;
  date_of_birth: string;
  gender: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  country: string;
  state: string;
  country_code: string;
  approved_by_admin: null;
  years_of_experience: null;
  measurement: Measurement;
  coordinates: {
    latitude: string;
    longitude: string;
  };
}

interface User {
  id: string;
  email: string;
  phone: string;
  profile: UserProfile;
}

interface FabricDetails {
  id: string;
  product_id: string;
  market_id: string;
  weight_per_unit: string;
  location: {
    latitude: string;
    longitude: string;
  };
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
  deleted_at: null;
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
  type: string;
  status: string;
  approval_status: string;
  published_at: null;
  archived_at: null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  fabric: FabricDetails;
  style: null;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  product: Product;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: string;
  payment_id: string;
  metadata: null;
  logistics_agent_id: null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  payment: Payment;
  user: User;
  order_items: OrderItem[];
}

interface OrderRequestsResponse {
  statusCode: number;
  data: Order[];
  count: number;
}
export default function OrderRequests() {
  const query = useQuery<OrderRequestsResponse>({
    queryKey: ["logistics", "orders"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/orders/available-orders");
      return resp.data;
    },
  });

  if (query.isFetching)
    <>
      <div data-theme="nord">
        <div className="animate-spin loading-bars"></div>
        <span>Loading Orders</span>
      </div>
    </>;

  if (query.isError)
    return (
      <div data-theme="nord">
        <div>Error Occured loading Orders</div>
        <button className="btn btn-primary" onClick={query.refetch}>
          Reload
        </button>
      </div>
    );
  interface ColumnDef<T> {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
  }

  const columns: ColumnDef<Order>[] = [
    {
      key: "order_id",
      label: "Order ID",
      render: (item: Order) => {
        return <span>{item.id}</span>;
      },
    },
    {
      key: "customer_name",
      label: "Customer Name",
      render: (item: Order) => {
        return <span>{item.user.profile.address}</span>;
      },
    },
    {
      key: "order_date",
      label: "Order Date",
      render: (item: Order) => {
        return <span>{new Date(item.created_at).toLocaleString()}</span>;
      },
    },
    {
      key: "order_status",
      label: "Order Status",
      render: (item: Order) => {
        return <span>{item.status}</span>;
      },
    },
    {
      key: "total_amount",
      label: "Total Amount",
      render: (item: Order) => {
        return (
          <span>
            {item.payment.currency} {item.total_amount}
          </span>
        );
      },
    },
  ];

  return (
    <div data-theme="nord" className="bg-transparent">
      <div className="p-3 round-md my-4  bg-white mb-4">
        <h2 className="font-bold text-xl my-2">Orders</h2>
        <div className="font-semibold opacity-80">Dashboard {">"} Orders</div>
      </div>
      <CustomTable data={query.data?.data || []} columns={columns} />
    </div>
  );
}
