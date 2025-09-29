import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import {
  AlertCircle,
  Loader2,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  User,
  Phone,
  Mail,
  Navigation,
  Star,
  Calendar,
  DollarSign,
  ArrowRight,
  Target,
  Route,
  Image as ImageIcon,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useItemMap } from "../../../store/useTempStore";
import { useRef, useState } from "react";
import useGetUser from "../../../hooks/user/useGetSingleUser";
import useGetUserProfile from "../../Auth/hooks/useGetProfile";
import CustomBackbtn from "../../../components/CustomBackBtn";
import useToast from "../../../hooks/useToast";
import { formatOrderId } from "../../../lib/orderUtils";
import "react-toastify/dist/ReactToastify.css";

interface MeasurementData {
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
  customer_name: string;
}

interface MetadataItem {
  color: string;
  quantity: number;
  measurement: MeasurementData[];
  cart_item_id: string;
  customer_name: string;
  customer_email: string;
  style_product_id: string;
  fabric_product_id: string;
  style_product_name: string;
  fabric_product_name: string;
  image?: string;
}

interface OrderSummary {
  order_summary: {
    subtotal: number;
    vat_amount: number;
    coupon_code: string;
    final_total: number;
    postal_code: string;
    delivery_fee: number;
    delivery_city: string;
    delivery_state: string;
    delivery_address: string;
    delivery_country: string;
    total_style_items: number;
    total_fabric_items: number;
  };
}

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
  tax_amount: number;
  coupon_type: null;
  coupon_value: null;
  delivery_fee: number;
}

interface PaymentData {
  id: string;
  user_id: string;
  purchase_type: string;
  purchase_id: null;
  amount: string;
  discount_applied: string;
  payment_status: string;
  status: string;
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
  tailor_delivery_code: string | null;
  user_delivery_code: string | null;
  total_amount: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  profile_picture: null;
  address: string;
  bio: null;
  date_of_birth: null;
  gender: null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  country: string;
  state: string;
  country_code: string;
  approved_by_admin: null;
  years_of_experience: null;
  measurement: MeasurementData;
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

interface ProductFabric {
  id: string;
  product_id: string;
  market_id: string;
  weight_per_unit: string;
  location: {};
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

interface ProductStyle {
  id: string;
  product_id: string;
  estimated_sewing_time: number;
  minimum_fabric_qty: string;
  location: {};
  photos: string[];
  video_url: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}

interface Creator {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile: UserProfile;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category_id: string;
  market_id: string;
  location: {};
  currency: string;
  type: string;
  status: string;
  approval_status: string;
  published_at: null;
  archived_at: null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  fabric: ProductFabric;
  style: ProductStyle;
  creator: Creator;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  product: Product;
  metadata?: any; // Accepts object or null
}

interface LogisticAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface OrderLogisticsData {
  statusCode: number;
  data: {
    id: string;
    user_id: string;
    status: string;
    total_amount: string;
    payment_id: string;
    metadata: null;
    logistics_agent_id: string | null;
    first_leg_logistics_agent_id: string | null;
    tailor_delivery_code: string | null;
    user_delivery_code: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: null;
    user: User;
    order_items: OrderItem[];
    logistics_agent: LogisticAgent | null;
    payment: PaymentData;
  };
}

export default function ViewOrderLogistics() {
  const { id } = useParams();
  const setItem = useItemMap((state) => state.setItem);
  const [delivery_code, setDeliveryCode] = useState<string>("");
  const [tailor_delivery_code, setTailorDeliveryCode] = useState<string>("");
  const [user_delivery_code, setUserDeliveryCode] = useState<string>("");
  const { data: userProfile } = useGetUserProfile();
  const { toastSuccess, toastError } = useToast();
  const nav = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Modal state for viewing item image
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);

  const query = useQuery<OrderLogisticsData>({
    queryKey: ["logistic", id, "view"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/orders/" + id);
      console.log("🔍 Order data response:", resp.data);
      return resp.data;
    },
  });

