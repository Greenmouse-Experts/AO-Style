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
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import useGetSingleOrder from "../../../hooks/order/useGetSingleOrder";
import Loader from "../../../components/ui/Loader";

const OrderDetails = () => {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [markReceivedChecked, setMarkReceivedChecked] = useState(false);
  const [activeReviewModal, setActiveReviewModal] = useState(null);

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
  const orderPurchase = data?.data?.payment?.purchase?.items || [];
  const orderMetadata = data?.data?.payment?.metadata || [];

  // Filter to show only fabric items for fabric vendors
  const fabricOnlyPurchase = orderInfo?.order_items?.filter(
    (item) => item?.product?.type === "FABRIC",
  );
  const fabricOnlyMetadata = orderMetadata.filter(
    (meta) => meta?.fabric_product_id,
  );

  // Calculate fabric-only total amount
  const fabricOnlyTotal = fabricOnlyPurchase.reduce((total, item) => {
    return total + (item?.product?.price * item?.quantity || 0);
  }, 0);

  // Fabric vendors only deal with fabric orders
  const hasTailoringComponents = false;
  const isFabricOnlyOrder = true;

  console.log("📋 Order Details - API Data:", data);
  console.log("📋 Order Info:", orderInfo);
  console.log("📋 Order Purchase Items:", orderPurchase);
  console.log("📋 Order Metadata:", orderMetadata);
  console.log("📋 Fabric Only Purchase Items:", fabricOnlyPurchase);
  console.log("📋 Fabric Only Metadata:", fabricOnlyMetadata);
  console.log("📋 Fabric Only Total:", fabricOnlyTotal);
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
    }
  };

  const handleUpload = () => {
    alert("Fabric image uploaded successfully!");
    setShowUploadPopup(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "SHIPPED":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "PROCESSING":
        return <Package className="w-5 h-5 text-orange-600" />;
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
              Order #{orderInfo?.id?.slice(-8)?.toUpperCase() || "N/A"}
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
                    Fabric Total:
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    ₦{formatNumberWithCommas(parseInt(fabricOnlyTotal))}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-sm text-gray-500">
                  <span>Full Order Total:</span>
                  <span>
                    ₦{formatNumberWithCommas(parseInt(orderInfo?.total_amount))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Products */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Ordered Product(s)
            </h2>
            <div className="space-y-6">
              {fabricOnlyMetadata.length === 0
                ? // Render fabric-only orders directly from purchase items
                  fabricOnlyPurchase.map((purchaseItem, index) => (
                    <div
                      key={purchaseItem?.id || index}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Package className="w-5 h-5 text-purple-600" />
                            {purchaseItem?.product?.name || "Fabric Product"}
                          </h3>
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                            {purchaseItem?.product?.type}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6 items-center">
                          <div className="lg:w-32 lg:h-32 w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                            <img
                              src={purchaseItem?.product?.fabric?.photos?.[0]}
                              alt={purchaseItem?.name || "Fabric Product"}
                              className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                            />
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
                                    parseInt(purchaseItem?.product?.price || 0),
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
                                    parseInt(
                                      purchaseItem?.product?.price || 0,
                                    ) * parseInt(purchaseItem?.quantity || 1),
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : // Render orders with metadata (fabric only)
                  fabricOnlyMetadata.map((metaItem, id) => {
                    const purchaseItem = fabricOnlyPurchase.find(
                      (item) =>
                        item?.product_id === metaItem?.fabric_product_id,
                    );

                    return (
                      <div
                        key={id}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <div className="relative">
                                <img
                                  src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170603/AoStyle/image1_s3s2sd.jpg"
                                  alt={metaItem?.fabric_product_name}
                                  className="w-32 h-32 lg:w-20 lg:h-20 rounded-xl object-cover border border-gray-200"
                                />
                                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                  FABRIC
                                </div>
                              </div>
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {metaItem?.fabric_product_name}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-600">
                                        Color:
                                      </span>
                                      <span
                                        className="inline-block w-5 h-5 rounded-full border-2 border-white shadow-md"
                                        style={{
                                          backgroundColor: metaItem?.color,
                                        }}
                                      ></span>
                                      <span className="text-gray-900">
                                        {metaItem?.color}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">
                                        Quantity:
                                      </span>
                                      <span className="font-bold text-purple-600 ml-1">
                                        {metaItem?.quantity} Yards
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right lg:text-left">
                                  <div className="text-2xl font-bold text-purple-600 mb-3">
                                    ₦
                                    {formatNumberWithCommas(
                                      parseInt(purchaseItem?.price || 0),
                                    )}
                                  </div>
                                  <button
                                    onClick={() =>
                                      setActiveReviewModal(
                                        metaItem?.fabric_product_id,
                                      )
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                                  >
                                    <Star size={16} />
                                    View Reviews
                                  </button>
                                </div>
                              </div>

                              {/* Customer Information */}
                              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-sm text-white font-bold">
                                      C
                                    </span>
                                  </div>
                                  <span className="font-semibold text-gray-700">
                                    Customer Information
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 font-medium">
                                      Name:
                                    </span>
                                    <span className="text-gray-900 font-semibold">
                                      {metaItem?.customer_name}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 font-medium">
                                      Email:
                                    </span>
                                    <span className="text-gray-900 font-semibold truncate ml-2">
                                      {metaItem?.customer_email}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>

            {/* Empty state */}
            {fabricOnlyPurchase.length === 0 &&
              fabricOnlyMetadata.length === 0 && (
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
          {/* Vendor Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Order Actions
            </h3>

            <div className="space-y-4">
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

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">
                      Mark as Delivered
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Confirm order completion
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
                  {orderInfo?.user?.phone}
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

      {/* Upload Popup */}
      {showUploadPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Upload Delivery Proof
                </h3>
                <button
                  onClick={() => setShowUploadPopup(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Upload a clear picture of the delivered fabric to mark this
                order as completed.
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6 hover:border-purple-400 transition-colors">
                <div className="flex justify-center mb-4">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  Click to upload photo
                </p>
                <p className="text-gray-400 text-sm mb-4">Max file size: 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="fabric-upload"
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
                  htmlFor="fabric-upload"
                  className="inline-block px-6 py-2 bg-purple-100 text-purple-700 rounded-lg cursor-pointer hover:bg-purple-200 transition-colors font-medium"
                >
                  Browse Files
                </label>
              </div>

              <button
                onClick={handleUpload}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Confirm Upload & Mark Delivered
              </button>
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
