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
  MapPin,
  Calendar,
  User,
  Loader2,
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 bg-opacity-50 backdrop-blur-sm">
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
    <div className="fixed top-4 right-4 z-[10000] animate-slide-in-right">
      <div
        className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${isSuccess
          ? "bg-green-50 border border-green-200"
          : "bg-red-50 border border-red-200"
          }`}
      >
        <div
          className={`rounded-full p-2 ${isSuccess ? "bg-green-100" : "bg-red-100"
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
            className={`font-medium ${isSuccess ? "text-green-800" : "text-red-800"
              }`}
          >
            {isSuccess ? "Success!" : "Error"}
          </p>
          <p
            className={`text-sm ${isSuccess ? "text-green-600" : "text-red-600"
              }`}
          >
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-full hover:bg-opacity-20 ${isSuccess ? "hover:bg-green-600" : "hover:bg-red-600"
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

  // GIG Logistics state
  const [showShipmentDetailsModal, setShowShipmentDetailsModal] = useState(false);
  const [showTrackOrderModal, setShowTrackOrderModal] = useState(false);
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [isLoadingShipment, setIsLoadingShipment] = useState(false);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);

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
      console.log(orderId);
      const response = await CaryBinApi.patch(
        `/orders/${orderId}/cancel-order`,
        {
          status: "CANCELLED",
        },
      );
      console.log("This is the cancel order response", response);
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

  console.log(
    "This is the order details for the testing of the ETA",
    orderPurchase,
  );

  // Check if order uses GIG logistics
  const isGigLogistics = () => {
    const firstLegType = orderDetails?.first_leg_logistics_type;
    const secondLegType = orderDetails?.second_leg_logistics_type;
    return firstLegType === "GIG" || secondLegType === "GIG";
  };

  // Get the external logistics tracking ID for GIG
  const getGigTrackingId = () => {
    const firstLegType = orderDetails?.first_leg_logistics_type;
    const secondLegType = orderDetails?.second_leg_logistics_type;
    const firstLegTrackingId = orderDetails?.first_leg_external_logistics_tracking_id;
    const secondLegTrackingId = orderDetails?.second_leg_external_logistics_tracking_id;

    // Check first leg
    if (firstLegType === "GIG" && firstLegTrackingId) {
      return firstLegTrackingId;
    }

    // Check second leg
    if (secondLegType === "GIG" && secondLegTrackingId) {
      return secondLegTrackingId;
    }

    return null;
  };

  // Fetch shipment details
  const fetchShipmentDetails = async () => {
    const trackingId = getGigTrackingId();
    if (!trackingId) {
      setToast({
        type: "error",
        message: "No tracking ID available"
      });
      return;
    }

    setIsLoadingShipment(true);
    try {
      const response = await CaryBinApi.get(`/orders/external-logistics/shipment-details/${trackingId}`
      );
      setShipmentDetails(response.data);
      setShowShipmentDetailsModal(true);
    } catch (error) {
      console.error("Error fetching shipment details:", error);
      setToast({
        type: "error",
        message: "Failed to load shipment details"
      });
    } finally {
      setIsLoadingShipment(false);
    }
  };

  // Track order
  const fetchTrackingDetails = async () => {
    const trackingId = getGigTrackingId();
    if (!trackingId) {
      setToast({
        type: "error",
        message: "No tracking ID available"
      });
      return;
    }

    setIsLoadingTracking(true);
    try {
      const response = await CaryBinApi.get(`/orders/external-logistics/track/${trackingId}`
      );
      setTrackingDetails(response.data);
      setShowTrackOrderModal(true);
    } catch (error) {
      console.error("Error fetching tracking details:", error);
      setToast({
        type: "error",
        message: "Failed to load tracking details"
      });
    } finally {
      setIsLoadingTracking(false);
    }
  };

  // GIG Logistics Modal functions
  const handleCloseShipmentDetailsModal = () => {
    setShowShipmentDetailsModal(false);
    setShipmentDetails(null);
  };

  const handleCloseTrackOrderModal = () => {
    setShowTrackOrderModal(false);
    setTrackingDetails(null);
  };

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

  // Professional ETA calculation based on order creation date
  const calculateOrderETA = (orderItems, orderCreatedAt) => {
    if (!orderItems || orderItems.length === 0 || !orderCreatedAt) {
      return null;
    }

    // Parse the order creation date
    const orderDate = new Date(orderCreatedAt);

    // Validate the date
    if (isNaN(orderDate.getTime())) {
      console.error("Invalid order creation date:", orderCreatedAt);
      return null;
    }

    // Determine if order has style items
    const hasStyleItems = orderItems.length === 2;

    let totalHours = 0;
    let estimatedSewingTimeDays = 0;
    let deliveryTimeHours = 0;

    if (hasStyleItems) {
      // For style orders: 72 hours base + sewing time from API
      deliveryTimeHours = 72; // 3 days for processing and delivery

      // Get the style item (second item in the array)
      const styleItem = orderItems[1];

      // Get estimated_sewing_time from product > style > estimated_sewing_time (in days)
      estimatedSewingTimeDays =
        styleItem?.product?.style?.estimated_sewing_time || 0;

      // Convert days to hours
      const estimatedSewingTimeHours = estimatedSewingTimeDays * 24;

      totalHours = deliveryTimeHours + estimatedSewingTimeHours;
    } else {
      // For fabric-only orders: 48 hours
      totalHours = 48;
      deliveryTimeHours = 48;
    }

    // Calculate estimated arrival date from order creation date
    const estimatedArrivalDate = new Date(
      orderDate.getTime() + totalHours * 60 * 60 * 1000,
    );

    // Calculate days remaining from current time
    const now = new Date();
    const timeRemainingMs = estimatedArrivalDate.getTime() - now.getTime();

    // Calculate days remaining (can be negative if past due)
    const daysRemaining = Math.ceil(timeRemainingMs / (1000 * 60 * 60 * 24));

    // Calculate hours remaining for more precise display
    const hoursRemaining = Math.ceil(timeRemainingMs / (1000 * 60 * 60));

    return {
      hasStyleItems,
      deliveryTimeHours,
      deliveryTimeDays: Math.ceil(deliveryTimeHours / 24),
      sewingTimeDays: estimatedSewingTimeDays,
      sewingTimeHours: estimatedSewingTimeDays * 24,
      totalHours,
      totalDays: Math.ceil(totalHours / 24),
      orderCreatedAt: orderDate,
      estimatedArrival: estimatedArrivalDate,
      daysRemaining,
      hoursRemaining,
      isPastDue: daysRemaining < 0,
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
      "PAID",
    ].includes(orderDetails?.status);

    if (!shouldShowForStatus) {
      return null;
    }

    // Calculate ETA using order's created_at timestamp
    const etaData = calculateOrderETA(orderPurchase, orderDetails?.created_at);

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
      });
    };

    const formatDateTime = (date) => {
      return date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Display logic for remaining time
    const getTimeRemainingDisplay = () => {
      if (etaData.isPastDue) {
        const overdueDays = Math.abs(etaData.daysRemaining);
        return {
          text: `${overdueDays} ${overdueDays === 1 ? "Day" : "Days"} Overdue`,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      } else if (etaData.daysRemaining === 0) {
        if (etaData.hoursRemaining <= 0) {
          return {
            text: "Arriving Today",
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200",
          };
        }
        return {
          text: `${etaData.hoursRemaining} ${etaData.hoursRemaining === 1 ? "Hour" : "Hours"} Left`,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      } else if (etaData.daysRemaining === 1) {
        return {
          text: "Tomorrow",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      } else {
        return {
          text: `${etaData.daysRemaining} Days`,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      }
    };

    const timeDisplay = getTimeRemainingDisplay();

    return (
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-purple-200 p-4 sm:p-6 mt-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-md">
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

        {/* Order Timeline Info */}
        <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Order Placed:</p>
              <p className="font-semibold text-gray-900">
                {formatDateTime(etaData.orderCreatedAt)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Estimated Total Time:</p>
              <p className="font-semibold text-gray-900">
                {etaData.totalDays} {etaData.totalDays === 1 ? "Day" : "Days"} (
                {etaData.totalHours} hours)
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Breakdown */}
        <div className="space-y-4 mb-6">
          {etaData.hasStyleItems ? (
            <>
              <div className="flex items-start gap-4 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-blue-100 flex-col sm:flex-row">
                <div className="bg-blue-100 p-2 rounded-lg mb-2 sm:mb-0">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-2">
                    <span className="font-semibold text-gray-800">
                      Processing & Delivery
                    </span>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {etaData.deliveryTimeDays}{" "}
                      {etaData.deliveryTimeDays === 1 ? "day" : "days"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Order processing and shipment to tailor
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-purple-100 flex-col sm:flex-row">
                <div className="bg-purple-100 p-2 rounded-lg mb-2 sm:mb-0">
                  <Scissors className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-2">
                    <span className="font-semibold text-gray-800">
                      Tailoring Time
                    </span>
                    <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      {etaData.sewingTimeDays}{" "}
                      {etaData.sewingTimeDays === 1 ? "day" : "days"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Custom sewing for your style
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-4 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-green-100 flex-col sm:flex-row">
              <div className="bg-green-100 p-2 rounded-lg mb-2 sm:mb-0">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-2">
                  <span className="font-semibold text-gray-800">
                    Standard Delivery
                  </span>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    {etaData.deliveryTimeDays}{" "}
                    {etaData.deliveryTimeDays === 1 ? "day" : "days"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Processing and direct delivery to your location
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Total Estimate with Dynamic Time Remaining */}
        {etaData.isPastDue ? (
          // Overdue - Professional Apology Message
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-xl border-2 border-amber-200 p-4 sm:p-6 shadow-lg">
            <div className="flex items-start gap-4 mb-4 flex-col sm:flex-row">
              <div className="bg-amber-100 p-3 rounded-full flex-shrink-0 mb-2 sm:mb-0">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Taking a Bit Longer Than Expected
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  We sincerely apologize for the delay. Your order is taking
                  longer than our initial estimate due to unforeseen
                  circumstances.
                </p>
                <div className="bg-white rounded-lg p-4 border border-amber-200 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-gray-800">
                      Original Estimated Arrival
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm font-medium">
                    {formatDate(etaData.estimatedArrival)}
                  </p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      We're On It!
                    </p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Our team is working diligently to get your order to you as
                      soon as possible. You'll receive updates as we progress.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg p-4 text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  <span className="font-semibold">Expected Arrival:</span>
                </div>
                <span className="font-bold text-lg">Very Soon</span>
              </div>
              <p className="text-xs mt-2 text-white opacity-90">
                We appreciate your patience and understanding during this time.
              </p>
            </div>
          </div>
        ) : (
          // Normal - Expected Arrival
          <div className="bg-indigo-600 rounded-xl p-4 sm:p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-white font-semibold text-lg">
                  Expected Arrival
                </span>
              </div>
              <div
                className={`${timeDisplay.bgColor} ${timeDisplay.borderColor} border-2 backdrop-blur-sm px-4 py-2 rounded-full`}
              >
                <span className={`${timeDisplay.color} font-bold text-lg`}>
                  {timeDisplay.text}
                </span>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-black text-sm font-medium mb-1">
                {formatDate(etaData.estimatedArrival)}
              </p>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-600 bg-white bg-opacity-60 backdrop-blur-sm p-3 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p>
            Delivery times are estimates and may vary based on considerable
            factors i.e traffic, order complexity, and logistics. You'll receive
            updates as your order progresses.
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

      {/* /* Shipment Details Modal */}
      {showShipmentDetailsModal && shipmentDetails && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-purple-50">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                Shipment Details
              </h3>
              <button
                onClick={handleCloseShipmentDetailsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {shipmentDetails.data && shipmentDetails.data.length > 0 ? (
                (() => {
                  const shipment = shipmentDetails.data[0];
                  return (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Main Shipment Info */}
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-purple-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Waybill Number</p>
                            <p className="text-base sm:text-lg font-mono font-semibold text-gray-900">
                              {shipment.Waybill}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Status</p>
                            <span className={`inline-block px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${shipment.IsDelivered
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                              }`}>
                              {shipment.shipmentstatus}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Vehicle Type</p>
                            <p className="text-sm sm:text-base font-semibold text-purple-700">
                              {shipment.VehicleType}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Delivery Type</p>
                            <p className="text-sm sm:text-base font-medium text-gray-900">
                              {shipment.IsHomeDelivery ? "Home Delivery" : "Pickup"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sender & Receiver Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                          <h4 className="font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Sender Information
                          </h4>
                          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                            <div>
                              <p className="text-gray-500 text-[11px] sm:text-xs">Name</p>
                              <p className="font-medium text-gray-900">{shipment.SenderName}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-[11px] sm:text-xs">Phone</p>
                              <p className="font-medium text-gray-900">{shipment.SenderPhoneNumber}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-[11px] sm:text-xs">Address</p>
                              <p className="text-gray-700 text-[11px] sm:text-xs leading-relaxed">{shipment.SenderAddress}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                          <h4 className="font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            Receiver Information
                          </h4>
                          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                            <div>
                              <p className="text-gray-500 text-[11px] sm:text-xs">Name</p>
                              <p className="font-medium text-gray-900">{shipment.ReceiverName}</p>
                            </div>
                            {/* Uncomment if you want to show phone/address for receiver
                            <div>
                              <p className="text-gray-500 text-xs">Phone</p>
                              <p className="font-medium text-gray-900">{shipment.ReceiverPhoneNumber}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Address</p>
                              <p className="text-gray-700 text-xs leading-relaxed">{shipment.ReceiverAddress}</p>
                            </div>
                            */}
                          </div>
                        </div>
                      </div>

                      {/* Pricing Information */}
                      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                        <h4 className="font-semibold text-gray-700 mb-3 sm:mb-4">Pricing Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          <div>
                            <p className="text-[11px] sm:text-xs text-gray-500 mb-1">Delivery Price</p>
                            <p className="text-base sm:text-lg font-bold text-gray-900">₦{shipment.DeliveryPrice.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[11px] sm:text-xs text-gray-500 mb-1">Insurance</p>
                            <p className="text-base sm:text-lg font-bold text-gray-900">₦{shipment.InsuranceValue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[11px] sm:text-xs text-gray-500 mb-1">Grand Total</p>
                            <p className="text-base sm:text-lg font-bold text-purple-600">₦{shipment.GrandTotal.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                          <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-900 text-sm">Created</h4>
                          </div>
                          <p className="text-xs sm:text-sm text-blue-800">
                            {new Date(shipment.DateCreated).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
                          <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <Clock className="w-5 h-5 text-green-600" />
                            <h4 className="font-semibold text-green-900 text-sm">Last Modified</h4>
                          </div>
                          <p className="text-xs sm:text-sm text-green-800">
                            {new Date(shipment.DateModified).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Waybill Image */}
                      {shipment.WaybillImageUrl && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                          <h4 className="font-semibold text-gray-700 mb-2 sm:mb-3">Waybill Image</h4>
                          <img
                            src={shipment.WaybillImageUrl}
                            alt="Waybill"
                            className="w-full rounded-lg border border-gray-300 object-contain max-h-64"
                          />
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No shipment details available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* /* Track Order Modal */}
      {showTrackOrderModal && trackingDetails && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-blue-50">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                Track Order
              </h3>
              <button
                onClick={handleCloseTrackOrderModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {trackingDetails.data && trackingDetails.data.length > 0 ? (
                (() => {
                  const shipment = trackingDetails.data[0];
                  const trackings = shipment.MobileShipmentTrackings || [];

                  return (
                    <div className="space-y-6">
                      {/* Shipment Summary */}
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-100">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Waybill</p>
                            <p className="text-base sm:text-lg font-mono font-semibold text-gray-900">
                              {shipment.Waybill}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Amount</p>
                            <p className="text-base sm:text-lg font-bold text-blue-600">
                              ₦{shipment.Amount?.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Pickup Option</p>
                            <p className="text-sm sm:text-base font-medium text-gray-900">
                              {shipment.MobileShipmentTrackings[0]?.PickupOptions || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Events */}
                      {trackings.length > 0 ? (
                        <div className="relative">
                          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 hidden sm:block"></div>
                          <div className="space-y-6">
                            {trackings.map((tracking, index) => {
                              const isLatest = index === 0;
                              return (
                                <div key={index} className="relative flex flex-col sm:flex-row gap-4 items-start">
                                  <div className="relative z-10 flex-shrink-0 flex justify-center sm:block">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${isLatest
                                      ? "bg-green-100 border-4 border-green-500"
                                      : "bg-gray-100 border-4 border-gray-300"
                                      }`}>
                                      {isLatest ? (
                                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                      ) : (
                                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">
                                          {tracking.Status}
                                        </h4>
                                        {tracking.ScanStatusIncident && (
                                          <p className="text-sm text-blue-600 font-medium">
                                            {tracking.ScanStatusIncident}
                                          </p>
                                        )}
                                      </div>
                                      {tracking.DateTime && (
                                        <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 ml-0 sm:ml-3">
                                          <Calendar className="w-4 h-4" />
                                          {(() => {
                                            let dateStr = tracking.DateTime?.replace(" WAT", "");
                                            let dateObj = dateStr ? new Date(dateStr.replace(/-/g, '/')) : null;
                                            return dateObj && !isNaN(dateObj)
                                              ? dateObj.toLocaleString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                              })
                                              : tracking.DateTime || "N/A";
                                          })()}
                                        </span>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      {tracking.ScanStatusReason && (
                                        <p className="text-sm text-gray-600">
                                          <span className="font-medium">Reason:</span> {tracking.ScanStatusReason}
                                        </p>
                                      )}

                                      {tracking.ScanStatusComment && (
                                        <p className="text-sm text-gray-600">
                                          <span className="font-medium">Comment:</span> {tracking.ScanStatusComment}
                                        </p>
                                      )}

                                      {tracking.DepartureServiceCentre?.Name && (
                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                                          <MapPin className="w-4 h-4" />
                                          {tracking.DepartureServiceCentre.Name}
                                        </p>
                                      )}
                                    </div>

                                    {/* Additional Info */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3">
                                      {tracking.ServiceCentreId && (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                          Service Centre: {tracking.ServiceCentreId}
                                        </span>
                                      )}
                                      {tracking.TrackingType !== undefined && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                          Tracking Type: {tracking.TrackingType}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No tracking events available yet</p>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tracking details available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CustomBackbtn />

      <div className="bg-white px-4 sm:px-6 py-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-lg font-medium mb-2 sm:mb-3">
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

      {/* GIG Logistics Buttons */}
      {isGigLogistics() && (
        <div className="bg-white rounded-xl shadow-sm px-4 sm:px-6 py-4 mb-6">
          {/* 1. Container: flex-col (vertical) on mobile, sm:flex-row (horizontal) on tablet/desktop */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">

            <button
              onClick={fetchShipmentDetails}
              disabled={isLoadingShipment}
              // 2. Button: w-full (mobile) -> sm:w-auto (desktop) + justify-center
              className="w-full sm:w-auto justify-center cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingShipment ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  View Shipment Details
                </>
              )}
            </button>

            <button
              onClick={fetchTrackingDetails}
              disabled={isLoadingTracking}
              // 2. Button: w-full (mobile) -> sm:w-auto (desktop) + justify-center
              className="w-full sm:w-auto justify-center cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingTracking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  Track Order
                </>
              )}
            </button>

          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h5 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Truck className="w-5 h-5 text-purple-600" />
          Order Progress
        </h5>

        <div className="relative px-0 md:px-8">

          {/* --- DESKTOP LINES (Horizontal) --- */}
          {/* Only visible on md screens and up */}
          <div
            className="hidden md:block absolute top-5 h-1 bg-gray-200"
            style={{
              left: `calc(${100 / (orderSteps.length - 1) / 2}%)`,
              right: `calc(${100 / (orderSteps.length - 1) / 2}%)`,
            }}
          />
          <div
            className={`hidden md:block absolute top-5 h-1 transition-all duration-500 ${orderDetails?.status === "CANCELLED"
              ? "bg-red-500"
              : "bg-gradient-to-r from-purple-500 to-purple-600"
              }`}
            style={{
              left: `calc(${100 / (orderSteps.length - 1) / 2}%)`,
              width:
                currentStep >= 0
                  ? `calc(${(currentStep / (orderSteps.length - 1)) * 100
                  }% - ${100 / (orderSteps.length - 1)}%)`
                  : "0%",
            }}
          />

          {/* --- MOBILE LINE (Vertical) --- */}
          {/* Only visible on small screens. Connects the dots vertically. */}
          <div className="absolute left-5 top-4 bottom-10 w-0.5 bg-gray-200 md:hidden -z-0"></div>

          {/* --- STEPS CONTAINER --- */}
          {/* Flex-col for mobile (stack vertical), Flex-row for desktop (horizontal) */}
          <div className="relative flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-0">
            {orderSteps.map((step, index) => (
              <div
                key={index}
                className="flex flex-row md:flex-col items-center flex-1 relative z-10"
              >
                {/* ICON CIRCLE */}
                <div
                  className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 border-2 ${orderDetails?.status === "CANCELLED"
                    ? "bg-red-500 border-red-500 text-white shadow-lg ring-4 ring-red-100"
                    : index <= currentStep
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 border-transparent text-white shadow-lg ring-4 ring-purple-100"
                      : "bg-white border-gray-300 text-gray-400"
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

                {/* TEXT LABEL */}
                {/* Left margin for mobile, Top margin for desktop */}
                <span
                  className={`ml-4 md:ml-0 md:mt-3 text-sm font-medium text-left md:text-center ${orderDetails?.status === "CANCELLED"
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

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Status:</strong>{" "}
            {statusMessages[orderSteps[currentStep]] || "Order status unknown"}
          </p>
        </div>
      </div>

      <ETADisplay orderDetails={orderDetails} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Main Content Area */}
        <div className="bg-white p-4 sm:p-6 rounded-md md:col-span-2 shadow-sm border border-gray-200">
          <h5 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-3 mb-5">
            Order Details
          </h5>

          <div className="bg-white">
            {/* 1. Order & Payment Info Grid */}
            {/* Stack vertical on mobile, 2 columns on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 md:gap-x-12 mb-8">

              {/* Column 1: Order Info */}
              <div className="space-y-4">
                <h6 className="font-semibold text-gray-800 border-l-4 border-purple-500 pl-3">
                  Order Information
                </h6>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Order ID:</span>
                    <span className="font-mono font-medium text-gray-900 text-right break-all ml-4">
                      {orderDetails?.payment?.id?.replace(/-/g, "").slice(0, 12).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Transaction ID:</span>
                    <span className="font-medium text-gray-900 text-right break-all ml-4">
                      {orderDetails?.payment?.transaction_id || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="font-medium text-gray-900">
                      {orderDetails?.payment?.payment_method || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Purchase Type:</span>
                    <span className="font-medium text-gray-900">
                      {orderDetails?.payment?.purchase_type || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: Payment Info */}
              <div className="space-y-4">
                <h6 className="font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
                  Payment Information
                </h6>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Payment Status:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${orderDetails?.payment?.payment_status === "SUCCESS"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {orderDetails?.payment?.payment_status || "PENDING"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Currency:</span>
                    <span className="font-medium text-gray-900">
                      {orderDetails?.payment?.currency || "NGN"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Purchase Items List */}
            {orderPurchase && orderPurchase.length > 0 && (
              <div className="mt-8">
                <h6 className="font-semibold text-gray-800 mb-4">Purchase Items</h6>
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
                        // Mobile: Flex-col (Image top, text bottom). Desktop: Flex-row (Image left)
                        className="flex flex-col sm:flex-row gap-5 p-4 border border-gray-100 rounded-xl bg-gray-50/50"
                      >
                        <img
                          src={imageSrc}
                          alt={item.product.name || "Product"}
                          className="w-full sm:w-24 h-48 sm:h-24 rounded-lg object-cover border border-gray-200"
                        />

                        <div className="flex-1 w-full">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className="font-semibold text-base text-gray-900">
                              {item.product.name || "Product Item"}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${tagColor}`}
                            >
                              {tagLabel}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm text-gray-600 mb-3">
                            <span>Quantity: {item.quantity || 1}</span>
                            <span>
                              Unit Price: ₦{item.price ? parseInt(item.price).toLocaleString() : "0"}
                            </span>
                          </div>

                          {/* Sub-total calculation box */}
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-medium text-gray-500 uppercase">
                                Item Total
                              </span>
                              <div className="text-right">
                                <span className="block font-bold text-gray-900">
                                  ₦{" "}
                                  {item.price && item.quantity
                                    ? (parseInt(item.price) * parseInt(item.quantity)).toLocaleString()
                                    : "0"}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  ({item.price} x {item.quantity})
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

            {/* 3. Footer Summary */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    ₦ {parseInt(calculatedSubtotal || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium text-gray-900">
                    ₦ {orderDetails?.payment?.purchase?.tax_amount?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium text-gray-900">
                    ₦ {orderDetails?.payment?.purchase?.delivery_fee?.toLocaleString() || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>
                    - ₦ {parseInt(orderDetails?.payment?.discount_applied || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 pt-4 border-t border-gray-200 gap-4">
                <div>
                  <span className="text-gray-500 text-xs block mb-1">Total Amount Paid</span>
                  <span className="font-bold text-2xl text-gray-900">
                    ₦ {parseInt(totalAmount || 0).toLocaleString()}
                  </span>
                </div>

                <span
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border ${orderDetails?.status === "DELIVERED"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : orderDetails?.status === "CANCELLED"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                >
                  Order Status: {orderDetails?.status}
                </span>
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
                    (item) => item.product?.type === "STYLE",
                  ) && (
                      <button
                        onClick={() => setReviewTab("style")}
                        className={`px-6 py-3 font-medium transition-all ${reviewTab === "style"
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
                                (item) => item.product?.type === "STYLE",
                              ).length
                            }
                          </span>
                        </div>
                      </button>
                    )}

                  {orderPurchase.some(
                    (item) => item.product?.type === "FABRIC",
                  ) && (
                      <button
                        onClick={() => setReviewTab("fabric")}
                        className={`px-6 py-3 font-medium transition-all ${reviewTab === "fabric"
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
                                (item) => item.product?.type === "FABRIC",
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
                      (item) => item.product?.type === "STYLE",
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
                      (item) => item.product?.type === "FABRIC",
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
                      productName={`${orderDetails?.payment?.purchase_type || "Product"
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



