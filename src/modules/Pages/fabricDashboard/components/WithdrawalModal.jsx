import React, { useState, useEffect } from "react";
import { formatNumberWithCommas } from "../../../../lib/helper";
import useRequestWithdrawal from "../../../../hooks/withdrawal/useRequestWithdrawal";
import useToast from "../../../../hooks/useToast";
import useGetBusinessDetails from "../../../../hooks/settings/useGetBusinessDetails";

const WithdrawalModal = ({ isOpen, onClose, businessWallet }) => {
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState({});

  const { toastError, toastSuccess } = useToast();
  const { refetch: refetchBusinessDetails } = useGetBusinessDetails();

  const { isPending, requestWithdrawalMutate } = useRequestWithdrawal({
    onSuccess: () => {
      setAmount("");
      setErrors({});
      toastSuccess("Withdrawal request submitted successfully!");
      onClose();
      refetchBusinessDetails();
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    console.log("🔄 WithdrawalModal - Modal state changed, isOpen:", isOpen);
    if (!isOpen) {
      console.log("🧹 WithdrawalModal - Resetting form state");
      setAmount("");
      setErrors({});
    }
  }, [isOpen]);

  const validateAmount = (value) => {
    const numValue = parseFloat(value);
    const balance = businessWallet?.balance || 0;

    console.log("🔍 WithdrawalModal - Validating amount:", {
      value,
      numValue,
      balance,
      businessWallet,
    });

    if (!value || value.trim() === "") {
      console.log("❌ WithdrawalModal - Validation failed: Amount is required");
      return "Amount is required";
    }
    if (isNaN(numValue) || numValue <= 0) {
      console.log("❌ WithdrawalModal - Validation failed: Invalid amount");
      return "Please enter a valid amount";
    }
    if (numValue > balance) {
      console.log(
        "❌ WithdrawalModal - Validation failed: Insufficient balance",
      );
      return "Insufficient balance";
    }
    if (numValue < 20000) {
      console.log(
        "❌ WithdrawalModal - Validation failed: Below minimum amount",
      );
      return "Minimum withdrawal amount is ₦20,000";
    }
    console.log("✅ WithdrawalModal - Validation passed");
    return null;
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    console.log("⌨️ WithdrawalModal - Amount input changed:", value);
    setAmount(value);

    // Clear error when user starts typing
    if (errors.amount) {
      console.log("🧹 WithdrawalModal - Clearing previous amount error");
      setErrors({ ...errors, amount: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("🚀 WithdrawalModal - Form submission started");

    if (!navigator.onLine) {
      console.warn("🌐 WithdrawalModal - No internet connection");
      toastError("No internet connection. Please check your network.");
      return;
    }

    const amountError = validateAmount(amount);
    if (amountError) {
      console.log("❌ WithdrawalModal - Form validation failed:", amountError);
      setErrors({ amount: amountError });
      return;
    }

    const payload = {
      amount: parseFloat(amount),
      currency: businessWallet?.currency || "NGN",
    };
    console.log("📤 WithdrawalModal - Submitting withdrawal request:", payload);
    requestWithdrawalMutate(payload);
  };

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center z-50 transition-all duration-300 ease-out ${
        isOpen
          ? "opacity-100 backdrop-blur-sm bg-black/40 bg-opacity-30 visible"
          : "opacity-0 invisible"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          console.log("🚪 WithdrawalModal - Backdrop clicked, closing modal");
          onClose();
        }
      }}
    >
      <div
        className={`bg-white p-6 rounded-xl shadow-2xl w-full sm:w-[500px] max-h-[90vh] overflow-y-auto mx-4 transition-all duration-300 ease-out transform ${
          isOpen
            ? "scale-100 translate-y-0 opacity-100 animate-modal-in"
            : "scale-90 translate-y-8 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: isOpen ? "modalSlideIn 0.3s ease-out" : "none",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Withdrawal Request
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Submit a withdrawal from your wallet
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✕
          </button>
        </div>

        {/* Balance Display */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg mb-6 animate-fade-in-up">
          <p className="text-sm opacity-90">Available Balance</p>
          <p className="text-2xl font-bold">
            ₦ {formatNumberWithCommas(businessWallet?.balance ?? 0)}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Withdrawal Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-4 text-gray-500">₦</span>
              <input
                type="number"
                onChange={handleAmountChange}
                value={amount}
                placeholder="0.00"
                min="100"
                max={businessWallet?.balance || 0}
                step="0.01"
                disabled={isPending}
                className={`w-full pl-8 pr-4 py-4 border rounded-lg outline-none transition-all duration-300 ease-out disabled:bg-gray-100 disabled:cursor-not-allowed transform focus:scale-105 ${
                  errors.amount
                    ? "border-red-500 focus:ring-2 focus:ring-red-200 focus:shadow-lg animate-shake"
                    : "border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 focus:shadow-lg"
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.amount}
              </p>
            )}
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-gray-500">Minimum: ₦20,000</span>
              <button
                type="button"
                onClick={() =>
                  setAmount(businessWallet?.balance?.toString() || "0")
                }
                disabled={isPending || !businessWallet?.balance}
                className="text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
              >
                Use Max
              </button>
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

          {/* Processing Fee Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-500 mt-0.5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  Withdrawal Information
                </h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Processing time: 1-3 business days</li>
                  <li>
                    • Withdrawals will be sent to your registered bank account
                  </li>
                  <li>• Minimum withdrawal amount: ₦20,000</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            disabled={isPending || !amount || !!errors.amount}
            type="submit"
            className={`w-full py-4 rounded-lg font-medium text-lg transition-all duration-300 ease-out transform ${
              isPending || !amount || !!errors.amount
                ? "bg-gray-300 text-gray-500 cursor-not-allowed scale-100"
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl active:scale-95 button-hover-lift"
            }`}
          >
            {isPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              "Submit Withdrawal Request"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalModal;
