import React, { useState } from "react";
import {
  CheckCircle,
  Circle,
  Phone,
  MessageSquare,
  Mail,
  FileText,
  X,
  Truck,
  XCircle,
  AlertTriangle,
  Clock,
  Package,
  Scissors,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import useGetCustomerSingleOrder from "../../../hooks/order/useGetCustomerSingleOrder";
import Loader from "../../../components/ui/Loader";
import ReviewForm from "../../../components/reviews/ReviewForm";
import StarRating from "../../../components/reviews/StarRating";
import { useJsApiLoader } from "@react-google-maps/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustomBackbtn from "../../../components/CustomBackBtn";
import ReviewSubmission from "./components/ReviewSubmission";
import axios from "axios";
import CaryBinApi from "../../../services/CarybinBaseUrl";

// Cancel Order Modal Component
const CancelOrderModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Cancel Order</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Note:</strong> Once cancelled, you'll need to place a new
              order if you change your mind.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            No, Keep Order
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="cursor-pointer px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Yes, Cancel Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Success/Error Toast Component
const Toast = ({ type, message, onClose }) => {
  const isSuccess = type === "success";

  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
          isSuccess
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}
      >
        <div
          className={`rounded-full p-2 ${
            isSuccess ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isSuccess ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <p
            className={`font-medium ${
              isSuccess ? "text-green-800" : "text-red-800"
            }`}
          >
            {isSuccess ? "Success!" : "Error"}
          </p>
          <p
            className={`text-sm ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-full hover:bg-opacity-20 ${
            isSuccess ? "hover:bg-green-600" : "hover:bg-red-600"
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Dynamic order steps based on order type
const getOrderSteps = (hasStyleItems) => {
  if (hasStyleItems) {
    return [
      "Order Placed",
      "Processing",
      "Shipped to Tailor",
      "Tailor Processing",
      "Shipped to Customer",
      "Delivered",
    ];
  } else {
    return [
      "Order Placed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];
  }
};

const statusMessages = {
  "Order Placed": "Your order has been placed and is awaiting processing.",
  Processing: "Your order is being processed and prepared for shipment.",
  Shipped: "Your order has been shipped and is in transit.",
  "Shipped to Tailor":
    "Your order has been shipped to the tailor for processing.",
  "Tailor Processing": "Your order is being processed by the tailor.",
  "Shipped to Customer": "Your order has been shipped to you from the tailor.",
  "Out for Delivery": "Your order is out for delivery.",
  Delivered: "Your order has been delivered successfully!",
};

const GOOGLE_MAPS_API_KEY = "AIzaSyBstumBKZoQNTHm3Y865tWEHkkFnNiHGGE";

const WAREHOUSE_COORDINATES = {
  latitude: 6.5244,
  longitude: 3.3792,
};

const OrderDetails = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState("style");
  const [activeReviewProduct, setActiveReviewProduct] = useState(null);
  const [reviewTab, setReviewTab] = useState("style");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState(null);

  const { id: orderId } = useParams();
  const queryClient = useQueryClient();

  const {
    isPending: getUserIsPending,
    data,
    isError,
    error,
  } = useGetCustomerSingleOrder(orderId);

  // Cancel Order Mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      console.log(orderId)
      const response = await CaryBinApi.patch(`/orders/${orderId}/cancel`, {
        status: "CANCELLED",
      });
      console.log("This is the cancel order response", response)
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch order details
      queryClient.invalidateQueries(["customer-single-order", orderId]);

      setShowCancelModal(false);
      setToast({
        type: "success",
        message: data.message || "Order cancelled successfully!",
      });
    },
    onError: (error) => {
      setShowCancelModal(false);
      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to cancel order. Please try again.",
      });
    },
  });

  const handleCancelOrder = () => {
    cancelOrderMutation.mutate(orderId);
  };

  const orderDetails = data?.data;
  const orderPurchase = data?.data?.order_items;
  const metaData = data?.data?.payment?.metadata;

  console.log("This is the order setaikls ofr the testing of the ETA", orderPurchase)

  // Check if order has style items based on order_items length
  // If order_items has 2 items, the second one is the style
  const hasStyleItems = orderPurchase?.length === 2 || false;
  const orderSteps = getOrderSteps(hasStyleItems);
  const isDelivered = orderDetails?.status === "DELIVERED";

  // Check if order can be cancelled (not yet shipped)
  const canCancelOrder =
    orderDetails?.status &&
    ![
      "SHIPPED",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "SHIPPED_TO_TAILOR",
      "TAILOR_PROCESSING",
      "SHIPPED_TO_CUSTOMER",
    ].includes(orderDetails.status);

  const getStepFromStatus = (status) => {
    if (hasStyleItems) {
      const statusMap = {
        PROCESSING: 1,
        SHIPPED_TO_TAILOR: 2,
        TAILOR_PROCESSING: 3,
        SHIPPED_TO_CUSTOMER: 4,
        OUT_FOR_DELIVERY: 4,
        DELIVERED: 5,
      };
      return statusMap[status] || 0;
    } else {
      const statusMap = {
        PROCESSING: 1,
        SHIPPED: 2,
        IN_TRANSIT: 2,
        OUT_FOR_DELIVERY: 3,
        DELIVERED: 4,
        CANCELLED: -1,
      };
      return statusMap[status] || 0;
    }
  };

  // Simple ETA calculation function - no API needed
  const calculateOrderETA = (orderItems) => {
    if (!orderItems || orderItems.length === 0) {
      return null;
    }

    // If order_items has only 1 item, it's fabric only
    // If order_items has 2 items, the second one is the style
    const hasStyleItems = orderItems.length === 2;

    let totalHours = 0;
    let estimatedSewingTimeDays = 0;
    let deliveryTime = 0;

    if (hasStyleItems) {
      // For style orders: 72 hours base + sewing time from API
      deliveryTime = 72; // 3 days for processing and delivery
      
      // Get the style item (second item in the array)
      const styleItem = orderItems[1];
      
      // Get estimated_sewing_time from product > style > estimated_sewing_time (in days)
      estimatedSewingTimeDays = styleItem?.product?.style?.estimated_sewing_time || 0;
      
      // Convert days to hours
      const estimatedSewingTimeHours = estimatedSewingTimeDays * 24;
      
      totalHours = deliveryTime + estimatedSewingTimeHours;
    } else {
      // For fabric-only orders: 48 hours
      totalHours = 48;
      deliveryTime = 48;
    }

    const estimatedArrivalDate = new Date(Date.now() + totalHours * 60 * 60 * 1000);

    return {
      hasStyleItems,
      deliveryTime,
      sewingTimeDays: estimatedSewingTimeDays,
      sewingTimeHours: estimatedSewingTimeDays * 24,
      totalHours,
      estimatedArrival: estimatedArrivalDate,
    };
  };

  const ETADisplay = ({ orderDetails }) => {
    const shouldShowForStatus = [
      "PROCESSING",
      "SHIPPED",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "SHIPPED_TO_TAILOR",
      "TAILOR_PROCESSING",
      "SHIPPED_TO_CUSTOMER",
      "PAID"
    ].includes(orderDetails?.status);

    if (!shouldShowForStatus) {
      return null;
    }

    // Calculate ETA directly - no API call needed
    const etaData = calculateOrderETA(orderPurchase);

    // If no ETA data, don't show anything
    if (!etaData) {
      return null;
    }

    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const daysRemaining = Math.ceil(etaData.totalHours / 24);

    return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 p-6 mt-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-md">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Estimated Delivery Time
            </h3>
            <p className="text-sm text-gray-600">
              {etaData.hasStyleItems
                ? "Custom order with tailoring"
                : "Standard fabric order"}
            </p>
          </div>
        </div>

        {/* Timeline Breakdown */}
        <div className="space-y-4 mb-6">
          {etaData.hasStyleItems ? (
            <>
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800">
                      Processing & Delivery
                    </span>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {Math.ceil(etaData.deliveryTime / 24)} days
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Order processing and shipment to tailor
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-purple-100">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Scissors className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800">
                      Tailoring Time
                    </span>
                    <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      {etaData.sewingTimeDays} {etaData.sewingTimeDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Custom sewing for your style
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-green-100">
              <div className="bg-green-100 p-2 rounded-lg">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-800">
                    Standard Delivery
                  </span>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    {Math.ceil(etaData.deliveryTime / 24)} days
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Processing and direct delivery to your location
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Total Estimate */}
        <div className="bg-indigo-600 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg backdrop-blur-sm">
                <CheckCircle className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-white font-semibold text-lg">
                Expected Arrival
              </span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-gray-800 font-bold text-lg">
                {daysRemaining} {daysRemaining === 1 ? "Day" : "Days"}
              </span>
            </div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-gray-800 text-sm font-medium">
              {formatDate(etaData.estimatedArrival)}
            </p>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-600 bg-white bg-opacity-60 backdrop-blur-sm p-3 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p>
            Delivery times are estimates and may vary based on tailor availability, 
            order complexity, and logistics. You'll receive updates as your order progresses.
          </p>
        </div>
      </div>
    );
  };

  React.useEffect(() => {
    if (orderDetails?.status) {
      const step = getStepFromStatus(orderDetails.status);
      setCurrentStep(step);
    }
  }, [orderDetails?.status]);

  if (getUserIsPending) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Loading order details...</p>
          <p className="text-sm text-gray-500">Order ID: {orderId}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium mb-2">Error Loading Order</p>
          <p className="text-sm mb-4">Order ID: {orderId}</p>
          <p className="text-sm text-gray-600">
            {error?.message || "Failed to load order details"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Order Not Found</p>
          <p className="text-sm text-gray-600 mb-4">Order ID: {orderId}</p>
          <p className="text-sm text-gray-500">
            This order may not exist or you may not have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  const totalAmount =
    orderDetails?.total_amount || orderDetails?.payment?.amount || 0;

  let calculatedSubtotal = 0;
  if (orderPurchase && Array.isArray(orderPurchase)) {
    calculatedSubtotal = orderPurchase.reduce((acc, item) => {
      const price = parseInt(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return acc + price * quantity;
    }, 0);
  }

  return (
    <div className="">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        isLoading={cancelOrderMutation.isPending}
      />

      <CustomBackbtn />

      <div className="bg-white px-6 py-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-medium mb-3">
            Orders Details :{" "}
            <span className="text-gray-600">
              {orderDetails?.payment?.id
                ?.replace(/-/g, "")
                .slice(0, 12)
                .toUpperCase()}
            </span>
          </h1>
          <p className="text-gray-500">
            <Link to="/customer" className="text-blue-500 hover:underline">
              Dashboard
            </Link>{" "}
            &gt; Orders
          </p>
        </div>

        {/* Cancel Order Button - Only show if order can be cancelled */}
        {canCancelOrder && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <XCircle className="w-5 h-5" />
            Cancel Order
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h5 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Truck className="w-5 h-5 text-purple-600" />
          Order Progress
        </h5>
        <div className="relative px-8">
          <div
            className="absolute top-5 h-1 bg-gray-200"
            style={{
              left: `calc(${100 / (orderSteps.length - 1) / 2}%)`,
              right: `calc(${100 / (orderSteps.length - 1) / 2}%)`,
            }}
          />
          <div
            className={`absolute top-5 h-1 transition-all duration-500 ${
              orderDetails?.status === "CANCELLED"
                ? "bg-red-500"
                : "bg-gradient-to-r from-purple-500 to-purple-600"
            }`}
            style={{
              left: `calc(${100 / (orderSteps.length - 1) / 2}%)`,
              width:
                currentStep >= 0
                  ? `calc(${(currentStep / (orderSteps.length - 1)) * 100}% - ${
                      100 / (orderSteps.length - 1)
                    }%)`
                  : "0%",
            }}
          />
          <div className="relative flex items-start justify-between">
            {orderSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`z-10 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                    orderDetails?.status === "CANCELLED"
                      ? "bg-red-500 text-white shadow-lg ring-4 ring-red-100"
                      : index <= currentStep
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg ring-4 ring-purple-100"
                      : "bg-white border-2 border-gray-300 text-gray-400"
                  }`}
                >
                  {orderDetails?.status === "CANCELLED" ? (
                    <X size={20} />
                  ) : index <= currentStep ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Circle size={20} />
                  )}
                </div>
                <span
                  className={`mt-3 text-sm font-medium text-center ${
                    orderDetails?.status === "CANCELLED"
                      ? "text-red-600"
                      : index <= currentStep
                      ? "text-purple-600"
                      : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Status:</strong>{" "}
            {statusMessages[orderSteps[currentStep]] || "Order status unknown"}
          </p>
        </div>
      </div>

      <ETADisplay orderDetails={orderDetails} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-6 rounded-md md:col-span-2">
          <h5 className="text-lg font-meduim text-dark border-b border-[#D9D9D9] pb-3 mb-3">
            Order Details
          </h5>

          <div className="bg-white rounded-md">
            <div>
              <div className="bg-white mt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h6 className="font-semibold text-gray-800">
                      Order Information
                    </h6>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">
                          {orderDetails?.payment?.id
                            ?.replace(/-/g, "")
                            .slice(0, 12)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-medium">
                          {orderDetails?.payment?.transaction_id || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">
                          {orderDetails?.payment?.payment_method || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purchase Type:</span>
                        <span className="font-medium">
                          {orderDetails?.payment?.purchase_type || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h6 className="font-semibold text-gray-800">
                      Payment Information
                    </h6>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status:</span>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            orderDetails?.payment?.payment_status === "SUCCESS"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {orderDetails?.payment?.payment_status || "PENDING"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Currency:</span>
                        <span className="font-medium">
                          {orderDetails?.payment?.currency || "NGN"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {orderPurchase && orderPurchase.length > 0 && (
                  <div className="mt-6">
                    <h6 className="font-semibold text-gray-800 mb-4">
                      Purchase Items
                    </h6>
                    <div className="space-y-4">
                      {orderPurchase.map((item, index) => {
                        const isStyle = item.product.type === "STYLE";
                        const tagLabel = isStyle ? "Style" : "Fabric";
                        const tagColor = isStyle
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700";
                        const imageSrc = isStyle
                          ? item.product.style?.photos?.[0]
                          : item.product.fabric?.photos?.[0];
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-5 p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
                          >
                            <img
                              src={imageSrc}
                              alt={item.product.name || "Product"}
                              className="w-20 h-20 rounded-lg object-cover border border-gray-100"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-lg">
                                  {item.product.name || "Product Item"}
                                </p>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagColor} border border-gray-200`}
                                >
                                  {tagLabel}
                                </span>
                              </div>
                              <p className="text-gray-500 mb-1">
                                Quantity:{" "}
                                <span className="font-medium">
                                  {item.quantity || 1}
                                </span>
                              </p>
                              <div>
                                <p className="text-gray-600 text-sm">
                                  Amount:{" "}
                                  <span className="font-semibold text-gray-700">
                                    ₦
                                    {item.price
                                      ? parseInt(item.price).toLocaleString()
                                      : "0"}
                                  </span>
                                </p>
                                <div className="bg-gray-50 rounded-lg p-3 mt-2 shadow-sm border border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">
                                      Total Amount
                                    </span>
                                    <span className="flex items-center gap-2">
                                      <span className="font-semibold text-lg text-blue-700">
                                        ₦{" "}
                                        {item.price && item.quantity
                                          ? (
                                              parseInt(item.price) *
                                              parseInt(item.quantity)
                                            ).toLocaleString()
                                          : "0"}
                                      </span>
                                      <div className="text-xs text-gray-500 mt-1 text-right">
                                        ({item.price} x {item.quantity})
                                      </div>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-gray-600 font-medium">Subtotal:</span>
                    <span className="font-semibold">
                      ₦ {parseInt(calculatedSubtotal || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-gray-600 font-medium">Tax:</span>
                    <span className="font-semibold">
                      ₦{" "}
                      {orderDetails?.payment?.purchase?.tax_amount?.toLocaleString() ||
                        "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 mt-2">
                    <span className="text-gray-600 font-medium">
                      Delivery Fee:
                    </span>
                    <span className="font-semibold">
                      ₦{" "}
                      {orderDetails?.payment?.purchase?.delivery_fee?.toLocaleString() ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 mt-2">
                    <span className="text-gray-600 font-medium">Discount:</span>
                    <span className="font-semibold">
                      ₦{" "}
                      {parseInt(
                        orderDetails?.payment?.discount_applied || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-2 border-t">
                    <span className="text-gray-600 font-medium text-lg">
                      Order Total:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        ₦ {parseInt(totalAmount || 0).toLocaleString()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          orderDetails?.status === "DELIVERED"
                            ? "bg-green-100 text-green-600"
                            : orderDetails?.status === "CANCELLED"
                            ? "bg-red-100 text-red-600"
                            : orderDetails?.status === "SHIPPED" ||
                              orderDetails?.status === "IN_TRANSIT" ||
                              orderDetails?.status === "OUT_FOR_DELIVERY"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {orderDetails?.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rate & Review Section - Show for Delivered Orders */}
      {orderDetails?.status === "DELIVERED" && (
        <div className="mt-6 space-y-6">
          <div className="bg-white rounded-lg p-6 w-full mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Rate & Review Your Order
              </h2>
              <span className="text-sm text-white bg-green-500 px-3 py-1 rounded-full flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Order Delivered
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Your order has been delivered successfully! Share your experience
              with these products to help other customers.
            </p>

            {orderPurchase && orderPurchase.length > 0 && (
              <div className="mb-6">
                <div className="flex gap-2 border-b border-gray-200">
                  {orderPurchase.some(
                    (item) => item.product?.type === "STYLE"
                  ) && (
                    <button
                      onClick={() => setReviewTab("style")}
                      className={`px-6 py-3 font-medium transition-all ${
                        reviewTab === "style"
                          ? "border-b-2 border-purple-600 text-purple-600"
                          : "text-gray-600 hover:text-purple-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                          />
                        </svg>
                        <span>Style Items</span>
                        <span className="ml-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                          {
                            orderPurchase.filter(
                              (item) => item.product?.type === "STYLE"
                            ).length
                          }
                        </span>
                      </div>
                    </button>
                  )}

                  {orderPurchase.some(
                    (item) => item.product?.type === "FABRIC"
                  ) && (
                    <button
                      onClick={() => setReviewTab("fabric")}
                      className={`px-6 py-3 font-medium transition-all ${
                        reviewTab === "fabric"
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <span>Fabric Items</span>
                        <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {
                            orderPurchase.filter(
                              (item) => item.product?.type === "FABRIC"
                            ).length
                          }
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {orderPurchase && orderPurchase.length > 0 ? (
                <>
                  {reviewTab === "style" &&
                    orderPurchase
                      .filter((item) => item.product?.type === "STYLE")
                      .map((styleItem, index) => (
                        <div
                          key={`style-${index}`}
                          className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100">
                            <img
                              src={
                                styleItem.product?.style?.photos?.[0] ||
                                "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170600/AoStyle/image_bwjfib.jpg"
                              }
                              alt={styleItem.name || "Style Item"}
                              className="w-20 h-20 rounded-md object-cover border-2 border-purple-200"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-lg text-gray-900">
                                  {styleItem.name || "Style Item"}
                                </h4>
                                <span className="px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                                  Style
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm">
                                Style Design
                              </p>
                              <p className="text-sm text-gray-500">
                                Quantity: {styleItem.quantity || 1}
                              </p>
                            </div>
                          </div>

                          <div className="p-4 bg-white">
                            <ReviewSubmission
                              productId={styleItem.product_id || styleItem.id}
                              productName={styleItem.name}
                              productImage={
                                styleItem.product?.style?.photos?.[0]
                              }
                              onClose={null}
                            />
                          </div>
                        </div>
                      ))}

                  {reviewTab === "fabric" &&
                    orderPurchase
                      .filter((item) => item.product?.type === "FABRIC")
                      .map((fabricItem, index) => (
                        <div
                          key={`fabric-${index}`}
                          className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100">
                            <img
                              src={
                                fabricItem.product?.fabric?.photos?.[0] ||
                                "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170603/AoStyle/image1_s3s2sd.jpg"
                              }
                              alt={fabricItem.name || "Fabric Item"}
                              className="w-20 h-20 rounded-md object-cover border-2 border-blue-200"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-lg text-gray-900">
                                  {fabricItem.name || "Fabric Item"}
                                </h4>
                                <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                                  Fabric
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm">
                                Fabric Material
                              </p>
                              <p className="text-sm text-gray-500">
                                Quantity: {fabricItem.quantity || 1} yards
                              </p>
                            </div>
                          </div>

                          <div className="p-4 bg-white">
                            <ReviewSubmission
                              productId={fabricItem.product_id || fabricItem.id}
                              productName={fabricItem.name}
                              productImage={
                                fabricItem.product?.fabric?.photos?.[0]
                              }
                              onClose={null}
                            />
                          </div>
                        </div>
                      ))}

                  {reviewTab === "style" &&
                    orderPurchase.filter(
                      (item) => item.product?.type === "STYLE"
                    ).length === 0 && (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <svg
                            className="w-16 h-16 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                            />
                          </svg>
                        </div>
                        <h4 className="text-xl font-semibold mb-2">
                          No Style Items
                        </h4>
                        <p className="text-gray-600">
                          This order doesn't contain any style items to review.
                        </p>
                      </div>
                    )}

                  {reviewTab === "fabric" &&
                    orderPurchase.filter(
                      (item) => item.product?.type === "FABRIC"
                    ).length === 0 && (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <svg
                            className="w-16 h-16 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        </div>
                        <h4 className="text-xl font-semibold mb-2">
                          No Fabric Items
                        </h4>
                        <p className="text-gray-600">
                          This order doesn't contain any fabric items to review.
                        </p>
                      </div>
                    )}
                </>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-start gap-4 p-4 bg-gray-50">
                    <img
                      src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170600/AoStyle/image_bwjfib.jpg"
                      alt="Order Item"
                      className="w-20 h-20 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {orderDetails?.payment?.purchase_type || "Product"}{" "}
                        Order
                      </h4>
                      <p className="text-gray-600 text-sm">Order Item</p>
                      <p className="text-sm text-gray-500">
                        Amount: ₦ {parseInt(totalAmount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <ReviewSubmission
                      productId={
                        orderDetails?.payment?.purchase_id || orderDetails?.id
                      }
                      productName={`${
                        orderDetails?.payment?.purchase_type || "Product"
                      } Order`}
                      onClose={null}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ReviewForm
        productId={activeReviewProduct}
        isOpen={!!activeReviewProduct}
        onClose={() => setActiveReviewProduct(null)}
        onSuccess={() => {
          setActiveReviewProduct(null);
        }}
      />
    </div>
  );
};

export default OrderDetails;