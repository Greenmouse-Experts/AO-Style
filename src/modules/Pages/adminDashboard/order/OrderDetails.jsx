/**
 * Customer Order Details Page
 *
 * Updated to:
 * - Use the /orders/details/id endpoint for order data
 * - Automatically show review section when order status is DELIVERED
 * - Support individual product reviews for both styles and fabrics
 * - Integrate with existing review system using ReviewForm component
 * - Display order progress based on actual order status
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
import { Link, useSearchParams } from "react-router-dom";
import useGetSingleOrder from "../../../../hooks/order/useGetSingleOrder";
import Loader from "../../../../components/ui/Loader";
import ReviewForm from "../../../../components/reviews/ReviewForm";

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

const OrderDetails = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState("style");
  const [activeReviewProduct, setActiveReviewProduct] = useState(null);

  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");

  const { isPending: getUserIsPending, data } = useGetSingleOrder(orderId);

  // Console logs for debugging
  console.log("=== ORDER DETAILS DEBUG ===");
  console.log("orderId from URL:", orderId);
  console.log("isPending:", getUserIsPending);
  console.log("Raw API response data:", data);
  console.log("Order details (data?.data):", data?.data);
  console.log("Payment object:", data?.data?.payment);
  console.log("Purchase object:", data?.data?.payment?.purchase);
  console.log("Purchase items:", data?.data?.payment?.purchase?.items);
  console.log("Order status:", data?.data?.status);
  console.log("==============================");

  // Always call these hooks to maintain consistent hook order
  const orderDetails = data?.data;
  const orderPurchase = data?.data?.payment?.purchase?.items;

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

  // Removed handleStepClick - customers should not be able to manually change order progress

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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auto Renew:</span>
                        <span className="font-medium">
                          {orderDetails?.payment?.auto_renew ? "Yes" : "No"}
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
                    <div className="space-y-3">
                      {orderPurchase.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 border rounded-lg"
                        >
                          <img
                            src={
                              item.purchase_type === "STYLE"
                                ? "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170600/AoStyle/image_bwjfib.jpg"
                                : "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170603/AoStyle/image1_s3s2sd.jpg"
                            }
                            alt={item.name || "Product"}
                            className="w-16 h-16 rounded-md object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">
                              {item.name || "Product Item"}
                            </p>
                            <p className="text-gray-500">
                              Quantity: {item.quantity || 1}
                            </p>
                            <p className="text-blue-600">
                              N{" "}
                              {item.price
                                ? parseInt(item.price).toLocaleString()
                                : "0"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-gray-600 font-medium">Subtotal:</span>
                    <span className="font-semibold">
                      N {parseInt(totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 mt-2">
                    <span className="text-gray-600 font-medium">
                      Delivery Fee:
                    </span>
                    <span className="font-semibold">N 0</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 mt-2">
                    <span className="text-gray-600 font-medium">Discount:</span>
                    <span className="font-semibold">
                      N{" "}
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
                        N {parseInt(totalAmount || 0).toLocaleString()}
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
        <div className="flex flex-col gap-4">
          <div className="bg-white p-4 rounded-md">
            <h5 className="text-lg font-medium leading-loose border-b border-[#D9D9D9] pb-3 mb-3">
              Customer Details
            </h5>
            <div className="space-y-3">
              <div>
                <p className="font-medium mb-1">Customer ID:</p>
                <p className="text-gray-600">
                  #{orderDetails?.user?.id?.slice(-8).toUpperCase()}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Email:</p>
                <p className="text-gray-600">
                  {orderDetails?.user?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Phone:</p>
                <p className="text-gray-600">
                  {orderDetails?.user?.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Order Date:</p>
                <p className="text-gray-600">
                  {orderDetails?.created_at
                    ? new Date(orderDetails.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
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
