import { useEffect, useState } from "react";
import Breadcrumb from "./components/Breadcrumb";
import useGetCart from "../../hooks/cart/useGetCart";
import LoaderComponent from "../../components/BeatLoader";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useDeleteCart from "../../hooks/cart/useDeleteCart";
import useCreatePayment from "../../hooks/cart/useCreatePayment";
import { useCarybinUserStore } from "../../store/carybinUserStore";
import useVerifyPayment from "../../hooks/cart/useVerifyPayment";
import { useCartStore } from "../../store/carybinUserCartStore";
import Cookies from "js-cookie";
import useToast from "../../hooks/useToast";
import { useFormik } from "formik";
import Select from "react-select";
import { nigeriaStates } from "../../constant";
import PhoneInput from "react-phone-input-2";
import useCreateBilling from "../../hooks/billing/useCreateBilling";
import useAddMultipleCart from "../../hooks/cart/useAddMultipleCart";
import useApplyCoupon from "../../hooks/coupon/useApplyCoupon";
import useGetDeliveryFee from "../../hooks/delivery/useGetDeleiveryFee";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
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
  const [total, setTotal] = useState(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const [newCategory, setNewCategory] = useState();

  const { data: cartData, isPending } = useGetCart();

  const items = useCartStore((state) => state.items);

  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const handleAgreementClick = (e) => {
    e.preventDefault();

    // Check if it's a mobile device (screen width less than 768px)
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // On mobile, open PDF directly in new tab
      // window.open(
      //   "https://gray-daphene-38.tiiny.site/Checkout-agreement.pdf",
      //   "_blank",
      // );
      setShowPolicyModal(true);
    } else {
      // On desktop, show modal
      setShowPolicyModal(true);
    }
  };

  const totalProductQuantity = items?.reduce(
    (total, item) => total + (item?.product?.quantity || 0),
    0,
  );

  const totalStyleQuantity = items?.reduce(
    (total, item) => total + (item?.product?.style?.measurement?.length || 0),
    0,
  );

  const totalQuantity = totalProductQuantity + totalStyleQuantity;

  const totalAmount =
    items?.reduce((total, item) => {
      return total + item?.product.quantity * item?.product?.price_at_time;
    }, 0) ?? 0;

  const totalStyleAmount =
    items?.reduce((total, item) => {
      const measurements = item?.product?.style?.measurement || [];
      const pricePerMeasurement = +item?.product?.style?.price_at_time || 0;

      return total + measurements.length * pricePerMeasurement;
    }, 0) ?? 0;

  const [discountedPrice, setDiscountedPrice] = useState("0");

  const { data } = useGetDeliveryFee();

  console.log(data?.data?.data?.delivery_fee, "fee");

  const delivery_fee = data?.data?.data?.delivery_fee ?? 0;

  console.log(delivery_fee);

  const estimatedVat = (totalAmount + totalStyleAmount) * 0.075;
  const charges = (totalAmount + totalStyleAmount) * 0.015;

  const updatedAmount =
    totalAmount +
    totalStyleAmount -
    discountedPrice +
    delivery_fee +
    estimatedVat +
    charges;

  const actualWithoutDiscountAmount = totalAmount + totalStyleAmount;

  const { isPending: deleteIsPending, deleteCartMutate } = useDeleteCart();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { isPending: createPaymentPending, createPaymentMutate } =
    useCreatePayment();

  const { isPending: applyCouponPending, applyCouponMutate } = useApplyCoupon();

  const { isPending: billingPending, createBillingMutate } = useCreateBilling();

  const { isPending: verifyPending, verifyPaymentMutate } = useVerifyPayment();

  const { isPending: addCartPending, addMultipleCartMutate } =
    useAddMultipleCart();

  const [verifyPayment, setVerifyPayment] = useState("");

  const { carybinUser } = useCarybinUserStore();

  const currentUrl = Cookies.get("currUserUrl");
  const token = Cookies.get("token");
  const location = useLocation();
  const { toastSuccess } = useToast();

  const navigate = useNavigate();

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
        // console.log(payment_id);
        setVerifyPayment(response?.reference);
        verifyPaymentMutate(
          {
            id: response?.reference,
          },
          {
            onSuccess: () => {
              useCartStore.getState().clearCart();

              setVerifyPayment("");
              navigate(`/${currentUrl}/orders`);
            },
          },
        );
        // 🔁 You can call your backend here to verify & process the payment
      },
      onClose: function () {
        alert("Payment window closed.");
      },
    });

    handler.openIframe();
  };

  const { toastError } = useToast();

  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleChange,
    resetForm,
    setFieldValue,
    // setFieldError,
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
      console.log(val);
      createBillingMutate(val, {
        onSuccess: () => {
          const purchases = [];

          const metadata = [];

          items.forEach((item) => {
            const product = item.product;

            if (product?.id) {
              purchases.push({
                purchase_id: product.id,
                quantity: product.quantity,
                purchase_type: product.type,
              });
            }

            if (product?.style?.id) {
              purchases.push({
                purchase_id: product.style.id,
                quantity: product?.style?.measurement?.length,
                purchase_type: product.style.type,
              });
            }
          });

          items.forEach((item) => {
            const product = item.product;

            if (product?.style?.id) {
              metadata.push({
                style_product_id: product.style.id,
                measurement: product?.style?.measurement,
              });
            }
          });

          console.log({
            purchases,
            metadata,
            amount: Math.round(updatedAmount),
            currency: "NGN",
            email: carybinUser?.email,
          });

          createPaymentMutate(
            {
              purchases,
              metadata,
              amount: Math.round(updatedAmount),
              currency: "NGN",
              coupon_code: coupon ?? undefined,
              email: carybinUser?.email,
            },
            {
              onSuccess: (data) => {
                setShowCheckoutModal(false);
                resetForm();
                setCoupon("");
                payWithPaystack({
                  amount: +updatedAmount,
                  payment_id: data?.data?.data?.payment_id,
                });
              },
            },
          );
        },
      });
    },
  });

  console.log(carybinUser);

  return (
    <>
      <Breadcrumb
        title="Cart"
        subtitle="Cart"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744104104/AoStyle/image_1_xxie9w.jpg"
      />
      {items?.length == 0 ? (
        <div className="  px-4 h-[80vh]  flex-row flex items-center justify-center border-2">
          {" "}
          <div className="space-y-8 flex flex-col items-center justify-center">
            <p className="font-semibold text-base">Your cart is empty</p>

            <Link
              to={`/marketplace`}
              className="bg-gradient text-white px-5 lg:px-6 py-2 lg:py-3 hover:bg-purple-600 transition"
            >
              Explore Product
            </Link>
          </div>
        </div>
      ) : (
        <div className="Resizer section px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">
                Shopping Cart
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {items?.length} {items?.length === 1 ? "item" : "items"} in your
                cart
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items - Left Side */}
              <div className="lg:col-span-2 space-y-4">
                {/* Desktop Headers */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-600">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {/* Cart Items */}
                {items?.map((item) => (
                  <div
                    key={item.cartId}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative"
                  >
                    {/* Delete Icon - Top Right */}
                    <button
                      onClick={() => {
                        setNewCategory(item?.cartId);
                        setIsAddModalOpen(true);
                      }}
                      className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                      title="Remove item"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-4 pr-8">
                      {/* Product Info */}
                      <div className="space-y-3">
                        {/* Style Section */}
                        {item?.product?.style?.type === "STYLE" ? (
                          <div className="flex itemscenter space-x-3">
                            <img
                              src={item?.product?.style?.image}
                              alt="Style"
                              className="w-16 h-20 object-cover rounded border flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {item?.product?.style?.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Style •{" "}
                                {item?.product?.style?.measurement?.length}{" "}
                                {item?.product?.style?.measurement?.length > 1
                                  ? "pieces"
                                  : "piece"}
                              </p>
                              <p className="text-sm font-medium text-purple-600 mt-1">
                                ₦
                                {item?.product?.style?.price_at_time?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center h-16">
                            <div className="text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded">
                              No style selected
                            </div>
                          </div>
                        )}

                        {/* Fabric Section */}
                        {item?.product?.type === "FABRIC" ? (
                          <div className="flex items-center space-x-3">
                            <img
                              src={item?.product?.image}
                              alt="Fabric"
                              className="w-16 h-16 object-cover rounded border flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {item?.product?.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Fabric • {item?.product?.quantity} yards
                              </p>
                              <p className="text-sm font-medium text-purple-600 mt-1">
                                ₦
                                {item?.product?.price_at_time?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center h-16">
                            <div className="text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded">
                              No fabric selected
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mobile Summary Row */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Quantity</p>
                          <p className="text-sm font-medium text-gray-900">
                            {(item?.product?.quantity || 0) +
                              (item?.product?.style?.measurement?.length ||
                                0)}{" "}
                            items
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Unit Price</p>
                          <p className="text-sm font-medium text-gray-900">
                            ₦
                            {Math.max(
                              item?.product?.price_at_time || 0,
                              item?.product?.style?.price_at_time || 0,
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-lg font-bold text-purple-600">
                            ₦
                            {(
                              (item?.product?.price_at_time || 0) *
                                (item?.product?.quantity || 0) +
                              (item?.product?.style?.measurement?.length || 0) *
                                (item?.product?.style?.price_at_time || 0)
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center pr-8">
                      {/* Product Info - Style & Fabric Combined */}
                      <div className="md:col-span-6">
                        <div className="space-y-3">
                          {/* Style Section */}
                          {item?.product?.style?.type === "STYLE" ? (
                            <div className="flex items-center space-x-3">
                              <img
                                src={item?.product?.style?.image}
                                alt="Style"
                                className="w-12 h-14 object-cover rounded border"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {item?.product?.style?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Style •{" "}
                                  {item?.product?.style?.measurement?.length}{" "}
                                  {item?.product?.style?.measurement?.length > 1
                                    ? "pieces"
                                    : "piece"}
                                </p>
                                <p className="text-sm font-medium text-purple-600">
                                  ₦
                                  {item?.product?.style?.price_at_time?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center h-14">
                              <div className="text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded">
                                No style selected
                              </div>
                            </div>
                          )}

                          {/* Fabric Section */}
                          {item?.product?.type === "FABRIC" ? (
                            <div className="flex items-center space-x-3">
                              <img
                                src={item?.product?.image}
                                alt="Fabric"
                                className="w-12 h-12 object-cover rounded border"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {item?.product?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Fabric • {item?.product?.quantity} yards
                                </p>
                                <p className="text-sm font-medium text-purple-600">
                                  ₦
                                  {item?.product?.price_at_time?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center h-12">
                              <div className="text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded">
                                No fabric selected
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2 text-center">
                        <div className="text-sm text-gray-900">
                          {(item?.product?.quantity || 0) +
                            (item?.product?.style?.measurement?.length || 0)}
                        </div>
                        <div className="text-xs text-gray-500">items</div>
                      </div>

                      {/* Unit Price */}
                      <div className="md:col-span-2 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ₦
                          {Math.max(
                            item?.product?.price_at_time || 0,
                            item?.product?.style?.price_at_time || 0,
                          ).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">per unit</div>
                      </div>

                      {/* Total */}
                      <div className="md:col-span-2 text-right">
                        <div className="text-lg font-semibold text-purple-600">
                          ₦
                          {(
                            (item?.product?.price_at_time || 0) *
                              (item?.product?.quantity || 0) +
                            (item?.product?.style?.measurement?.length || 0) *
                              (item?.product?.style?.price_at_time || 0)
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary - Right Side */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm sticky top-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Summary
                  </h3>

                  {/* Coupon Field */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Promo Code
                    </label>
                    <div className="flex w-full">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        disabled={!coupon}
                        onClick={() => {
                          if (!token || !carybinUser) {
                            toastSuccess(
                              "You need to have a Customer Account to apply coupon",
                            );
                            const currentPath =
                              location.pathname + location.search;
                            navigate(
                              `/login?redirect=${encodeURIComponent(
                                currentPath,
                              )}`,
                            );
                          } else {
                            applyCouponMutate(
                              {
                                email: carybinUser?.email,
                                code: coupon,
                                amount: (
                                  totalAmount + totalStyleAmount
                                )?.toString(),
                              },
                              {
                                onSuccess: (data) => {
                                  setDiscountedPrice(
                                    data?.data?.data?.discount,
                                  );
                                },
                                onError: () => {
                                  setDiscountedPrice("0");
                                },
                              },
                            );
                          }
                        }}
                        className="flex-shrink-0 disabled:cursor-not-allowed px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {applyCouponPending ? "Please wait..." : "Apply"}
                      </button>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        ₦{(totalAmount + totalStyleAmount)?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">
                        -₦
                        {discountedPrice
                          ? formatNumberWithCommas(discountedPrice ?? 0)
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-medium text-green-600">
                        ₦
                        {delivery_fee
                          ? formatNumberWithCommas(delivery_fee ?? 0)
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700 mt-2">
                      <span>Estimated sales VAT(7.5)</span>
                      <span>
                        <span className="font-medium text-green-600">
                          ₦
                          {estimatedVat
                            ? formatNumberWithCommas(estimatedVat ?? 0)
                            : 0}
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-700 mt-2">
                      <span>Charges(1.5)</span>
                      <span>
                        <span className="font-medium text-green-600">
                          ₦{charges ? formatNumberWithCommas(charges ?? 0) : 0}
                        </span>
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-gray-900">
                          Total
                        </span>
                        <span className="text-xl font-bold text-purple-600">
                          ₦
                          {updatedAmount
                            ? Math.round(updatedAmount).toLocaleString()
                            : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* CHECKBOX */}
                  <div className="flex items-center mt-2 mb-3">
                    <input
                      type="checkbox"
                      id="agreeToPolicy"
                      checked={agreedToPolicy}
                      onChange={() => setAgreedToPolicy((prev) => !prev)}
                      className="mr-2 accent-purple-600"
                    />
                    <label
                      htmlFor="agreeToPolicy"
                      className="text-sm text-gray-700 select-none"
                    >
                      I agree to the{" "}
                      <button
                        type="button"
                        className="font-semibold text-grey-600 hover:text-purple-600 hover:underline cursor-pointer"
                        onClick={handleAgreementClick}
                        tabIndex={0}
                      >
                        CARYBIN checkout policy
                      </button>
                    </label>
                  </div>
                  {/* Checkout Button */}
                  <button
                    onClick={() => {
                      if (!token || !carybinUser) {
                        toastSuccess(
                          "You need to have a Customer Account to make an order",
                        );
                        const currentPath = location.pathname + location.search;
                        navigate(
                          `/login?redirect=${encodeURIComponent(currentPath)}`,
                        );
                      } else if (carybinUser?.role?.role_id !== "user") {
                        toastSuccess(
                          "Access Denied, Create Customer Account to Proceed",
                        );
                        const currentPath = location.pathname + location.search;
                        navigate(
                          `/login?redirect=${encodeURIComponent(currentPath)}`,
                        );
                      } else {
                        const updatedItem = items?.map((item) => {
                          return {
                            product_id: item?.product?.id,
                            product_type: item?.product?.type,
                            quantity: item?.product?.quantity,
                            color: item?.product?.color,
                            style_product_id: item?.product?.style?.id,
                            measurements:
                              item?.product?.style?.measurement ?? undefined,
                          };
                        });

                        addMultipleCartMutate(
                          {
                            items: updatedItem,
                          },
                          {
                            onSuccess: () => {
                              setShowCheckoutModal(true);
                            },
                          },
                        );
                      }
                    }}
                    disabled={addCartPending || !agreedToPolicy}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addCartPending
                      ? "Processing..."
                      : `Proceed to Checkout • ₦${Math.round(
                          updatedAmount,
                        ).toLocaleString()}`}
                  </button>

                  {/* Trust Badges */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Secure Payment</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Free Returns</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Modal */}
          {showCheckoutModal && (
            <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 pt-20">
              <div className="bg-white rounded-lg p-6 w-full max-h-[80vh] overflow-y-auto max-w-3xl relative">
                <button
                  onClick={() => {
                    setShowCheckoutModal(false);
                    handleSubmit();
                  }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
                <h2 className="text-xl font-semibold mb-4">
                  Receiver’s Information
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* <div>
                    <label className="block text-sm text-black">
                      Delivery Address Option *
                      <select className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none">
                        <option>Chose from previously used address</option>
                        <option>Standard Delivery</option>
                        <option>Express Delivery</option>
                      </select>
                    </label>
                  </div> */}
                  {/* <div>
                    <label className="block text-sm text-black">
                      Name *
                      <input
                        type="text"
                        placeholder="Enter contact name"
                        className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none"
                        // required
                      />
                    </label>
                  </div> */}
                  {/* <div>
                    <label className="block text-sm text-black">
                      Email *
                      <input
                        type="email"
                        placeholder="Enter contact email"
                        className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none"
                        // required
                      />
                    </label>
                  </div> */}
                  {/* <div className="flex gap-4">
                    <div className="w-full">
                      <label className="block text-sm text-black">
                        Phone Number *
                        <PhoneInput
                          country={"ng"}
                          value={values.phone}
                          inputProps={{
                            name: "phone",
                            required: true,
                          }}
                          onChange={(value) => {
                            // Ensure `+` is included and validate
                            if (!value.startsWith("+")) {
                              value = "+" + value;
                            }
                            setFieldValue("phone", value);
                          }}
                          containerClass="w-full disabled:bg-gray-100"
                          dropdownClass="flex flex-col gap-2 text-black disabled:bg-gray-100"
                          buttonClass="bg-gray-100 !border !border-gray-100 hover:!bg-gray-100 disabled:bg-gray-100"
                          inputClass="!w-full px-2 font-sans disabled:bg-gray-100  !h-[50px] !py-2 border border-gray-300 !rounded-md focus:outline-none"
                        />
                      </label>
                    </div>
                  </div> */}
                  <div>
                    <label className="block text-sm text-black">
                      Country *
                      <Select
                        options={[{ value: "NG", label: "Nigeria" }]}
                        name="country"
                        value={[{ value: "NG", label: "Nigeria" }]?.find(
                          (opt) => opt.value === values.country,
                        )}
                        onChange={(selectedOption) =>
                          setFieldValue("country", selectedOption.value)
                        }
                        placeholder="Select"
                        className="p-1 w-full mt-1 border border-[#CCCCCC] outline-none rounded-lg"
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            border: "none",
                            boxShadow: "none",
                            outline: "none",
                            backgroundColor: "#fff",
                            "&:hover": {
                              border: "none",
                            },
                          }),
                          indicatorSeparator: () => ({
                            display: "none",
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />{" "}
                    </label>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-sm text-black">
                        State *
                        <Select
                          options={nigeriaStates}
                          name="state"
                          value={nigeriaStates?.find(
                            (opt) => opt.value === values.state,
                          )}
                          onChange={(selectedOption) =>
                            setFieldValue("state", selectedOption.value)
                          }
                          placeholder="Select"
                          className="p-1 w-full mt-1 border border-[#CCCCCC] outline-none rounded-lg"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              border: "none",
                              boxShadow: "none",
                              outline: "none",
                              backgroundColor: "#fff",
                              "&:hover": {
                                border: "none",
                              },
                            }),
                            indicatorSeparator: () => ({
                              display: "none",
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                          }}
                        />{" "}
                      </label>
                    </div>
                    <div className="w-1/2">
                      <label className="block text-sm text-black">
                        City*
                        <input
                          type="text"
                          placeholder="Enter your city"
                          className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none"
                          required
                          name={"city"}
                          value={values.city}
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-black">
                      Delivery Address *
                      <input
                        type="text"
                        placeholder="Enter your delivery address"
                        className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none"
                        required
                        name={"address"}
                        maxLength={150}
                        value={values.address}
                        onChange={handleChange}
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-black">
                      Postal Code *
                      <input
                        type="text"
                        placeholder="Postal code"
                        className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none"
                        required
                        name={"postal_code"}
                        value={values.postal_code}
                        onChange={handleChange}
                      />
                    </label>
                  </div>
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>SUBTOTAL</span>
                      <span>
                        NGN {(totalAmount + totalStyleAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-700">
                      <span className="">Discount</span>
                      <span className=" text-green-600">
                        -₦
                        {discountedPrice
                          ? formatNumberWithCommas(discountedPrice ?? 0)
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700 mt-2">
                      <span>DELIVERY FEE</span>
                      <span>
                        {" "}
                        ₦
                        {delivery_fee
                          ? formatNumberWithCommas(delivery_fee ?? 0)
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700 mt-2">
                      <span>Estimated sales VAT (7.5)</span>
                      <span>
                        ₦
                        {estimatedVat
                          ? formatNumberWithCommas(estimatedVat ?? 0)
                          : 0}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-700 mt-2">
                      <span>Charges(1.5)</span>
                      <span>
                        {" "}
                        ₦{charges ? formatNumberWithCommas(charges ?? 0) : 0}
                      </span>
                    </div>

                    <div className="flex justify-between text-lg font-medium text-gray-700 mt-2">
                      <span>TOTAL</span>
                      <span>
                        ₦
                        {updatedAmount
                          ? Math.round(updatedAmount).toLocaleString()
                          : 0}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={billingPending}
                    onClick={() => {
                      // const updatedCart = cartData?.data?.items?.map((item) => {
                      //   return {
                      //     purchase_id: item?.product_id,
                      //     quantity: item?.quantity,
                      //     purchase_type: item?.product_type,
                      //   };
                      // });
                      // createPaymentMutate(
                      //   {
                      //     purchases: updatedCart,
                      //     amount: totalAmount,
                      //     currency: "NGN",
                      //     email: carybinUser?.email,
                      //   },
                      //   {
                      //     onSuccess: (data) => {
                      //       payWithPaystack({
                      //         amount: totalAmount,
                      //         payment_id: data?.data?.data?.payment_id,
                      //       });
                      //     },
                      //   }
                      // );
                    }}
                    type="submit"
                    className="w-full cursor-pointer mt-6 py-3 bg-gradient text-white hover:from-purple-600 hover:to-pink-600 transition"
                  >
                    {billingPending || createPaymentPending
                      ? "Please wait..."
                      : "Proceed to Payment"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {isAddModalOpen && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setNewCategory(null);
              }}
            >
              <div
                className="bg-white rounded-xl p-6 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Remove Cart
                  </h2>
                  <button
                    onClick={() => {
                      setNewCategory(null);
                      setIsAddModalOpen(false);
                    }}
                    className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-[80vh] overflow-y-auto px-1">
                  {" "}
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Are you sure you want to Remove
                  </label>
                  <div className="flex justify-between mt-6 space-x-4">
                    <button
                      onClick={() => {
                        setNewCategory(null);
                        setIsAddModalOpen(false);
                      }}
                      className="w-full cursor-pointer bg-purple-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        removeFromCart(newCategory);
                        toastSuccess("Item removed from cart successfully.");
                        setIsAddModalOpen(false);
                      }}
                      className="w-full cursor-pointer bg-gradient text-white px-4 py-4 rounded-md text-sm font-medium"
                    >
                      {"Remove"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checkout Policy Modal */}
      {showPolicyModal && (
        <CheckoutPolicyModal
          open={showPolicyModal}
          onClose={() => setShowPolicyModal(false)}
        />
      )}
    </>
  );

  // Checkout Policy Modal Component
  function CheckoutPolicyModal({ open, onClose, agreementType = "checkout" }) {
    useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }

      const handleKeyDown = (event) => {
        if (!open) return;
        if (event.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open, onClose]);

    const isFabricVendor = agreementType === "fabric";
    const isTailor = agreementType === "tailor";
    const isCheckout = agreementType === "checkout";

    if (!open) return null;

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
                          styles providing necessary details such as selection
                          of fabrics, selection of tailor, measurements for
                          tailor, and proceeding to checkout.
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
                          including credit/debit cards, digital wallets, and
                          bank transfers.
                        </li>
                        <li>
                          Payment processing is handled by secure, third-party
                          payment gateways.
                        </li>
                        <li>
                          Customers will receive a payment confirmation email
                          within <strong>5 minutes</strong> of successful
                          payment.
                        </li>
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        2.3 Order Confirmation
                      </h4>
                      <p className="text-gray-700 mb-2 ml-4">
                        Once payment is confirmed, customers will receive an
                        order confirmation email with the following details:
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
                        Refunds will be issued to the original payment method
                        used during checkout.
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
                          Provide accurate order details and payment
                          information.
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
                          Payment disputes (e.g., unauthorized transactions)
                          must be reported to the platform within{" "}
                          <strong>48 hours</strong> of the transaction by
                          sending an email to accounts@carybin.com
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
                        Delays caused by third-party payment gateways or
                        logistics providers.
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
              ) : (
                // SLA Content (Fabric Vendor and Tailor)
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                      Service Level Agreement (SLA)
                    </h1>
                    <p className="text-lg text-gray-600">
                      {isTailor
                        ? "Between Carybin Limited and The Tailor"
                        : "Between Carybin Limited and Fabric Vendors"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      <strong>Effective Date:</strong> [Upon Sign Up]
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
                        <strong>
                          {isTailor ? "Tailors:" : "Fabric Vendors:"}
                        </strong>{" "}
                        {isTailor
                          ? "[Business Name as provided by vendor]"
                          : "[Insert Fabric Vendor Name/Business Name]"}
                      </li>
                    </ol>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      1. Purpose
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {isTailor
                        ? "This SLA defines the terms and conditions under which tailors will provide custom tailoring services to customers through the e-commerce platform. It outlines performance standards, responsibilities, and remedies for service failures."
                        : "This SLA defines the terms and conditions under which fabric vendors will supply fabrics to customers and tailors through the Carybin (Oastyles platform). It outlines performance standards, responsibilities, and remedies for service failures."}
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      2. Scope
                    </h3>
                    <p className="text-gray-700 mb-3">
                      This SLA covers the following services:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                      {isTailor ? (
                        <>
                          <li>Custom tailoring services for customers.</li>
                          <li>
                            Timely completion and delivery of tailored products.
                          </li>
                          <li>Quality assurance for tailored products.</li>
                          <li>
                            Communication with customers and the platform.
                          </li>
                        </>
                      ) : (
                        <>
                          <li>Supply of fabrics as per customer orders.</li>
                          <li>
                            Timely fulfillment and delivery of fabric orders.
                          </li>
                          <li>Quality assurance for supplied fabrics.</li>
                          <li>
                            Communication with customers and the platform.
                          </li>
                        </>
                      )}
                    </ul>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      3. Service Levels and Performance Metrics
                    </h3>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        3.1 Order Acknowledgment
                      </h4>
                      <p className="text-gray-700 ml-4">
                        {isTailor ? "Tailors" : "Fabric vendors"} must
                        acknowledge orders within <strong>2 hours</strong> of
                        receipt.
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        3.2 Order {isTailor ? "Completion" : "Fulfillment"} Time
                      </h4>
                      <p className="text-gray-700 mb-2 ml-4">
                        {isTailor
                          ? "Tailored products must be completed and ready for pickup/delivery within the agreed timeframe:"
                          : "Fabric orders must be filled and ready for pickup/delivery within the agreed timeframe:"}
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-8 text-gray-700">
                        {isTailor ? (
                          <>
                            <li>
                              <strong>Standard Orders:</strong> 7-10 business
                              days.
                            </li>
                            <li>
                              <strong>Express Orders:</strong> 3-5 business days
                              (if applicable).
                            </li>
                          </>
                        ) : (
                          <>
                            <li>
                              <strong>Standard Orders:</strong> 2 hours.
                            </li>
                            <li>
                              <strong>Express Orders:</strong> Immediately
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        3.3 Quality Standards
                      </h4>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                        {isTailor ? (
                          <>
                            <li>
                              Tailored products must meet the quality standards
                              agreed upon with the customer and the Platform
                              host.
                            </li>
                            <li>
                              A maximum of <strong>2% defect rate</strong> is
                              allowed (e.g., incorrect measurements, stitching
                              issues).
                            </li>
                          </>
                        ) : (
                          <>
                            <li>
                              Supplied fabrics must meet the quality standards
                              as uploaded on the platform.
                            </li>
                            <li>
                              Minimum defects are allowed (e.g., damage,
                              incorrect fabric type, or colour).
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        3.4 Communication
                      </h4>
                      <p className="text-gray-700 ml-4">
                        {isTailor ? "Tailors" : "Fabric vendors"} must respond
                        to customer inquiries or requests for updates within{" "}
                        <strong>12 hours</strong>
                        {isTailor ? "." : " through the customer service."}
                      </p>
                    </div>
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
                        <li>
                          Provide accurate customer orders and specifications to
                          the {isTailor ? "tailor" : "fabric vendor"}.
                        </li>
                        <li>
                          Handle customer complaints and disputes related to
                          platform issues.
                        </li>
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        4.2 {isTailor ? "Tailors" : "Fabric Vendors"}
                      </h4>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                        {isTailor ? (
                          <>
                            <li>
                              Deliver high-quality tailoring services within the
                              agreed timelines.
                            </li>
                            <li>
                              Communicate any delays or issues to customers and
                              the platform promptly.
                            </li>
                            <li>
                              Ensure accurate measurements and specifications
                              are followed.
                            </li>
                            <li>
                              Package tailored products securely for
                              pickup/delivery.
                            </li>
                          </>
                        ) : (
                          <>
                            <li>
                              Supply high-quality fabrics as per customer orders
                              and as uploaded on the platform.
                            </li>
                            <li>
                              Ensure timely fulfillment and delivery of fabric
                              orders.
                            </li>
                            <li>
                              Communicate any delays or issues to customer
                              service through the platform, WhatsApp, or contact
                              form promptly.
                            </li>
                            <li>
                              Package fabrics securely for pickup/delivery with
                              allocated official Carybin branding materials.
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      5. Dispute Resolution
                    </h3>
                    <p className="text-gray-700 leading-relaxed ml-4">
                      {isTailor
                        ? "Disputes related to tailoring (e.g., quality, delays) will be resolved through the platform's dispute resolution mechanism (Refer to term and conditions), and the Tailor hereby agrees, to have read, and therefore accepts the dispute resolution mechanism of the platform, and any decision given by the platform hosts."
                        : "Disputes related to fabric supply (e.g., quality, delays) will be resolved through the platforms despite the resolution mechanism and the fabric vendor hereby agrees to have read and therefore accepts the dispute resolution mechanism of the platform and any decision given by the platform hosts."}
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      6. Penalties and Remedies
                    </h3>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        6.1 Late Order {isTailor ? "Completion" : "Fulfillment"}
                      </h4>
                      <p className="text-gray-700 ml-4">
                        For orders {isTailor ? "completed" : "fulfilled"} after
                        the agreed time frame, the{" "}
                        {isTailor ? "tailor" : "fabric vendor"} will issue a{" "}
                        <strong>10% discount</strong> on the order value
                        {isTailor ? " to the customer" : ""}.
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        6.2 Defective {isTailor ? "Products" : "Fabrics"}
                      </h4>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                        <li>
                          Defective{" "}
                          {isTailor
                            ? "products will be repaired or replaced by the tailor"
                            : "fabrics will be replaced by the fabric vendor"}{" "}
                          at no additional cost to the customer.
                        </li>
                        <li>
                          If the defect cannot be resolved, the{" "}
                          {isTailor ? "tailor" : "fabric vendor"} will issue a{" "}
                          <strong>full refund</strong> for the order.
                        </li>
                        {!isTailor && (
                          <li>
                            Where the defective fabric is discovered by the
                            tailor or customer end, the cost of logistics is
                            applied to the vendor's account.
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        6.3 Failure to Communicate
                      </h4>
                      <p className="text-gray-700 ml-4">
                        Failure to respond to customer inquiries
                        {isTailor ? "" : " through the platform host"} within
                        the agreed timeframe will result in a{" "}
                        <strong>5% penalty</strong> on the order value.
                      </p>
                    </div>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      7. Termination
                    </h3>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                      <li>
                        This platform host reserves the right to terminate this
                        SLA may be terminated at any time with or without notice
                        to the {isTailor ? "Tailor" : "Fabric vendor"} provided
                        that the {isTailor ? "Tailor" : "Vendor"} is not being
                        owed by the platform.
                      </li>
                      <li>
                        Termination due to breach of terms will be immediate.
                      </li>
                    </ul>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      8. Amendments
                    </h3>
                    <p className="text-gray-700 leading-relaxed ml-4">
                      Any changes to this SLA must be communicated to the{" "}
                      {isTailor ? "Tailor" : "Fabric Vendor"} and asked to give
                      consent failure of which the{" "}
                      {isTailor ? "Tailor's" : "Vendor's"} account may be
                      suspended.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      9. Governing Law
                    </h3>
                    <p className="text-gray-700 ml-4">
                      This SLA is governed by the laws of{" "}
                      {isTailor
                        ? "the Federal Republic of Nigeria."
                        : "Federal Republic of Nigeria"}
                    </p>
                  </section>

                  {!isTailor && (
                    <section className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        10. Withdrawals
                      </h3>
                      <p className="text-gray-700 leading-relaxed ml-4">
                        The Fabric Vendor agrees to the platform's form policy
                        of withdrawals on bi-weekly basis but subjects to the
                        terms and conditions of the platform as maybe prescribed
                        from time to time
                      </p>
                    </section>
                  )}

                  <hr className="my-8 border-gray-300" />

                  <section className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {isTailor ? "10" : "11"}. Signatures
                    </h3>
                    <p className="text-gray-700 ml-4">
                      By ticking the box below, the{" "}
                      {isTailor ? "Vendor" : "Vendor"} agrees to these terms and
                      conditions outlined in this SLA.
                    </p>
                  </section>
                </>
              )}
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
};

export default CartPage;
