import React, { useState } from "react";
import { formatNumberWithCommas } from "../../../../lib/helper";
import useRequestWithdrawal from "../../../../hooks/withdrawal/useRequestWithdrawal";
import useToast from "../../../../hooks/useToast";

const WithdrawalModal = ({ isOpen, onClose, businessWallet }) => {
  const [amount, setAmount] = useState("");

  const { toastError } = useToast();

  const { isPending, requestWithdrawalMutate } = useRequestWithdrawal();

  return (
    isOpen && (
      <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg w-full sm:w-[500px]">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semi-bold">Withdrawal</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black rounded-full bg-gray-100 p-2"
            >
              ✕
            </button>
          </div>

          <p className="text-base mb-6 text-start">
            Fill in form to process your withdrawal
          </p>

          {/* Form */}
          <div className="space-y-6 text-start">
            <form action="">
              <div>
                <label className="block text-gray-700 mb-4">Amount</label>
                <input
                  type="number"
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                  value={amount}
                  placeholder="Enter the withdrawal amount"
                  className="w-full p-4 border border-gray-300 rounded-lg outline-none"
                  required
                />
                <div className="flex justify-end mt-1">
                  <span className="text-purple-500">
                    Available Amount :{" "}
                    {formatNumberWithCommas(businessWallet?.balance ?? 0)}
                  </span>
                </div>
              </div>

              {/* <div>
                <label className="block text-gray-700 mb-4">Deposit To :</label>
                <div className="border border-purple-300 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <span className="text-purple-600">
                          <svg
                            className="w-6 h-6"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M4 10h16v4H4z M4 7h16v2H4z M4 15h16v2H4z" />
                          </svg>
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">Access Bank</p>
                        <p className="text-gray-500">112-xxxx-xxxx</p>
                      </div>
                    </div>
                    <div>
                      <input
                        type="radio"
                        className="w-5 h-5 text-purple-600"
                        checked
                        required
                      />
                    </div>
                  </div>
                </div>
              </div> */}

              {/* <div>
                <button className="flex items-center text-purple-600 mt-4">
                  <span className="bg-purple-100 rounded-full p-1 mr-2">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 6v12M6 12h12" />
                    </svg>
                  </span>
                  Add New Account
                </button>
              </div> */}

              <button
                disabled={isPending}
                onClick={(e) => {
                  e.preventDefault();
                  if (!navigator.onLine) {
                    toastError(
                      "No internet connection. Please check your network."
                    );
                    return;
                  }
                  requestWithdrawalMutate({
                    amount: +amount,
                    currency: businessWallet?.currency,
                  });
                }}
                type="submit"
                className={`${
                  !amount || isPending
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                } w-full py-4 mt-6  rounded-lg font-medium`}
              >
                Withdraw
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  );
};

export default WithdrawalModal;
