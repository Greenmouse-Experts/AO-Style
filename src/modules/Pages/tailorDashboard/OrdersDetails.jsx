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

const OrderDetails = () => {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [markReceivedChecked, setMarkReceivedChecked] = useState(false);
  const [markSentChecked, setMarkSentChecked] = useState(false);

  // Mock data - replace with your actual hook
  const orderInfo = {
    id: "order_1234567890abcdef",
    status: "PROCESSING",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T12:45:00Z",
    total_amount: "19950",
    user: {
      email: "greenmousedev+pmcus@gmail.com",
      phone: "+234 901 234 5678",
    },
    payment: {
      payment_status: "SUCCESS",
      payment_method: "Card Payment",
      transaction_id: "txn_abc123def456",
      amount: "19950",
      currency: "NGN",
    },
  };

  const orderMetadata = [
    {
      fabric_product_id: "fabric_001",
      fabric_product_name: "Lace Beautiful Flocky Fabric",
      style_product_id: "style_001",
      style_product_name:
        "Men's Senator Native Wear (Black With Brown Design Long Sleeve)",
      customer_name: "Daniel",
      customer_email: "greenmousedev+pmcus@gmail.com",
      color: "#b33737",
      quantity: 6,
      measurement: [
        { name: "Chest", value: "42", unit: "inches" },
        { name: "Length", value: "28", unit: "inches" },
        { name: "Shoulder", value: "18", unit: "inches" },
        { name: "Sleeve", value: "24", unit: "inches" },
      ],
    },
  ];

  const orderPurchase = [
    {
      id: "item_001",
      name: "Lace Beautiful Flocky Fabric",
      price: "19950",
      quantity: 6,
      purchase_type: "FABRIC",
      product_id: "fabric_001",
    },
  ];

  const formatNumberWithCommas = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatDateStr = (dateStr, format) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-50 text-green-700 border-green-200";
      case "SHIPPED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PROCESSING":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
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
              {orderMetadata.map((metaItem, id) => {
                const purchaseItem = orderPurchase.find(
                  (item) => item?.product_id === metaItem?.fabric_product_id,
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
                                    style={{ backgroundColor: metaItem?.color }}
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
                              {/* <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                <Ruler size={16} />
                                View Measurements
                              </button>*/}
                            </div>
                          </div>

                          {/* Style Information */}
                          {metaItem?.style_product_name && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-6">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Scissors className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wide block mb-1">
                                    STYLE TO TAILOR
                                  </span>
                                  <span className="text-lg font-bold text-purple-800">
                                    {metaItem?.style_product_name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Measurements */}
                          {/* {metaItem?.measurement &&
                            metaItem.measurement.length > 0 && (
                              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Ruler className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-semibold text-blue-800">
                                    Customer Measurements
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {metaItem.measurement.map(
                                    (measure, index) => (
                                      <div
                                        key={index}
                                        className="bg-white rounded-lg p-3 border border-blue-100"
                                      >
                                        <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                                          {measure.name}
                                        </div>
                                        <div className="text-lg font-bold text-blue-800">
                                          {measure.value} {measure.unit}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}*/}

                          {/* Customer Information */}
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
          <div className="bg-white rounded-xl shadow-sm p-6">
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
          </div>

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
