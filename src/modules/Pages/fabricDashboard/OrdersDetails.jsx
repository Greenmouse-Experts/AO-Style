import {
  Phone,
  MessageSquare,
  Mail,
  X,
  Star,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Play,
  Maximize2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import useGetSingleOrder from "../../../hooks/order/useGetSingleOrder";
import useUpdateOrderStatus from "../../../hooks/order/useUpdateOrderStatus";
import Loader from "../../../components/ui/Loader";
import { formatOrderId } from "../../../lib/orderUtils";

import useToast from "../../../hooks/useToast";

const OrderDetails = () => {
  const [activeReviewModal, setActiveReviewModal] = useState(null);
  const [expandedVideo, setExpandedVideo] = useState(null);

  // Get order ID from URL params
  const { id } = useParams();

  // Fetch order data from API
  const {
    data,
    isPending: getOrderIsPending,
    isError,
    refetch,
  } = useGetSingleOrder(id);

  // Debug logging when page loads
  console.log("=== FABRIC VENDOR ORDER DETAILS PAGE LOADED ===");
  console.log("Order ID:", id);
  console.log("Raw data:", data);
  console.log("Is Loading:", getOrderIsPending);
  console.log("Is Error:", isError);
  console.log("Order Info:", orderInfo);
  console.log("Order Purchase Items:", orderPurchase);
  console.log("Order Metadata:", orderMetadata);
  console.log("================================================");

  // Status update hook
  const { isPending: isStatusUpdating, updateOrderStatusMutate } =
    useUpdateOrderStatus();
  const { toastSuccess, toastError } = useToast();

  // Extract order information from API response
  const orderInfo = data?.data || {};
  const orderPurchase = data?.data?.order_items || [];
  const orderMetadata = data?.data?.payment?.metadata || [];

  const handleExpandVideo = (videoType) => {
    setExpandedVideo(videoType);
  };

  const handleCloseVideoModal = () => {
    setExpandedVideo(null);
  };

  // Filter to show only fabric items for fabric vendors
  const fabricOnlyPurchase = Array.isArray(orderInfo?.order_items)
    ? orderInfo.order_items.filter(
        (item) =>
          item?.product?.type?.toUpperCase() === "FABRIC" ||
          item?.type?.toUpperCase() === "FABRIC",
      )
    : [];

  console.log("=== FABRIC VENDOR ORDER ANALYSIS ===");
  console.log("Fabric only purchase items:", fabricOnlyPurchase);
  console.log("Is fabric only order:", isFabricOnlyOrder);
  console.log("Has style items:", hasStyleItems);
  console.log("Can update status:", canUpdateStatus());
  console.log("Current order status:", orderInfo?.status);
  console.log("===================================");

  // --- FIX: Always show all fabric items, regardless of metadata ---
  // If both metadata and purchase items exist, show all unique fabric items.
  // Sometimes metadata may not contain all fabrics, so always show all from fabricOnlyPurchase.

  // Calculate fabric-only total amount
  const fabricOnlyTotal = Array.isArray(fabricOnlyPurchase)
    ? fabricOnlyPurchase.reduce((total, item) => {
        return total + (item?.product?.price * item?.quantity || 0);
      }, 0)
    : 0;

  // Detect if order has style items (proper order type detection)
  const hasStyleItems = useMemo(() => {
    if (!orderInfo?.order_items) return false;

    return orderInfo.order_items.some((item) => {
      const isStyle =
        item?.product?.type?.toLowerCase().includes("style") ||
        item?.type?.toLowerCase().includes("style") ||
        item?.product?.name?.toLowerCase().includes("style") ||
        item?.name?.toLowerCase().includes("style");

      return isStyle;
    });
  }, [orderInfo?.order_items]);

  // Check if order has metadata indicating style components
  const hasStyleMetadata = useMemo(() => {
    if (!orderMetadata) return false;

    return orderMetadata.some(
      (meta) =>
        meta?.style_product_id || meta?.measurement || meta?.style_product_name,
    );
  }, [orderMetadata]);

  // Final determination of order type
  const isFabricOnlyOrder = !hasStyleItems && !hasStyleMetadata;

  // console.log("📋 Order Details - API Data:", data);
  // console.log("📋 Order Info:", orderInfo);
  // console.log("📋 Order Purchase Items:", orderPurchase);
  // console.log("📋 Order Metadata:", orderMetadata);
  // console.log("📋 Fabric Only Purchase Items:", fabricOnlyPurchase);
  // console.log("📋 Fabric Only Metadata:", fabricOnlyMetadata);
  // console.log("📋 Fabric Only Total:", fabricOnlyTotal);
  // console.log("📋 Is Fabric Only Order:", isFabricOnlyOrder);
  // console.log("📋 Has Tailoring Components:", hasTailoringComponents);
  // console.log("📋 Order ID from params:", id);
  // console.log("📋 Loading state:", getOrderIsPending);
  // console.log("📋 Error state:", isError);

  // Loading state
  if (getOrderIsPending) {
    console.log("📋 Still loading order details...");
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="text-gray-500 mt-4">Loading order details...</p>
          <p className="text-sm text-gray-400">Order ID: {id}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || (!getOrderIsPending && !orderInfo?.id)) {
    console.log("📋 Error loading order details:", { isError, orderInfo, id });
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load order details</p>
          <p className="text-sm text-gray-600 mb-4">
            Order ID: {id || "No ID provided"}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Error: {isError ? "API Error" : "No order data received"}
          </p>
          <button
            onClick={() => {
              console.log("📋 Retrying order fetch for ID:", id);
              refetch();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatDateStr = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PAID: "bg-blue-100 text-blue-600",
      DISPATCHED_TO_AGENT: "bg-purple-100 text-purple-600",
      OUT_FOR_DELIVERY: "bg-orange-100 text-orange-600",
      IN_TRANSIT: "bg-indigo-100 text-indigo-600",
      DELIVERED: "bg-green-100 text-green-600",
      CANCELLED: "bg-red-100 text-red-600",
      PENDING: "bg-yellow-100 text-yellow-600",
      PROCESSING: "bg-blue-100 text-blue-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  // Status update handler
  const handleStatusUpdate = (newStatus) => {
    // Validation checks
    if (!id) {
      toastError("Order ID is missing");
      return;
    }

    if (!newStatus) {
      toastError("New status is required");
      return;
    }

    if (!canUpdateStatus()) {
      toastError("Cannot update status at this time");
      return;
    }

    console.log("=== FABRIC VENDOR STATUS UPDATE ===");
    console.log("Order ID:", id);
    console.log("Current Status:", orderInfo?.status);
    console.log("New Status:", newStatus);
    console.log("Is Fabric Only Order:", isFabricOnlyOrder);
    console.log("Validation passed - proceeding with update");
    console.log("==================================");

    updateOrderStatusMutate(
      { id: id, statusData: { status: newStatus } },
      {
        onSuccess: (response) => {
          console.log("✅ Status update successful:", newStatus);
          console.log("Response:", response);
          toastSuccess(
            `Order status updated to ${newStatus.replace(/_/g, " ")}`,
          );
          refetch();
        },
        onError: (error) => {
          console.error("❌ Status update failed:", error);
          console.error("Error details:", error?.response?.data);
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to update order status";
          toastError(errorMessage);
        },
      },
    );
  };

  // Check if fabric vendor can update status
  const canUpdateStatus = () => {
    if (!orderInfo?.status) {
      console.log("Cannot update: No order status found");
      return false;
    }

    const currentStatus = orderInfo?.status;
    const allowedStatuses = ["PAID", "PENDING", "PROCESSING"];
    const canUpdate = allowedStatuses.includes(currentStatus);

    console.log("Can update status check:", {
      currentStatus,
      allowedStatuses,
      canUpdate,
      isFabricOnlyOrder,
      hasOrderData: !!orderInfo,
    });

    return canUpdate;
  };

  // Get the appropriate next status based on order type
  const getNextStatus = () => {
    const currentStatus = orderInfo?.status;

    console.log("Getting next status for:", {
      currentStatus,
      isFabricOnlyOrder,
      hasStyleItems,
    });

    if (!currentStatus) {
      console.warn(
        "No current status found, defaulting to DISPATCHED_TO_AGENT",
      );
      return "DISPATCHED_TO_AGENT";
    }

    // For fabric-only orders: go directly to delivery
    if (isFabricOnlyOrder) {
      switch (currentStatus) {
        case "PAID":
        case "PENDING":
        case "PROCESSING":
          return "OUT_FOR_DELIVERY";
        default:
          console.warn(
            `Unexpected status for fabric-only order: ${currentStatus}`,
          );
          return "OUT_FOR_DELIVERY";
      }
    } else {
      // For orders with style items: go to logistics agent first
      switch (currentStatus) {
        case "PAID":
        case "PENDING":
        case "PROCESSING":
          return "DISPATCHED_TO_AGENT";
        default:
          console.warn(`Unexpected status for style order: ${currentStatus}`);
          return "DISPATCHED_TO_AGENT";
      }
    }
  };

  // Comprehensive status update flow testing
  const testStatusUpdateFlow = () => {
    console.log("=== COMPREHENSIVE STATUS UPDATE TEST ===");
    console.log("Order ID:", id);
    console.log("Order Info:", orderInfo);
    console.log("Current Status:", orderInfo?.status);
    console.log("Order Items:", orderInfo?.order_items);
    console.log("Fabric Items:", fabricOnlyPurchase);
    console.log("Is Fabric Only:", isFabricOnlyOrder);
    console.log("Has Style Items:", hasStyleItems);
    console.log("Can Update Status:", canUpdateStatus());
    console.log("Next Status:", getNextStatus());
    console.log("Status Update Hook Available:", !!updateOrderStatusMutate);
    console.log("Is Status Updating:", isStatusUpdating);
    console.log("========================================");
  };

  // Run test on component mount
  React.useEffect(() => {
    if (orderInfo) {
      testStatusUpdateFlow();
    }
  }, [orderInfo]);

  // Get status description based on order type
  const getStatusDescription = () => {
    if (isFabricOnlyOrder) {
      return "Mark order ready for direct delivery to customer";
    } else {
      return "Dispatch fabric to logistics agent for delivery to tailor";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "DISPATCHED_TO_AGENT":
        return <Package className="w-5 h-5 text-purple-600" />;
      case "OUT_FOR_DELIVERY":
        return <Truck className="w-5 h-5 text-orange-600" />;
      case "IN_TRANSIT":
        return <Truck className="w-5 h-5 text-indigo-600" />;
      case "PROCESSING":
        return <Package className="w-5 h-5 text-blue-600" />;
      case "PAID":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm px-6 py-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order ID: {formatOrderId(orderInfo?.id || "")}
            </h1>
            <p className="text-gray-500 text-sm">
              <a
                href="/fabric"
                className="text-purple-600 hover:text-purple-800 transition-colors"
              >
                Dashboard
              </a>{" "}
              → Orders → Order Details
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(orderInfo?.status)}
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(orderInfo?.status)}`}
            >
              {orderInfo?.status || "PENDING"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Order Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Order ID:</span>
                  <span className="font-semibold text-gray-900">
                    {formatOrderId(orderInfo?.id || "")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Transaction ID:
                  </span>
                  <span className="font-mono text-sm text-gray-900">
                    {orderInfo?.payment?.transaction_id}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Order Date:</span>
                  <span className="text-gray-900">
                    {formatDateStr(orderInfo?.created_at, "D MMM YYYY h:mm A")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Payment Method:
                  </span>
                  <span className="text-gray-900 capitalize">
                    {orderInfo?.payment?.payment_method || "N/A"}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Total Amount:
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₦{(fabricOnlyTotal || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Items:</span>
                  <span className="text-gray-900">
                    {fabricOnlyPurchase.length} fabric item(s)
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Delivery City:
                  </span>
                  <span className="text-gray-900">
                    {orderInfo?.payment?.order_summary?.delivery_city || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Customer Name:
                  </span>
                  <span className="text-gray-900">
                    {orderInfo?.user?.full_name || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Fabric Items ({fabricOnlyPurchase.length})
            </h3>
            <div className="space-y-4">
              {fabricOnlyPurchase.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Image */}
                    <div className="lg:w-32 lg:h-32 w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item?.product?.fabric?.photos ? (
                        <img
                          src={item.product.fabric.photos[0]}
                          alt={item.product?.name || "Fabric"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {item?.product?.name || "Fabric Item"}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Qty: {item?.quantity || 1}</span>
                            <span>
                              ₦{(item?.product?.price || 0).toLocaleString()}/
                              unit
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ₦
                            {(
                              (item?.product?.price || 0) *
                              (item?.quantity || 1)
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Fabric Details */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 font-medium">
                            Color:
                          </span>
                          <p className="text-gray-900">
                            {item?.color || "Default"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">
                            Material:
                          </span>
                          <p className="text-gray-900">
                            {item?.product?.fabric?.material_type || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">
                            Weight:
                          </span>
                          <p className="text-gray-900">
                            {item?.product?.fabric?.weight_per_unit || "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item?.product?.fabric?.video_url && (
                            <button
                              onClick={() => handleExpandVideo("fabric")}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium"
                            >
                              <Play className="w-3 h-3" />
                              Preview
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Order Actions
            </h3>

            <div className="space-y-4">
              {/* Current Status Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(orderInfo?.status)}
                  <span className="font-semibold text-gray-700">
                    Current Status
                  </span>
                </div>
                <p className="text-sm text-blue-800 font-medium mb-1">
                  {orderInfo?.status || "PENDING"}
                </p>
                <p className="text-xs text-blue-600">
                  Last Updated:{" "}
                  {formatDateStr(orderInfo?.updated_at, "D MMM YYYY h:mm A")}
                </p>
              </div>

              {/* Order Type Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Order Type</span>
                </div>
                <p className="text-sm text-gray-800 font-medium">
                  {isFabricOnlyOrder ? "Fabric Only" : "Fabric + Style"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {isFabricOnlyOrder
                    ? "Direct delivery to customer"
                    : "Delivery to tailor first, then to customer"}
                </p>
              </div>

              {/* Status Update Action */}
              {canUpdateStatus() ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 block mb-1">
                        Ready to Dispatch?
                      </span>
                      <p className="text-sm text-gray-600 mb-3">
                        {getStatusDescription()}
                      </p>
                      <button
                        onClick={() => {
                          const nextStatus = getNextStatus();
                          if (
                            window.confirm(
                              `Are you sure you want to update the order status to "${nextStatus.replace(/_/g, " ")}"?`,
                            )
                          ) {
                            handleStatusUpdate(nextStatus);
                          }
                        }}
                        disabled={isStatusUpdating || !canUpdateStatus()}
                        className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                        title={
                          !canUpdateStatus()
                            ? "Status cannot be updated at this time"
                            : ""
                        }
                        onMouseEnter={() => {
                          console.log("=== STATUS UPDATE BUTTON HOVER ===");
                          console.log("Can update:", canUpdateStatus());
                          console.log("Is updating:", isStatusUpdating);
                          console.log("Next status:", getNextStatus());
                          console.log("Current status:", orderInfo?.status);
                          console.log("==================================");
                        }}
                      >
                        {isStatusUpdating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            Update to {getNextStatus().replace(/_/g, " ")}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {orderInfo?.status === "DISPATCHED_TO_AGENT"
                        ? "Order dispatched to logistics agent"
                        : orderInfo?.status === "OUT_FOR_DELIVERY"
                          ? "Order ready for delivery"
                          : "Order has been processed"}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Flow Information */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Expected Flow
                </h4>
                <div className="text-sm text-amber-800 space-y-1">
                  {isFabricOnlyOrder ? (
                    <>
                      <div>1. Update to "OUT FOR DELIVERY" when ready</div>
                      <div>
                        2. Logistics will pick up and deliver to customer
                      </div>
                    </>
                  ) : (
                    <>
                      <div>1. Update to "DISPATCHED TO AGENT" when ready</div>
                      <div>2. Logistics will deliver fabric to tailor</div>
                      <div>
                        3. Tailor will process and prepare for final delivery
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Contact */}
          {/* <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Customer Contact
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500 font-medium">
                  Email Address
                </span>
                <p className="text-gray-900 font-semibold break-all">
                  {orderInfo?.user?.email}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 font-medium">
                  Phone Number
                </span>
                <p className="text-gray-900 font-semibold">
                  {orderInfo?.user?.phone || "N/A"}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Contact Customer
                </p>
                <div className="flex gap-3">
                  <a
                    href={`tel:${orderInfo?.user?.phone?.replace(/\s+/g, "")}`}
                    className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                    title="Call Customer"
                  >
                    <Phone size={18} />
                  </a>
                  <a
                    href={`sms:${orderInfo?.user?.phone?.replace(/\s+/g, "")}`}
                    className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Text Customer"
                  >
                    <MessageSquare size={18} />
                  </a>
                  <a
                    href={`mailto:${orderInfo?.user?.email}`}
                    className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                    title="Email Customer"
                  >
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>*/}
        </div>
      </div>

      {/* Video Expansion Modal */}
      {expandedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                {expandedVideo === "fabric"
                  ? "Fabric Preview"
                  : "Style Preview"}
              </h3>
              <button
                onClick={handleCloseVideoModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-black rounded-xl overflow-hidden">
                <video
                  src={
                    expandedVideo === "fabric"
                      ? orderPurchase[0]?.product?.fabric?.video_url
                      : orderPurchase[1]?.product?.style?.video_url
                  }
                  controls
                  className="w-full max-h-[70vh] object-contain"
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {expandedVideo === "fabric" ? "Fabric" : "Style"}:{" "}
                  <span className="font-medium">
                    {expandedVideo === "fabric"
                      ? orderPurchase[0]?.product?.name
                      : orderPurchase[1]?.product?.name}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {activeReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Product Reviews
                </h3>
                <button
                  onClick={() => setActiveReviewModal(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="text-center py-12 text-gray-500">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No reviews yet</p>
                <p className="text-sm">Be the first to review this product!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
