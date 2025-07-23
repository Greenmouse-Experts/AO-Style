import { useState } from "react";
import {
  CheckCircle,
  Circle,
  Phone,
  MessageSquare,
  Mail,
  FileText,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import useGetSingleOrder from "../../../hooks/order/useGetSingleOrder";
import Loader from "../../../components/ui/Loader";

const orderSteps = [
  "Order Placed",
  "Fabric Delivery",
  "Tailoring",
  "Out for Delivery",
  "Delivered",
];

const statusMessages = {
  "Order Placed": "Your order has been placed, awaiting fabric from vendor.",
  "Fabric Delivery": "Fabric has been delivered, preparing for tailoring.",
  Tailoring: "Your order is being tailored.",
  "Out for Delivery": "Your order is out for delivery.",
  Delivered: "Your order has been delivered successfully!",
};

const OrderDetails = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState("style");
  const [showReviewSection, setShowReviewSection] = useState(false);
  const [styleRating, setStyleRating] = useState(0);
  const [fabricRating, setFabricRating] = useState(0);

  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");

  const { isPending: getUserIsPending, data } = useGetSingleOrder(orderId);

  if (getUserIsPending) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  const orderDetails = data?.data;

  const orderPurchase = data?.data?.payment?.purchase?.items;

  const totalAmount =
    orderPurchase?.reduce((total, item) => {
      return total + item?.quantity * item?.price;
    }, 0) ?? 0;

  const handleStepClick = (index) => {
    setCurrentStep(index);
    if (orderSteps[index] === "Delivered") {
      setShowReviewSection(true);
    }
  };

  const handleStarClick = (type, rating) => {
    if (type === "style") {
      setStyleRating(rating);
    } else {
      setFabricRating(rating);
    }
  };

  const handleSubmitReview = () => {
    alert("Review submitted successfully!");
    setShowReviewSection(false);
  };

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
                  index <= currentStep ? "bg-[#EC8B20]" : "bg-gray-300"
                }`}
              ></div>
            )}
            <button
              className={`z-10 w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all ${
                index <= currentStep
                  ? "bg-[#EC8B20] border-[#EC8B20] text-white"
                  : "bg-gray-200 border-gray-400 text-gray-600"
              }`}
              onClick={() => handleStepClick(index)}
            >
              {index <= currentStep ? (
                <CheckCircle size={20} />
              ) : (
                <Circle size={20} />
              )}
            </button>
            <span
              className={`mt-2 text-sm font-medium ${
                index <= currentStep ? "text-black" : "text-gray-400"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white leading-loose rounded-md mt-2 flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
        <span>
          Order Status: {statusMessages[orderSteps[currentStep]]}
          <span
            className={`ml-2 px-2 py-1 rounded ${
              orderSteps[currentStep] === "Delivered"
                ? "text-green-700 bg-green-100"
                : "text-yellow-700 bg-yellow-100"
            }`}
          >
            {orderSteps[currentStep] === "Delivered" ? "Completed" : "Ongoing"}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-6 rounded-md md:col-span-2">
          <h5 className="text-lg font-meduim text-dark border-b border-[#D9D9D9] pb-3 mb-3">
            Order Details
          </h5>
          <div className="flex justify-between items-center">
            {[
              { key: "style", label: "Style" },
              { key: "fabric", label: "Fabric" },
              { key: "measurement", label: "Measurement" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`text-base font-normal ${
                  activeTab === tab.key ? "text-black" : "text-gray-500"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-md">
            <div>
              <div className="bg-white grid grid-cols-3 gap-4 mt-5 items-center">
                {orderPurchase?.map((order) => {
                  return (
                    <div className="">
                      <div className="flex items-center gap-4">
                        {order?.purchase_type == "STYLE" ? (
                          <>
                            <img
                              src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170600/AoStyle/image_bwjfib.jpg"
                              alt="Ankara Gown"
                              className="w-24 h-24 rounded-md"
                            />
                            <div>
                              <p className="font-semibold">Ankara Gown</p>
                              <p className="text-gray-500">x 1 Piece</p>
                              <p className="text-blue-600">N 24,000</p>
                            </div>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {order?.purchase_type == "FABRIC" ? (
                          <>
                            <img
                              src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170603/AoStyle/image1_s3s2sd.jpg"
                              alt="Luxury Embellished Lace"
                              className="w-24 h-24 rounded-md mb-2"
                            />
                            <div>
                              <p className="font-semibold">
                                {order?.name?.length > 30
                                  ? `${order?.name.slice(0, 30)}...`
                                  : order?.name}
                              </p>
                              <p className="text-gray-500">
                                x {order?.quantity} Yards
                              </p>
                              <p className="text-blue-600">N {order?.price}</p>
                            </div>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-center">
                  <FileText size={24} className="text-gray-600" />
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-600 font-medium">Subtotal :</span>
                  <span className="font-semibold">
                    N {totalAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 mt-2">
                  <span className="text-gray-600 font-medium">
                    Delivery Fee :
                  </span>
                  <span className="font-semibold">N 0</span>
                </div>
                <div className="flex justify-between items-center pb-2 mt-2">
                  <span className="text-gray-600 font-medium">Discount :</span>
                  <span className="font-semibold">N 0</span>
                </div>
                <div className="flex justify-between items-center pb-2 mt-2">
                  <span className="text-gray-600 font-medium">
                    Estimated sales VAT :
                  </span>
                  <span className="font-semibold">N 0</span>
                </div>
                <div className="flex justify-between items-center pb-2 mt-2">
                  <span className="text-gray-600 font-medium">Charges :</span>
                  <span className="font-semibold">N 0</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-600 font-medium text-lg">
                    Order Total :
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">
                      N {(totalAmount + 0 + 0)?.toLocaleString()}
                    </span>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                      {orderDetails?.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-white p-4 rounded-md">
            <h5 className="text-lg font-medium leading-loose border-b border-[#D9D9D9] pb-3 mb-3">
              Delivery Details
            </h5>
            <p className="font-medium mb-2">SHIPPING ADDRESS:</p>
            <p className="text-gray-600"></p>
            <p className="ont-medium mb-2 mt-2">DELIVERY DATE:</p>
            <p className="text-gray-600"></p>
            <p className="font-medium mb-2 mt-2">DELIVERY CODE:</p>
            <p className="text-[#A14DF6]"></p>
          </div>
          <div className="bg-white p-4 rounded-md">
            <h5 className="text-lg font-medium leading-loose border-b border-[#D9D9D9] pb-3 mb-3">
              Order Support
            </h5>
            <p className="font-medium mb-4">Need help?</p>
            <div className="flex space-x-6 mt-2">
              <Phone className="text-purple-500" size={24} />
              <MessageSquare className="text-purple-500" size={24} />
              <Mail className="text-purple-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Rate & Review Section - Inline on Page */}
      {showReviewSection && (
        <div className="mt-6 bg-white rounded-lg p-6 w-full max-w-3xl mx-auto relative">
          <button
            onClick={() => setShowReviewSection(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
          <h2 className="text-xl font-semibold mb-6">Rate & Review</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Style Review */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium mb-2">Style</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  SELECT THE STARS TO RATE THE PRODUCT
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170600/AoStyle/image_bwjfib.jpg"
                    alt="Ankara Gown"
                    className="w-16 h-16 rounded-md"
                  />
                  <span className="font-medium">Ankara Gown</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick("style", star)}
                      className={`text-2xl ${
                        star <= styleRating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  placeholder="eg I like it / I don't like it"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details Review
                </label>
                <textarea
                  placeholder="Tell us more about your rating"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                ></textarea>
              </div>
            </div>

            {/* Fabric Review */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium mb-2">Fabric</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  SELECT THE STARS TO RATE THE PRODUCT
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170603/AoStyle/image1_s3s2sd.jpg"
                    alt="Luxury Embellished Lace"
                    className="w-16 h-16 rounded-md"
                  />
                  <span className="font-medium">Luxury Embellished Lace</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick("fabric", star)}
                      className={`text-2xl ${
                        star <= fabricRating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  placeholder="eg I like it / I don't like it"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details Review
                </label>
                <textarea
                  placeholder="Tell us more about your rating"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                ></textarea>
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmitReview}
            className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transition"
          >
            Submit Review
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
