import { useState, useRef, useEffect } from "react";
// import ReusableTable from "../logisticsDashboard/components/ReusableTable";
import { FaTimes, FaCheck, FaMapMarkerAlt, FaEllipsisH } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import CustomTable from "../../../components/CustomTable";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import { AlertCircle, Eye, Loader2 } from "lucide-react";
import useGetUserProfile from "../../Auth/hooks/useGetProfile";
import { formatOrderId } from "../../../lib/orderUtils";
interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: string;
  payment_id: string;
  metadata: any;
  logistics_agent_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  payment: Payment;
  user: User;
  logistics_agent: LogisticsAgent;
  order_items: OrderItem[];
}

interface Payment {
  id: string;
  user_id: string;
  purchase_type: string;
  purchase_id: any;
  amount: string;
  discount_applied: string;
  payment_status: string;
  transaction_id: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  billing_at_payment: any;
  billing_id: any;
  interval: any;
  currency: string;
  auto_renew: boolean;
  is_renewal: boolean;
  is_upgrade: boolean;
  metadata: PaymentMetadata[];
  purchase: Purchase;
  transaction_type: any;
  order_id: any;
}

interface PaymentMetadata {
  color: string;
  quantity: number;
  measurement: Measurement[];
  cart_item_id: string;
  customer_name: string;
  customer_email: string;
  style_product_id: string;
  fabric_product_id: string;
  style_product_name: string;
  fabric_product_name: string;
}

interface Measurement {
  full_body: FullBody;
  lower_body: LowerBody;
  upper_body: UpperBody;
  customer_name: string;
}

interface FullBody {
  height: number;
  height_unit: string;
  dress_length: number;
  dress_length_unit: string;
}

interface LowerBody {
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
}

interface UpperBody {
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
}

interface Purchase {
  items: Item[];
  coupon_id: any;
  tax_amount: number;
  coupon_type: any;
  coupon_value: any;
  delivery_fee: number;
}

