import { useEffect, useState } from "react";
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

const initialValues = {
  address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "NG",
};

const CartPage = () => {
  const [coupon, setCoupon] = useState("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
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

  const { data: deliveryData } = useGetDeliveryFee();
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
    totals.subtotal + delivery_fee + estimatedVat + charges - discountAmount;

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

  // Formik for billing
  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleChange,
    resetForm,
    setFieldValue,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      console.log("🛒 Creating billing with:", val);
      createBillingMutate(val, {
        onSuccess: () => {
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
          };

          console.log("🛒 Creating payment with:", paymentData);

          createPaymentMutate(paymentData, {
            onSuccess: (data) => {
              setShowCheckoutModal(false);
              resetForm();
              setCoupon("");
              payWithPaystack({
                amount: finalTotal,
                payment_id: data?.data?.data?.payment_id,
              });
            },
            onError: (error) => {
              toastError("Failed to create payment");
              console.error("Payment creation error:", error);
            },
          });
        },
        onError: (error) => {
          toastError("Failed to create billing");
          console.error("Billing error:", error);
        },
      });
    },
  });

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
                        {formatPrice(delivery_fee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>VAT (7.5%)</span>
                      <span className="text-green-600 font-semibold">
                        {formatPrice(estimatedVat)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Service Charge</span>
                      <span className="text-green-600 font-semibold">
                        {formatPrice(charges)}
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
                    onClick={() => setShowCheckoutModal(true)}
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

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Billing Information
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <Select
                  options={nigeriaStates}
                  value={nigeriaStates.find(
                    (state) => state.value === values.state,
                  )}
                  onChange={(option) =>
                    setFieldValue("state", option?.value || "")
                  }
                  placeholder="Select state"
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={values.postal_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Order Total
                </h4>
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-purple-600">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-4">
                <input
                  type="checkbox"
                  id="agree-policy"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="agree-policy" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={handleAgreementClick}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    terms and conditions
                  </button>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !agreedToPolicy || billingPending || createPaymentPending
                  }
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {billingPending || createPaymentPending
                    ? "Processing..."
                    : "Place Order"}
                </button>
              </div>
            </form>
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
