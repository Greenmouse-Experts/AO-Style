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
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import useGetSingleOrder from "../../../hooks/order/useGetSingleOrder";
import useUpdateOrderStatus from "../../../hooks/order/useUpdateOrderStatus";
import Loader from "../../../components/ui/Loader";
import { formatOrderId } from "../../../lib/orderUtils";

import useToast from "../../../hooks/useToast";

const OrderDetails = () => {
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

  // Status update hook
  const { isPending: isStatusUpdating, updateOrderStatusMutate } =
    useUpdateOrderStatus();
  const { toastSuccess, toastError } = useToast();

  // Extract order information from API response
  const orderInfo = data?.data || {};
  const orderPurchase = data?.data?.order_items || [];
  const orderMetadata = data?.data?.payment?.metadata || [];

  // Debug logging when page loads (after variable declarations)
  console.log("=== FABRIC VENDOR ORDER DETAILS PAGE LOADED ===");
  console.log("Order ID:", id);
  console.log("Raw data:", data);
  console.log("Is Loading:", getOrderIsPending);
  console.log("Is Error:", isError);
  console.log("Order Info:", orderInfo);
  console.log("Order Purchase Items:", orderPurchase);
  console.log("Order Metadata:", orderMetadata);
  console.log("================================================");

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
  console.log("Current order status:", orderInfo?.status);
  console.log("===================================");

  // Calculate fabric-only total amount
  const fabricOnlyTotal = Array.isArray(fabricOnlyPurchase)
    ? fabricOnlyPurchase.reduce((total, item) => {
        return total + (item?.product?.price * item?.quantity || 0);
      }, 0)
    : 0;

  // Detect if order has style items (simplified to avoid hooks issues)
  const hasStyleItems = orderInfo?.order_items
    ? orderInfo.order_items.some((item) => {
        const isStyle =
          item?.product?.type?.toLowerCase().includes("style") ||
          item?.type?.toLowerCase().includes("style") ||
          item?.product?.name?.toLowerCase().includes("style") ||
          item?.name?.toLowerCase().includes("style");
        return isStyle;
      })
    : false;

  // Check if order has metadata indicating style components (simplified)
  const hasStyleMetadata = orderMetadata
    ? orderMetadata.some(
        (meta) =>
          meta?.style_product_id ||
          meta?.measurement ||
          meta?.style_product_name,
      )
    : false;

  // Final determination of order type
  const isFabricOnlyOrder = !hasStyleItems && !hasStyleMetadata;

  // Loading and error states handled in render
  const showLoading = getOrderIsPending;
  const showError = isError || (!getOrderIsPending && !orderInfo?.id);

  const formatDateStr = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color classes
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

  // Debug logging (simplified to avoid function calls in render)
  if (orderInfo && orderInfo.id) {
    console.log("=== FABRIC VENDOR ORDER ANALYSIS ===");
    console.log("Order ID:", id);
    console.log("Current Status:", orderInfo?.status);
    console.log("Is Fabric Only:", isFabricOnlyOrder);
    console.log("Has Style Items:", hasStyleItems);
    console.log("===================================");
  }

  // Run test when orderInfo is available (no useEffect to avoid hooks issues)
  if (orderInfo && orderInfo.id) {
    // testStatusUpdateFlow(); // Disabled to prevent hooks issues
  }

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
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  // Handle loading state
  if (showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Handle error state
  if (showError) {
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
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm px-6 py-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order ID: {formatOrderId(orderInfo?.payment_id || "")}
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
          <div className="text-right">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(orderInfo?.status)}`}
            >
              {getStatusIcon(orderInfo?.status)}
              <span className="ml-2">
                {orderInfo?.status?.replace(/_/g, " ") || "Unknown"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Last Updated:{" "}
              {formatDateStr(orderInfo?.updated_at, "D MMM YYYY h:mm A")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Order Summary
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Order ID:</span>
                  <span className="text-gray-900 font-semibold">
                    {formatOrderId(orderInfo?.payment_id || "")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Transaction ID:
                  </span>
                  <span className="text-gray-900">
                    {orderInfo?.payment?.transaction_id || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Order Date:</span>
                  <span className="text-gray-900">
                    {formatDateStr(orderInfo?.created_at, "D MMM YYYY")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Payment Method:
                  </span>
                  <span className="text-gray-900">
                    {orderInfo?.payment?.payment_method || "PAYSTACK"}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Total Amount:
                  </span>
                  <span className="text-gray-900 font-semibold">
                    ₦
                    {(
                      fabricOnlyTotal || parseInt(orderInfo?.total_amount || 0)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Items:</span>
                  <span className="text-gray-900">
                    {fabricOnlyPurchase.length} fabric item(s)
                  </span>
                </div>
                {/* <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Delivery City:
                  </span>
                  <span className="text-gray-900">
                    {orderInfo?.payment?.metadata?.delivery_city ||
                      orderInfo?.payment?.order_summary?.delivery_city ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Customer Name:
                  </span>
                  <span className="text-gray-900">
                    {orderInfo?.user?.first_name && orderInfo?.user?.last_name
                      ? `${orderInfo.user.first_name} ${orderInfo.user.last_name}`
                      : orderInfo?.user?.full_name || "N/A"}
                  </span>
                </div>*/}
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
                      {item?.product?.fabric?.photos &&
                      item?.product?.fabric?.photos[0] ? (
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
                          <p className="text-sm text-gray-500">Total</p>
                        </div>
                      </div>

                      {/* Fabric Details */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 font-medium">
                            Color:
                          </span>
                          <p className="text-gray-900">
                            {item?.product?.fabric_colors ||
                              item?.color ||
                              "Default"}
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
                          {item?.product?.video_url && (
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
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {orderInfo?.status === "DISPATCHED_TO_AGENT"
                          ? "Order dispatched to logistics agent"
                          : orderInfo?.status === "OUT_FOR_DELIVERY"
                            ? "Order ready for delivery"
                            : "Order has been processed"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expected Flow Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-medium text-yellow-800 block mb-1">
                      Expected Flow
                    </span>
                    {isFabricOnlyOrder ? (
                      <>
                        <div>1. Update to "OUT FOR DELIVERY" when ready</div>
                        <div>
                          2. Logistics will deliver directly to customer
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
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {expandedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={handleCloseVideoModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            <video
              controls
              autoPlay
              className="w-full h-auto"
              src={orderInfo?.order_items?.[0]?.product?.video_url}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
