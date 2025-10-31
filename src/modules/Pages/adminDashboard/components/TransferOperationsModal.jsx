import React, { useState } from "react";
import { FaTimes, FaSpinner } from "react-icons/fa";
import useInitiateTransfer from "../../../../hooks/withdrawal/useInitiateTransfer";
import useResendOtp from "../../../../hooks/withdrawal/useResendOtp";

const TransferOperationsModal = ({
  isOpen,
  onClose,
  operation,
  withdrawal,
  onConfirm,
  isLoading,
}) => {
  const [otp, setOtp] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  // Hook to allow resending (re-initiate) the transfer from inside this modal
  const { resendOtp, isPending: isResendPending } = useResendOtp();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (operation === "finalize" && !otp.trim()) {
      setError("OTP is required to finalize transfer");
      return;
    }

    const payload = {};
    if (operation === "initiate") {
      payload.withdrawalId = withdrawal.id;
    } else if (operation === "finalize") {
      payload.otp = otp.trim();
      payload.withdrawalId = withdrawal.id;
    }

    onConfirm(payload);
  };

  const handleClose = () => {
    setOtp("");
    setReference("");
    setError("");
    onClose();
  };

  const getTitle = () => {
    switch (operation) {
      case "initiate":
        return "Initiate Transfer";
      case "finalize":
        return "Finalize & Verify Transfer";
      default:
        return "Transfer Operation";
    }
  };

  const getDescription = () => {
    switch (operation) {
      case "initiate":
        return `Are you sure you want to initiate transfer for withdrawal ID: ${withdrawal?.id?.replace(/-/g, "")?.slice(0, 12)?.toUpperCase()}?`;
      case "finalize":
        return "Please enter the OTP received to finalize the transfer. The system will automatically verify the transfer after finalization.";
      default:
        return "Please confirm the operation.";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">{getTitle()}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-gray-100 rounded-full p-1 cursor-pointer"
            disabled={isLoading}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Withdrawal Info */}
        {withdrawal && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">
                  Withdrawal ID:
                </span>
                <p className="text-gray-900">{withdrawal.id?.replace(/-/g, "")?.slice(0, 12)?.toUpperCase()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Amount:</span>
                <p className="text-gray-900">
                  ₦
                  {withdrawal.rawAmount?.toLocaleString?.() ||
                    withdrawal.rawAmount ||
                    withdrawal.amount}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">User:</span>
                <p className="text-gray-900">
                  {withdrawal.user?.name || withdrawal.user?.email}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <p className="text-gray-900">{withdrawal.status}</p>
              </div>
              {withdrawal.bank_name && (
                <>
                  <div>
                    <span className="font-medium text-gray-600">Bank:</span>
                    <p className="text-gray-900">{withdrawal.bank_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Account:</span>
                    <p className="text-gray-900">{withdrawal.account_number}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Description */}
          <p className="text-gray-600 mb-4">{getDescription()}</p>

          {/* Input Fields */}
          {operation === "finalize" && (
            <div className="mb-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                OTP Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                maxLength={6}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {operation === "finalize" && (
              <button
                type="button"
                onClick={() => {
                  // Clear any existing error, then call initiateTransfer to resend the code
                  setError("");
                  if (!withdrawal?.id) {
                    setError("Invalid withdrawal ID for resend");
                    return;
                  }
                  resendOtp({ withdrawalId: withdrawal.id });
                }}
                className="px-4 py-2 text-gray-700 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-all duration-200 cursor-pointer font-medium flex items-center"
                disabled={isLoading || isResendPending}
              >
                {isResendPending && (
                  <FaSpinner className="animate-spin mr-2" size={16} />
                )}
                <span>Resend Code</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-all duration-200 cursor-pointer font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-md transition-all duration-200 flex items-center space-x-2 font-medium ${
                operation === "initiate"
                  ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}`}
              disabled={isLoading}
            >
              {isLoading && <FaSpinner className="animate-spin" size={16} />}
              <span>
                {isLoading
                  ? `${operation === "initiate" ? "Initiating" : "Finalizing & Verifying"}...`
                  : operation === "initiate"
                    ? "Initiate Transfer"
                    : "Finalize & Verify Transfer"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferOperationsModal;
