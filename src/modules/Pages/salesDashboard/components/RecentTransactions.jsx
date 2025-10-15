import { useState } from "react";
import { FaArrowUp, FaArrowDown, FaEllipsisH } from "react-icons/fa";
import useGetMarketRepPayments from "../../../../hooks/marketRep/useGetMarketRepPayments";
import TransactionDetailsModal from "../../../../components/modals/TransactionDetailsModal";
import { formatNumberWithCommas } from "../../../../lib/helper";

const RecentTransactions = () => {
  const [selectedFilter, setSelectedFilter] = useState("SUCCESS");
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { paymentsData, isLoading, isError, refetch } = useGetMarketRepPayments(
    {
      payment_status: selectedFilter,
      limit: 10,
    },
  );
  console.log(paymentsData);
  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString.replace(" ", "T"));
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // Get transaction type display name
  const getTransactionType = (transaction) => {
    if (!transaction) return "Unknown";

    if (transaction.purchase_type === "SUBSCRIPTION") {
      return transaction.subscription_plan?.name || "Subscription";
    } else if (transaction.purchase_type === "PRODUCT") {
      const item = transaction.purchase?.items?.[0];
      return item?.name || "Product Purchase";
    }
    return transaction.purchase_type || "Payment";
  };

  // Format amount with currency
  const formatAmount = (amount, currency = "NGN") => {
    const symbol = currency === "NGN" ? "₦" : "$";
    return `${symbol} ${formatNumberWithCommas(amount || 0)}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return "bg-green-100 text-green-600";
      case "PENDING":
        return "bg-yellow-100 text-yellow-600";
      case "FAILED":
        return "bg-red-100 text-red-600";
      case "CANCELLED":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const filterOptions = [
    { value: "SUCCESS", label: "Success" },
    { value: "PENDING", label: "Pending" },
    { value: "FAILED", label: "Failed" },
    { value: "", label: "All" },
  ];

  // Handle transaction click
  const handleTransactionClick = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTransactionId(null);
  };

  if (isError) {
    return (
      <div className="bg-white p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">Error Occurred</p>
          <button
            onClick={() => refetch()}
            className="text-blue-600 hover:underline text-sm"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <h2 className="text-lg font-semibold">Transactions</h2>

        {/* Filter Dropdown */}
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-purple-500"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading transactions...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading &&
        (!paymentsData?.data || paymentsData.data.length === 0) && (
          <div className="text-center py-8">
            <FaArrowUp className="text-gray-400 text-3xl mx-auto mb-2" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}

      {/* Transactions List */}
      {!isLoading && paymentsData?.data && paymentsData.data.length > 0 && (
        <div className="space-y-3">
          {paymentsData.data.map((transaction, index) => (
            <div
              key={transaction.id || index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => handleTransactionClick(transaction.id)}
            >
              {/* Transaction Info */}
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <FaArrowUp className="text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {getTransactionType(transaction)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {transaction.transaction_id || transaction.id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>

              {/* Amount and Status */}
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="font-semibold text-green-600">
                    + {formatAmount(transaction.amount, transaction.currency)}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(
                      transaction.payment_status,
                    )}`}
                  >
                    {transaction.payment_status || "Unknown"}
                  </span>
                </div>
                {/* <button
                  className="text-gray-400 hover:text-gray-600 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTransactionClick(transaction.id);
                  }}
                >
                  <FaEllipsisH />
                </button>*/}
              </div>
            </div>
          ))}

          {/* Show total count */}
          {paymentsData.count > paymentsData.data.length && (
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-500">
                Showing {paymentsData.data.length} of {paymentsData.count}{" "}
                transactions
              </p>
              <button
                onClick={() => {
                  /* Add pagination logic if needed */
                }}
                className="text-purple-600 hover:underline text-sm mt-1"
              >
                View More
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        transactionId={selectedTransactionId}
      />
    </div>
  );
};

export default RecentTransactions;
