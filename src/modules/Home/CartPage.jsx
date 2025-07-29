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
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react";

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

  const [discountedPrice, setDiscountedPrice] = useState("");

  const updatedAmount = totalAmount + totalStyleAmount - discountedPrice;

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
                              }
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
                        -₦{discountedPrice}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700 mt-2">
                      <span>Estimated sales VAT</span>
                      <span>
                        <span className="font-medium text-green-600">₦0</span>
                      </span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-700 mt-2">
                      <span>Charges</span>
                      <span>
                        <span className="font-medium text-green-600">₦0</span>
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-gray-900">
                          Total
                        </span>
                        <span className="text-xl font-bold text-purple-600">
                          ₦{Math.round(updatedAmount).toLocaleString()}
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
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPolicyModal(true);
                        }}
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
                          "Access Denied, Create Customer Account to Proceed"
                        );
                        const currentPath = location.pathname + location.search;
                        navigate(
                          `/login?redirect=${encodeURIComponent(currentPath)}`
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
                        -₦{discountedPrice}
                      </span>
                    </div>
                    {/* <div className="flex justify-between text-sm text-gray-700 mt-2">
                      <span>Estimated sales VAT (7.5)</span>
                      <span>
                        NGN {Math.round(updatedAmount).toLocaleString()}
                      </span>
                    </div> */}
                    <div className="flex justify-between text-sm text-gray-700 mt-2">
                      <span>DELIVERY FEE</span>
                      <span>NGN 0</span>
                    </div>
                    <div className="flex justify-between text-lg font-medium text-gray-700 mt-2">
                      <span>TOTAL</span>
                      <span>
                        NGN ₦{Math.round(updatedAmount).toLocaleString()}
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
  function CheckoutPolicyModal({ open, onClose }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(100);

    useEffect(() => {
      if (open) {
        setIsLoading(true);
        setError(null);
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }

      const handleKeyDown = (event) => {
        if (!open) return;

        switch (event.key) {
          case "Escape":
            onClose();
            break;
          case "=":
          case "+":
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              handleZoomIn();
            }
            break;
          case "-":
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              handleZoomOut();
            }
            break;
          default:
            break;
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open]);

    const handleDownload = () => {
      const link = document.createElement("a");
      link.href = "https://gray-daphene-38.tiiny.site/Checkout-agreement.pdf";
      link.download = "Checkout-agreement.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleZoomIn = () => {
      setZoom((prev) => Math.min(prev + 25, 200));
    };

    const handleZoomOut = () => {
      setZoom((prev) => Math.max(prev - 25, 50));
    };

    const toggleFullscreen = () => {
      setIsFullscreen(!isFullscreen);
    };

    const handleIframeLoad = () => {
      setIsLoading(false);
    };

    const handleIframeError = () => {
      setIsLoading(false);
      setError("Failed to load PDF. Please try downloading the file instead.");
    };

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-[9999] bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-300 ${
            isFullscreen ? "w-full h-full" : "w-full max-w-6xl h-[90vh]"
          }`}
        >
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
                animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1);
              }
            `}
          </style>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-[#2B21E5] truncate">
                CARYBIN Checkout Policy
              </h2>
              <span className="text-sm text-gray-500">{zoom}%</span>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Zoom Out"
                disabled={zoom <= 50}
              >
                <ZoomOut
                  size={18}
                  className={zoom <= 50 ? "text-gray-400" : "text-gray-600"}
                />
              </button>

              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Zoom In"
                disabled={zoom >= 200}
              >
                <ZoomIn
                  size={18}
                  className={zoom >= 200 ? "text-gray-400" : "text-gray-600"}
                />
              </button>

              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Download PDF"
              >
                <Download size={18} className="text-gray-600" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 size={18} className="text-gray-600" />
                ) : (
                  <Maximize2 size={18} className="text-gray-600" />
                )}
              </button>

              <button
                onClick={onClose}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                title="Close"
              >
                <X size={18} className="text-red-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B21E5]"></div>
                  <p className="text-gray-600">Loading PDF...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                  <div className="text-red-500 text-xl">⚠️</div>
                  <p className="text-gray-600 max-w-md">{error}</p>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-[#2B21E5] text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Download PDF Instead
                  </button>
                </div>
              </div>
            )}

            <div
              className="w-full h-full overflow-auto"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top left",
                width: `${10000 / zoom}%`,
                height: `${10000 / zoom}%`,
              }}
            >
              <iframe
                src={`https://gray-daphene-38.tiiny.site/Checkout-agreement.pdf#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
                className="w-full h-full border-0"
                title="CARYBIN Checkout Policy"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{
                  minHeight: "600px",
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t bg-gray-50 text-sm text-gray-500 rounded-b-lg">
            <div className="flex items-center space-x-4">
              <span>Use mouse wheel or zoom controls to adjust size</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Press ESC to close • Ctrl/Cmd + Plus/Minus to zoom</span>
              <button
                onClick={onClose}
                className="bg-gradient text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default CartPage;
