import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Loader2,
  Clock,
  AlertTriangle,
  MapPin,
  Package,
} from "lucide-react"; // Import Lucide Icons
import CaryBinApi from "../../../services/CarybinBaseUrl";
import CustomTable from "../../../components/CustomTable";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { formatOrderId } from "../../../lib/orderUtils";
import useGetUserProfile from "../../Auth/hooks/useGetProfile";

// Interfaces (unchanged from original)
interface Measurement {
  full_body?: {
    height: number;
    height_unit: string;
    dress_length: number;
    dress_length_unit: string;
  };
  lower_body?: {
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
  upper_body?: {
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
  customer_name?: string;
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
  approved_by_admin: string | null;
  years_of_experience: string | null;
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

interface Product {
  id: string;
  business_id: string;
  category_id: string;
  creator_id: string;
  name: string;
  sku: string;
  description: string;
  gender: string;
  tags: [];
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
  fabric: any | null;
  style: any | null;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  product: Product;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: string;
  payment_id: string;
  metadata: any | null;
  logistics_agent_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  payment: any;
  user: User;
  logistics_agent: any | null;
  order_items: OrderItem[];
}

interface OrderRequestsResponse {
  statusCode: number;
  data: Order[];
  count: number;
}

export default function OrderRequests() {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedItem, setSelectedItem] = useState<Order | null>(null);
  const { data: user } = useGetUserProfile();

  // Query for available orders
  const {
    data: availableOrdersData,
    isFetching: isAvailableLoading,
    isError: isAvailableError,
    error: availableError,
    refetch: refetchAvailable,
  } = useQuery<OrderRequestsResponse>({
    queryKey: ["logistics", "orders", "available"],
    queryFn: async () => {
      const resp = await CaryBinApi.get(
        "/orders/available-orders?type=new-order",
      );
      console.log("=== LOGISTICS ORDERS PAGE LOADED ===");
      console.log("Available orders data:", resp.data);
      console.log("Number of orders:", resp.data?.data?.length || 0);
      console.log("====================================");
      return resp.data;
    },
  });
  console.log("Available orders data (outside):", availableOrdersData);
  // Query for ongoing orders
  const {
    data: ongoingOrdersData,
    isFetching: isOngoingLoading,
    isError: isOngoingError,
    error: ongoingError,
    refetch: refetchOngoing,
  } = useQuery<OrderRequestsResponse>({
    queryKey: ["logistics", "orders", "ongoing"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/orders/available-orders", {
        params: {
          user_id: user?.id,
          type: "ongoing",
        },
      });
      console.log("=== ONGOING ORDERS ===");
      console.log("Ongoing orders data:", resp.data);
      console.log("Number of ongoing orders:", resp.data?.data?.length || 0);
      console.log("======================");
      return resp.data;
    },
    enabled: !!user?.id,
  });
  console.log("Ongoing orders data (outside):", ongoingOrdersData);
  const hasOngoingOrders =
    ongoingOrdersData?.data && ongoingOrdersData.data.length > 0;
  const isLoading = isAvailableLoading || isOngoingLoading;
  const isError = isAvailableError || isOngoingError;
  const error = availableError || ongoingError;

