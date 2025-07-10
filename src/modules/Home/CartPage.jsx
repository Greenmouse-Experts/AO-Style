import { useState, useEffect } from "react";
import Breadcrumb from "./components/Breadcrumb";
import useGetCart from "../../hooks/cart/useGetCart";
import LoaderComponent from "../../components/BeatLoader";
import { useNavigate } from "react-router-dom";
import useDeleteCart from "../../hooks/cart/useDeleteCart";
import useCreatePayment from "../../hooks/cart/useCreatePayment";
import { useCarybinUserStore } from "../../store/carybinUserStore";
import useVerifyPayment from "../../hooks/cart/useVerifyPayment";

const CartPage = () => {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [total, setTotal] = useState(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const { data: cartData, isPending } = useGetCart();

  const totalQuantity = cartData?.data?.items?.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalAmount =
    cartData?.data?.items?.reduce((total, item) => {
      return total + item.quantity * item.price_at_time;
    }, 0) ?? 0;

  const { isPending: deleteIsPending, deleteCartMutate } = useDeleteCart();

  const { isPending: cartIsPending, createPaymentMutate } = useCreatePayment();

  const { isPending: verifyPending, verifyPaymentMutate } = useVerifyPayment();

  const [verifyPayment, setVerifyPayment] = useState("");

  const { carybinUser } = useCarybinUserStore();

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
              setVerifyPayment("");
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

  return (
    <>
      <Breadcrumb
        title="Cart Page"
        subtitle="Cart"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744104104/AoStyle/image_1_xxie9w.jpg"
      />
      {isPending ? (
        <div className="h-screen flex items-center">
          {" "}
          <LoaderComponent />
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
            {cartData?.data?.items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-300 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                {/* Style */}
                <div className="flex items-center gap-4 w-full md:w-1/3">
                  {item?.product?.type == "STYLE" ? (
                    <>
                      <img
                        src={item.style.image}
                        alt="Style"
                        className="w-20 h-24 object-cover rounded-md"
                      />
                      <div>
                        <p className="font-semibold">{item.style.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.style.qty}
                        </p>
                        <p className="text-purple-600 font-medium mt-1">
                          ₦{item.style.price.toLocaleString()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 italic">-</div>
                  )}
                </div>

                {/* Fabric */}
                <div className="flex items-center gap-4 w-full md:w-1/3">
                  {item?.product?.type == "FABRIC" ? (
                    <>
                      {/* <img
                        src={item.fabric.image}
                        alt="Fabric"
                        className="w-20 h-20 object-cover rounded-md"
                      /> */}
                      <div>
                        <p className="font-semibold">{item?.product?.name}</p>
                        <p className="text-sm text-gray-500">{item.quantity}</p>
                        <p className="text-purple-600 font-medium mt-1">
                          ₦{item?.price_at_time.toLocaleString()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 italic">-</div>
                  )}
                </div>

                {/* Total & Dropdown Action */}
                <div className="flex items-center justify-between w-full md:w-auto md:gap-16 relative">
                  <div className="text-purple-600 font-semibold">
                    ₦{item?.price_at_time * item.quantity}
                  </div>

                  <div className="relative ml-14 cursor-pointer">
                    <button
                      onClick={() =>
                        setDropdownOpen(
                          dropdownOpen === item.id ? null : item.id
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
                    {dropdownOpen === item.id && (
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
                            deleteCartMutate(
                              {
                                id: item?.id,
                              },
                              {
                                onSuccess: () => {
                                  setDropdownOpen(null);
                                },
                              }
                            );
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
                <span className="font-medium">₦{totalAmount}</span>
              </div>
              <div className="flex justify-between w-full max-w-md">
                <span className="font-light">Discount :</span>
                <span className="font-medium">₦0</span>
              </div>
              <div className="flex justify-between w-full max-w-md">
                <span className="font-light">Estimated Sales VAT (7.5%) :</span>
                <span className="font-medium">
                  ₦{Math.round(totalAmount * 0.075).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between w-full max-w-md">
                <span className="font-light">Delivery Fee :</span>
                <span className="font-medium">₦0</span>
              </div>
              <div className="flex justify-between w-full max-w-md">
                <span className="font-medium text-lg">Total :</span>
                <span className="font-medium text-lg">
                  ₦
                  {(
                    totalAmount + Math.round(totalAmount * 0.075)
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="flex justify-center mt-8">
              <button
                disabled={cartIsPending}
                onClick={() => {
                  const updatedCart = cartData?.data?.items?.map((item) => {
                    return {
                      purchase_id: item?.product_id,
                      quantity: item?.quantity,
                      purchase_type: item?.product_type,
                    };
                  });

                  createPaymentMutate(
                    {
                      purchases: updatedCart,
                      amount: totalAmount,
                      currency: "NGN",
                      email: carybinUser?.email,
                    },
                    {
                      onSuccess: (data) => {
                        payWithPaystack({
                          amount: totalAmount,
                          payment_id: data?.data?.data?.payment_id,
                        });
                      },
                    }
                  );
                  // console.log({
                  //   purchases: updatedCart,
                  //   amount: totalAmount + Math.round(totalAmount * 0.075),
                  //   currency: "NGN",
                  //   email: carybinUser?.email,
                  // });
                }}
                className="bg-gradient text-white font-medium px-16 py-3 cursor-pointer"
              >
                {cartIsPending
                  ? "Please wait..."
                  : `Checkout | ₦${(
                      totalAmount + Math.round(totalAmount * 0.075)
                    ).toLocaleString()}`}
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
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm text-black">
                      Delivery Address Option *
                      <select className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none">
                        <option>Chose from previously used address</option>
                        <option>Standard Delivery</option>
                        <option>Express Delivery</option>
                      </select>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-black">
                      Name *
                      <input
                        type="text"
                        placeholder="Enter contact name"
                        className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none"
                        required
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-black">
                      Email *
                      <input
                        type="email"
                        placeholder="Enter contact email"
                        className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none"
                        required
                      />
                    </label>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/3">
                      <label className="block text-sm text-black">
                        Phone Number *
                        <select className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none">
                          <option value="+234">🇳🇬 +234</option>
                          {/* Add more country codes as needed */}
                        </select>
                      </label>
                    </div>
                    <div className="w-2/3">
                      <label className="block text-sm text-black">
                        &nbsp;
                        <input
                          type="tel"
                          placeholder="Enter phone number"
                          className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none"
                          required
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-black">
                      Country *
                      <select className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none">
                        <option>Select an option</option>
                        <option>Nigeria</option>
                        {/* Add more countries as needed */}
                      </select>
                    </label>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-sm text-black">
                        State *
                        <select className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none">
                          <option>Select an option</option>
                          <option>Lagos</option>
                          {/* Add more states as needed */}
                        </select>
                      </label>
                    </div>
                    <div className="w-1/2">
                      <label className="block text-sm text-black">
                        Local Government *
                        <select className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none">
                          <option>Select an option</option>
                          <option>Ikeja</option>
                          {/* Add more local governments as needed */}
                        </select>
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
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-black">
                      Landmark/nearest bustop *
                      <input
                        type="text"
                        placeholder="Enter your nearest bustop"
                        className="mt-1 w-full p-3 border border-gray-300 rounded-md outline-none"
                        required
                      />
                    </label>
                  </div>
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>SUBTOTAL</span>
                      <span>NGN {total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700 mt-2">
                      <span>Estimated sales VAT (7.5)</span>
                      <span>
                        NGN {Math.round(total * 0.075).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700 mt-2">
                      <span>DELIVERY FEE</span>
                      <span>NGN 0</span>
                    </div>
                    <div className="flex justify-between text-lg font-medium text-gray-700 mt-2">
                      <span>TOTAL</span>
                      <span>
                        NGN{" "}
                        {(total + Math.round(total * 0.075)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-6 py-3 bg-gradient text-white hover:from-purple-600 hover:to-pink-600 transition"
                  >
                    Proceed to Payment
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CartPage;
