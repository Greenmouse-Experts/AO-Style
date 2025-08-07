import React, { useEffect, useState } from "react";
import Breadcrumb from "./components/Breadcrumb";
import useGetCart from "../../hooks/cart/useGetCart";
import LoaderComponent from "../../components/BeatLoader";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useDeleteCart from "../../hooks/cart/useDeleteCart";
import useCreatePayment from "../../hooks/cart/useCreatePayment";
import { useCarybinUserStore } from "../../store/carybinUserStore";
import useVerifyPayment from "../../hooks/cart/useVerifyPayment";
import Cookies from "js-cookie";
import useToast from "../../hooks/useToast";
import { useFormik } from "formik";
import Select from "react-select";
import { nigeriaStates } from "../../constant";
import PhoneInput from "react-phone-input-2";
import useCreateBilling from "../../hooks/billing/useCreateBilling";
import useApplyCoupon from "../../hooks/cart/useApplyCoupon";
import useGetDeliveryFee from "../../hooks/delivery/useGetDeleiveryFee";
import useUpdateCartItem from "../../hooks/cart/useUpdateCartItem";

import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Trash2,
  User,
  Calendar,
  Package,
  Tag,
} from "lucide-react";
import { formatNumberWithCommas } from "../../lib/helper";
import CartItemStyle from "./components/CartItemStyle";
import CartItemStyleDesktop from "./components/CartItemStyleDesktop";

const initialValues = {
  address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "NG",
};