interface Item {
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

interface VendorCharge {
  fabric_vendor_fee: number;
  fashion_designer_fee: number;
}

interface User {
  id: string;
  email: string;
  phone: string;
  profile: Profile;
}

interface Profile {
  id: string;
  user_id: string;
  profile_picture: any;
  address: string;
  bio: any;
  date_of_birth: any;
  gender: any;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  country: string;
  state: string;
  country_code: string;
  approved_by_admin: any;
  years_of_experience: any;
  measurement: Measurement2;
  coordinates: Coordinates;
}

interface Measurement2 {
  full_body: FullBody2;
  lower_body: LowerBody2;
  upper_body: UpperBody2;
}

interface FullBody2 {
  height: number;
  height_unit: string;
  dress_length: number;
  dress_length_unit: string;
}

interface LowerBody2 {
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
}

interface UpperBody2 {
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
}

interface Coordinates {
  latitude: string;
  longitude: string;
}

interface LogisticsAgent {
  id: string;
  name: string;
  profile: Profile2;
}

interface Profile2 {
  id: string;
  user_id: string;
  profile_picture: any;
  address: string;
  bio: any;
  date_of_birth: any;
  gender: any;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  country: string;
  state: any;
  country_code: string;
  approved_by_admin: any;
  years_of_experience: any;
  measurement: any;
  coordinates: Coordinates2;
}

interface Coordinates2 {
  latitude: string;
  longitude: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  deleted_at: any;
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
  tags: any[];
  price: string;
  original_price: string;
  currency: string;
  type: string;
  status: string;
  approval_status: string;
  published_at: any;
  archived_at: any;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  fabric: Fabric | null;
  style: Style | null;
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
  deleted_at: any;
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
  deleted_at: any;
}
interface OrderRequestsResponse {
  statusCode: number;
  data: Order[];
  count: number;
}
const OrderRequests = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: user } = useGetUserProfile();
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const query = useQuery<OrderRequestsResponse>({
    queryKey: ["logistics", "orders", status],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/orders/available-orders", {
        params: {
          user_id: user.id,
          status: status,
        },
      });
      return resp.data;
    },
  });
  // if (query.isFetching) {
  //   return (
  //     <div
  //       data-theme="nord"
  //       className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
  //       aria-live="polite"
  //     >
  //       <Loader2 className="w-8 h-8 text-primary animate-spin" />
  //       <span className="text-base-content text-lg">Loading Orders...</span>
  //     </div>
  //   );
  // }

  // Error State
  if (query.isError) {
    return (
      <div
        data-theme="nord"
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
        aria-live="assertive"
      >
        <div className="alert alert-error max-w-md">
          <AlertCircle className="w-6 h-6 text-error-content" />
          <span className="text-error-content">
            {query.error?.message || "An error occurred while loading orders"}
          </span>
        </div>
        <button
          className="btn btn-primary btn-md"
          onClick={() => query.refetch()}
          aria-label="Retry loading orders"
        >
          Try Again
        </button>
      </div>
    );
  }
  const columns: {
    key: string;
    label: string;
    render?: (_, item: Order) => JSX.Element;
  }[] = [
    {
      key: "id",
      label: "Order ID",
      render: (_, item) => {
        return (
          <div className=" w-[80px] overflow-ellipsis" data-theme="nord">
            {formatOrderId(item.payment?.id || item.id)}
          </div>
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
    {
      key: "amount",
      label: "Amount",
      render: (_, item) => {
        return <>{item.total_amount}</>;
      },
    },
    {
      key: "location",
      label: "location",
      render: (_, item) => {
        return <>{item.user.profile.address}</>;
      },
    },
    {
      key: "items",
      label: "items",
      render: (_, item) => {
        return <>{item.order_items.length}</>;
      },
    },
    {
      key: "created_at",
      label: "Date Created",
      render: (_, item) => {
        const date = new Date(item.created_at);
        return (
          <span className="text-sm">
            {date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        );
      },
    },
  ];

  const actions = [
    {
      key: "view",
      label: "View",
      icon: <Eye className="w-4 h-4 text-primary" />,
      action: (item: Order) => {
        console.log(item, "view");
        // dialogRef.current?.showModal();
        navigate(`/logistics/orders/${item.payment?.id || item.id}`);
      },
    },
    {
      key: "locate",
      label: "locate",
      icon: <Eye className="w-4 h-4 text-primary" />,
      action: (item: Order) => {
        console.log(item, "view");
        // dialogRef.current?.showModal();
        navigate(`/logistics/orders/${item.payment?.id || item.id}/map`);
      },
    },
  ];
  const data = query.data?.data;
  const tabs = [
    {
      key: "all",
      label: "All",
      value: "",
    },
    {
      key: "DELIVERED",
      label: "Delivered",
      value: "DELIVERED",
    },
    {
      key: "ongoing",
      label: "Ongoing",
      value: "OUT_FOR_DELIVERY",
    },
  ];
  // return <>{JSON.stringify(data)}</>;
  return (
    <div data-theme="nord" className="min-h-screen flex flex-col  bg-base-100">
      <div className="p-4 rounded-box outline outline-current/20 m-4">
        <h2 className="font-bold text-2xl text-base-content mb-2">
          Orders Requested
        </h2>
        <div className="breadcrumbs text-base-content">
          <ul>
            <li>Dashboard</li>
            <li>Orders</li>
          </ul>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
          <h2 className="text-lg font-semibold">Order Requests</h2>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 py-2 px-3 border border-gray-200 rounded-md outline-none text-sm"
            />
            <div className="dropdown dropdown-end w-full sm:w-auto">
              <label
                tabIndex={0}
                className="btn m-1 bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md border-none hover:bg-gray-200"
              >
                Export As ▾
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <a>CSV</a>
                </li>
                <li>
                  <a>Excel</a>
                </li>
                <li>
                  <a>PDF</a>
                </li>
              </ul>
            </div>
            {/* <button className="w-full sm:w-auto bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md">
              Sort: Newest First ▾
            </button>*/}
          </div>
        </div>

        {/* Table */}
        <div className="tabs tabs-lift">
          {tabs.map((item) => {
            if (item.value === status) {
              return (
                <div className="tab tab-active" key={item.key}>
                  {item.label}
                </div>
              );
            }
            return (
              <div
                className="tab"
                key={item.key}
                onClick={() => setStatus(item.value)}
              >
                {item.label}
              </div>
            );
          })}
        </div>
        {query.isFetching ? (
          <div
            data-theme="nord"
            className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
            aria-live="polite"
          >
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-base-content text-lg">Loading Orders...</span>
          </div>
        ) : (
          <CustomTable data={data} columns={columns} actions={actions} />
        )}
      </div>
    </div>
  );
};

export default OrderRequests;
