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
import useCreateBilling from "../../hooks/billing/useCreateBilling";
import useApplyCoupon from "../../hooks/coupon/useApplyCoupon";
import useGetDeliveryFee from "../../hooks/delivery/useGetDeleiveryFee";
import useUpdateCartItem from "../../hooks/cart/useUpdateCartItem";
import useRemoveCoupon from "../../hooks/cart/useRemoveCoupon";
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

const CartPage = () => {
  const [coupon, setCoupon] = useState("");
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
  const { removeCouponMutate, isPending: removeCouponPending } =
    useRemoveCoupon();
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
  const discountAmount = 0; // Will be updated when coupon is applied

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

  // Handle quantity update
  const handleQuantityUpdate = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      setItemToDelete(itemId);
      setIsDeleteModalOpen(true);
      return;
    }

    console.log("🛒 Updating quantity:", { itemId, newQuantity });
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
          toastSuccess("Item removed from cart");
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

    console.log("🛒 Applying coupon:", coupon);
    applyCouponMutate(
      {
        coupon_code: coupon.trim(),
      },
      {
        onSuccess: (data) => {
          refetchCart();
          toastSuccess("Coupon applied successfully");
        },
        onError: (error) => {
          toastError("Failed to apply coupon");
          console.error("Coupon error:", error);
        },
      },
    );
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    console.log("🛒 Removing coupon");
    removeCouponMutate(undefined, {
      onSuccess: () => {
        refetchCart();
        setCoupon("");
        toastSuccess("Coupon removed");
      },
      onError: (error) => {
        toastError("Failed to remove coupon");
        console.error("Remove coupon error:", error);
      },
    });
  };

  // Payment with Paystack
  const payWithPaystack = ({ amount, payment_id }) => {
    console.log("🚀 Initializing Paystack payment:", {
      amount: amount,
      amount_in_kobo: amount * 100,
      payment_id: payment_id,
      user_email: carybinUser?.email,
      paystack_key: import.meta.env.VITE_PAYSTACK_API_KEY
        ? "Available"
        : "Missing",
    });

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
        subtotal: totals.subtotal,
        delivery_fee: delivery_fee,
        vat_amount: estimatedVat,
        discount_amount: discountAmount,
        total_items: items.length,
        coupon_code: coupon || null,
      },
      callback: function (response) {
        console.log("✅ Paystack payment successful:", response);
        console.log("📄 Payment details:", {
          reference: response.reference,
          status: response.status,
          trans: response.trans,
          transaction: response.transaction,
          message: response.message,
        });
        console.log(
          "🔍 Verifying payment with reference:",
          response?.reference,
        );
        verifyPaymentMutate(
          {
            id: response?.reference,
          },
          {
            onSuccess: (verificationResponse) => {
              console.log(
                "✅ Payment verification successful:",
                verificationResponse,
              );
              console.log("🛒 Clearing cart and redirecting to orders...");
              refetchCart();
              navigate(`/${currentUrl}/orders`);
              toastSuccess("Payment successful!");
            },
            onError: (error) => {
              console.error("❌ Payment verification failed:", error);
              console.error("📄 Verification error details:", {
                message: error?.data?.message,
                status: error?.status,
                response: error?.response,
              });
              toastError("Payment verification failed");
            },
          },
        );
      },
      onClose: function () {
        console.log("❌ Paystack payment window closed by user");
        console.log("📊 Payment cancellation details:", {
          payment_id: payment_id,
          amount: amount,
          user_email: carybinUser?.email,
          timestamp: new Date().toISOString(),
        });
        toastError("Payment was cancelled");
      },
    });

    handler.openIframe();
  };

  // Formik for billing

  // Get address from user profile
  const getProfileAddress = () => {
    console.log("📍 Getting address from user profile:", carybinUser);
    console.log("🔍 Profile structure:", {
      name: carybinUser?.name,
      email: carybinUser?.email,
      phone: carybinUser?.phone,
      address: carybinUser?.address,
      state: carybinUser?.state,
      country: carybinUser?.country,
      is_email_verified: carybinUser?.is_email_verified,
    });

    // Use the exact address from profile
    const profileAddress = {
      address:
        carybinUser?.address ||
        "2 Metalbox Rd, Ogba, Lagos 101233, Lagos, Nigeria",
      city: "Lagos",
      state: carybinUser?.state || "Lagos State",
      postal_code: "101233",
      country: carybinUser?.country || "NG",
    };

    console.log("📊 Final address data being used:", profileAddress);
    console.log("🔍 Profile source confirmation:", {
      country_from_profile: carybinUser?.country,
      country_code_used: "NG",
      postal_code_extracted: "101233",
      state_from_profile: carybinUser?.state,
      address_from_profile: carybinUser?.address,
    });
    console.log("✅ Using profile address for delivery");
    return profileAddress;
  };

  // Handle proceed to payment with detailed logging
  const handleProceedToPayment = () => {
    if (!navigator.onLine) {
      toastError("No internet connection. Please check your network.");
      return;
    }

    console.log("💳 Starting payment process...");

    // Get address from user profile
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

    console.log("🔍 Detailed Profile Analysis:", {
      raw_profile_data: carybinUser,
      address_processing: {
        original_address: carybinUser?.address,
        processed_address: addressInfo.address,
        city_used: addressInfo.city,
        state_used: addressInfo.state,
        postal_code_used: addressInfo.postal_code,
        country_used: addressInfo.country,
      },
      user_verification_status: {
        email_verified: carybinUser?.is_email_verified,
        phone_verified: carybinUser?.is_phone_verified,
        has_phone: !!carybinUser?.phone,
        has_alt_phone: !!carybinUser?.alternative_phone,
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
      coupon_code: coupon || undefined,
    };

    console.log("🧾 Creating billing with enhanced data:", billingData);
    console.log("📊 Billing API payload breakdown:", {
      address_info: {
        address: billingData.address,
        city: billingData.city,
        state: billingData.state,
        postal_code: billingData.postal_code,
        country: billingData.country,
      },
      financial_info: {
        subtotal: billingData.subtotal,
        discount_amount: billingData.discount_amount,
        delivery_fee: billingData.delivery_fee,
        vat_amount: billingData.vat_amount,
        total_amount: billingData.total_amount,
      },
      coupon_code: billingData.coupon_code,
      timestamp: new Date().toISOString(),
    });

    createBillingMutate(billingData, {
      onSuccess: (billingResponse) => {
        console.log("✅ Billing created successfully:", billingResponse);
        console.log("📄 Billing response data:", {
          billing_id: billingResponse?.data?.data?.id,
          status: billingResponse?.status,
          message: billingResponse?.data?.message,
          created_at: billingResponse?.data?.data?.created_at,
        });

        console.log("✅ Backend received profile-based billing data:", {
          address_from_profile: addressInfo.address === carybinUser?.address,
          user_profile_id: carybinUser?.id,
          financial_totals_sent: {
            subtotal: billingData.subtotal,
            discount: billingData.discount_amount,
            delivery: billingData.delivery_fee,
            vat: billingData.vat_amount,
            total: billingData.total_amount,
          },
          coupon_applied: billingData.coupon_code,
        });

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
          coupon_code: coupon || undefined,
          email: carybinUser?.email,
          subtotal: totals.subtotal,
          delivery_fee: delivery_fee,
          vat_amount: estimatedVat,
          country: addressInfo.country,
          postal_code: addressInfo.postal_code,
        };

        console.log("💳 Creating payment with enhanced data:", paymentData);
        console.log("📊 Payment API payload breakdown:", {
          purchase_info: {
            purchases: paymentData.purchases,
            total_items: paymentData.purchases.length,
          },
          financial_info: {
            amount: paymentData.amount,
            currency: paymentData.currency,
            subtotal: paymentData.subtotal,
            delivery_fee: paymentData.delivery_fee,
            vat_amount: paymentData.vat_amount,
          },
          location_info: {
            country: paymentData.country,
            postal_code: paymentData.postal_code,
          },
          user_info: {
            email: paymentData.email,
            coupon_code: paymentData.coupon_code,
          },
          billing_id: paymentData.billing_id,
          timestamp: new Date().toISOString(),
        });

        console.log("🎯 PAYMENT ENDPOINT WILL RECEIVE:", {
          "POST /payment/create": {
            purchases: paymentData.purchases,
            amount: paymentData.amount,
            currency: paymentData.currency,
            email: paymentData.email,
            subtotal: paymentData.subtotal,
            delivery_fee: paymentData.delivery_fee,
            vat_amount: paymentData.vat_amount,
            country: paymentData.country,
            postal_code: paymentData.postal_code,
            coupon_code: paymentData.coupon_code,
            note: "Total excludes service charges - only subtotal + VAT + delivery",
          },
          "Data Sources": {
            country_source: "Using country code: NG",
            postal_code_source: "Hardcoded: 101233",
            financial_calculation:
              "subtotal + VAT + delivery (NO service charges)",
          },
        });

        createPaymentMutate(paymentData, {
          onSuccess: (paymentResponse) => {
            console.log("✅ Payment created successfully:", paymentResponse);
            console.log("📄 Payment response data:", {
              payment_id: paymentResponse?.data?.data?.payment_id,
              status: paymentResponse?.status,
              message: paymentResponse?.data?.message,
              amount: paymentResponse?.data?.data?.amount,
              created_at: paymentResponse?.data?.data?.created_at,
            });

            console.log("🎯 Complete Backend Data Flow Success:", {
              billing_created: true,
              payment_created: true,
              profile_data_used: true,
              financial_data_sent: {
                subtotal_sent: paymentData.subtotal,
                delivery_fee_sent: paymentData.delivery_fee,
                vat_amount_sent: paymentData.vat_amount,
              },
              location_data_sent: {
                country_sent: paymentData.country,
                postal_code_sent: paymentData.postal_code,
              },
              user_context: {
                user_id: carybinUser?.id,
                user_email: carybinUser?.email,
                address_from_profile: true,
              },
              next_step: "Proceeding to Paystack payment",
            });
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
            console.error("📄 Payment error details:", {
              message: error?.data?.message || error?.message,
              status: error?.status || error?.response?.status,
              data: error?.data,
              response: error?.response?.data,
              timestamp: new Date().toISOString(),
            });
            toastError(
              "Failed to create payment - " +
                (error?.data?.message || "Unknown error"),
            );
          },
        });
      },
      onError: (error) => {
        console.error("❌ Billing creation failed:", error);
        console.error("📄 Billing error details:", {
          message: error?.data?.message || error?.message,
          status: error?.status || error?.response?.status,
          data: error?.data,
          response: error?.response?.data,
          validation_errors: error?.data?.errors,
          timestamp: new Date().toISOString(),
        });
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
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                              Quantity:
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleQuantityUpdate(item.id, quantity - 1)
                                }
                                disabled={updatePending || quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium">
                                {quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityUpdate(item.id, quantity + 1)
                                }
                                disabled={updatePending}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        {/* Product Info */}
                        <div className="col-span-5 flex items-center space-x-3">
                          {item.product?.image && (
                            <img
                              src={item.product.image}
                              alt={item.product?.name || "Product"}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          )}
                          <div className="min-w-0 flex-1">
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
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="col-span-2 flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleQuantityUpdate(item.id, quantity - 1)
                            }
                            disabled={updatePending || quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityUpdate(item.id, quantity + 1)
                            }
                            disabled={updatePending}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
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
                  <div className="mb-6 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-w-0"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!coupon.trim() || applyCouponPending}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      >
                        {applyCouponPending ? "..." : "Apply"}
                      </button>
                    </div>

                    {coupon && (
                      <button
                        onClick={handleRemoveCoupon}
                        disabled={removeCouponPending}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove Coupon
                      </button>
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
                        has_coupon: !!coupon,
                        coupon_code: coupon,
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
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

      {/* Confirmation Modal */}
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

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Discount {coupon && `(${coupon})`}</span>
                        <span className="text-green-600">
                          -₦{formatNumberWithCommas(discountAmount)}
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
                    2. Checkout Process
                  </h3>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      2.1 Order Placement
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                      <li>
                        Customers can place orders by selecting fabrics and
                        styles providing necessary details such as selection of
                        fabrics, selection of tailor, measurements for tailor,
                        and proceeding to checkout.
                      </li>
                      <li>
                        Customers are responsible for ensuring the accuracy of
                        their order details before confirming payment.
                      </li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      2.2 Payment Processing
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                      <li>
                        The platform supports multiple payment methods,
                        including credit/debit cards, digital wallets, and bank
                        transfers.
                      </li>
                      <li>
                        Payment processing is handled by secure, third-party
                        payment gateways.
                      </li>
                      <li>
                        Customers will receive a payment confirmation email
                        within <strong>5 minutes</strong> of successful payment.
                      </li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      2.3 Order Confirmation
                    </h4>
                    <p className="text-gray-700 mb-2 ml-4">
                      Once payment is confirmed, customers will receive an order
                      confirmation email with the following details:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-8 text-gray-700">
                      <li>Order number.</li>
                      <li>Product/service details.</li>
                      <li>Expected delivery timeline.</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    3.2 Refunds and Return Policy
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                    <li>
                      Check our refund and return policy{" "}
                      <em>(hyperlink to the refund and return policy)</em>
                    </li>
                    <li>
                      Refunds will be issued to the original payment method used
                      during checkout.
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    4. Responsibilities
                  </h3>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      4.1 E-Commerce Platform Host
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                      <li>Ensure a secure and seamless checkout process.</li>
                      <li>
                        Provide customer support for checkout-related issues.
                      </li>
                      <li>
                        Facilitate refunds and returns as per this agreement.
                      </li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      4.2 Customers
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                      <li>
                        Provide accurate order details and payment information.
                      </li>
                      <li>
                        Adhere to the platform's refund and return policies.
                      </li>
                      <li>
                        Notify the platform immediately in case of payment or
                        order issues.
                      </li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      4.3 Vendors
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                      <li>
                        Fulfil orders as per the agreed timelines and quality
                        standards.
                      </li>
                      <li>
                        Communicate any delays or issues to the platform and
                        customers promptly.
                      </li>
                      <li>
                        Process returns and refunds as per the platform's
                        policies.
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    5. Dispute Resolution
                  </h3>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      5.1 Payment Disputes
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                      <li>
                        Payment disputes (e.g., unauthorized transactions) must
                        be reported to the platform within{" "}
                        <strong>48 hours</strong> of the transaction by sending
                        an email to accounts@carybin.com
                      </li>
                      <li>
                        The platform will investigate and resolve disputes
                        within <strong>7 business days</strong>.
                      </li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      5.2 Order Disputes
                    </h4>
                    <p className="text-gray-700 ml-4">
                      Check our terms and conditions for Dispute Resolution{" "}
                      <em>(hyperlink to the refund and return policy)</em>
                    </p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    6. Limitation of Liability
                  </h3>
                  <p className="text-gray-700 mb-2 ml-4">
                    The platform is not liable for:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-8 text-gray-700">
                    <li>
                      Delays caused by third-party payment gateways or logistics
                      providers.
                    </li>
                    <li>Errors in order details provided by customers.</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    8. Governing Law
                  </h3>
                  <p className="text-gray-700 ml-4">
                    This agreement is governed by the laws of the Federal
                    Republic of Nigeria.
                  </p>
                </section>

                <hr className="my-8 border-gray-300" />

                <section className="mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    By using the platform's checkout process, customers and
                    vendors agree to the terms and conditions outlined in this
                    agreement.
                  </p>
                </section>
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
