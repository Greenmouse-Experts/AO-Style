import {
  Phone,
  MessageSquare,
  Mail,
  X,
  Scissors,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Ruler,
  User,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import useGetSingleOrder from "../../../hooks/order/useGetSingleOrder";
import Loader from "../../../components/ui/Loader";

const OrderDetails = () => {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [markReceivedChecked, setMarkReceivedChecked] = useState(false);
  const [markSentChecked, setMarkSentChecked] = useState(false);

  // Get order ID from URL params
  const { id } = useParams();

  // Fetch order data from API
  const {
    data,
    isPending: getOrderIsPending,
    isError,
    refetch,
  } = useGetSingleOrder(id);

  // Extract order information from API response
  const orderInfo = data?.data || {};
  const orderPurchase = data?.data?.order_items || [];
  const orderMetadata = data?.data?.payment?.metadata || [];

  // Determine if this is a fabric-only order or has tailoring/style components
  const hasTailoringComponents = orderMetadata && orderMetadata.length > 0;
  const isFabricOnlyOrder = !hasTailoringComponents;

  console.log("📋 Tailor Order Details - API Data:", data);
  console.log("📋 Order Info:", orderInfo);
  console.log("📋 Order Purchase Items:", orderPurchase);
  console.log("📋 Order Metadata:", orderMetadata);
  console.log("📋 Is Fabric Only Order:", isFabricOnlyOrder);
  console.log("📋 Has Tailoring Components:", hasTailoringComponents);
  console.log("📋 Order ID from params:", id);
  console.log("📋 Loading state:", getOrderIsPending);
  console.log("📋 Error state:", isError);

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
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatNumberWithCommas = (num) => {
    return parseInt(num || 0).toLocaleString();
  };

  const formatDateStr = (dateStr, format) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayOrderId = (id) => {
    return `#${id?.slice(-8)?.toUpperCase() || "N/A"}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      DELIVERED: "bg-green-100 text-green-600",
      SHIPPED: "bg-blue-100 text-blue-600",
      CANCELLED: "bg-red-100 text-red-600",
      PENDING: "bg-yellow-100 text-yellow-600",
      PROCESSING: "bg-purple-100 text-purple-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const handleCheckboxChange = (type) => {
    if (type === "received") {
      setMarkReceivedChecked(!markReceivedChecked);
      if (!markReceivedChecked) {
        setShowUploadPopup(true);
      }
    } else if (type === "sent") {
      setMarkSentChecked(!markSentChecked);
      if (!markSentChecked) {
        setShowUploadPopup(true);
      }
    }
  };

  const handleUpload = () => {
    alert("Tailored garment image uploaded successfully!");
    setShowUploadPopup(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "SHIPPED":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "PROCESSING":
        return <Scissors className="w-5 h-5 text-orange-600" />;
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Scissors className="w-6 h-6 text-purple-600" />
              Tailoring Order #
              {orderInfo?.id?.slice(-8)?.toUpperCase() || "N/A"}
            </h1>
            <p className="text-gray-500 text-sm">
              <a
                href="/tailor"
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
              Tailoring Order Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Order ID:</span>
                  <span className="font-semibold text-gray-900">
                    #{orderInfo?.id?.slice(-8)?.toUpperCase()}
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
              </div>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Payment Method:
                  </span>
                  <span className="text-gray-900">
                    {orderInfo?.payment?.payment_method}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Payment Status:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      orderInfo?.payment?.payment_status === "SUCCESS"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {orderInfo?.payment?.payment_status}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Total Amount:
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    ₦{formatNumberWithCommas(parseInt(orderInfo?.total_amount))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tailoring Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-purple-600" />
              Tailoring Orders
            </h2>
            <div className="space-y-6">
              {orderPurchase.map(
                (purchaseItem, index) =>
                  purchaseItem?.product?.type && (
                    <div
                      key={purchaseItem?.id || index}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-4 border-b border-yellow-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            {purchaseItem?.product?.type === "FABRIC" ? (
                              <Package className="w-5 h-5 text-purple-600" />
                            ) : (
                              <Scissors className="w-5 h-5 text-purple-600" />
                            )}
                            {purchaseItem?.product?.name || "Fabric Product"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                              {purchaseItem?.product?.type || "FABRIC"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="lg:w-32 lg:h-32 w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                            <rewrite_this>
                              {purchaseItem?.product?.fabric?.photos?.[0] ? (
                                <img
                                  src={
                                    purchaseItem.product?.fabric?.photos?.[0]
                                  }
                                  alt={
                                    purchaseItem?.product?.name ||
                                    "Fabric Photo"
                                  }
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                <img
                                  src={purchaseItem.product?.style?.photos?.[0]}
                                  alt={
                                    purchaseItem?.product?.name ||
                                    "Fabric Photo"
                                  }
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              )}
                            </rewrite_this>
                          </div>

                          <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <span className="text-sm font-medium text-gray-600">
                                  Quantity:
                                </span>
                                <p className="text-lg font-bold text-gray-900">
                                  {purchaseItem?.quantity || 1}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">
                                  Unit Price:
                                </span>
                                <p className="text-lg font-bold text-purple-600">
                                  ₦
                                  {formatNumberWithCommas(
                                    parseInt(purchaseItem?.price || 0),
                                  )}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">
                                  Total:
                                </span>
                                <p className="text-2xl font-bold text-purple-600">
                                  ₦
                                  {formatNumberWithCommas(
                                    parseInt(purchaseItem?.price || 0) *
                                      parseInt(purchaseItem?.quantity || 1),
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Info message for tailor */}
                            {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm">ℹ️</span>
                                </div>
                                <div>
                                  <p className="text-blue-800 font-medium">
                                    This is a fabric-only order
                                  </p>
                                  <p className="text-blue-600 text-sm">
                                    No tailoring services are required for this
                                    item.
                                  </p>
                                </div>
                              </div>
                            </div>*/}

                            {/* Customer Information for fabric-only orders */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-gray-700">
                                  Customer Information
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 font-medium">
                                    Email:
                                  </span>
                                  <span className="text-gray-900 font-semibold truncate ml-2">
                                    {orderInfo?.user?.email}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 font-medium">
                                    Phone:
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {orderInfo?.user?.phone || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
              )}
            </div>
            {/* Empty state */}
            {orderPurchase.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">
                  No products found
                </p>
                <p className="text-gray-400">
                  This order doesn't contain any products.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tailor Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-purple-600" />
              Tailoring Actions
            </h3>

            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(orderInfo?.status)}
                  <span className="font-semibold text-gray-700">
                    Current Status
                  </span>
                </div>
                <p className="text-sm text-orange-800 font-medium mb-1">
                  {orderInfo?.status || "PENDING"}
                </p>
                <p className="text-xs text-orange-600">
                  Last Updated:{" "}
                  {formatDateStr(orderInfo?.updated_at, "D MMM YYYY h:mm A")}
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">
                      Mark Tailoring Complete
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload finished garment photo
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    checked={markReceivedChecked}
                    onChange={() => handleCheckboxChange("received")}
                    disabled={orderInfo?.status === "DELIVERED"}
                  />
                </label>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">
                      Mark as Shipped
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Send to customer
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    checked={markSentChecked}
                    onChange={() => handleCheckboxChange("sent")}
                    disabled={orderInfo?.status === "DELIVERED"}
                  />
                </label>
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
                  <a
                    href={`mailto:${orderInfo?.user?.email}`}
                    className="hover:underline"
                  >
                    {orderInfo?.user?.email}
                  </a>
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 font-medium">
                  Phone Number
                </span>
                <p className="text-gray-900 font-semibold">
                  <a
                    href={`tel:${orderInfo?.user?.phone.replace(/\s+/g, "")}`}
                    className="hover:underline"
                  >
                    {orderInfo?.user?.phone}
                  </a>
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Contact Customer
                </p>
                <div className="flex gap-3">
                  <a
                    href={`tel:${orderInfo?.user?.phone.replace(/\s+/g, "")}`}
                    className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                    title="Call"
                  >
                    <Phone size={18} />
                  </a>
                  <a
                    href={`sms:${orderInfo?.user?.phone.replace(/\s+/g, "")}`}
                    className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Send SMS"
                  >
                    <MessageSquare size={18} />
                  </a>
                  <a
                    href={`mailto:${orderInfo?.user?.email}`}
                    className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                    title="Send Email"
                  >
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>*/}

          {/* Order Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Order Timeline
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Order Placed
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateStr(orderInfo?.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    In Progress
                  </p>
                  <p className="text-xs text-gray-500">Currently tailoring</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Ready for Delivery</p>
                  <p className="text-xs text-gray-400">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Popup */}
      {showUploadPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Upload Finished Garment
                </h3>
                <button
                  onClick={() => setShowUploadPopup(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Upload a clear picture of the finished tailored garment to mark
                this order as completed.
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6 hover:border-purple-400 transition-colors">
                <div className="flex justify-center mb-4">
                  <Scissors className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  Click to upload photo
                </p>
                <p className="text-gray-400 text-sm mb-4">Max file size: 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="garment-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      if (file.size <= 5 * 1024 * 1024) {
                        handleUpload();
                      } else {
                        alert("File size exceeds 5MB limit.");
                      }
                    }
                  }}
                />
                <label
                  htmlFor="garment-upload"
                  className="inline-block px-6 py-2 bg-purple-100 text-purple-700 rounded-lg cursor-pointer hover:bg-purple-200 transition-colors font-medium"
                >
                  Browse Files
                </label>
              </div>

              <button
                onClick={handleUpload}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Confirm Upload & Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