  // Accept mutation for both first and second leg
  const accept_mutation = useMutation({
    mutationFn: async ({ leg }: { leg: "first" | "second" }) => {
      const currentStatus = query.data?.data?.status;
      let route = "";
      if (leg === "first") {
        route = `/orders/${id}/accept-order-first-leg`;
      } else {
        route = `/orders/${id}/accept-order`;
      }
      console.log("🚛 Accepting order:", {
        orderId: id,
        currentStatus,
        route,
        leg,
      });

      let resp = await CaryBinApi.patch(route);
      console.log("✅ Accept order response:", resp.data);
      return resp.data;
    },
    onSuccess: (result) => {
      console.log("✅ Order accepted successfully:", result);
      const message = result?.message || "Order accepted successfully!";
      toastSuccess(message);
      query.refetch();
    },
    onError: (error: any) => {
      console.error("❌ Accept order failed:", error);
      console.error("❌ Error response:", error?.response?.data);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to accept order";
      toastError(errorMessage);
    },
  });

  const order_mutation = useMutation({
    mutationFn: async ({ status, code }: { status: string; code?: string }) => {
      const payload: any = { status: status };
      if (code) {
        if (status === "DELIVERED_TO_TAILOR") {
          payload.tailor_delivery_code = code;
        } else if (status === "DELIVERED") {
          payload.user_delivery_code = code;
        }
      }
      let resp = await CaryBinApi.put(`/orders/${id}/status`, payload);
      return resp.data;
    },
    onSuccess: (result) => {
      console.log("✅ Status update successful:", result);
      const message = result?.message || "Status updated successfully!";
      toastSuccess(message);
      query.refetch();
      dialogRef.current?.close();
      setDeliveryCode("");
      setTailorDeliveryCode("");
      setUserDeliveryCode("");
    },
    onError: (error: any) => {
      console.error("❌ Status update failed:", error);
      console.error("❌ Error response:", error?.response?.data);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        error?.data?.message ||
        "Failed to update status";
      toastError(errorMessage);
    },
  });

