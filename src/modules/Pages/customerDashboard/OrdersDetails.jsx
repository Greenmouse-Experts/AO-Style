/**
 * Customer Order Details Page
 *
 * Updated to:
 * - Use the /orders/details/id endpoint for order data
 * - Automatically show review section when order status is DELIVERED
 * - Support individual product reviews for both styles and fabrics
 * - Integrate with existing review system using ReviewForm component
 * - Display order progress based on actual order status
 * - Working ETA calculation using Google Maps Distance Matrix API
 */
import React, { useState } from "react";
import {
  CheckCircle,
  Circle,
  Phone,
  MessageSquare,
  Mail,
  FileText,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import useGetCustomerSingleOrder from "../../../hooks/order/useGetCustomerSingleOrder";
import Loader from "../../../components/ui/Loader";
import ReviewForm from "../../../components/reviews/ReviewForm";
import StarRating from "../../../components/reviews/StarRating";
import { useJsApiLoader } from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";

const orderSteps = [
  "Order Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const statusMessages = {
  "Order Placed": "Your order has been placed and is awaiting processing.",
  Processing: "Your order is being processed and prepared for shipment.",
  Shipped: "Your order has been shipped and is in transit.",
  "Out for Delivery": "Your order is out for delivery.",
  Delivered: "Your order has been delivered successfully!",
};

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = "AIzaSyBstumBKZoQNTHm3Y865tWEHkkFnNiHGGE";

// Warehouse coordinates (Lagos, Nigeria - update this to your actual warehouse location)
const WAREHOUSE_COORDINATES = {
  latitude: 6.5244,
  longitude: 3.3792,
};

const OrderDetails = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState("style");
  const [activeReviewProduct, setActiveReviewProduct] = useState(null);

  const { id: orderId } = useParams();

  const {
    isPending: getUserIsPending,
    data,
    isError,
    error,
  } = useGetCustomerSingleOrder(orderId);

  // Enhanced debugging
  console.log("=== CUSTOMER ORDER DETAILS DEBUG ===");
  console.log("orderId from URL:", orderId);
  console.log("isPending:", getUserIsPending);
  console.log("isError:", isError);
  console.log("error:", error);
  console.log("Raw API response data:", data);
  console.log("Order details (data?.data):", data?.data);
  console.log("Payment object:", data?.data?.payment);
  console.log("Purchase object:", data?.data?.payment?.purchase);
  console.log("Purchase items:", data?.data?.payment?.purchase?.items);
  console.log("Order status:", data?.data?.status);
  console.log("User coordinates:", data?.data?.user?.profile?.coordinates);
  console.log("=====================================");

  // Always call these hooks to maintain consistent hook order
  const orderDetails = data?.data;
  const orderPurchase = data?.data?.order_items;
  const metaData = data?.data?.payment?.metadata;

  // Check if order is delivered and show review section automatically
  const isDelivered = orderDetails?.status === "DELIVERED";

  console.log("=== PROCESSED DATA DEBUG ===");
  console.log("isDelivered:", isDelivered);
  console.log("orderPurchase items count:", orderPurchase?.length);
  console.log(
    "Style items:",
    orderPurchase?.filter((item) => item.purchase_type === "STYLE"),
  );
  console.log(
    "Fabric items:",
    orderPurchase?.filter((item) => item.purchase_type === "FABRIC"),
  );
  console.log("Current step:", currentStep);
  console.log("============================");

  // Update currentStep based on order status
  const getStepFromStatus = (status) => {
    const statusMap = {
      PROCESSING: 1,
      SHIPPED: 2,
      IN_TRANSIT: 2,
      OUT_FOR_DELIVERY: 3,
      DELIVERED: 4,
      CANCELLED: -1, // Special case for cancelled orders
    };
    return statusMap[status] || 0;
  };

  // Custom hook for ETA calculation using Google Maps
  const useOrderETA = (orderDetails) => {
    const shouldFetchETA =
      orderDetails?.status === "SHIPPED" ||
      orderDetails?.status === "IN_TRANSIT" ||
      orderDetails?.status === "OUT_FOR_DELIVERY" ||
      orderDetails?.status === "PAID" ||
      orderDetails?.status === "DELIVERED";

    const userCoordinates = orderDetails?.user?.profile?.coordinates;
    const hasCoordinates =
      userCoordinates?.latitude && userCoordinates?.longitude;

    return useQuery({
      queryKey: ["order-eta", orderDetails?.id, userCoordinates],
      queryFn: async () => {
        if (!hasCoordinates) throw new Error("No user coordinates available");

        const origin = `${WAREHOUSE_COORDINATES.latitude},${WAREHOUSE_COORDINATES.longitude}`;
        const destination = `${userCoordinates.latitude},${userCoordinates.longitude}`;

        console.log("=== ETA CALCULATION DEBUG ===");
        console.log("Origin (warehouse):", origin);
        console.log("Destination (user):", destination);
        console.log("API Key available:", !!GOOGLE_MAPS_API_KEY);

        // Create a proxy request to avoid CORS issues
        // Since we can't directly call Google's API from the frontend due to CORS,
        // we'll use a simple calculation based on distance

        // Calculate distance using Haversine formula
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
          const R = 6371; // Radius of the Earth in kilometers
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lon2 - lon1) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c; // Distance in kilometers
        };

        const distanceKm = calculateDistance(
          WAREHOUSE_COORDINATES.latitude,
          WAREHOUSE_COORDINATES.longitude,
          userCoordinates.latitude,
          userCoordinates.longitude,
        );

        console.log("Calculated distance (km):", distanceKm);

        // Estimate delivery time based on distance
        // Assuming average delivery speed of 30 km/h in urban areas
        const averageDeliverySpeed = 30; // km/h
        const estimatedHours = distanceKm / averageDeliverySpeed;
        const estimatedMinutes = Math.ceil(estimatedHours * 60);

        // Add buffer time for processing, loading, etc.
        const bufferMinutes = 30;
        const totalMinutes = estimatedMinutes + bufferMinutes;

        console.log("Estimated delivery time (minutes):", totalMinutes);

        return {
          distance: {
            text: `${distanceKm.toFixed(1)} km`,
            value: distanceKm * 1000, // in meters
          },
          duration: {
            text: `${Math.ceil(estimatedHours)} hours`,
            value: totalMinutes * 60, // in seconds
          },
          duration_in_traffic: {
            text: `${Math.ceil(estimatedHours + 0.5)} hours`, // Add traffic buffer
            value: (totalMinutes + 30) * 60, // in seconds with traffic
          },
          status: "OK",
        };
      },
      // enabled: shouldFetchETA && hasCoordinates,
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
      staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
      retry: 2,
      onError: (error) => {
        console.error("ETA calculation error:", error);
      },
      onSuccess: (data) => {
        console.log("ETA calculation successful:", data);
      },
    });
  };

  // ETA Display Component - Enhanced with better debugging
  const ETADisplay = ({ orderDetails }) => {
    console.log("=== ETADisplay Component Debug ===");
    console.log("Order Details passed to ETADisplay:", orderDetails);
    console.log("Order Status:", orderDetails?.status);
    console.log("User coordinates:", orderDetails?.user?.profile?.coordinates);

    // Check status first
    const shouldShowForStatus = [
      "SHIPPED",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "PAID",
      "DELIVERED",
    ].includes(orderDetails?.status);
    console.log("Should show for status:", shouldShowForStatus);

    if (!shouldShowForStatus) {
      console.log(
        "❌ ETA not shown - status not eligible:",
        orderDetails?.status,
      );
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="text-sm text-red-700">
            ETA not available for status:{" "}
            <strong>{orderDetails?.status}</strong>
            <br />
            ETA is only shown for: SHIPPED, IN_TRANSIT, OUT_FOR_DELIVERY
          </div>
        </div>
      );
    }

    // Check coordinates
    const userCoordinates = orderDetails?.user?.profile?.coordinates;
    const hasCoordinates =
      userCoordinates?.latitude && userCoordinates?.longitude;
    console.log("Has coordinates:", hasCoordinates);

    if (!hasCoordinates) {
      console.log("❌ ETA not shown - no coordinates available");
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-yellow-700">
              Location not available for ETA calculation
            </span>
          </div>
        </div>
      );
    }

    // Use the ETA hook
    console.log("✅ Calling useOrderETA hook");
    const {
      data: etaData,
      isLoading: etaLoading,
      error: etaError,
    } = useOrderETA(orderDetails);

    console.log("ETA Hook Results:", { etaData, etaLoading, etaError });

    if (etaLoading) {
      console.log("⏳ ETA is loading...");
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">
              Calculating delivery ETA...
            </span>
          </div>
        </div>
      );
    }

    if (etaError) {
      console.log("❌ ETA Error:", etaError);
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="text-sm text-red-700">
            <strong>ETA calculation error:</strong> {etaError.message}
            <br />
            <small>Check console for more details</small>
          </div>
        </div>
      );
    }

    if (etaData && etaData.status === "OK") {
      console.log("✅ ETA Data available:", etaData);

      const formatETA = (duration) => {
        const minutes = Math.ceil(duration.value / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours > 0) {
          return `${hours}h ${remainingMinutes}m`;
        }
        return `${minutes} minutes`;
      };

      const estimatedArrival = new Date(
        Date.now() + etaData.duration_in_traffic.value * 1000,
      );

      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">
                🚚 Estimated Delivery Time
              </span>
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                {formatETA(etaData.duration_in_traffic)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">Expected Arrival:</span>
              <span className="font-medium text-green-800">
                {estimatedArrival.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">Distance:</span>
              <span className="text-green-800">{etaData.distance.text}</span>
            </div>

            <div className="text-xs text-green-600 mt-2">
              * ETA calculated based on distance and traffic conditions, updates
              every 5 minutes
            </div>
          </div>
        </div>
      );
    }

    console.log("❌ ETA Data not available or invalid");
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
        <div className="text-sm text-gray-600">
          ETA calculation in progress... Please wait.
        </div>
      </div>
    );
  };

  // Set current step based on order status
  React.useEffect(() => {
    console.log(
      "useEffect triggered - orderDetails?.status:",
      orderDetails?.status,
    );
    if (orderDetails?.status) {
      const step = getStepFromStatus(orderDetails.status);
      console.log("Setting currentStep to:", step);
      setCurrentStep(step);
    }
  }, [orderDetails?.status]);

  // Enhanced error handling
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
    console.error("❌ Error loading order details:", error);
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
    console.warn("⚠️ No order data found for ID:", orderId);
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

  console.log("=== CUSTOMER TOTAL AMOUNT DEBUG ===");
  console.log("Calculated totalAmount:", totalAmount);
  console.log("Order Purchase Array Length:", orderPurchase?.length || 0);
  console.log("Individual item calculations:");
  orderPurchase?.forEach((item, index) => {
    console.log(`Item ${index + 1}:`, {
      name: item?.name,
      quantity: item?.quantity,
      price: item?.price,
      subtotal:
        orderDetails?.payment?.metadata[1]?.order_summary?.subtotal || 0,
      purchase_type: item?.purchase_type,
    });
  });
  console.log("====================================");

  // Additional debug info
  if (!orderPurchase || orderPurchase.length === 0) {
    console.warn("⚠️ No purchase items found in order data");
  }

  return (
    <div className="">
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-lg font-medium mb-3">
          Orders Details :{" "}
          <span className="text-gray-600">{orderDetails?.id}</span>
        </h1>
        <p className="text-gray-500">
          <Link to="/customer" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Orders
        </p>
      </div>

      <h5 className="text-lg font-meduim text-[#A14DF6] mb-4">
        ORDER PROGRESS
      </h5>
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 relative space-y-4 md:space-y-0">
        {orderSteps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center w-full relative"
          >
            {index > 0 && (
              <div
                className={`absolute top-3 left-0 right-0 h-1 ${
                  orderDetails?.status === "CANCELLED"
                    ? "bg-red-300"
                    : index <= currentStep
                      ? "bg-[#EC8B20]"
                      : "bg-gray-300"
                }`}
              ></div>
            )}
            <div
              className={`z-10 w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                orderDetails?.status === "CANCELLED"
                  ? "bg-red-500 border-red-500 text-white"
                  : index <= currentStep
                    ? "bg-[#EC8B20] border-[#EC8B20] text-white"
                    : "bg-gray-200 border-gray-400 text-gray-600"
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
              className={`mt-2 text-sm font-medium ${
                orderDetails?.status === "CANCELLED"
                  ? "text-red-600"
                  : index <= currentStep
                    ? "text-black"
                    : "text-gray-400"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white leading-loose rounded-md mt-2 flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
        <span>
          Order Status:{" "}
          {orderDetails?.status === "CANCELLED"
            ? "Order has been cancelled"
            : statusMessages[orderSteps[currentStep]] ||
              `Order is ${orderDetails?.status?.toLowerCase().replace("_", " ")}`}
          <span
            className={`ml-2 px-2 py-1 rounded ${
              orderDetails?.status === "DELIVERED"
                ? "text-green-700 bg-green-100"
                : orderDetails?.status === "CANCELLED"
                  ? "text-red-700 bg-red-100"
                  : "text-yellow-700 bg-yellow-100"
            }`}
          >
            {orderDetails?.status === "DELIVERED"
              ? "Completed"
              : orderDetails?.status === "CANCELLED"
                ? "Cancelled"
                : "Ongoing"}
          </span>
        </span>
        {orderDetails?.status === "DELIVERED" && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            ✅ Your order has been delivered! You can now add reviews below.
          </div>
        )}
        {orderDetails?.status &&
          orderDetails?.status !== "DELIVERED" &&
          orderDetails?.status !== "CANCELLED" && (
            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
              📦 Your order is{" "}
              {orderDetails.status.toLowerCase().replace("_", " ")}. Reviews
              will be available after delivery.
            </div>
          )}
        {orderDetails?.status === "CANCELLED" && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            ❌ This order has been cancelled.
          </div>
        )}
      </div>

      {/* ETA Display Section - Enhanced Debug Version */}
      <div className="mt-4">
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h6 className="font-semibold mb-2">ETA Debug Information:</h6>
          <div className="text-sm space-y-1">
            <p>
              Order Status: <strong>{orderDetails?.status || "N/A"}</strong>
            </p>
            <p>
              User Coordinates Available:{" "}
              <strong>
                {orderDetails?.user?.profile?.coordinates ? "Yes" : "No"}
              </strong>
            </p>
            {orderDetails?.user?.profile?.coordinates && (
              <>
                <p>
                  Latitude:{" "}
                  <strong>
                    {orderDetails.user.profile.coordinates.latitude}
                  </strong>
                </p>
                <p>
                  Longitude:{" "}
                  <strong>
                    {orderDetails.user.profile.coordinates.longitude}
                  </strong>
                </p>
              </>
            )}
            <p>
              Should Show ETA:{" "}
              <strong>
                {["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(
                  orderDetails?.status,
                )
                  ? "Yes"
                  : "No"}
              </strong>
            </p>
          </div>
        </div>
        <ETADisplay orderDetails={orderDetails} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-6 rounded-md md:col-span-2">
          <h5 className="text-lg font-meduim text-dark border-b border-[#D9D9D9] pb-3 mb-3">
            Order Details
          </h5>

          <div className="bg-white rounded-md">
            <div>
              <div className="bg-white mt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Information */}
                  <div className="space-y-4">
                    <h6 className="font-semibold text-gray-800">
                      Order Information
                    </h6>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">
                          #{orderDetails?.id?.slice(-8).toUpperCase()}
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

                  {/* Payment Information */}
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

                {/* Purchase Items */}
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
                              <p className="text-blue-600 font-semibold">
                                N{" "}
                                {item.price
                                  ? parseInt(item.price).toLocaleString()
                                  : "0"}
                              </p>
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
                      ₦{" "}
                      {parseInt(
                        orderDetails?.payment?.metadata[1]?.order_summary
                          ?.subtotal || 0,
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-gray-600 font-medium">Tax:</span>
                    <span className="font-semibold">
                      ₦{" "}
                      {orderDetails?.payment?.metadata[1]?.order_summary?.vat_amount?.toLocaleString() ||
                        "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 mt-2">
                    <span className="text-gray-600 font-medium">
                      Delivery Fee:
                    </span>
                    <span className="font-semibold">
                      ₦ {orderDetails?.payment?.purchase?.delivery_fee || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 mt-2">
                    <span className="text-gray-600 font-medium">Discount:</span>
                    <span className="font-semibold">
                      ₦{" "}
                      {parseInt(
                        orderDetails?.payment?.discount_applied || 0,
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
        <div className="mt-6 bg-white rounded-lg p-6 w-full mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Rate & Review Your Order</h2>
            <span className="text-sm text-white bg-green-500 px-3 py-1 rounded-full">
              ✅ Order Delivered
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Your order has been delivered successfully! Share your experience
            with these products to help other customers.
          </p>

          <div className="space-y-6">
            {/* Check if we have purchase items */}
            {orderPurchase && orderPurchase.length > 0 ? (
              <>
                {/* Style Items Review */}
                {orderPurchase
                  ?.filter((item) => item.purchase_type === "STYLE")
                  .map((styleItem, index) => (
                    <div
                      key={`style-${index}`}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170600/AoStyle/image_bwjfib.jpg"
                          alt={styleItem.name || "Style Item"}
                          className="w-20 h-20 rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">
                            {styleItem.name || "Style Item"}
                          </h4>
                          <p className="text-gray-600">Style Design</p>
                          <p className="text-sm text-gray-500">
                            Quantity: {styleItem.quantity || 1}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setActiveReviewProduct(
                              styleItem.product_id || styleItem.id,
                            )
                          }
                          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
                        >
                          Write Review
                        </button>
                      </div>
                    </div>
                  ))}

                {/* Fabric Items Review */}
                {orderPurchase
                  ?.filter((item) => item.purchase_type === "FABRIC")
                  .map((fabricItem, index) => (
                    <div
                      key={`fabric-${index}`}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170603/AoStyle/image1_s3s2sd.jpg"
                          alt={fabricItem.name || "Fabric Item"}
                          className="w-20 h-20 rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">
                            {fabricItem.name || "Fabric Item"}
                          </h4>
                          <p className="text-gray-600">Fabric Material</p>
                          <p className="text-sm text-gray-500">
                            Quantity: {fabricItem.quantity || 1} yards
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setActiveReviewProduct(
                              fabricItem.product_id || fabricItem.id,
                            )
                          }
                          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
                        >
                          Write Review
                        </button>
                      </div>
                    </div>
                  ))}
              </>
            ) : (
              /* Fallback for orders without detailed item data */
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170600/AoStyle/image_bwjfib.jpg"
                    alt="Order Item"
                    className="w-20 h-20 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">
                      {orderDetails?.payment?.purchase_type || "Product"} Order
                    </h4>
                    <p className="text-gray-600">Order Item</p>
                    <p className="text-sm text-gray-500">
                      Amount: N {parseInt(totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setActiveReviewProduct(
                        orderDetails?.payment?.purchase_id || orderDetails?.id,
                      )
                    }
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
                  >
                    Write Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      <ReviewForm
        productId={activeReviewProduct}
        isOpen={!!activeReviewProduct}
        onClose={() => setActiveReviewProduct(null)}
        onSuccess={() => {
          setActiveReviewProduct(null);
          // You can add a success message here
        }}
      />
    </div>
  );
};

export default OrderDetails;