  const hasStyleItems = () => {
    return (
      availableOrdersData?.data?.some((order: Order) =>
        order?.order_items?.some((item: OrderItem) =>
          item?.product?.type?.toLowerCase().includes("style"),
        ),
      ) || false
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <div
        data-theme="nord"
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
        aria-live="polite"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-base-content text-lg">Loading Orders...</span>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div
        data-theme="nord"
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
        aria-live="assertive"
      >
        <div className="alert alert-error max-w-md shadow-lg">
          <AlertCircle className="w-6 h-6 text-error-content" />
          <span className="text-error-content">
            {error?.message || "An error occurred while loading orders"}
          </span>
        </div>
        <button
          className="btn btn-primary btn-md"
          onClick={() => {
            refetchAvailable();
            refetchOngoing();
          }}
          aria-label="Retry loading orders"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Improved Columns with better styling
  const columns: {
    key: string;
    label: string;
    render?: (value: any, item: Order) => React.JSX.Element;
  }[] = [
    {
      key: "id",
      label: "Order ID",
      render: (value: any, item: Order) => {
        const fullId = item.payment?.id || item.id;
        const displayId = formatOrderId(fullId);
        return (
          <div className="flex flex-col">
            <span
              className="font-mono text-sm font-semibold text-primary cursor-pointer hover:text-primary-focus transition-colors"
              title={`Full ID: ${fullId}`}
            >
              {displayId}
            </span>
            <span className="text-xs text-base-content/60">
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
        );
      },
    },
    {
      key: "customer",
      label: "Customer",
      render: (value: any, item: Order) => {
        return (
          <div className="flex flex-col">
            <span className="font-medium text-base-content">
              {item.user?.email?.split("@")[0] || "Unknown"}
            </span>
            <span className="text-xs text-base-content/60">
              {item.user?.phone || "No phone"}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value: any, item: Order) => {
        const status = item.status.toLowerCase();
        let badgeClass = "badge-primary";
        let icon = <Clock className="w-3 h-3" />;
        let showSecondLeg = false;

        if (status === "paid") {
          badgeClass = "badge-success";
          icon = <CheckCircle className="w-3 h-3" />;
        } else if (status === "cancelled") {
          badgeClass = "badge-error";
          icon = <AlertCircle className="w-3 h-3" />;
        } else if (
          (status === "out_for_delivery" || status === "out for delivery") &&
          hasStyleItems()
        ) {
          badgeClass = "badge-info";
          icon = <Package className="w-3 h-3" />;
          showSecondLeg = true;
        }

        return (
          <div className="flex flex-col items-start gap-1">
            <div className={`badge ${badgeClass} gap-1 px-3 py-2`}>
              {icon}
              <span className="text-xs font-medium">
                {item.status.replaceAll("_", " ").toUpperCase()}
              </span>
            </div>
            {showSecondLeg && (
              <div className="badge badge-warning badge-outline badge-xs gap-1 px-2 py-1">
                <div className="w-1.5 h-1.5 bg-warning rounded-full"></div>
                <span className="text-xs">Second Leg</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "location",
      label: "Location",
      render: (value: any, item: Order) => {
        return (
          <div className="flex items-center gap-2 max-w-[200px]">
            <MapPin className="w-4 h-4 text-base-content/60 flex-shrink-0" />
            <span
              className="truncate text-sm"
              title={item.user.profile.address}
            >
              {item.user.profile.address}
            </span>
          </div>
        );
      },
    },
    {
      key: "items",
      label: "Items",
      render: (value: any, item: Order) => {
        return (
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-base-content/60" />
            <span className="font-semibold text-primary">
              {item.order_items.length}
            </span>
            <span className="text-xs text-base-content/60">
              item{item.order_items.length !== 1 ? "s" : ""}
            </span>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (_, item) => {
        return (
          <div className="flex flex-col items-end">
            <span className="font-bold text-success">
              ₦{parseFloat(item.payment.purchase.delivery_fee).toLocaleString()}
            </span>
            <span className="text-xs text-base-content/60">Total</span>
          </div>
        );
      },
    },
  ];

  // Actions with improved styling
  interface ActionConfig {
    key: string;
    label: string;
    icon: React.JSX.Element;
    action: (item: Order) => void;
    className?: string;
  }

  const actions: ActionConfig[] = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4" />,
      action: (item: Order) => {
        console.log(item, "view");
        navigate(`/logistics/orders/${item.id}`);
      },
      className: "btn-primary btn-sm",
    },
    {
      key: "locate",
      label: "View on Map",
      icon: <MapPin className="w-4 h-4" />,
      action: (item: Order) => {
        console.log(item, "locate");
        navigate(`/logistics/orders/${item.payment?.id || item.id}/map`);
      },
      className: "btn-secondary btn-sm",
    },
  ];

  // Ongoing Orders Alert Component
  const OngoingOrdersAlert = () => (
    <div className="m-4 mb-6">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 rounded-xl shadow-sm">
        <div className="flex items-start gap-4 p-6">
          <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              Pending Orders Found
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              You have {ongoingOrdersData?.data.length} ongoing order
              {ongoingOrdersData?.data.length !== 1 ? "s" : ""} that must be
              completed before accepting new ones.
            </p>

            {/* Ongoing Orders Summary */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-orange-100">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                Your Ongoing Orders:
              </h4>
              <div className="space-y-2">
                {ongoingOrdersData?.data.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-100 hover:border-orange-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <div>
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {formatOrderId(order.payment?.id || order.id)}
                        </span>
                        <div className="text-xs text-gray-500">
                          {order.order_items.length} item
                          {order.order_items.length !== 1 ? "s" : ""} • ₦
                          {parseFloat(
                            order.payment.purchase.delivery_fee,
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                        {order.status.replaceAll("_", " ").toUpperCase()}
                      </div>
                      <button
                        className="text-orange-600 hover:text-orange-700 p-1 rounded-md hover:bg-orange-50 transition-colors"
                        onClick={() =>
                          navigate(`/logistics/orders/${order.id}`)
                        }
                        title="View Order"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                className="px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                onClick={() => {
                  refetchOngoing();
                  refetchAvailable();
                }}
              >
                <Loader2 className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div data-theme="nord" className="min-h-screen flex flex-col bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-base-300">
        <div className="p-6 mx-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-base-content mb-2">
                Order Management
              </h1>
              <div className="breadcrumbs text-base-content/70">
                <ul>
                  <li>Dashboard</li>
                  <li>Logistics</li>
                  <li className="text-primary font-medium">Available Orders</li>
                </ul>
              </div>
            </div>
            <div className="stats shadow bg-base-100/50 backdrop-blur-sm">
              <div className="stat place-items-center py-4 px-6">
                <div className="stat-title text-xs">Available Orders</div>
                <div className="stat-value text-2xl text-primary">
                  {availableOrdersData?.data?.length || 0}
                </div>
                <div className="stat-desc text-xs">Ready for pickup</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Orders Alert */}
      {hasOngoingOrders && <OngoingOrdersAlert />}

      {/* Available Orders Table */}
      <div
        className={`flex-1 ${hasOngoingOrders ? "opacity-40 pointer-events-none" : ""} transition-all duration-300`}
      >
        <div className="m-4">
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
            <div className="p-6 border-b border-base-300 bg-base-200/50">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-xl text-base-content flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Available Orders
                  {hasOngoingOrders && (
                    <div className="badge badge-outline badge-sm ml-2">
                      Temporarily Disabled
                    </div>
                  )}
                </h2>
                {!hasOngoingOrders && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      refetchAvailable();
                      refetchOngoing();
                    }}
                  >
                    <Loader2 className="w-4 h-4" />
                    Refresh
                  </button>
                )}
              </div>
              {!hasOngoingOrders && (
                <p className="text-base-content/70 text-sm mt-2">
                  Select orders to pickup and deliver to customers
                </p>
              )}
            </div>

            <div className="relative">
              {hasOngoingOrders && (
                <div className="absolute inset-0 bg-gray-50/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Complete Ongoing Orders First
                    </h3>
                    <p className="text-gray-600 text-sm">
                      You must complete your current orders before accepting new
                      ones
                    </p>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <CustomTable
                  data={availableOrdersData?.data}
                  actions={actions}
                  columns={columns}
                  className="table-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      <dialog
        ref={dialogRef}
        className="modal"
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      >
        <div className="modal-box bg-base-100 max-w-2xl">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setSelectedItem(null)}
            >
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg text-base-content mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Order Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-base-200 rounded-lg p-4">
                <h4 className="font-semibold text-base-content mb-3">
                  Order Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Order ID:</span>
                    <span className="font-mono font-semibold">
                      {formatOrderId(
                        selectedItem?.payment?.id || selectedItem?.id || "",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Status:</span>
                    <div className="badge badge-primary badge-sm">
                      {selectedItem?.status}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Total Amount:</span>
                    <span className="font-bold text-success">
                      ₦
                      {selectedItem?.total_amount
                        ? parseFloat(selectedItem.total_amount).toLocaleString()
                        : "0"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-base-200 rounded-lg p-4">
                <h4 className="font-semibold text-base-content mb-3">
                  Customer
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Email:</span>
                    <span>{selectedItem?.user?.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Phone:</span>
                    <span>{selectedItem?.user?.phone || "N/A"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-base-content/70">Address:</span>
                    <span className="text-xs bg-base-100 p-2 rounded">
                      {selectedItem?.user?.profile?.address ||
                        "No address provided"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-base-200 rounded-lg p-4">
                <h4 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Items ({selectedItem?.order_items.length || 0})
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {selectedItem?.order_items.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-base-100 rounded p-3 border"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="font-medium text-sm">
                            {item.product.name}
                          </span>
                          <div className="text-xs text-base-content/70 mt-1">
                            SKU: {item.product.sku}
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <div className="font-semibold text-sm">
                            x{item.quantity}
                          </div>
                          <div className="text-xs text-success">
                            ₦{parseFloat(item.price).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              className="btn btn-ghost"
              onClick={() => setSelectedItem(null)}
            >
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                navigate(`/logistics/orders/${selectedItem?.id}`);
                setSelectedItem(null);
              }}
            >
              <Eye className="w-4 h-4" />
              View Full Details
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setSelectedItem(null)}>close</button>
        </form>
      </dialog>
    </div>
  );
}