  if (query.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Order
          </h3>
          <p className="text-red-600">
            Failed to load order details. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const order_data = query.data?.data;
  const currentStatus = order_data?.status;

  // Helper function to check if order has style items
  const hasStyleItems = () => {
    return (
      order_data?.order_items?.some((item) =>
        item?.product?.type?.toLowerCase().includes("style"),
      ) || false
    );
  };

  // Delivery leg determination based on order type
  const firstLegStatuses = ["DISPATCHED_TO_AGENT"]; // Fabric+Style orders: vendor to tailor
  const secondLegStatuses = ["OUT_FOR_DELIVERY"]; // Tailor to customer OR fabric-only vendor to customer
  const transitStatuses = ["IN_TRANSIT"];

  const isFirstLeg = firstLegStatuses.includes(currentStatus || "");
  const isSecondLeg = secondLegStatuses.includes(currentStatus || "");
  const isInTransit = transitStatuses.includes(currentStatus || "");
  const isDelivered = currentStatus === "DELIVERED";

  // Assignment logic
  const isAssigned =
    order_data?.logistics_agent_id === userProfile?.id ||
    order_data?.first_leg_logistics_agent_id === userProfile?.id;

  // Second leg assignment eligibility:
  // If there is a first_leg_logistics_agent_id (someone did first leg), and
  // there is NO logistics_agent_id (nobody has accepted second leg yet), and
  // status is OUT_FOR_DELIVERY, and current user is NOT the first_leg_logistics_agent
  const canAcceptSecondLeg =
    !!order_data?.first_leg_logistics_agent_id &&
    !order_data?.logistics_agent_id &&
    currentStatus === "OUT_FOR_DELIVERY" &&
    userProfile?.id !== order_data?.first_leg_logistics_agent_id;

  // Debug logging
  console.log("🔍 Order data debug:", {
    order_data,
    currentStatus,
    logistics_agent_id: order_data?.logistics_agent_id,
    first_leg_logistics_agent_id: order_data?.first_leg_logistics_agent_id,
    userProfile_id: userProfile?.id,
    isAssigned,
    canAcceptSecondLeg,
    user_profile: order_data?.user?.profile,
    order_items: order_data?.order_items,
    payment: order_data?.payment,
  });

  // Status flow based on order type
  const getStatusInfo = () => {
    const isStyleOrder = hasStyleItems();

    switch (currentStatus) {
      case "DISPATCHED_TO_AGENT":
        // First leg: Fabric vendor to tailor (fabric+style orders only)
        return {
          phase: "First Leg - Pickup",
          description: "Pickup fabric from vendor → Deliver to tailor",
          nextAction: "Deliver to Tailor",
          nextStatus: "DELIVERED_TO_TAILOR",
          codeType: "tailor_delivery_code",
          icon: Package,
          color: "blue",
        };
      case "OUT_FOR_DELIVERY":
        // Direct delivery for fabric-only OR second leg for fabric+style
        return {
          phase: isStyleOrder ? "Second Leg - Pickup" : "Direct Delivery",
          description: isStyleOrder
            ? "Pickup completed item from tailor → Deliver to customer"
            : "Pickup fabric from vendor → Deliver to customer",
          nextAction: "Start Delivery",
          nextStatus: "IN_TRANSIT",
          codeType: null,
          icon: Truck,
          color: "orange",
        };
      case "IN_TRANSIT":
        return {
          phase: "In Transit",
          description: "En route to customer",
          nextAction: "Complete Delivery",
          nextStatus: "DELIVERED",
          codeType: "user_delivery_code",
          icon: Navigation,
          color: "purple",
        };
      case "DELIVERED":
        return {
          phase: "Completed",
          description: "Order delivered successfully",
          nextAction: null,
          nextStatus: null,
          codeType: null,
          icon: CheckCircle,
          color: "green",
        };
      default:
        return {
          phase: "Pending",
          description: "Waiting for vendor to dispatch order",
          nextAction: null,
          nextStatus: null,
          codeType: null,
          icon: Clock,
          color: "gray",
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleStatusUpdate = (newStatus: string, code?: string) => {
    order_mutation.mutate({ status: newStatus, code });
  };

  const deliveryAddress = order_data?.user?.profile?.address;
  const deliveryCity = order_data?.user?.profile?.state;
  const deliveryState = order_data?.user?.profile?.state;
  const deliveryCountry = order_data?.user?.profile?.country;

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <CustomBackbtn />
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isDelivered
                        ? "bg-green-500"
                        : isInTransit
                          ? "bg-purple-500 animate-pulse"
                          : isFirstLeg || isSecondLeg
                            ? "bg-orange-500"
                            : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-gray-600">
                    Order ID: {formatOrderId(order_data?.payment_id || "")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Delivery Management
                  </h1>
                  <p className="text-gray-600">
                    Manage your delivery assignments and track order progress
                  </p>
                </div>

                {/* Status Badge */}
                <div className="mt-4 lg:mt-0">
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      statusInfo.color === "green"
                        ? "bg-green-100 text-green-800"
                        : statusInfo.color === "purple"
                          ? "bg-purple-100 text-purple-800"
                          : statusInfo.color === "orange"
                            ? "bg-orange-100 text-orange-800"
                            : statusInfo.color === "blue"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <statusInfo.icon className="w-4 h-4 mr-2" />
                    {statusInfo.phase}: {currentStatus?.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Assignment Status */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-600" />
                  Assignment Status
                </h3>

                {/* First leg assignment */}
                {!order_data?.logistics_agent_id &&
                !order_data?.first_leg_logistics_agent_id &&
                !canAcceptSecondLeg ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-800 text-sm font-medium">
                        📋 Order available for assignment
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        accept_mutation.mutate({
                          leg:
                            order_data?.status === "OUT_FOR_DELIVERY"
                              ? "second"
                              : "first",
                        })
                      }
                      disabled={accept_mutation.isPending}
                      className="cursor-pointer w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {accept_mutation.isPending ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Accepting...
                        </div>
                      ) : order_data?.status === "OUT_FOR_DELIVERY" ? (
                        "Accept Order"
                      ) : (
                        "Accept Order"
                      )}
                    </button>
                  </div>
                ) : null}

                {/* Second leg assignment */}
                {canAcceptSecondLeg && (
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-indigo-800 text-sm font-medium">
                        🚚 Second leg available for assignment
                      </p>
                    </div>
                    <button
                      onClick={() => accept_mutation.mutate({ leg: "second" })}
                      disabled={accept_mutation.isPending}
                      className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {accept_mutation.isPending ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Accepting...
                        </div>
                      ) : (
                        "Accept Order (Second Leg)"
                      )}
                    </button>
                  </div>
                )}

                {/* Already assigned to me */}
                {isAssigned && !canAcceptSecondLeg && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm font-medium">
                        ✅ Assigned to you
                      </p>
                    </div>

                    {/* Status Update Actions */}
                    {statusInfo.nextAction && (
                      <div className="space-y-3">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">
                            {statusInfo.phase}
                          </h4>
                          <p className="text-blue-700 text-sm">
                            {statusInfo.description}
                          </p>
                        </div>

                        {statusInfo.codeType ? (
                          <button
                            onClick={() => dialogRef.current?.showModal()}
                            disabled={order_mutation.isPending}
                            className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              statusInfo.color === "blue"
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : statusInfo.color === "purple"
                                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                                  : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                          >
                            {order_mutation.isPending ? (
                              <div className="flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Updating...
                              </div>
                            ) : (
                              statusInfo.nextAction
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleStatusUpdate(statusInfo.nextStatus!)
                            }
                            disabled={order_mutation.isPending}
                            className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {order_mutation.isPending ? (
                              <div className="flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Starting...
                              </div>
                            ) : (
                              statusInfo.nextAction
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Assigned to someone else */}
                {!isAssigned &&
                  !canAcceptSecondLeg &&
                  (order_data?.logistics_agent_id ||
                    order_data?.first_leg_logistics_agent_id) && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-600 text-sm">
                        👤 Assigned to:{" "}
                        {order_data?.logistics_agent?.name || "Another agent"}
                      </p>
                    </div>
                  )}
              </div>

              {/* Delivery Progress */}
              {!isInTransit && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Route className="w-5 h-5 mr-2 text-purple-600" />
                    Delivery Progress
                  </h3>

                  <div className="space-y-4">
                    {/* Delivery Progress Logic */}
                    {hasStyleItems() ? (
                      <>
                        {/* First Leg: Vendor → Tailor */}
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              [
                                "DELIVERED_TO_TAILOR",
                                "OUT_FOR_DELIVERY",
                                "SHIPPED",
                                "IN_TRANSIT",
                                "DELIVERED",
                              ].includes(currentStatus || "")
                                ? "bg-green-100 text-green-600"
                                : currentStatus === "DISPATCHED_TO_AGENT"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {[
                              "DISPATCHED_TO_AGENT",
                              "DELIVERED_TO_TAILOR",
                              "PROCESSING",
                              "OUT_FOR_DELIVERY",
                              "SHIPPED",
                              "IN_TRANSIT",
                              "DELIVERED",
                            ].includes(currentStatus || "") ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <span className="text-xs font-bold">1</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              First Leg
                            </p>
                            <p className="text-sm text-gray-600">
                              Vendor → Tailor
                            </p>
                          </div>
                        </div>
                        {/* Second Leg: Tailor → Customer */}
                        {canAcceptSecondLeg &&
                          (currentStatus === "OUT_FOR_DELIVERY" ||
                          currentStatus === "SHIPPED" ||
                          currentStatus === "IN_TRANSIT" ||
                          currentStatus === "DELIVERED" ? (
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  currentStatus === "DELIVERED"
                                    ? "bg-green-100 text-green-600"
                                    : [
                                          "OUT_FOR_DELIVERY",
                                          "SHIPPED",
                                          "IN_TRANSIT",
                                        ].includes(currentStatus || "")
                                      ? "bg-purple-100 text-purple-600"
                                      : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                {currentStatus === "DELIVERED" ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <span className="text-xs font-bold">2</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  Second Leg
                                </p>
                                <p className="text-sm text-gray-600">
                                  Tailor → Customer
                                </p>
                              </div>
                            </div>
                          ) : null)}
                      </>
                    ) : (
                      <>
                        {/* Only Leg: Vendor → Customer */}
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              [
                                "OUT_FOR_DELIVERY",
                                "SHIPPED",
                                "IN_TRANSIT",
                                "DELIVERED",
                              ].includes(currentStatus || "")
                                ? "bg-green-100 text-green-600"
                                : currentStatus === "DISPATCHED_TO_AGENT"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {[
                              "DISPATCHED_TO_AGENT",
                              "OUT_FOR_DELIVERY",
                              "SHIPPED",
                              "IN_TRANSIT",
                              "DELIVERED",
                            ].includes(currentStatus || "") ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <span className="text-xs font-bold">1</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              Delivery
                            </p>
                            <p className="text-sm text-gray-600">
                              Vendor → Customer
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Quick Actions
                </h3>

                <div className="space-y-3">
                  <Link
                    to={`/logistics/orders/${id}/map`}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">View on Map</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <button
                    onClick={() => nav("/logistics/orders")}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors w-full"
                  >
                    <div className="flex items-center space-x-3">
                      <Package className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">All Orders</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              {/*<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-600" />
                  Customer Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {order_data?.user.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {order_data?.user.phone}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Delivery Address
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{deliveryAddress}</p>
                      <p>
                        {deliveryCity}, {deliveryState}
                      </p>
                      <p>{deliveryCountry}</p>
                    </div>
                  </div>
                </div>
              </div>*/}

              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-purple-600" />
                  Order Items ({order_data?.order_items.length})
                </h3>

                <div className="space-y-4">
                  {order_data?.order_items.map((item: OrderItem) => {
                    // Check for image in metadata
                    let metaImage: string | undefined = undefined;
                    if (
                      item.metadata &&
                      typeof item.metadata === "object" &&
                      "image" in item.metadata &&
                      typeof item.metadata.image === "string"
                    ) {
                      metaImage = item.metadata.image;
                    }

                    return (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {metaImage ? (
                              <img
                                src={metaImage}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : item.product.style?.photos?.[0] ? (
                              <img
                                src={item.product.style.photos[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : item.product.fabric?.photos?.[0] ? (
                              <img
                                src={item.product.fabric.photos[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Quantity: {item.quantity}
                            </p>

                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                {item.product.fabric
                                  ? "Pickup Location:"
                                  : item.product.style
                                    ? "Destination Address:"
                                    : "Pickup Location:"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {item.product.creator?.profile?.address ||
                                  "Address not available"}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button
                              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                              onClick={() => {
                                setItem(item);
                                nav(`/logistics/orders/item/${item.id}/map`);
                              }}
                            >
                              View Pickup
                            </button>
                            {metaImage && (
                              <button
                                className="px-3 py-2 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium hover:bg-pink-200 transition-colors flex items-center justify-center"
                                onClick={() => setViewImageUrl(metaImage!)}
                                type="button"
                              >
                                <ImageIcon className="w-4 h-4 mr-1" />
                                View Item Image
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                  Order Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {order_data?.order_items?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Items</p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-base font-semibold text-gray-800 break-words">
                      {order_data?.status?.replace(/_/g, " ") || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Order Status</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Code Modal */}
        <dialog ref={dialogRef} className="modal">
          <div className="modal-box max-w-md mx-auto bg-white rounded-2xl shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                {statusInfo.nextAction}
              </h3>

              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-4">
                  {statusInfo.codeType === "tailor_delivery_code"
                    ? "Enter the delivery code provided by the tailor to confirm delivery."
                    : "Enter the delivery code provided by the customer to complete the order."}
                </p>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Code
                </label>
                <input
                  value={
                    statusInfo.codeType === "tailor_delivery_code"
                      ? tailor_delivery_code
                      : user_delivery_code
                  }
                  onChange={(e) => {
                    if (statusInfo.codeType === "tailor_delivery_code") {
                      setTailorDeliveryCode(e.target.value);
                    } else {
                      setUserDeliveryCode(e.target.value);
                    }
                  }}
                  type="text"
                  placeholder="Enter delivery code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  onClick={() => {
                    dialogRef.current?.close();
                    setTailorDeliveryCode("");
                    setUserDeliveryCode("");
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={
                    !(statusInfo.codeType === "tailor_delivery_code"
                      ? tailor_delivery_code.trim()
                      : user_delivery_code.trim()) || order_mutation.isPending
                  }
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                  onClick={() => {
                    const code =
                      statusInfo.codeType === "tailor_delivery_code"
                        ? tailor_delivery_code
                        : user_delivery_code;
                    handleStatusUpdate(statusInfo.nextStatus!, code);
                  }}
                >
                  {order_mutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Confirming...
                    </div>
                  ) : (
                    "Confirm Delivery"
                  )}
                </button>
              </div>
            </div>
          </div>
        </dialog>

        {/* Modal for viewing item image */}
        {viewImageUrl && (
          <dialog
            open
            className="modal"
            style={{
              background: "rgba(0,0,0,0.3)",
              position: "fixed",
              zIndex: 50,
              left: 0,
              top: 0,
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setViewImageUrl(null)}
          >
            <div
              className="modal-box bg-white rounded-2xl shadow-2xl max-w-lg p-4 relative"
              style={{ maxWidth: 480, width: "90%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
                onClick={() => setViewImageUrl(null)}
                aria-label="Close"
                type="button"
              >
                ×
              </button>
              <div className="flex flex-col items-center">
                <img
                  src={viewImageUrl}
                  alt="Order Item"
                  className="max-h-96 w-auto rounded-lg border border-gray-200 object-contain"
                  style={{ maxWidth: "100%" }}
                />
                <div className="mt-3 text-center text-gray-700 text-sm">
                  Order Item Image
                </div>
              </div>
            </div>
          </dialog>
        )}
      </div>
    </>
  );
}
