import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  CheckCircle,
  Circle,
  X,
  Eye,
  Image,
  Truck,
  Star,
  ArrowLeft,
  Clock,
  Download,
  MessageSquare,
} from "lucide-react";
import useGetSingleOrder from "../../../../hooks/order/useGetSingleOrder";
import Loader from "../../../../components/ui/Loader";
import { formatOrderId } from "../../../../lib/orderUtils";

const getOrderSteps = (hasStyleItems) => {
  if (hasStyleItems) {
    return [
      "Order Placed",
      "Processing",
      "Shipped to Tailor",
      "Tailor Processing",
      "Out for Delivery",
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
  "Order Placed": "Your order has been received and is being prepared",
  Processing: "Your order is being processed by our team",
  "Shipped to Tailor": "Fabric has been shipped to the tailor",
  "Tailor Processing": "Tailor is working on your custom design",
  Shipped: "Your order has been shipped and is on the way",
  "Out for Delivery": "Your order is out for delivery",
  Delivered: "Your order has been successfully delivered",
};

const OrderDetails = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState(null);

  const { id: orderId } = useParams();
  const { isPending: getUserIsPending, data } = useGetSingleOrder(orderId);

  const orderDetails = data?.data;

  // Check if order has style items
  const hasStyleItems =
    orderDetails?.order_items?.some((item) => item.purchase_type === "STYLE") ||
    false;
  const orderSteps = getOrderSteps(hasStyleItems);

  // Update currentStep based on order status
  const getStepFromStatus = React.useCallback(
    (status) => {
      if (hasStyleItems) {
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
    },
    [hasStyleItems],
  );

  React.useEffect(() => {
    if (orderDetails?.status) {
      const step = getStepFromStatus(orderDetails.status);
      setCurrentStep(step);
    }
  }, [orderDetails?.status, getStepFromStatus]);

  if (getUserIsPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      PAID: "bg-purple-100 text-purple-800",
      PROCESSING: "bg-yellow-100 text-yellow-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      IN_TRANSIT: "bg-purple-100 text-purple-800",
      OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

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
  const totalAmount =
    orderDetails?.total_amount || orderDetails?.payment?.amount || 0;
  const deliveryFee = parseInt(
    orderDetails?.payment?.purchase?.delivery_fee || 0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Image className="w-5 h-5 text-purple-600" />
                Order Image
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
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Image className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-1">
                        Reference Image
                      </h4>
                      <p className="text-sm text-purple-700">
                        This image was provided reference for their order
                        requirements. Use this to understand the expectations
                        and ensure accurate order fulfillment.
                      </p>
                      <div className="mt-2 text-xs text-purple-600">
                        <span className="font-medium">Order ID:</span>
                        {formatOrderId(orderDetails?.payment?.id)}
                      </div>
                    </div>
                  </div>
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

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/orders"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Package className="w-7 h-7 text-purple-600" />
                  Order Details
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(orderDetails?.status)}`}
              >
                {orderDetails?.status || "Unknown"}
              </span>
              {orderDetails?.metadata?.image && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <Image className="w-3 h-3 mr-1" />
                  Has Reference Image
                </span>
              )}
              <div className="text-right">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(orderDetails?.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Reference Image Section */}
          {orderDetails?.metadata?.image && (
            <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Image className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Reference Image
                    </h3>
                    <p className="text-sm text-gray-600">
                      Provided reference image for this order
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setModalImageUrl(orderDetails?.metadata?.image);
                    setShowImageModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Image
                </button>
              </div>
            </div>
          )}

          {/* Order Progress */}
          {/* Order Progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h5 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              Order Progress
            </h5>
            <div className="relative px-8">
              {/* Background line */}
              <div
                className="absolute top-5 h-1 bg-gray-200"
                style={{
                  left: `calc(${100 / (orderSteps.length - 1) / 2}%)`,
                  right: `calc(${100 / (orderSteps.length - 1) / 2}%)`,
                }}
              />
              {/* Progress line */}
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
                      ? `calc(${(currentStep / (orderSteps.length - 1)) * 100}% - ${100 / (orderSteps.length - 1)}%)`
                      : "0%",
                }}
              />

              {/* Steps */}
              <div className="relative flex items-start justify-between">
                {orderSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1"
                  >
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
                {statusMessages[orderSteps[currentStep]] ||
                  "Order status unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Details */}
                  <div className="space-y-4">
                    <h6 className="font-semibold text-gray-800 mb-3">
                      Order Details
                    </h6>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">
                          {formatOrderId(orderDetails?.payment?.id)}
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
                          {orderDetails?.payment?.purchase_type || "PRODUCT"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-4">
                    <h6 className="font-semibold text-gray-800 mb-3">
                      Payment Information
                    </h6>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status:</span>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            orderDetails?.payment?.payment_status === "SUCCESS"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {orderDetails?.payment?.payment_status || "SUCCESS"}
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
              </div>
            </div>

            {/* Reference Image */}
            {/* {orderDetails?.metadata?.image && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Image className="w-5 h-5 text-purple-600" />
                    Reference Image
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={orderDetails?.metadata?.image}
                        alt="Customer Reference"
                        className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                      />
                      <div
                        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer"
                        onClick={() => {
                          setModalImageUrl(orderDetails?.metadata?.image);
                          setShowImageModal(true);
                        }}
                      >
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Customer Reference Photo
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        The customer has provided this reference image to help
                        with their order requirements.
                      </p>
                      <button
                        onClick={() => {
                          setModalImageUrl(orderDetails?.metadata?.image);
                          setShowImageModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}*/}

            {/* Order Items */}
            {orderDetails?.order_items &&
              orderDetails.order_items.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      Order Items ({orderDetails.order_items.length})
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {orderDetails.order_items.map((item, index) => {
                        const imgUrl =
                          item?.product?.fabric?.photos?.[0] ||
                          item?.product?.style?.photos?.[0];
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
                                alt={item?.product?.name || "Product"}
                                className="w-20 h-20 rounded-lg object-cover border-2 border-gray-100"
                              />
                              {imgUrl && (
                                <button
                                  type="button"
                                  className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full p-2 shadow-lg hover:bg-purple-700 transition-colors"
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
                                {item?.product?.name || "Product Item"}
                              </h4>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Type:</span>{" "}
                                  {item?.product?.type || "N/A"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Quantity:</span>{" "}
                                  {item.quantity || 1}
                                </p>
                                <p className="text-lg font-bold text-purple-600">
                                  ₦
                                  {item?.product?.price
                                    ? parseInt(
                                        item?.product?.price,
                                      ).toLocaleString()
                                    : "0"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Summary
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">
                      ₦{subtotalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="font-semibold">
                      ₦{deliveryFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-xl font-bold text-purple-600">
                        ₦{parseInt(totalAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Customer & Delivery Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Customer Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">
                      Customer ID
                    </p>
                    <p className="text-gray-900 font-semibold">
                      #{formatOrderId(orderDetails?.user?.id)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">
                      Phone Number
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {orderDetails?.user?.phone || "+2348061235550"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">
                      Email Address
                    </p>
                    <p className="text-gray-900 font-semibold break-all">
                      {orderDetails?.user?.email || "kaceytester2@gmail.com"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">
                      Order Date
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {formatDate(orderDetails?.created_at) ||
                        "September 11, 2025 at 12:12 PM"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Delivery Information
                </h3>
              </div>
              <div className="p-6">
                {/* Delivery Flow Information */}
                <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Truck className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-1">
                        Delivery Flow
                      </h4>
                      <p className="text-sm text-purple-700">
                        {hasStyleItems
                          ? "Two-step delivery: First to tailor for processing, then to customer after completion."
                          : "Direct delivery: Fabric will be delivered directly to customer address."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Check for metadata delivery addresses */}
                {orderDetails?.payment?.metadata?.length > 0 ? (
                  <div className="space-y-6">
                    {orderDetails.payment.metadata.map((metaItem, index) => (
                      <div key={index} className="space-y-4">
                        {metaItem?.delivery_address && (
                          <>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-purple-600">
                                  {index + 1}
                                </span>
                              </div>
                              <h4 className="font-semibold text-gray-800">
                                {hasStyleItems && index === 0
                                  ? "Tailor Address"
                                  : hasStyleItems && index === 1
                                    ? "Customer Address"
                                    : "Delivery Address"}
                              </h4>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-500 mb-1">
                                    Full Address
                                  </p>
                                  <p className="text-gray-900">
                                    {metaItem.delivery_address}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">
                                      City
                                    </p>
                                    <p className="text-gray-900">
                                      {metaItem.delivery_city || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">
                                      State
                                    </p>
                                    <p className="text-gray-900">
                                      {metaItem.delivery_state || "N/A"}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500 mb-1">
                                    Country
                                  </p>
                                  <p className="text-gray-900">
                                    {metaItem.delivery_country || "Nigeria"}
                                  </p>
                                </div>
                                {metaItem.postal_code && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">
                                      Postal Code
                                    </p>
                                    <p className="text-gray-900">
                                      {metaItem.postal_code}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            {index <
                              orderDetails.payment.metadata.length - 1 && (
                              <div className="border-t border-gray-200 my-4"></div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Fallback to user profile address if no metadata */
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Address
                      </p>
                      <p className="text-gray-900">
                        {orderDetails?.user?.profile?.address ||
                          "No address provided"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Country
                      </p>
                      <p className="text-gray-900">
                        {orderDetails?.user?.profile?.country || "Nigeria"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  Quick Actions
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                  <Truck className="w-4 h-4" />
                  Update Status
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Print Order
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Contact Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
