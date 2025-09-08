import React, { useState } from "react";
import {
  CheckCircle,
  Circle,
  Phone,
  MessageSquare,
  Mail,
  FileText,
  X,
  Image,
  Eye,
  Package,
  User,
  Calendar,
  MapPin,
  CreditCard,
  Truck,
  Star,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import useGetSingleOrder from "../../../../hooks/order/useGetSingleOrder";
import Loader from "../../../../components/ui/Loader";
import ReviewForm from "../../../../components/reviews/ReviewForm";
import { formatOrderId } from "../../../../lib/orderUtils";

// Dynamic order steps based on order type
const getOrderSteps = (hasStyleItems) => {
  if (hasStyleItems) {
    // Orders with style items: Vendor → Tailor → Customer
    return [
      "Order Placed",
      "Processing",
      "Shipped to Tailor",
      "Tailor Processing",
      "Shipped to Customer",
      "Delivered",
    ];
  } else {
    // Fabric-only orders: Vendor → Customer
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

const OrderDetails = () => {
  const [currentStep, setCurrentStep] = useState(0);
  // const [activeTab, setActiveTab] = useState("style"); // Not used, can be removed if not needed
  const [activeReviewProduct, setActiveReviewProduct] = useState(null);

  // For image modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState(null);

  const { id: orderId } = useParams();

  const { isPending: getUserIsPending, data } = useGetSingleOrder(orderId);
  console.log(data, "orderss");

  // Always call these hooks to maintain consistent hook order
  const orderDetails = data?.data;
  const orderPurchase = data?.data?.payment?.purchase?.items || [];

  // Check if order has style items to determine progress flow
  const hasStyleItems =
    orderDetails?.order_items?.some((item) => item.purchase_type === "STYLE") ||
    false;
  const orderSteps = getOrderSteps(hasStyleItems);

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
    orderDetails?.order_items?.filter(
      (item) => item.purchase_type === "FABRIC",
    ),
  );
  console.log("hasStyleItems:", hasStyleItems);
  console.log("orderSteps:", orderSteps);
  console.log("Order type:", hasStyleItems ? "Fabric + Style" : "Fabric Only");
  console.log("Current step:", currentStep);
  console.log("============================");

  // Update currentStep based on order status
  const getStepFromStatus = (status) => {
    if (hasStyleItems) {
      // Status mapping for orders with style items (6 steps)
      const statusMap = {
        PROCESSING: 1,
        SHIPPED_TO_TAILOR: 2,
        TAILOR_PROCESSING: 3,
        SHIPPED_TO_CUSTOMER: 4,
        OUT_FOR_DELIVERY: 4,
        DELIVERED: 5,
        CANCELLED: -1,
      };
      return statusMap[status] || 0;
    } else {
      // Status mapping for fabric-only orders (5 steps)
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

  // Early return after all hooks are called
  if (getUserIsPending) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  const totalAmount =
    orderDetails?.total_amount || orderDetails?.payment?.amount || 0;

  console.log("=== TOTAL AMOUNT DEBUG ===");
  console.log("Calculated totalAmount:", totalAmount);
  console.log("Individual item calculations:");
  orderPurchase?.forEach((item, index) => {
    console.log(`Item ${index + 1}:`, {
      name: item?.name,
      quantity: item?.quantity,
      price: item?.price,
      subtotal: item?.quantity * item?.price,
    });
  });
  console.log("=========================");
  const calculateSubtotal = () => {
    if (!orderDetails?.order_items || orderDetails.order_items.length === 0) {
      return 0;
    }

    return orderDetails.order_items.reduce((total, item) => {
      const itemPrice = parseInt(item?.product?.price || 0);
      const itemQuantity = parseInt(item?.quantity || 1);
      return total + itemPrice * itemQuantity;
    }, 0);
  };

  const subtotalAmount = calculateSubtotal();
  const deliveryFee = parseInt(
    orderDetails?.payment?.purchase?.delivery_fee || 0,
  );
  const taxAmount = parseInt(orderDetails?.payment?.purchase?.tax_amount || 0);
  const discountAmount = parseInt(
    orderDetails?.payment?.purchase?.coupon_value || 0,
  );
  // Removed handleStepClick - customers should not be able to manually change order progress

  // Helper to get image from metadata - Updated for correct data structure
  const getOrderItemImage = (item) => {
    // First check if there's a direct metadata image on the order level
    const orderMetaImg = orderDetails?.metadata?.image;
    if (orderMetaImg) return orderMetaImg;

    // Then check item-level metadata
    const metaImg =
      item?.metadata?.image ||
      item?.metadata?.img ||
      item?.metadata?.photo ||
      null;
    if (metaImg) return metaImg;

    // fallback to product images if metadata is missing
    if (item?.product?.type === "FABRIC") {
      return item?.product?.fabric?.photos?.[0] || null;
    }
    if (item?.product?.type === "STYLE") {
      return item?.product?.style?.photos?.[0] || null;
    }
    return null;
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper to get status color
  const getStatusColor = (status) => {
    const colors = {
      PAID: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-yellow-100 text-yellow-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      IN_TRANSIT: "bg-indigo-100 text-indigo-800",
      OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Image className="w-5 h-5 text-blue-600" />
                Customer Reference Image
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                onClick={() => setShowImageModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            {modalImageUrl ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-2">
                  <img
                    src={modalImageUrl}
                    alt="Customer Reference"
                    className="w-full h-auto rounded-lg object-contain max-h-96"
                  />
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> This image was uploaded by the
                    customer as a reference for their order requirements.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-20">
                <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No image available for this order.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-7 h-7 text-blue-600" />
                Order Details
              </h1>
              <p className="text-gray-600 mt-1">
                <Link
                  to="/admin/orders"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Orders
                </Link>{" "}
                / Order #{formatOrderId(orderDetails?.id)}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(orderDetails?.status)}`}
              >
                {orderDetails?.status || "Unknown"}
              </span>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {formatDate(orderDetails?.created_at)}
              </p>
            </div>
          </div>

          {/* Customer Reference Image Button */}
          {orderDetails?.metadata?.image && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Image className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Customer Reference Image
                    </h3>
                    <p className="text-sm text-gray-600">
                      Customer has provided a reference image for this order
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setModalImageUrl(orderDetails?.metadata?.image);
                    setShowImageModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Order Progress Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h5 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Order Progress
          </h5>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between relative space-y-4 md:space-y-0">
            {orderSteps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center w-full relative"
              >
                {index > 0 && (
                  <div
                    className={`absolute top-4 left-0 right-0 h-1 ${
                      orderDetails?.status === "CANCELLED"
                        ? "bg-red-300"
                        : index <= currentStep
                          ? "bg-gradient-to-r from-blue-500 to-blue-600"
                          : "bg-gray-200"
                    }`}
                  ></div>
                )}
                <div
                  className={`z-10 w-10 h-10 flex items-center justify-center rounded-full border-3 transition-all duration-300 ${
                    orderDetails?.status === "CANCELLED"
                      ? "bg-red-500 border-red-500 text-white shadow-lg"
                      : index <= currentStep
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500 text-white shadow-lg"
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
                <span
                  className={`mt-3 text-sm font-medium text-center ${
                    orderDetails?.status === "CANCELLED"
                      ? "text-red-600"
                      : index <= currentStep
                        ? "text-blue-600"
                        : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* Status Message */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Status:</strong>{" "}
              {statusMessages[orderSteps[currentStep]] ||
                "Order status unknown"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-6 bg-white leading-loose rounded-xl shadow-lg border border-gray-200 flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
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
                  ✅ Your order has been delivered! You can now add reviews
                  below.
                </div>
              )}
              {orderDetails?.status &&
                orderDetails?.status !== "DELIVERED" &&
                orderDetails?.status !== "CANCELLED" && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    📦 Your order is{" "}
                    {orderDetails.status.toLowerCase().replace("_", " ")}.
                    Reviews will be available after delivery.
                  </div>
                )}
              {orderDetails?.status === "CANCELLED" && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  ❌ This order has been cancelled.
                </div>
              )}
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
                                #
                                {orderDetails?.id
                                  ? orderDetails.id
                                      .replace(/-/g, "")
                                      .substring(0, 12)
                                      .toUpperCase()
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Transaction ID:
                              </span>
                              <span className="font-medium">
                                {orderDetails?.payment?.transaction_id || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Payment Method:
                              </span>
                              <span className="font-medium">
                                {orderDetails?.payment?.payment_method || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Purchase Type:
                              </span>
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
                              <span className="text-gray-600">
                                Payment Status:
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-sm ${
                                  orderDetails?.payment?.payment_status ===
                                  "SUCCESS"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-yellow-100 text-yellow-600"
                                }`}
                              >
                                {orderDetails?.payment?.payment_status ||
                                  "PENDING"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Currency:</span>
                              <span className="font-medium">
                                {orderDetails?.payment?.currency || "NGN"}
                              </span>
                            </div>
                            {/* <div className="flex justify-between">
                        <span className="text-gray-600">Auto Renew:</span>
                        <span className="font-medium">
                          {orderDetails?.payment?.auto_renew ? "Yes" : "No"}
                        </span>
                      </div>*/}
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Purchase Items */}
                      {orderDetails.order_items && orderPurchase.length > 0 && (
                        <div className="mt-8">
                          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                              <h6 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-indigo-600" />
                                Order Items ({orderDetails.order_items.length})
                              </h6>
                            </div>
                            <div className="p-6">
                              <div className="space-y-4">
                                {orderDetails.order_items.map((item, index) => {
                                  const imgUrl = getOrderItemImage(item);
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                      <div className="relative">
                                        <img
                                          src={
                                            imgUrl ||
                                            "https://via.placeholder.com/80x80?text=No+Image"
                                          }
                                          alt={item.name || "Product"}
                                          className="w-20 h-20 rounded-lg object-cover border-2 border-gray-100"
                                        />
                                        {imgUrl && (
                                          <button
                                            type="button"
                                            className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition-colors"
                                            onClick={() => {
                                              setModalImageUrl(imgUrl);
                                              setShowImageModal(true);
                                            }}
                                            title="View Full Image"
                                          >
                                            <Eye size={14} />
                                          </button>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-lg">
                                          {item?.product?.name ||
                                            "Product Item"}
                                        </h4>
                                        <div className="mt-2 space-y-1">
                                          <p className="text-sm text-gray-600">
                                            <span className="font-medium">
                                              Type:
                                            </span>{" "}
                                            {item?.product?.type || "N/A"}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            <span className="font-medium">
                                              Quantity:
                                            </span>{" "}
                                            {item.quantity || 1}
                                          </p>
                                          <p className="text-lg font-bold text-blue-600">
                                            ₦
                                            {item?.product?.price
                                              ? parseInt(
                                                  item?.product?.price,
                                                ).toLocaleString()
                                              : "0"}
                                          </p>
                                        </div>
                                        {!imgUrl && (
                                          <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-2 py-1 rounded">
                                            ⚠️ No image available for this item
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-6">
                      <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between items-center pb-2">
                          <span className="text-gray-600 font-medium">
                            Subtotal:
                          </span>
                          <span className="font-semibold">
                            ₦ {subtotalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 mt-2">
                          <span className="text-gray-600 font-medium">
                            Delivery Fee:
                          </span>
                          <span className="font-semibold">
                            ₦{" "}
                            {orderDetails?.payment?.purchase?.delivery_fee
                              ? parseInt(
                                  orderDetails?.payment?.purchase?.delivery_fee,
                                ).toLocaleString()
                              : "0"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 mt-2">
                          <span className="text-gray-600 font-medium">
                            Tax:
                          </span>
                          <span className="font-semibold">
                            ₦{" "}
                            {orderDetails?.payment?.purchase?.tax_amount
                              ? parseInt(
                                  orderDetails?.payment?.purchase?.tax_amount,
                                ).toLocaleString()
                              : "0"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 mt-2">
                          <span className="text-gray-600 font-medium">
                            Discount:
                          </span>
                          <span className="font-semibold">
                            ₦{" "}
                            {orderDetails?.payment?.discount_applied > 0
                              ? parseInt(
                                  orderDetails?.payment?.discount_applied,
                                ).toLocaleString()
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-2 border-t">
                          <span className="text-gray-600 font-medium text-lg">
                            Order Total:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xl text-green-600">
                              ₦{parseInt(totalAmount || 0).toLocaleString()}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails?.status)}`}
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
              <div className="flex flex-col gap-6">
                {/* Enhanced Customer Details Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h5 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-green-600" />
                      Customer Information
                    </h5>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Customer ID
                            </p>
                            <p className="text-gray-900 font-semibold">
                              #
                              {orderDetails?.user?.id
                                ? orderDetails.user.id
                                    .replace(/-/g, "")
                                    .substring(0, 12)
                                    .toUpperCase()
                                : "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Email Address
                            </p>
                            <p className="text-gray-900 font-semibold">
                              {orderDetails?.user?.email || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Phone Number
                            </p>
                            <p className="text-gray-900 font-semibold">
                              {orderDetails?.user?.phone || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Order Date
                            </p>
                            <p className="text-gray-900 font-semibold">
                              {orderDetails?.created_at
                                ? new Date(
                                    orderDetails.created_at,
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address Section */}
                    {orderDetails?.user?.profile && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h6 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-red-600" />
                          Delivery Information
                        </h6>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">
                                Address
                              </p>
                              <p className="text-gray-900">
                                {orderDetails?.user?.profile?.address || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">
                                City
                              </p>
                              <p className="text-gray-900">
                                {orderDetails?.user?.profile?.city || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">
                                State
                              </p>
                              <p className="text-gray-900">
                                {orderDetails?.user?.profile?.state || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">
                                Country
                              </p>
                              <p className="text-gray-900">
                                {orderDetails?.user?.profile?.country || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h5 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      Payment Details
                    </h5>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Payment Method
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {orderDetails?.payment?.payment_method || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Payment Status
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {orderDetails?.payment?.status || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Customer & Payment Info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Update Status
                    </button>
                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Print Order
                    </button>
                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Send Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="bg-white p-4 rounded-md">
            <h5 className="text-lg font-medium leading-loose border-b border-[#D9D9D9] pb-3 mb-3">
              Order Support
            </h5>
            <p className="font-medium mb-4">Need help?</p>
            <div className="flex space-x-6 mt-2">
              <Phone className="text-purple-500" size={24} />
              <MessageSquare className="text-purple-500" size={24} />
              <Mail className="text-purple-500" size={24} />
            </div>
          </div>*/}
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
                          src={
                            styleItem?.metadata?.image ||
                            styleItem?.metadata?.img ||
                            styleItem?.metadata?.photo ||
                            "https://via.placeholder.com/80x80?text=No+Image"
                          }
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
                          {!styleItem?.metadata && (
                            <p className="text-xs text-gray-400 mt-1">
                              No image metadata available for this item.
                            </p>
                          )}
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
                          src={
                            fabricItem?.metadata?.image ||
                            fabricItem?.metadata?.img ||
                            fabricItem?.metadata?.photo ||
                            "https://via.placeholder.com/80x80?text=No+Image"
                          }
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
                          {!fabricItem?.metadata && (
                            <p className="text-xs text-gray-400 mt-1">
                              No image metadata available for this item.
                            </p>
                          )}
                        </div>
                        {/* <button
                          onClick={() =>
                            setActiveReviewProduct(
                              fabricItem.product_id || fabricItem.id,
                            )
                          }
                          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
                        >
                          Write Review
                        </button>*/}
                      </div>
                    </div>
                  ))}
              </>
            ) : (
              /* Fallback for orders without detailed item data */
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={
                      orderDetails?.payment?.metadata?.image ||
                      orderDetails?.payment?.metadata?.img ||
                      orderDetails?.payment?.metadata?.photo ||
                      "https://via.placeholder.com/80x80?text=No+Image"
                    }
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
                    {!orderDetails?.payment?.metadata && (
                      <p className="text-xs text-gray-400 mt-1">
                        No image metadata available for this item.
                      </p>
                    )}
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
