import { useState } from "react";
import { FaEye, FaEyeSlash, FaArrowUp, FaArrowDown } from "react-icons/fa";

import useMarketRepWalletData from "../../../../hooks/marketRep/useMarketRepWalletData";
import TransactionDetailsModal from "../../../../components/modals/TransactionDetailsModal";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { useQuery } from "@tanstack/react-query";

const WalletPage = ({ onWithdrawClick, onViewAllClick }) => {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    walletMetrics,
    isError,
    formatAmount,
    getTransactionType,
    formatDate,
    loadingStates,
  } = useMarketRepWalletData();

  console.log("🏦 WalletPage - Using comprehensive wallet data");
  console.log("💰 WalletPage - Wallet Metrics:", walletMetrics);

  const {data: repSum, isFetching, isLoading: tailorStatsLoading} = useQuery({
    queryKey: ["rep-sum"],
    queryFn: async()=>{
      let response = await CaryBinApi.get(`/market-rep-analytics/summary`)
      console.log("This is the rep sum response", response)
      return response?.data?.data
    }
  })


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

  return (
    <div className="bg-white p-6 rounded-xl lg:max-w-md md:max-w-auto mx-auto stagger-animation">
      {/* Wallet Header */}
      <div className="flex justify-between items-center mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold">Wallet</h2>
        {/* <button className="bg-gray-100 px-3 py-1 rounded-md text-gray-700 text-sm">
          Monthly ▾
        </button> */}
      </div>
      {/* Balance Card */}
      <div className="bg-gradient text-white p-6 h-28 rounded-lg relative smooth-transition card-hover-scale">
        <p className="text-sm mb-3">TOTAL BALANCE</p>
        <h1 className="text-3xl font-bold animate-fade-in-up">
          {loadingStates.profile
            ? "Loading..."
            : showBalance
              ? formatAmount(walletMetrics?.currentBalance)
              : "******"}
        </h1>
        <button
          className="absolute top-6 right-6 text-white text-xl hover:scale-110 transition-transform duration-200 ease-in-out animate-pulse-scale"
          onClick={() => setShowBalance(!showBalance)}
        >
          {showBalance ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* Income & Withdrawal */}
      <div className="flex justify-between mt-6">
        <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 ease-in-out button-hover-lift">
          <div className="bg-green-100 p-4 rounded-full animate-smooth-bounce">
            <FaArrowUp className="text-green-500" />
          </div>
          <div>
            <p className="text-green-600 text-sm">INCOME</p>
            <p className="font-semibold animate-fade-in-up">
              {loadingStates.analytics
                ? "Loading..."
                : formatAmount(repSum?.total_income)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 ease-in-out button-hover-lift">
          <div className="bg-red-100 p-4 rounded-full animate-smooth-bounce">
            <FaArrowDown className="text-red-500" />
          </div>
          <div>
            <p className="text-red-600 text-sm">WITHDRAWALS</p>
            <p className="font-semibold animate-fade-in-up">
              {loadingStates.withdrawals
                ? "Loading..."
                : formatAmount(repSum?.total_withdrawals)}
            </p>
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      <div className="mt-6 text-center space-y-3">
        <button
          className="border border-purple-600 w-full text-purple-600 px-6 py-4 rounded-lg font-light cursor-pointer hover:bg-purple-600 hover:text-white transform transition-all duration-300 ease-in-out active:scale-95"
          onClick={onWithdrawClick}
        >
          Withdraw
        </button>
        <button
          className="bg-purple-600 w-full text-white px-6 py-3 rounded-lg font-light cursor-pointer hover:bg-purple-700 hover:shadow-lg transform transition-all duration-300 ease-in-out active:scale-95"
          onClick={onViewAllClick}
        >
          View All Withdrawals
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="mt-6">
        <p className="text-gray-500 text-sm">RECENT</p>
        {loadingStates.payments ? (
          <div className="flex justify-center items-center bg-gray-50 p-4 rounded-lg mt-2">
            <p className="text-gray-500 text-sm">Loading transactions...</p>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center bg-red-50 p-4 rounded-lg mt-2">
            <div className="text-center">
              <p className="text-red-600 text-sm">Error Occurred</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-1 text-xs text-blue-600 hover:underline"
              >
                Reload
              </button>
            </div>
          </div>
        ) : walletMetrics?.recentTransaction ? (
          <div
            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mt-2 hover:bg-gray-100 transition-all duration-300 ease-in-out card-hover-scale animate-slide-up cursor-pointer"
            onClick={() =>
              handleTransactionClick(walletMetrics.recentTransaction.id)
            }
          >
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-4 rounded-full animate-pulse-scale">
                <FaArrowUp className="text-green-500" />
              </div>
              <div>
                <p className="text-sm">
                  {getTransactionType(walletMetrics.recentTransaction)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(walletMetrics.recentTransaction.created_at)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">
                + {formatAmount(walletMetrics.recentTransaction.amount)}
              </p>
              <p className="text-xs text-green-500">
                {walletMetrics.recentTransaction.payment_status || "Success"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center bg-gray-50 p-4 rounded-lg mt-2 opacity-60 animate-fade-in-out">
            <p className="text-gray-500 text-sm">No recent transactions</p>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        transactionId={selectedTransactionId}
      />
    </div>
  );
};

export default WalletPage;
