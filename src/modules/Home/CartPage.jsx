import { useState } from "react";
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

const initialValues = {
  address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "NG",
};

const CartPage = () => {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [total, setTotal] = useState(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const [newCategory, setNewCategory] = useState();

  const { data: cartData, isPending } = useGetCart();

  const items = useCartStore((state) => state.items);

  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const totalProductQuantity = items?.reduce(
    (total, item) => total + (item?.product?.quantity || 0),
    0
  );

  const totalStyleQuantity = items?.reduce(
    (total, item) => total + (item?.product?.style?.measurement?.length || 0),
    0
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

  const updatedAmount = totalAmount + totalStyleAmount;

  const { isPending: deleteIsPending, deleteCartMutate } = useDeleteCart();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { isPending: createPaymentPending, createPaymentMutate } =
    useCreatePayment();

  const { isPending: billingPending, createBillingMutate } = useCreateBilling();

  const { isPending: verifyPending, verifyPaymentMutate } = useVerifyPayment();

  const { isPending: addCartPending, addMultipleCartMutate } =
    useAddMultipleCart();

  const [verifyPayment, setVerifyPayment] = useState("");

  const { carybinUser } = useCarybinUserStore();

  const currentUrl = Cookies.get("currUserUrl");

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
          }
        );
        // 🔁 You can call your backend here to verify & process the payment
      },
      onClose: function () {
        alert("Payment window closed.");
      },
    });

    handler.openIframe();
  };

  const token = Cookies.get("token");

  const { toastSuccess } = useToast();

  const location = useLocation();

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
              email: carybinUser?.email,
            },
            {
              onSuccess: (data) => {
                setShowCheckoutModal(false);
                resetForm();
                payWithPaystack({
                  amount: Math.round(updatedAmount),
                  payment_id: data?.data?.data?.payment_id,
                });
              },
            }
          );
        },
      });
    },
  });

  console.log(items);

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
        <div className="Resizer section px-4">
          <h2 className="text-lg font-medium mb-6">Cart ({totalQuantity})</h2>

          <div className="hidden md:grid grid-cols-[4fr_2fr_2fr_1fr] gap-8 text-sm font-medium text-gray-500 mb-4">
            <div>STYLE</div>
            <div>FABRIC</div>
            <div className="text-right">TOTAL AMOUNT</div>
            <div className="text-right">ACTION</div>
          </div>

          <div className="space-y-6">
            {items?.map((item) => (
              <div
                key={item.cartId}
                className="border border-gray-300 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                {/* Style */}
                <div className="flex items-center gap-4 w-full md:w-1/3">
                  {item?.product?.style?.type == "STYLE" ? (
                    <>
                      <img
                        src={item?.product?.style?.image}
                        alt="Style"
                        className="w-20 h-24 object-cover rounded-md"
                      />
                      <div>
                        <p className="font-semibold">
                          {item?.product?.style?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          x {item?.product?.style?.measurement?.length}{" "}
                          {item?.product?.style?.measurement?.length > 1
                            ? "Pieces"
                            : "Piece"}
                        </p>
                        <p className="text-purple-600 font-medium mt-1">
                          ₦
                          {item?.product?.style?.price_at_time?.toLocaleString()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 italic">
                      Tailor Not Needed?
                    </div>
                  )}
                </div>

                {/* Fabric */}
                <div className="flex items-center gap-4 w-full md:w-1/3">
                  {item?.product?.type == "FABRIC" ? (
                    <>
                      <img
                        src={item?.product?.image}
                        alt="Fabric"
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div>
                        <p className="font-semibold">{item?.product?.name}</p>
                        <p className="text-sm text-gray-500">
                          x {item?.product?.quantity} yards
                        </p>
                        <p className="text-purple-600 font-medium mt-1">
                          ₦{item?.product?.price_at_time.toLocaleString()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 italic">
                      {" "}
                      Fabric Not Needed?
                    </div>
                  )}
                </div>

                {/* Total & Dropdown Action */}
                <div className="flex items-center justify-between w-full md:w-auto md:gap-16 relative">
                  <div className="text-purple-600 font-semibold">
                    ₦
                    {(
                      (item?.product?.price_at_time || 0) *
                        (item?.product?.quantity || 0) +
                      (item?.product?.style?.measurement?.length || 0) *
                        (item?.product?.style?.price_at_time || 0)
                    )?.toLocaleString()}
                  </div>

                  <div className="relative ml-14 cursor-pointer">
                    <button
                      onClick={() =>
                        setDropdownOpen(
                          dropdownOpen === item?.cartId ? null : item?.cartId
                        )
                      }
                      className="text-gray-600 hover:text-black cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="8"
                        viewBox="0 0 28 8"
                        fill="none"
                      >
                        <path
                          d="M1.48645 6.35355C2.1447 7.01181 2.9672 7.34 3.92 7.34C4.8511 7.34 5.65872 7.00839 6.31355 6.35355C6.9718 5.6953 7.3 4.8728 7.3 3.92C7.3 2.9672 6.9718 2.1447 6.31355 1.48645C5.65872 0.831614 4.8511 0.5 3.92 0.5C2.9672 0.5 2.1447 0.828195 1.48645 1.48645C0.828195 2.1447 0.5 2.9672 0.5 3.92C0.5 4.8728 0.828195 5.6953 1.48645 6.35355ZM11.1349 6.35355C11.7931 7.01181 12.6156 7.34 13.5684 7.34C14.4995 7.34 15.3072 7.00839 15.962 6.35355C16.6202 5.6953 16.9484 4.8728 16.9484 3.92C16.9484 2.9672 16.6202 2.1447 15.962 1.48645C15.3072 0.831614 14.4995 0.5 13.5684 0.5C12.6156 0.5 11.7931 0.828195 11.1349 1.48645C10.4766 2.1447 10.1484 2.9672 10.1484 3.92C10.1484 4.8728 10.4766 5.6953 11.1349 6.35355ZM20.7833 6.35355C21.4416 7.01181 22.2641 7.34 23.2169 7.34C24.148 7.34 24.9556 7.00839 25.6104 6.35355C26.2687 5.6953 26.5969 4.8728 26.5969 3.92C26.5969 2.9672 26.2687 2.1447 25.6104 1.48645C24.9556 0.831614 24.148 0.5 23.2169 0.5C22.2641 0.5 21.4416 0.828195 20.7833 1.48645C20.1251 2.1447 19.7969 2.9672 19.7969 3.92C19.7969 4.8728 20.1251 5.6953 20.7833 6.35355Z"
                          fill="#AB52EE"
                          stroke="white"
                        />
                      </svg>
                    </button>

                    {/* Dropdown */}
                    {dropdownOpen === item?.cartId && (
                      <div className="absolute cursor-pointer  right-0 mt-2 w-40 bg-white border shadow-lg rounded-lg z-50">
                        <button
                          onClick={() => {
                            // console.log(item);
                            // navigate("/shop-details", {
                            //   state: { info: item?.product?.id },
                            // });
                          }}
                          className="block cursor-pointer  px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            setNewCategory(item?.cartId);
                            setIsAddModalOpen(true);
                            setDropdownOpen(null);
                            // deleteCartMutate(
                            //   {
                            //     id: item?.id,
                            //   },
                            //   {
                            //     onSuccess: () => {
                            //       setDropdownOpen(null);
                            //     },
                            //   }
                            // );
                          }}
                          className="block cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 w-full text-left text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Field */}
          <div className="mt-10">
            <label className="block mb-2 text-sm text-gray-700">Coupon</label>
            <input
              type="text"
              placeholder="Enter coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="w-full max-w-sm border border-gray-300 outline-none rounded-lg p-3"
            />
          </div>

          {/* Summary */}
          <div className="mt-10 border-t border-gray-300 pt-6">
            <div className="flex flex-col w-full space-y-2 text-sm text-gray-700">
              <div className="flex justify-between w-full max-w-md">
                <span className="font-light">Sub-Total :</span>
                <span className="font-medium">
                  ₦{updatedAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between w-full max-w-md">
                <span className="font-light">Discount :</span>
                <span className="font-medium">₦0</span>
              </div>
              {/* <div className="flex justify-between w-full max-w-md">
                <span className="font-light">Estimated Sales VAT (7.5%) :</span>
                <span className="font-medium">
                  ₦{Math.round(updatedAmount * 0.075).toLocaleString()}
                </span>
              </div> */}
              <div className="flex justify-between w-full max-w-md">
                <span className="font-light">Delivery Fee :</span>
                <span className="font-medium">₦0</span>
              </div>
              <div className="flex justify-between w-full max-w-md">
                <span className="font-medium text-lg">Total :</span>
                <span className="font-medium text-lg">
                  ₦ {Math.round(updatedAmount).toLocaleString()}
                  {/* {(
                    updatedAmount + Math.round(updatedAmount * 0.075)
                  ).toLocaleString()} */}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="flex justify-center mt-8">
              <button
                // disabled={cartIsPending}
                onClick={() => {
                  if (!token) {
                    toastSuccess(
                      "You need to have a Customer Account to make an order"
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
                      }
                    );
                  }

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
                className="bg-gradient text-white font-medium px-16 py-3 cursor-pointer"
              >
                {addCartPending
                  ? "Please wait..."
                  : `Checkout | ₦${Math.round(updatedAmount).toLocaleString()}`}
              </button>
            </div>
          </div>

          {/* Checkout Modal */}
          {showCheckoutModal && (
            <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 pt-20">
              <div className="bg-white rounded-lg p-6 w-full max-h-[80vh] overflow-y-auto max-w-3xl relative">
                <button
                  onClick={() => setShowCheckoutModal(false)}
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
                          (opt) => opt.value === values.country
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
                            (opt) => opt.value === values.state
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
                      Deliver Address *
                      <input
                        type="text"
                        placeholder="Enter your delivery address"
                        className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none"
                        required
                        name={"address"}
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
                      <span>NGN {updatedAmount.toLocaleString()}</span>
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
    </>
  );
};

export default CartPage;