const CartPage = () => {
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // API hooks
  const {
    data: cartResponse,
    isPending: cartLoading,
    refetch: refetchCart,
  } = useGetCart();
  const { updateCartItemMutate, isPending: updatePending } =
    useUpdateCartItem();
  const { deleteCartMutate, isPending: deleteIsPending } = useDeleteCart();
  const { applyCouponMutate, isPending: applyCouponPending } = useApplyCoupon();

  const { createPaymentMutate, isPending: createPaymentPending } =
    useCreatePayment();
  const { createBillingMutate, isPending: billingPending } = useCreateBilling();
  const { verifyPaymentMutate, isPending: verifyPending } = useVerifyPayment();

  // Get cart data from API response
  const cartData = cartResponse?.data;
  const items = cartData?.items || [];
  const cartUser = cartData?.user;
  const cartMeta = {
    id: cartData?.id,
    created_at: cartData?.created_at,
    updated_at: cartData?.updated_at,
    count: cartData?.count,
  };

  console.log("🛒 Cart API Data:", cartData);
  console.log("🛒 Cart Items:", items);
  console.log("🛒 Cart User:", cartUser);

  const {
    data: deliveryData,
    isLoading: deliveryLoading,
    isError: deliveryError,
  } = useGetDeliveryFee();

  // Console log delivery data
  console.log("🚚 Delivery API Response:", deliveryData);
  console.log("🚚 Delivery Loading State:", deliveryLoading);
  console.log("🚚 Delivery Error State:", deliveryError);
  console.log("🚚 Raw Delivery Data:", deliveryData?.data);
  console.log("🚚 Delivery Fee Value:", deliveryData?.data?.data?.delivery_fee);

  // Immediate logging when delivery data changes
  useEffect(() => {
    if (deliveryData) {
      console.log("🚚 CartPage: Delivery data received!");
      console.log("🚚 CartPage: Full deliveryData object:", deliveryData);
      console.log("🚚 CartPage: deliveryData.data:", deliveryData.data);
      console.log(
        "🚚 CartPage: deliveryData.data.data:",
        deliveryData.data?.data,
      );
      console.log(
        "🚚 CartPage: Final delivery_fee extracted:",
        deliveryData?.data?.data?.delivery_fee,
      );
    } else {
      console.log("🚚 CartPage: No delivery data available");
    }
  }, [deliveryData]);
  const { carybinUser } = useCarybinUserStore();
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUrl = Cookies.get("currUserUrl");
  const token = Cookies.get("token");

  // Calculate totals from API cart items
  const calculateTotals = () => {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        totalQuantity: 0,
        itemCount: 0,
      };
    }
    //GOOD
    const subtotal = items.reduce((total, item) => {
      const price = parseFloat(item.price_at_time || item.product?.price || 0);
      const quantity = parseInt(item.quantity || 1);
      return total + price * quantity;
    }, 0);

    const totalQuantity = items.reduce((total, item) => {
      return total + parseInt(item.quantity || 1);
    }, 0);

    return {
      subtotal,
      totalQuantity,
      itemCount: items.length,
    };
  };

  const totals = calculateTotals();
  const delivery_fee = deliveryData?.data?.data?.delivery_fee ?? 0;
  const estimatedVat = totals.subtotal * 0.075;
  const charges = totals.subtotal * 0.015;
  const discountAmount = appliedCoupon?.discount || 0;

  const finalTotal =
    totals.subtotal + delivery_fee + estimatedVat - discountAmount;

  // Console log calculation details
  console.log("💰 Cart Calculations:", {
    subtotal: totals.subtotal,
    delivery_fee: delivery_fee,
    estimatedVat: estimatedVat,
    charges: charges,
    discountAmount: discountAmount,
    finalTotal: finalTotal,
    note: "Service charges excluded from total (only subtotal + VAT + delivery)",
    deliveryDataExists: !!deliveryData,
    deliveryDataPath: deliveryData?.data?.data,
  });

  // Handle agreement click
  const handleAgreementClick = (e) => {
    e.preventDefault();
    const isMobile = window.innerWidth < 768;
    setShowPolicyModal(true);
  };

  // Get measurement count for styled items
  const getMeasurementCount = (measurement) => {
    if (Array.isArray(measurement)) {
      return measurement.length;
    }
    return measurement ? 1 : 0;
  };

  // Handle quantity update with minimum yards and style constraints
  const handleQuantityUpdate = (itemId, newQuantity, item) => {
    // If item has a style, don't allow quantity changes (quantity = number of measurements)
    if (item?.style_product) {
      toastError(
        "Cannot change quantity for styled items. Quantity equals number of measurements.",
      );
      return;
    }

    const minimumYards = item?.product?.minimum_yards || 1;

    if (newQuantity < minimumYards) {
      setItemToDelete(itemId);
      setIsDeleteModalOpen(true);
      return;
    }

    console.log("🛒 Updating quantity:", { itemId, newQuantity, minimumYards });
    updateCartItemMutate(
      {
        id: itemId,
        quantity: newQuantity,
      },
      {
        onSuccess: () => {
          refetchCart();
          // Toast is handled by the hook
        },
        onError: (error) => {
          toastError("Failed to update cart item");
          console.error("Update error:", error);
        },
      },
    );
  };

  // Handle quantity increment with minimum yards constraint
  const handleQuantityIncrement = (item) => {
    if (item?.style_product) {
      toastError(
        "Cannot change quantity for styled items. Quantity equals number of measurements.",
      );
      return;
    }

    const minimumYards = item?.product?.minimum_yards || 1;
    const currentQuantity = parseInt(item.quantity || 1);
    const newQuantity = currentQuantity + minimumYards;

    handleQuantityUpdate(item.id, newQuantity, item);
  };

  // Handle quantity decrement with minimum yards constraint
  const handleQuantityDecrement = (item) => {
    if (item?.style_product) {
      toastError(
        "Cannot change quantity for styled items. Quantity equals number of measurements.",
      );
      return;
    }

    const minimumYards = item?.product?.minimum_yards || 1;
    const currentQuantity = parseInt(item.quantity || 1);
    const newQuantity = currentQuantity - minimumYards;

    if (newQuantity < minimumYards) {
      setItemToDelete(item.id);
      setIsDeleteModalOpen(true);
      return;
    }

    handleQuantityUpdate(item.id, newQuantity, item);
  };

  // Handle item removal
  const handleRemoveItem = (itemId) => {
    console.log("🛒 Removing item:", itemId);
    deleteCartMutate(
      {
        id: itemId,
      },
      {
        onSuccess: () => {
          refetchCart();
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        },
        onError: (error) => {
          toastError("Failed to remove item");
          console.error("Delete error:", error);
        },
      },
    );
  };

  // Handle coupon application
  const handleApplyCoupon = () => {
    if (!coupon.trim()) return;

    // Validate user email
    if (!carybinUser?.email) {
      toastError("Please login to apply coupon");
      return;
    }

    const couponPayload = {
      email: carybinUser.email,
      code: coupon.trim(),
      amount: totals.subtotal.toString(),
    };

    console.log("🛒 Applying coupon:", couponPayload);
    applyCouponMutate(couponPayload, {
      onSuccess: (data) => {
        console.log("✅ Coupon applied successfully:", data?.data?.data);

        // Store the applied coupon details
        const couponData = data?.data?.data;
        if (couponData) {
          setAppliedCoupon({
            id: couponData.id || coupon.trim(), // Use API ID or fallback to code
            code: coupon.trim(),
            discount: parseFloat(couponData.discount || 0),
            discountedAmount: parseFloat(couponData.discountedAmount || 0),
            message: data?.data?.message || "Coupon applied successfully",
          });
        }

        refetchCart();
      },
      onError: (error) => {
        toastError("Failed to apply coupon");
        console.error("Coupon error:", error);
      },
    });
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    console.log("🛒 Removing coupon - clearing state and restoring total");
    setAppliedCoupon(null);
    setCoupon("");
    toastSuccess("Coupon removed successfully");
  };

  // Payment with Paystack
  const payWithPaystack = ({ amount, payment_id }) => {
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_API_KEY,
      email: carybinUser?.email,
      id: payment_id,
      amount: amount * 100,
      currency: "NGN",
      reference: payment_id,
      ref: payment_id,
      metadata: {
        custom_fields: [
          {
            display_name: carybinUser?.email,
            variable_name: carybinUser?.email,
            value: payment_id,
          },
        ],
      },
      callback: function (response) {
        console.log("💳 Payment callback:", response);
        verifyPaymentMutate(
          {
            id: response?.reference,
          },
          {
            onSuccess: () => {
              refetchCart();
              navigate(`/${currentUrl}/orders`);
              toastSuccess("Payment successful!");
            },
            onError: (error) => {
              toastError("Payment verification failed");
              console.error("Payment verification error:", error);
            },
          },
        );
      },
      onClose: function () {
        alert("Payment window closed.");
      },
    });

    handler.openIframe();
  };

  // Get profile address or use defaults
  const getProfileAddress = () => {
    const baseAddress = {
      address: carybinUser?.address || "2 Metalbox Rd, Ogba, Lagos 101233",
      city: carybinUser?.city || "Lagos",
      state: carybinUser?.state || "Lagos",
      postal_code: carybinUser?.postal_code || "101233",
      country: carybinUser?.country || "NG",
    };

    console.log("🏠 Profile address extraction:", {
      raw_user_data: carybinUser,
      extracted_address: baseAddress,
      address_source: carybinUser?.address ? "profile" : "default",
    });

    return baseAddress;
  };

  // Handle proceeding to payment
  const handleProceedToPayment = () => {
    if (!navigator.onLine) {
      toastError("No internet connection. Please check your network.");
      return;
    }

    const addressInfo = getProfileAddress();

    console.log("📊 Payment Data Summary:", {
      subtotal: totals.subtotal,
      discountAmount: discountAmount,
      delivery_fee: delivery_fee,
      estimatedVat: estimatedVat,
      finalTotal: finalTotal,
      itemCount: items.length,
      addressInfo: addressInfo,
      coupon: coupon,
      profile_data_used: {
        user_id: carybinUser?.id,
        user_name: carybinUser?.name,
        user_email: carybinUser?.email,
        profile_address: carybinUser?.address,
        profile_state: carybinUser?.state,
        profile_country: carybinUser?.country,
        email_verified: carybinUser?.is_email_verified,
      },
    });

    // Prepare billing data with totals
    const billingData = {
      ...addressInfo,
      subtotal: totals.subtotal,
      discount_amount: discountAmount,
      delivery_fee: delivery_fee,
      vat_amount: estimatedVat,
      total_amount: finalTotal,
      coupon_code: appliedCoupon?.code || undefined,
    };

    console.log("🧾 Creating billing with enhanced data:", billingData);

    createBillingMutate(billingData, {
      onSuccess: (billingResponse) => {
        console.log("✅ Billing created successfully:", billingResponse);

        // Prepare purchases from cart items
        const purchases = items.map((item) => ({
          purchase_id: item.product_id,
          quantity: item.quantity,
          purchase_type: item.product_type || item.product?.type,
        }));

        const paymentData = {
          purchases,
          amount: Math.round(finalTotal),
          currency: "NGN",
          coupon_code: appliedCoupon?.code || undefined,
          email: carybinUser?.email,
          subtotal: totals.subtotal,
          delivery_fee: delivery_fee,
          vat_amount: estimatedVat,
          country: addressInfo.country,
          postal_code: addressInfo.postal_code,
        };

        console.log("💳 Creating payment with enhanced data:", paymentData);

        createPaymentMutate(paymentData, {
          onSuccess: (paymentResponse) => {
            console.log("✅ Payment created successfully:", paymentResponse);
            setShowConfirmationModal(false);
            setCoupon("");

            console.log("🚀 Launching Paystack with:", {
              amount: finalTotal,
              payment_id: paymentResponse?.data?.data?.payment_id,
            });

            payWithPaystack({
              amount: finalTotal,
              payment_id: paymentResponse?.data?.data?.payment_id,
            });
          },
          onError: (error) => {
            console.error("❌ Payment creation failed:", error);
            toastError(
              "Failed to create payment - " +
                (error?.data?.message || "Unknown error"),
            );
          },
        });
      },
      onError: (error) => {
        console.error("❌ Billing creation failed:", error);
        toastError(
          "Failed to create billing - " +
            (error?.data?.message || "Unknown error"),
        );
      },
    });
  };

  // Format currency
  const formatPrice = (price) => {
    const numPrice = parseFloat(price || 0);
    return `₦${numPrice.toLocaleString()}`;
  };

  // Format date
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

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderComponent />
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        title="Shopping Cart"
        subtitle="Cart"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744104104/AoStyle/image_1_xxie9w.jpg"
      />

      {!items || items.length === 0 ? (
        <div className="px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-gray-50 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Looks like you haven't added any items to your cart yet. Discover
              our amazing collection of fabrics and styles!
            </p>
            <div className="space-y-4">
              <Link
                to="/marketplace"
                className="block bg-gradient text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold shadow-lg"
              >
                Explore Products
              </Link>
              <Link
                to="/pickastyle"
                className="block border-2 border-purple-300 text-purple-700 px-8 py-4 rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium"
              >
                Browse Styles
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="Resizer section px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Cart Header with User Info */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Shopping Cart
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {totals.itemCount}{" "}
                    {totals.itemCount === 1 ? "item" : "items"} •{" "}
                    {totals.totalQuantity} total pieces
                  </p>
                </div>

                {/* Cart Metadata */}
                {cartMeta && (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {formatDate(cartMeta.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tag className="w-4 h-4" />
                      <span>Cart ID: {cartMeta.id}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* User Information */}
              {cartUser && (
                <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">
                      Cart Owner
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {cartUser.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {cartUser.email}
                    </div>
                    {cartUser.phone && (
                      <div>
                        <span className="font-medium">Phone:</span>{" "}
                        {cartUser.phone}
                      </div>
                    )}
                    {cartUser.is_email_verified && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Status:</span>
                        <span className="text-purple-600">✓ Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items - Left Side */}
              <div className="lg:col-span-2 space-y-4">
                {/* Desktop Headers */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-600">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                {/* Cart Items */}
                {items.map((item) => {
                  const unitPrice = parseFloat(
                    item.price_at_time || item.product?.price || 0,
                  );
                  const quantity = parseInt(item.quantity || 1);
                  const itemTotal = unitPrice * quantity;

                  // For styled items, display should show measurement count
                  const measurementCount = getMeasurementCount(
                    item.measurement,
                  );
                  const displayQuantity = item?.style_product
                    ? measurementCount
                    : quantity;

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Mobile Layout */}
                      <div className="md:hidden space-y-4">
                        {/* Product Info */}
                        <div className="flex items-start space-x-4">
                          {item.product?.image && (
                            <img
                              src={item.product.image}
                              alt={item.product?.name || "Product"}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {item.product?.name ||
                                `Product ${item.product_id}`}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Type: {item.product_type || item.product?.type}
                            </p>
                            <p className="text-sm text-purple-600 font-semibold mt-1">
                              {formatPrice(unitPrice)} each
                            </p>
                            {item.product?.sku && (
                              <p className="text-xs text-gray-400 mt-1">
                                SKU: {item.product.sku}
                              </p>
                            )}

                            {/* Style Information */}
                            {item.style_product && (
                              <CartItemStyle
                                styleProduct={item.style_product}
                                measurement={item.measurement}
                                fabricImage={item.product?.image}
                                fabricName={item.product?.name}
                              />
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                Quantity:
                              </span>
                              {item?.style_product ? (
                                <span className="text-xs text-blue-600 font-medium">
                                  = {getMeasurementCount(item.measurement)}{" "}
                                  measurement
                                  {getMeasurementCount(item.measurement) !== 1
                                    ? "s"
                                    : ""}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  Min: {item?.product?.minimum_yards || 1} yards
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuantityDecrement(item)}
                                disabled={
                                  updatePending ||
                                  item?.style_product ||
                                  quantity <=
                                    (item?.product?.minimum_yards || 1)
                                }
                                className={`w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  item?.style_product
                                    ? "border-blue-300 bg-blue-50"
                                    : "border-gray-300"
                                }`}
                                title={
                                  item?.style_product
                                    ? "Cannot change quantity for styled items"
                                    : quantity <=
                                        (item?.product?.minimum_yards || 1)
                                      ? `Minimum quantity is ${item?.product?.minimum_yards || 1} yards`
                                      : "Decrease quantity"
                                }
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span
                                className={`w-8 text-center font-medium ${
                                  item?.style_product ? "text-blue-600" : ""
                                }`}
                              >
                                {displayQuantity}
                              </span>
                              <button
                                onClick={() => handleQuantityIncrement(item)}
                                disabled={updatePending || item?.style_product}
                                className={`w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  item?.style_product
                                    ? "border-blue-300 bg-blue-50"
                                    : "border-gray-300"
                                }`}
                                title={
                                  item?.style_product
                                    ? "Cannot change quantity for styled items"
                                    : `Increase by ${item?.product?.minimum_yards || 1} yards`
                                }
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-purple-600">
                              {formatPrice(itemTotal)}
                            </p>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              setItemToDelete(item.id);
                              setIsDeleteModalOpen(true);
                            }}
                            disabled={deleteIsPending}
                            className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>

                        {/* Item Metadata */}
                        <div className="bg-gray-50 rounded p-3 text-xs text-gray-600 space-y-1">
                          <div>Added: {formatDate(item.created_at)}</div>
                          {item.updated_at !== item.created_at && (
                            <div>Updated: {formatDate(item.updated_at)}</div>
                          )}
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                        {/* Product Information */}
                        <div className="col-span-5 flex items-center space-x-3">
                          {item.product?.image && (
                            <img
                              src={item.product.image}
                              alt={item.product?.name || "Product"}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div>
                              <h3 className="font-semibold text-gray-900 truncate">
                                {item.product?.name ||
                                  `Product ${item.product_id}`}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {item.product_type || item.product?.type}
                              </p>
                              {item.product?.sku && (
                                <p className="text-xs text-gray-400">
                                  SKU: {item.product.sku}
                                </p>
                              )}

                              {/* Style Information */}
                              {item.style_product && (
                                <CartItemStyleDesktop
                                  styleProduct={item.style_product}
                                  measurement={item.measurement}
                                  fabricImage={item.product?.image}
                                  fabricName={item.product?.name}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="col-span-2 flex flex-col items-center justify-center gap-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityDecrement(item)}
                              disabled={
                                updatePending ||
                                item?.style_product ||
                                quantity <= (item?.product?.minimum_yards || 1)
                              }
                              className={`w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-50 disabled:opacity-50 ${
                                item?.style_product
                                  ? "border-blue-300 bg-blue-50"
                                  : "border-gray-300"
                              }`}
                              title={
                                item?.style_product
                                  ? "Cannot change quantity for styled items"
                                  : quantity <=
                                      (item?.product?.minimum_yards || 1)
                                    ? `Minimum quantity is ${item?.product?.minimum_yards || 1} yards`
                                    : "Decrease quantity"
                              }
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span
                              className={`w-8 text-center font-medium ${
                                item?.style_product ? "text-blue-600" : ""
                              }`}
                            >
                              {displayQuantity}
                            </span>
                            <button
                              onClick={() => handleQuantityIncrement(item)}
                              disabled={updatePending || item?.style_product}
                              className={`w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-50 disabled:opacity-50 ${
                                item?.style_product
                                  ? "border-blue-300 bg-blue-50"
                                  : "border-gray-300"
                              }`}
                              title={
                                item?.style_product
                                  ? "Cannot change quantity for styled items"
                                  : `Increase by ${item?.product?.minimum_yards || 1} yards`
                              }
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          {item?.style_product ? (
                            <span className="text-xs text-blue-600 font-medium">
                              = {getMeasurementCount(item.measurement)}{" "}
                              measurement
                              {getMeasurementCount(item.measurement) !== 1
                                ? "s"
                                : ""}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">
                              Min: {item?.product?.minimum_yards || 1}y
                            </span>
                          )}
                        </div>

                        {/* Unit Price */}
                        <div className="col-span-2 text-right">
                          <p className="font-semibold text-gray-500">
                            {formatPrice(unitPrice)}
                          </p>
                        </div>

                        {/* Total */}
                        <div className="col-span-2 text-right">
                          <p className="text-lg font-bold text-purple-600">
                            {formatPrice(itemTotal)}
                          </p>
                        </div>

                        {/* Remove */}
                        <div className="col-span-1 text-center">
                          <button
                            onClick={() => {
                              setItemToDelete(item.id);
                              setIsDeleteModalOpen(true);
                            }}
                            disabled={deleteIsPending}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary - Right Side */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg sticky top-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Order Summary
                  </h2>

                  {/* Coupon Section */}
                  <div className="mb-6">
                    {!appliedCoupon ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Have a coupon code?
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                            placeholder="Enter coupon code"
                            className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={!coupon.trim() || applyCouponPending}
                            className="absolute right-1 top-1 bottom-1 px-3 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {applyCouponPending ? "..." : "Apply"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 8 8"
                                >
                                  <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-green-800">
                                  Coupon "{appliedCoupon.code}" applied
                                </div>
                                <div className="text-sm text-green-600">
                                  You saved ₦
                                  {formatNumberWithCommas(
                                    appliedCoupon.discount,
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={handleRemoveCoupon}
                              className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal ({totals.itemCount} items)</span>
                      <span className="text-green-600 font-semibold">
                        {formatPrice(totals.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery Fee</span>
                      <span className="text-green-600 font-semibold">
                        {deliveryLoading ? (
                          <span className="text-gray-400">Loading...</span>
                        ) : deliveryError ? (
                          <span className="text-red-500">
                            Error loading fee
                          </span>
                        ) : (
                          formatPrice(delivery_fee)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>VAT (7.5%)</span>
                      <span className="text-green-600 font-semibold">
                        {formatPrice(estimatedVat)}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-green-600 font-semibold">
                          -{formatPrice(discountAmount)}
                        </span>
                      </div>
                    )}
                    <hr className="border-gray-200 my-4" />
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-green-600">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Policy Checkbox */}
                  <div className="flex items-start gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="main-agree-policy"
                      checked={agreedToPolicy}
                      onChange={(e) => setAgreedToPolicy(e.target.checked)}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="main-agree-policy"
                      className="text-sm text-gray-700 leading-relaxed"
                    >
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={handleAgreementClick}
                        className="text-purple-600 hover:text-purple-800 underline font-medium"
                      >
                        Carybin Checkout Policy
                      </button>
                    </label>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => {
                      console.log("🛒 User initiated checkout process");
                      console.log("📊 Checkout initiation data:", {
                        total_items: items.length,
                        subtotal: totals.subtotal,
                        delivery_fee: delivery_fee,
                        vat_amount: estimatedVat,
                        final_total: finalTotal,
                        has_coupon: !!appliedCoupon,
                        coupon_code: appliedCoupon?.code,
                        discount_amount: discountAmount,
                        user_email: carybinUser?.email,
                        policy_agreed: agreedToPolicy,
                        user_profile_address: getProfileAddress(),
                        timestamp: new Date().toISOString(),
                      });
                      console.log(
                        "🚀 Opening review modal with profile address",
                      );
                      setShowConfirmationModal(true);
                    }}
                    disabled={
                      !agreedToPolicy || createPaymentPending || billingPending
                    }
                    className="w-full bg-gradient text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {createPaymentPending || billingPending
                      ? "Processing..."
                      : "Proceed to Checkout"}
                  </button>

                  {/* Continue Shopping */}
                  <Link
                    to="/marketplace"
                    className="block text-center text-purple-600 hover:text-purple-800 mt-4 text-sm font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Remove Item
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this item from your cart?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveItem(itemToDelete)}
                disabled={deleteIsPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteIsPending ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 pt-20">
          <div className="bg-white rounded-lg p-6 w-full max-h-[80vh] overflow-y-auto max-w-4xl relative">
            <button
              onClick={() => {
                setShowConfirmationModal(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center text-purple-600">
              Review Your Order
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Order Details */}
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {carybinUser?.name || "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {carybinUser?.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {carybinUser?.phone ||
                        carybinUser?.alternative_phone ||
                        "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium">Email Verified:</span>{" "}
                      <span
                        className={
                          carybinUser?.is_email_verified
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {carybinUser?.is_email_verified ? "✅ Yes" : "❌ No"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-purple-600" />
                    Delivery Address
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Full Address:</span>{" "}
                      {carybinUser?.address ||
                        "2 Metalbox Rd, Ogba, Lagos 101233, Lagos, Nigeria"}
                    </p>
                    <p>
                      <span className="font-medium">State:</span>{" "}
                      {carybinUser?.state || "Lagos State"}
                    </p>
                    <p>
                      <span className="font-medium">Country:</span>{" "}
                      {carybinUser?.country || "NG"}
                    </p>
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                      <p>
                        <strong>Profile ID:</strong> {carybinUser?.id}
                      </p>
                      <p>
                        <strong>Member Since:</strong>{" "}
                        {new Date(carybinUser?.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                    <p>
                      💡 Address from your profile -{" "}
                      <button
                        onClick={() => {
                          console.log(
                            "📝 User wants to update profile address",
                          );
                          window.open("/profile", "_blank");
                        }}
                        className="underline hover:text-blue-800"
                      >
                        Update if needed
                      </button>
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-purple-600" />
                    Order Items ({items.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start border-b border-gray-200 pb-2"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {item.product?.name || item.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity} × ₦
                            {formatNumberWithCommas(
                              item.price || item.price_at_time,
                            )}
                          </p>
                          {item.product_type && (
                            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mt-1">
                              {item.product_type}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ₦
                            {formatNumberWithCommas(
                              (item.price || item.price_at_time) *
                                item.quantity,
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                    Order Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₦{formatNumberWithCommas(totals.subtotal)}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Coupon Discount ({appliedCoupon.code})</span>
                        <span>
                          -₦{formatNumberWithCommas(appliedCoupon.discount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>
                        {deliveryLoading ? (
                          <span className="text-gray-400">Loading...</span>
                        ) : deliveryError ? (
                          <span className="text-red-500">Error</span>
                        ) : (
                          `₦${formatNumberWithCommas(delivery_fee)}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>VAT (7.5%)</span>
                      <span>₦{formatNumberWithCommas(estimatedVat)}</span>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      <p>* Total includes: Subtotal + VAT + Delivery Fee</p>
                      <p>* Service charges excluded from final amount</p>
                    </div>

                    <div className="border-t border-purple-200 pt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-purple-600">
                          ₦{formatNumberWithCommas(finalTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  disabled={billingPending || createPaymentPending}
                  onClick={handleProceedToPayment}
                  className="w-full cursor-pointer py-4 bg-gradient text-white hover:from-purple-600 hover:to-pink-600 transition rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {billingPending || createPaymentPending
                    ? "Processing..."
                    : `Proceed to Payment - ₦${formatNumberWithCommas(finalTotal)}`}
                </button>

                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>By proceeding, you agree to our terms and conditions</p>
                  <p>Your payment is secured by Paystack</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <CheckoutPolicyModal
          isOpen={showPolicyModal}
          onClose={() => setShowPolicyModal(false)}
        />
      )}
    </>
  );
};

// Policy Modal Component
function CheckoutPolicyModal({ isOpen, onClose, agreementType = "checkout" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (event) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const isFabricVendor = agreementType === "fabric";
  const isTailor = agreementType === "tailor";
  const isCheckout = agreementType === "checkout";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up">
        <style>
          {`
            @keyframes fadeInUp {
              0% {
                opacity: 0;
                transform: translateY(40px) scale(0.98);
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            .animate-fade-in-up {
              animation: fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1);
            }
          `}
        </style>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-purple-500">
            {isCheckout
              ? "Checkout Agreement"
              : isTailor
                ? "Service Level Agreement (SLA) - Tailors"
                : "Service Level Agreement (SLA) - Fabric Vendors"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            {isCheckout ? (
              // Checkout Agreement Content
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Checkout Agreement
                  </h1>
                  <p className="text-lg text-gray-600">
                    For E-Commerce Platform
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Effective Date:</strong> [From sign up or date of
                    checkout]
                  </p>
                </div>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Parties:
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>
                      <strong>E-Commerce Platform Host:</strong> [Carybin
                      Limited]
                    </li>
                    <li>
                      <strong>Customers:</strong> End-users of the platform
                    </li>
                    <li>
                      <strong>Vendors:</strong> Tailors, Fabric Vendors,
                      Logistics Vendors
                    </li>
                  </ol>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    1. Purpose
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    This agreement defines the terms and conditions governing
                    the checkout process on the e-commerce platform, including
                    payment, order confirmation, refunds, and dispute
                    resolution.
                  </p>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    2. Order Process
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>
                      Orders are confirmed upon successful payment processing
                    </li>
                    <li>
                      You will receive an order confirmation email within 24
                      hours
                    </li>
                    <li>
                      Order details cannot be modified after payment
                      confirmation
                    </li>
                    <li>
                      We reserve the right to cancel orders for any reason
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    3. Payment Terms
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>
                      All payments are processed securely through Paystack
                    </li>
                    <li>
                      We accept major credit/debit cards and bank transfers
                    </li>
                    <li>
                      Payment must be completed before order processing begins
                    </li>
                    <li>VAT and delivery fees are calculated at checkout</li>
                    <li>All prices are in Nigerian Naira (NGN)</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    4. Delivery & Shipping
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>
                      Delivery timeframes vary by product type and location
                    </li>
                    <li>Custom tailoring orders may take 7-14 business days</li>
                    <li>
                      Fabric orders typically ship within 2-5 business days
                    </li>
                    <li>
                      Delivery fees are calculated based on location and weight
                    </li>
                    <li>
                      Customers are responsible for providing accurate delivery
                      addresses
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    5. Returns & Refunds
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>Custom-made items are generally non-refundable</li>
                    <li>
                      Fabric products may be returned within 7 days if unused
                    </li>
                    <li>Refunds are processed within 7-14 business days</li>
                    <li>
                      Return shipping costs are borne by the customer unless
                      item is defective
                    </li>
                    <li>
                      Damaged or incorrect items will be replaced or refunded at
                      no cost
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    6. Quality Assurance
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>All vendors are vetted for quality and reliability</li>
                    <li>
                      We maintain quality standards for all products and
                      services
                    </li>
                    <li>
                      Customer feedback is regularly monitored and addressed
                    </li>
                    <li>
                      Dispute resolution process is available for quality issues
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    7. Customer Responsibilities
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>Provide accurate measurements for custom tailoring</li>
                    <li>Respond promptly to vendor communications</li>
                    <li>
                      Inspect deliveries upon receipt and report issues
                      immediately
                    </li>
                    <li>
                      Maintain account security and update contact information
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    8. Dispute Resolution
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>First contact vendor directly for issue resolution</li>
                    <li>
                      Escalate to Carybin support if vendor resolution fails
                    </li>
                    <li>
                      We provide mediation services for vendor-customer disputes
                    </li>
                    <li>
                      Final decisions on disputes are at Carybin's discretion
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    9. Privacy & Data Protection
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>
                      Personal information is protected per our Privacy Policy
                    </li>
                    <li>
                      Payment data is securely processed and not stored on our
                      servers
                    </li>
                    <li>
                      Order information may be shared with vendors for
                      fulfillment
                    </li>
                    <li>
                      Marketing communications can be opted out at any time
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    10. Platform Liability
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>
                      Carybin acts as an intermediary between customers and
                      vendors
                    </li>
                    <li>
                      We are not liable for vendor performance or product
                      defects
                    </li>
                    <li>Our liability is limited to the transaction value</li>
                    <li>Force majeure events are excluded from liability</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    11. Modifications
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Carybin reserves the right to modify these terms at any
                    time. Customers will be notified of significant changes via
                    email or platform notifications. Continued use of the
                    platform constitutes acceptance of modified terms.
                  </p>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    12. Contact Information
                  </h3>
                  <div className="text-gray-700 leading-relaxed">
                    <p className="mb-2">
                      <strong>Carybin Limited</strong>
                    </p>
                    <p className="mb-2">Email: support@carybin.com</p>
                    <p className="mb-2">Phone: +234 (0) 123 456 7890</p>
                    <p className="mb-2">Website: www.carybin.com</p>
                  </div>
                </section>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium">
                    By proceeding with checkout, you acknowledge that you have
                    read, understood, and agree to be bound by these terms and
                    conditions.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">Press ESC to close</div>
          <button
            onClick={onClose}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
