import React, { useState } from "react";
import { formatNumberWithCommas } from "../../../../lib/helper";
import useFetchWithdrawal from "../../../../hooks/withdrawal/useFetchWithdrawal";
import { Search, X, Eye, Calendar, Filter } from "lucide-react";

const ViewWithdrawalsModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  console.log("👁️ ViewWithdrawalsModal - Component state:", {
    isOpen,
    searchTerm,
    statusFilter,
    currentPage,
  });

  const {
    data: withdrawalData,
    isLoading,
    refetch,
  } = useFetchWithdrawal({
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const withdrawals = withdrawalData?.data || [];
  const totalItems = withdrawalData?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  console.log("📊 ViewWithdrawalsModal - Withdrawal data:", {
    withdrawalData,
    withdrawals,
    totalItems,
    totalPages,
    isLoading,
  });

  const filteredWithdrawals = withdrawals.filter(
    (withdrawal) =>
      withdrawal.id
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      withdrawal.amount?.toString().includes(searchTerm) ||
      withdrawal.status?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  console.log("🔍 ViewWithdrawalsModal - Filtering results:", {
    originalCount: withdrawals.length,
    filteredCount: filteredWithdrawals.length,
    searchTerm,
    statusFilter,
  });

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      case "completed":
      case "success":
      case "approved":
        return "bg-green-100 text-green-600";
      case "failed":
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-600";
      case "processing":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusText = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "pending":
        return "Pending";
      case "completed":
      case "success":
        return "Completed";
      case "approved":
        return "Approved";
      case "failed":
        return "Failed";
      case "rejected":
        return "Rejected";
      case "cancelled":
        return "Cancelled";
      case "processing":
        return "Processing";
      default:
        return status || "Unknown";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center z-50 transition-all duration-300 ease-out ${
        isOpen
          ? "opacity-100 backdrop-blur-sm bg-black/40 bg-opacity-50 visible"
          : "opacity-0 invisible"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          console.log(
            "🚪 ViewWithdrawalsModal - Backdrop clicked, closing modal",
          );
          onClose();
        }
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden mx-4 transition-all duration-300 ease-out transform ${
          isOpen
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-90 translate-y-8 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: isOpen ? "modalSlideIn 0.3s ease-out" : "none",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              All Withdrawal Requests
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              View and track your withdrawal history
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  console.log(
                    "🔘 ViewWithdrawalsModal - Status filter changed to: all",
                  );
                  setStatusFilter("all");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${
                  statusFilter === "all"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:shadow-md"
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  console.log(
                    "🔘 ViewWithdrawalsModal - Status filter changed to: pending",
                  );
                  setStatusFilter("pending");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${
                  statusFilter === "pending"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:shadow-md"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => {
                  console.log(
                    "🔘 ViewWithdrawalsModal - Status filter changed to: completed",
                  );
                  setStatusFilter("completed");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${
                  statusFilter === "completed"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:shadow-md"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => {
                  console.log(
                    "🔘 ViewWithdrawalsModal - Status filter changed to: failed",
                  );
                  setStatusFilter("failed");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${
                  statusFilter === "failed"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:shadow-md"
                }`}
              >
                Failed
              </button>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search withdrawals..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => {
                  console.log(
                    "🔍 ViewWithdrawalsModal - Search term changed:",
                    e.target.value,
                  );
                  setSearchTerm(e.target.value);
                }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading withdrawals...</span>
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                <Eye size={96} className="mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                No Withdrawals Found
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "No withdrawals match your current filters."
                  : "You haven't made any withdrawal requests yet."}
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden lg:grid lg:grid-cols-6 gap-4 pb-4 border-b border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                <div>Request ID</div>
                <div>Amount</div>
                <div>Date</div>
                <div>Time</div>
                <div>Status</div>
                <div>Notes</div>
              </div>

              {/* Table Body */}
              <div className="space-y-4 mt-4">
                {filteredWithdrawals.map((withdrawal, index) => (
                  <div
                    key={withdrawal.id || index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:scale-105 transition-all duration-200 ease-in-out lg:grid lg:grid-cols-6 lg:gap-4 lg:items-center"
                  >
                    {/* Mobile Layout */}
                    <div className="lg:hidden space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Request ID
                          </p>
                          <p className="font-mono text-sm">
                            {withdrawal.id || `WR${index + 1}`}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            withdrawal.status,
                          )}`}
                        >
                          {getStatusText(withdrawal.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Amount
                          </p>
                          <p className="text-lg font-semibold text-gray-800">
                            ₦{formatNumberWithCommas(withdrawal.amount || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Date & Time
                          </p>
                          <p className="text-sm text-gray-800">
                            {formatDate(withdrawal.created_at)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(withdrawal.created_at)}
                          </p>
                        </div>
                      </div>

                      {withdrawal.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Notes
                          </p>
                          <p className="text-sm text-gray-700">
                            {withdrawal.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:contents">
                      <div className="font-mono text-sm text-gray-700">
                        {withdrawal.id || `WR${index + 1}`}
                      </div>
                      <div className="text-lg font-semibold text-gray-800">
                        ₦{formatNumberWithCommas(withdrawal.amount || 0)}
                      </div>
                      <div className="text-sm text-gray-700">
                        {formatDate(withdrawal.created_at)}
                      </div>
                      <div className="text-sm text-gray-700">
                        {formatTime(withdrawal.created_at)}
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            withdrawal.status,
                          )}`}
                        >
                          {getStatusText(withdrawal.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        {withdrawal.notes || "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <button
                    onClick={() => {
                      const newPage = Math.max(1, currentPage - 1);
                      console.log(
                        "⬅️ ViewWithdrawalsModal - Previous page clicked, new page:",
                        newPage,
                      );
                      setCurrentPage(newPage);
                    }}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200 ease-in-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            console.log(
                              "📄 ViewWithdrawalsModal - Page number clicked:",
                              pageNum,
                            );
                            setCurrentPage(pageNum);
                          }}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 ${
                            currentPage === pageNum
                              ? "bg-purple-600 text-white shadow-lg"
                              : "text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 hover:shadow-md"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      const newPage = Math.min(totalPages, currentPage + 1);
                      console.log(
                        "➡️ ViewWithdrawalsModal - Next page clicked, new page:",
                        newPage,
                      );
                      setCurrentPage(newPage);
                    }}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200 ease-in-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {filteredWithdrawals.length > 0 && (
              <>
                Showing {filteredWithdrawals.length} of {totalItems} withdrawal
                requests
              </>
            )}
          </div>
          <button
            onClick={() => {
              console.log("🔄 ViewWithdrawalsModal - Refresh button clicked");
              refetch();
            }}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-purple-600 bg-white border border-purple-600 rounded-lg hover:bg-purple-50 hover:scale-105 transition-all duration-200 ease-in-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                Refreshing...
              </div>
            ) : (
              "Refresh"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewWithdrawalsModal;
