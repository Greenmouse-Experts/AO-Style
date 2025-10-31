import { useState, useMemo } from "react";
import { FaTimes, FaCheck, FaMapMarkerAlt, FaEllipsisH } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import CustomTable from "../../../components/CustomTable";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import {
  AlertCircle,
  Eye,
  Loader2,
  Package,
  Truck,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import useGetUserProfile from "../../Auth/hooks/useGetProfile";
import { formatOrderId } from "../../../lib/orderUtils";

// ... [Keep all the existing interfaces as they are] ...
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

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status.toLowerCase();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return { class: "badge-success", text: "Paid" };
      case "delivered":
        return { class: "badge-success", text: "Delivered" };
      case "dispatched_to_agent":
        return { class: "badge-info", text: "Dispatched to Agent" };
      case "out_for_delivery":
        return { class: "badge-warning", text: "Out for Delivery" };
      case "pending":
        return { class: "badge-error", text: "Pending" };
      case "cancelled":
        return { class: "badge-error", text: "Cancelled" };
      default:
        return { class: "badge-primary", text: status.replace(/_/g, " ") };
    }
  };

  const config = getStatusConfig(normalizedStatus);

  return (
    <div className={`${config.class} badge badge-outline py-5`}>
      {config.text}
    </div>
  );
};

const priceToDisplay = (item: Order) => {
  if(item?.status === "OUT_FOR_DELIVERY" || (item?.status === "IN_TRANSIT" && item?.logistics_agent_id)) {
    return item?.payment?.purchase?.delivery_data?.data?.second_leg_delivery_fee
  } else{
    return item?.payment?.purchase?.delivery_data?.data?.first_leg_delivery_fee
  }
}

