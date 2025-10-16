import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaCopy,
  FaCheck,
} from "react-icons/fa";
import { useState } from "react";
import useGetPaymentDetails from "../../hooks/marketRep/useGetPaymentDetails";
import CaryBinApi from "../../services/CarybinBaseUrl";
import { useQuery } from "@tanstack/react-query";

// TypeScript interfaces removed for JS compatibility

const TransactionDetailsModal = ({ isOpen, onClose, transactionId, type }) => {
  const [copiedField, setCopiedField] = useState(null);

  // const { paymentDetails, isLoading, isError, refetch } = useGetPaymentDetails(
  //   transactionId,
  //   isOpen,
  // );

  const {
    data: paymentDetails,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [type === "withdrawal" ? "withdraw" : "payment", transactionId],
    queryFn: async () => {
      if (type === "withdrawal") {
        const resp = await CaryBinApi.get("/withdraw/details/" + transactionId);
        return resp.data;
      } else {
        const resp = await CaryBinApi.get(
          "/payment/my-payments/" + transactionId,
        );
        return resp.data;
      }
    },
    enabled: !!transactionId && isOpen,
  });

  console.log("This is the payment details", paymentDetails);
  // Copy to clipboard function
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString.replace(" ", "T"));
      return date.toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const transaction = paymentDetails?.data;

  // Helper: Render user info for both payment and withdrawal
  const renderUserInfo = (user) => (
    <div className="space-y-3">
      <h5 className="font-medium text-gray-900 border-b pb-2">
        User Information
      </h5>
      {user?.name && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium text-gray-900 text-sm">{user.name}</p>
          </div>
          <button
            onClick={() => copyToClipboard(user.name, "user_name")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {copiedField === "user_name" ? (
              <FaCheck className="h-4 w-4 text-green-500" />
            ) : (
              <FaCopy className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
      {user?.email && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900 text-sm">{user.email}</p>
          </div>
          <button
            onClick={() => copyToClipboard(user.email, "user_email")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {copiedField === "user_email" ? (
              <FaCheck className="h-4 w-4 text-green-500" />
            ) : (
              <FaCopy className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
      {user?.phone && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium text-gray-900 text-sm">{user.phone}</p>
          </div>
          <button
            onClick={() => copyToClipboard(user.phone, "user_phone")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {copiedField === "user_phone" ? (
              <FaCheck className="h-4 w-4 text-green-500" />
            ) : (
              <FaCopy className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
      {user?.id && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">User ID</p>
            <p className="font-medium text-gray-900 text-sm">{user.id}</p>
          </div>
          <button
            onClick={() => copyToClipboard(user.id, "user_id")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {copiedField === "user_id" ? (
              <FaCheck className="h-4 w-4 text-green-500" />
            ) : (
              <FaCopy className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
      {typeof user?.is_suspended === "boolean" && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Account Status</p>
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs ${
              user.is_suspended
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {user.is_suspended ? "Suspended" : "Active"}
          </span>
        </div>
      )}
      {user?.referral_source && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Referral Source</p>
          <p className="font-medium text-gray-900 text-sm">
            {user.referral_source}
          </p>
        </div>
      )}
    </div>
  );

  // Helper: Render withdrawal details
  const renderWithdrawalDetails = (transaction) => (
    <div className="space-y-6">
      {/* Withdrawal Status */}
      <div className="text-center bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-center mb-2">
          <div className="p-3 rounded-full bg-yellow-100">
            <FaArrowDown className="h-6 w-6 text-yellow-500" />
          </div>
        </div>
        <h4 className="text-2xl font-bold text-gray-900 mb-2">
          Withdrawal Details
        </h4>
        <p className="text-sm text-gray-600">
          {paymentDetails?.message || "Withdrawal information"}
        </p>
      </div>

      {/* Withdrawal Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-medium text-gray-900 text-sm">
              {transaction.amount} {transaction.currency || ""}
            </p>
          </div>
          <button
            onClick={() =>
              copyToClipboard(transaction.amount, "withdraw_amount")
            }
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {copiedField === "withdraw_amount" ? (
              <FaCheck className="h-4 w-4 text-green-500" />
            ) : (
              <FaCopy className="h-4 w-4" />
            )}
          </button>
        </div>
        {transaction.status && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs ${
                  transaction.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : transaction.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {transaction.status}
              </span>
            </div>
          </div>
        )}
        {transaction.created_at && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium text-gray-900 text-sm">
                {formatDate(transaction.created_at)}
              </p>
            </div>
          </div>
        )}
        {transaction.updated_at && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium text-gray-900 text-sm">
                {formatDate(transaction.updated_at)}
              </p>
            </div>
          </div>
        )}
        {transaction.reference && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Reference</p>
              <p className="font-medium text-gray-900 text-sm">
                {transaction.reference}
              </p>
            </div>
            <button
              onClick={() =>
                copyToClipboard(transaction.reference, "withdraw_reference")
              }
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {copiedField === "withdraw_reference" ? (
                <FaCheck className="h-4 w-4 text-green-500" />
              ) : (
                <FaCopy className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
        {transaction.notes && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Notes</p>
            <p className="font-medium text-gray-900 text-sm break-all">
              {typeof transaction.notes === "string"
                ? transaction.notes
                : JSON.stringify(transaction.notes.transfer_code)}
            </p>
          </div>
        )}
      </div>

      {/* User Info if available */}
      {(transaction.user || transaction.user_id) &&
        renderUserInfo(transaction.user || { id: transaction.user_id })}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          className="cursor-pointer flex-1 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="button"
          className="cursor-pointer flex-1 inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          onClick={() =>
            copyToClipboard(
              transaction?.user?.id || transaction.user_id || transactionId,
              "copy_all",
            )
          }
        >
          {copiedField === "copy_all" ? "Copied!" : "Copy ID"}
        </button>
      </div>
    </div>
  );

  // Helper: Render payment details (original)
  const renderPaymentDetails = (transaction) => (
    <div className="space-y-6">
      {/* Payment Status */}
      <div className="text-center bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-center mb-2">
          <div className="p-3 rounded-full bg-green-100">
            <FaArrowUp className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <h4 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Details
        </h4>
        <p className="text-sm text-gray-600">
          {paymentDetails?.message || "Payment information"}
        </p>
      </div>

      {/* User Information */}
      {transaction.user && renderUserInfo(transaction.user)}

      {/* Additional Payment Info */}
      {(transaction.subscription_plan || transaction.billing_info) && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900 border-b pb-2">
            Payment Details
          </h5>

          {transaction.subscription_plan && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Subscription Plan</p>
              <p className="font-medium text-blue-900 text-sm">
                {JSON.stringify(transaction.subscription_plan?.name)}
              </p>
            </div>
          )}

          {transaction.billing_info && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Billing Information</p>
              <p className="font-medium text-blue-900 text-sm">
                {JSON.stringify(transaction.billing_info)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          className="cursor-pointer flex-1 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="button"
          className="cursor-pointer flex-1 inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          onClick={() =>
            copyToClipboard(transaction?.user?.id || transactionId, "copy_all")
          }
        >
          {copiedField === "copy_all" ? "Copied!" : "Copy ID"}
        </button>
      </div>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Transaction Details
                  </Dialog.Title>
                  <button
                    type="button"
                    className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={onClose}
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">
                      Loading transaction details...
                    </p>
                  </div>
                )}

                {/* Error State */}
                {isError && (
                  <div className="text-center py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 mb-2">
                        Failed to load transaction details
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Transaction Details */}
                {!isLoading &&
                  !isError &&
                  transaction &&
                  (type === "withdrawal"
                    ? renderWithdrawalDetails(transaction)
                    : renderPaymentDetails(transaction))}

                {/* No Data State */}
                {!isLoading && !isError && !transaction && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No transaction details available
                    </p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TransactionDetailsModal;
