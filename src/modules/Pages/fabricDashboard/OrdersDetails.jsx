import { Phone, MessageSquare, Mail, X, Star } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import useGetSingleOrder from "../../../hooks/order/useGetSingleOrder";
import Loader from "../../../components/ui/Loader";
import ReviewList from "../../../components/reviews/ReviewList";
import { formatDateStr, formatNumberWithCommas } from "../../../lib/helper";

const OrderDetails = () => {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [markReceivedChecked, setMarkReceivedChecked] = useState(false);
  const [markSentChecked, setMarkSentChecked] = useState(false);
  const [activeReviewModal, setActiveReviewModal] = useState(null);

  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");

  // Using the same getSingleOrder hook since the data structure is similar
  const { isPending: getOrderIsPending, data } = useGetSingleOrder(orderId);

  if (getOrderIsPending) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  const orderInfo = data?.data;
  const orderPurchase = data?.data?.payment?.purchase?.items;

  console.log("Vendor Order Details:", orderInfo);
  console.log("Order Purchase Items:", orderPurchase);

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
    // Placeholder for upload logic
    alert("Fabric image uploaded successfully!");
    setShowUploadPopup(false);
  };

  return (
    <div className="">
      <div className="bg-white rounded-lg px-6 py-4 mb-6">
        <h1 className="text-xl font-semibold mb-4">
          Vendor Order Details :{" "}
          <span className="text-gray-600">
            #{orderInfo?.id?.slice(-8)?.toUpperCase()}
          </span>
        </h1>
        <p className="text-gray-500 text-sm">
          <Link to="/fabric" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Orders &gt; Order Details
        </p>
      </div>

      <div className="space-y-6">
        {/* Order Details and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="bg-white p-6 rounded-lg md:col-span-2">
            <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">
              Vendor Order Details
            </h5>

            {/* Order Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h6 className="font-semibold text-gray-800">
                  Order Information
                </h6>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">
                      #{orderInfo?.id?.slice(-8)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Email:</span>
                    <span className="font-medium">
                      {orderInfo?.user?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium">
                      {orderInfo?.payment?.transaction_id
                        ?.slice(-8)
                        ?.toUpperCase() || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">
                      {orderInfo?.created_at
                        ? formatDateStr(
                            orderInfo.created_at.split(".").shift(),
                            "D MMM YYYY",
                          )
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h6 className="font-semibold text-gray-800">
                  Payment & Status
                </h6>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Status:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        orderInfo?.status === "DELIVERED"
                          ? "bg-green-100 text-green-600"
                          : orderInfo?.status === "CANCELLED"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {orderInfo?.status || "PENDING"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        orderInfo?.payment?.payment_status === "SUCCESS"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {orderInfo?.payment?.payment_status || "PENDING"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">
                      ₦
                      {formatNumberWithCommas(
                        orderInfo?.total_amount ||
                          orderInfo?.payment?.amount ||
                          0,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Items */}
            <div className="space-y-4">
              <h6 className="font-semibold text-gray-800">Ordered Products</h6>
              {orderPurchase?.map((order, id) => (
                <div key={id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        order?.purchase_type === "FABRIC"
                          ? "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170603/AoStyle/image1_s3s2sd.jpg"
                          : "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170600/AoStyle/image_bwjfib.jpg"
                      }
                      alt={order?.name || "Product"}
                      className="w-20 h-20 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">
                            {order?.name || "Product Item"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order?.purchase_type}
                          </p>
                          <p className="text-gray-600">
                            Quantity: {order?.quantity || 1}{" "}
                            {order?.purchase_type === "FABRIC"
                              ? "Yards"
                              : "Piece(s)"}
                          </p>
                          <p className="text-blue-600 font-medium">
                            ₦{formatNumberWithCommas(order?.price || 0)}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setActiveReviewModal(order?.product_id || order?.id)
                          }
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                        >
                          <Star size={14} />
                          View Reviews
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Actions */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg">
              <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">
                Vendor Actions
              </h5>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 mb-3 font-medium">
                    Order Status Updates
                  </p>
                  <label className="flex items-center gap-2 mb-4">
                    <span className="text-sm w-full">
                      Mark Order as Delivered
                    </span>
                    <input
                      type="checkbox"
                      className="accent-purple-500 w-5 h-5"
                      checked={markReceivedChecked}
                      onChange={() => handleCheckboxChange("received")}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* <div className="bg-white p-6 rounded-lg">
              <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">
                Customer Information
              </h5>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Customer Email:</span>
                  <p className="font-medium">
                    {orderInfo?.user?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Customer Phone:</span>
                  <p className="font-medium">
                    {orderInfo?.user?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Order Date:</span>
                  <p className="font-medium">
                    {orderInfo?.created_at
                      ? formatDateStr(
                          orderInfo.created_at.split(".").shift(),
                          "D MMM YYYY h:mm A",
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Payment Method:</span>
                  <p className="font-medium">
                    {orderInfo?.payment?.payment_method || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">
                Support
              </h5>
              <p className="font-medium mb-4">Need help with this order?</p>
              <div className="flex space-x-6 mt-2">
                <Phone className="text-purple-500 cursor-pointer" size={24} />
                <MessageSquare
                  className="text-purple-500 cursor-pointer"
                  size={24}
                />
                <Mail className="text-purple-500 cursor-pointer" size={24} />
              </div>
            </div>*/}
          </div>
        </div>

        {/* Upload Popup */}
        {showUploadPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <button
                onClick={() => setShowUploadPopup(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              <h2 className="text-lg font-semibold mb-4">
                Upload Received Material
              </h2>
              <p className="text-black mb-6 leading-loose">
                Upload a clear picture of the fabric you received from the
                fabric vendor to mark fabric as “Delivered”
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
                <div className="flex justify-center mb-2">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-500">Click to upload photo</p>
                <p className="text-gray-400 text-sm">
                  (Each photo less than 5mb)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="fabric-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      if (file.size <= 5 * 1024 * 1024) {
                        // 5MB limit
                        handleUpload();
                      } else {
                        alert("File size exceeds 5MB limit.");
                      }
                    }
                  }}
                />
                <label htmlFor="fabric-upload" className="cursor-pointer">
                  <span className="block mt-2 text-blue-600 underline">
                    Browse files
                  </span>
                </label>
              </div>
              <button
                onClick={handleUpload}
                className="w-full py-3 bg-gradient text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
              >
                Upload Fabric Image
              </button>
            </div>
          </div>
        )}

        {/* Delivery & Support */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Delivery Details */}
          <div className="bg-white p-6 rounded-lg">
            <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">
              Delivery Details
            </h5>
            <p className="text-gray-700 mb-3">
              <span className="font-semibold">Shipping Address:</span>
              {/* No 7,
              Street name, Estate name, Lagos, Nigeria */}
            </p>
            <p className="text-gray-700 mb-3">
              <span className="font-semibold">Delivery Date:</span>
              {/* 12-03-2025
              (10 days left) */}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Delivery Method:</span>
            </p>
          </div>

          {/* Order Support */}
          <div className="bg-white p-6 rounded-lg">
            <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">
              Order Support
            </h5>
            <p className="text-gray-700 mb-6">Need help?</p>
            <div className="flex space-x-4">
              <Phone
                className="text-purple-500 bg-purple-100 p-2 rounded-full"
                size={32}
              />
              <MessageSquare
                className="text-purple-500 bg-purple-100 p-2 rounded-full"
                size={32}
              />
              <Mail
                className="text-purple-500 bg-purple-100 p-2 rounded-full"
                size={32}
              />
            </div>
          </div>
        </div>

        {/* Customer & Vendor */}
        <div className="bg-white p-6 rounded-lg">
          <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">
            Customer & Vendor
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-500 text-sm mb-2">Customer Email</p>
              <p className="font-semibold">{orderInfo?.user?.email}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-2">
                Customer Phone Number
              </p>
              <p className="font-semibold">{orderInfo?.user?.phone}</p>
            </div>
            {/* <div>
              <p className="text-gray-500 text-sm mb-2">Delivery Method</p>
              <p className="font-semibold"></p>
            </div> */}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {activeReviewModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-lg backdrop-brightness-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Product Reviews</h3>
                <button
                  onClick={() => setActiveReviewModal(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              <ReviewList
                productId={activeReviewModal}
                className="max-h-96 overflow-y-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