// Delivery Stage Component
const DeliveryStage = ({ item }: { item: Order }) => {
  const status = item.status.toLowerCase();
  const hasStyle = item.order_items.some(
    (orderItem) => orderItem.product.style !== null,
  );

  // Helper function to render stage indicator
  const renderStageIndicator = (
    icon: React.ReactNode,
    label: string,
    description: string,
    variant: "info" | "warning" | "success" | "neutral" = "info",
  ) => {
    const variantClasses = {
      info: "bg-blue-50 border-blue-200 text-blue-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      success: "bg-green-50 border-green-200 text-green-800",
      neutral: "bg-gray-50 border-gray-200 text-gray-800",
    };

    const iconClasses = {
      info: "text-blue-600",
      warning: "text-yellow-600",
      success: "text-green-600",
      neutral: "text-gray-600",
    };

    // Make the badge more robust for long text: allow wrapping and set min/max width
    return (
      <div
        className={`flex items-start gap-3 p-3 border rounded-lg min-w-0 ${variantClasses[variant]}`}
        style={{
          minWidth: 0,
          maxWidth: 260,
          wordBreak: "break-word",
          whiteSpace: "normal",
        }}
      >
        <div className={`flex-shrink-0 mt-0.5 ${iconClasses[variant]}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <p
            className="font-medium text-sm leading-tight break-words"
            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
          >
            {label}
          </p>
          <p
            className="text-xs opacity-80 mt-1 leading-tight break-words"
            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
          >
            {description}
          </p>
        </div>
      </div>
    );
  };

  switch (status) {
    case "delivered":
      return renderStageIndicator(
        <CheckCircle className="w-4 h-4" />,
        "Delivered",
        "Successfully delivered to customer",
        "success",
      );

    case "dispatched_to_agent":
      return renderStageIndicator(
        <Truck className="w-4 h-4" />,
        "First Leg",
        "En route to logistics agent",
        "info",
      );

    case "out_for_delivery":
      if (hasStyle) {
        return renderStageIndicator(
          <ArrowRight className="w-4 h-4" />,
          "Tailor → Customer",
          "Custom order in transit",
          "warning",
        );
      } else {
        return renderStageIndicator(
          <Package className="w-4 h-4" />,
          "Vendor → Customer",
          "Final delivery in progress",
          "warning",
        );
      }

    default:
      return renderStageIndicator(
        <Package className="w-4 h-4" />,
        "Processing",
        "Order being processed",
        "neutral",
      );
  }
};

const OrderRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: user } = useGetUserProfile();
  const [status, setStatus] = useState("all");
  const navigate = useNavigate();

  // Map tab status to API type param
  const getTypeParam = (tabStatus: string) => {
    if (tabStatus === "all") return "all";
    if (tabStatus === "DELIVERED") return "delivered";
    if (tabStatus === "ongoing") return "ongoing";
    return "all";
  };

  const query = useQuery<OrderRequestsResponse>({
    queryKey: ["logistics", "orders", status],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/orders/available-orders", {
        params: {
          user_id: user?.id,
          type: getTypeParam(status),
        },
      });
      console.log(resp.data, "orders");
      return resp.data;
    },
    enabled: !!user?.id,
  });

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!query.data?.data) return [];

    return query.data.data.filter(
      (order) =>
        formatOrderId(order.payment?.id || order.id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.user.profile.address
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [query.data?.data, searchTerm]);

  // Error State
  if (query.isError) {
    return (
      <div
        data-theme="nord"
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
        aria-live="assertive"
      >
        <div className="alert alert-error max-w-md">
          <AlertCircle className="w-6 h-6" />
          <span>
            {query.error?.message || "An error occurred while loading orders"}
          </span>
        </div>
        <button
          className="btn btn-primary"
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
    render?: (_: any, item: Order) => JSX.Element;
  }[] = [
    {
      key: "id",
      label: "Order ID",
      render: (_, item) => (
        <div
          className="font-mono text-sm max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap"
          title={formatOrderId(item.payment?.id || item.id)}
        >
          {formatOrderId(item.payment?.id || item.id)}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, item) => <StatusBadge status={item.status} />,
    },
    {
      key: "delivery_stage",
      label: "Delivery Stage",
      render: (_, item) => (
        <div className="min-w-[200px] max-w-[260px]">
          <DeliveryStage item={item} />
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (_, item) => (
        <div className="font-semibold text-right">
          ₦{parseFloat(priceToDisplay(item)).toLocaleString()}
        </div>
      ),
    },
    {
      key: "location",
      label: "Delivery Location",
      render: (_, item) => (
        <div
          className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
          title={item.user.profile.address}
        >
          <FaMapMarkerAlt className="inline w-3 h-3 mr-1 text-gray-500" />
          {item.user.profile.address}
        </div>
      ),
    },
    // {
    //   key: "items",
    //   label: "Items",
    //   render: (_, item) => (
    //     <div className="text-center">
    //       <span className="badge badge-outline">{item.order_items.length}</span>
    //     </div>
    //   ),
    // },
    {
      key: "created_at",
      label: "Date Created",
      render: (_, item) => {
        const date = new Date(item.created_at);
        return (
          <div className="text-sm text-gray-600">
            <div>
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="text-xs text-gray-500">
              {date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      },
    },
  ];

  const actions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4" />,
      action: (item: Order) => {
        navigate(`/logistics/orders/${item.id}`);
      },
    },
    //tawkto
    // GMT timing
    // reinitiate
    // logistics accurate pricing
    // viewing details takes us to 404 page
    {
      key: "locate",
      label: "Track Location",
      icon: <FaMapMarkerAlt className="w-4 h-4" />,
      action: (item: Order) => {
        navigate(`/logistics/orders/${item.payment?.id || item.id}/map`);
      },
    },
  ];

  const tabs = [
    {
      key: "all",
      label: "All Orders",
      value: "all",
      count: query.data?.count || 0,
    },
    { key: "DELIVERED", label: "Delivered", value: "DELIVERED" },
    { key: "ongoing", label: "Ongoing", value: "ongoing" },
  ];

  return (
    <div data-theme="nord" className="min-h-screen bg-base-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order Management
              </h1>
              <div className="text-sm breadcrumbs text-gray-600 mt-1">
                <ul>
                  <li>
                    <Link to="/logistics">Dashboard</Link>
                  </li>
                  <li>Orders</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="stats shadow">
                <div className="stat py-2 px-4">
                  <div className="stat-title text-xs">Total Orders</div>
                  <div className="stat-value text-lg">
                    {query.data?.count || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Controls Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Order Requests
              </h2>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered w-full sm:w-80 text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-outline btn-sm">
                    Export <FaEllipsisH className="w-4 h-4 ml-2" />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40"
                  >
                    <li>
                      <a>Export as CSV</a>
                    </li>
                    <li>
                      <a>Export as Excel</a>
                    </li>
                    <li>
                      <a>Export as PDF</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="px-6">
            <div className="tabs tabs-lifted">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`tab tab-lg ${status === tab.value ? "tab-active" : ""}`}
                  onClick={() => setStatus(tab.value)}
                >
                  {tab.label}
                  {/*{tab.key === "all" && query.data?.count && (
                    <span className="badge badge-sm ml-2">
                      {query.data.count}
                    </span>
                  )}*/}
                </button>
              ))}
            </div>
          </div>

          {/* Table Section */}
          <div className="p-6">
            {query.isFetching ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Orders Found
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "No orders match your search criteria."
                    : "No orders available at the moment."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="btn btn-primary btn-sm mt-4"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <CustomTable
                  data={filteredData}
                  columns={columns}
                  actions={actions}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderRequests;
