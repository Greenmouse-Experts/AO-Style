import { Phone, MessageSquare, Mail, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import useGetSingleOrder from "../../../hooks/order/useGetSingleOrder";
import Loader from "../../../components/ui/Loader";

const OrderDetails = () => {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [markReceivedChecked, setMarkReceivedChecked] = useState(false);
  const [markSentChecked, setMarkSentChecked] = useState(false);

  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");

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
          Order Details : <span className="text-gray-600">{orderInfo?.id}</span>
        </h1>
        <p className="text-gray-500 text-sm">
          <Link to="/admin" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Orders &gt; Order Details
        </p>
      </div>

      <div className="space-y-6">
        {/* Order Details and Status */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Order Details */}
          <div className="bg-white p-6 rounded-lg md:col-span-2">
            <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">
              Order Details
            </h5>
            <div className="flex justify-between w-full items-center mb-5">
              {[
                { key: "product", label: "Product" },
                { key: "measurement", label: "Measurement" },
              ].map((tab) => (
                <div
                  key={tab.key}
                  className={`text-base w-full font-normal text-gray-500`}
                  onClick={() => {}}
                >
                  {tab.label}
                </div>
              ))}
            </div>

            <div className="w-full flex flex-col gap-6">
              {orderPurchase?.map((order, id) => {
                return (
                  <div key={id} className="flex w-full justify-between">
                    <div className="flex items-center gap-4  w-full">
                      <div className="w-full">
                        <div className="text-xs text-gray-400 italic px-3 py-2 rounded">
                          {order?.purchase_type}
                        </div>
                        <div className="flex items-center space-x-3">
                          <img
                            src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170600/AoStyle/image_bwjfib.jpg"
                            alt="Ankara Gown"
                            className="w-24 h-24 rounded-md"
                          />
                          <div>
                            <p className="font-semibold">{order?.name}</p>
                            {order?.purchase_type == "FABRIC" ? (
                              <p className="text-gray-500">
                                x {order?.quantity} Yards
                              </p>
                            ) : (
                              <p className="text-gray-500">
                                x {order?.quantity} Piece
                              </p>
                            )}
                            <p className="text-blue-600">N {order?.price}</p>
                          </div>
                        </div>
                      </div>

                      {/* <div className="flex w-full gap-4">
                        <a href="#" className="text-blue-700 underline text-sm">
                          See measurement
                        </a>
                      </div> */}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-5">
              <span className="text-gray-700 mb-4 font-medium">
                Order Total:{" "}
                <span className="font-medium">
                  N {orderInfo?.total_amount?.toLocaleString()}
                </span>
                <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  Pending
                </span>
              </span>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white p-6 rounded-lg">
            <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">
              Order Status
            </h5>
            <div className="space-y-4">
              <div>
                <p className="text-gray-700 mb-3">FABRIC</p>
                <label className="flex items-center gap-2 mb-4">
                  <span className="text-sm w-full">Mark as Delivered</span>
                  <input
                    type="checkbox"
                    className="accent-purple-500 w-5 h-5"
                    checked={markReceivedChecked}
                    onChange={() => handleCheckboxChange("received")}
                  />
                </label>
              </div>

              {/* <div>
                                <p className="text-gray-700 mb-3">TAILORING</p>
                                <label className="flex items-center gap-2 mb-4">
                                    <span className="text-sm w-full">Mark as Completed</span>
                                    <input
                                        type="checkbox"
                                        className="accent-purple-500 w-5 h-5"
                                        disabled
                                    />
                                </label>
                            </div>
                            <div>
                                <p className="text-gray-700 mb-3">OUT FOR DELIVERY</p>
                                <label className="flex items-center gap-2 mb-4">
                                    <span className="text-sm w-full">Mark as Sent</span>
                                    <input
                                        type="checkbox"
                                        className="accent-purple-500 w-5 h-5"
                                        checked={markSentChecked}
                                        onChange={() => handleCheckboxChange("sent")}
                                    />
                                </label>
                            </div> */}
            </div>
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
              <span className="font-semibold">Delivery Method:</span> Logistics
            </p>
          </div>

          {/* Order Support */}
          {/* <div className="bg-white p-6 rounded-lg">
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
          </div>*/}
        </div>

        {/* Customer & Vendor */}
        {/* <div className="bg-white p-6 rounded-lg">
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
        {/* </div>
        </div>*/}
      </div>
    </div>
  );
};

export default OrderDetails;
