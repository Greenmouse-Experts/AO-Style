import { useState } from "react";
import { FaEye, FaEyeSlash, FaArrowUp, FaArrowDown } from "react-icons/fa";

import useGetBusinessDetails from "../../../../hooks/settings/useGetBusinessDetails";
import useVendorSummaryStat from "../../../../hooks/analytics/useGetVendorSummmary";
import useFetchWithdrawal from "../../../../hooks/withdrawal/useFetchWithdrawal";
import { formatNumberWithCommas } from "../../../../lib/helper";

const WalletPage = ({ onWithdrawClick, onViewAllClick }) => {
  const [showBalance, setShowBalance] = useState(true);

  const { data: businessData } = useGetBusinessDetails();
  const { data: vendorSummary } = useVendorSummaryStat();
  const { data: withdrawalData } = useFetchWithdrawal({ limit: 10 });

  console.log("🏦 WalletPage - Business Data:", businessData);
  console.log("📊 WalletPage - Vendor Summary:", vendorSummary);
  console.log("💸 WalletPage - Withdrawal Data:", withdrawalData);

  const businessWallet = businessData?.data?.business_wallet?.balance;
  console.log("💰 WalletPage - Business Wallet Balance:", businessWallet);

  // Calculate total income from vendor summary
  const totalIncome = vendorSummary?.data?.total_revenue || 0;
  console.log("📈 WalletPage - Total Income Calculated:", totalIncome);

  // Calculate total withdrawals from withdrawal data
  const totalWithdrawals =
    withdrawalData?.data?.reduce((sum, withdrawal) => {
      if (
        withdrawal.status === "COMPLETED" ||
        withdrawal.status === "completed"
      ) {
        return sum + (withdrawal.amount || 0);
      }
      return sum;
    }, 0) || 0;
  console.log(
    "💸 WalletPage - Total Withdrawals Calculated:",
    totalWithdrawals,
  );
  console.log(
    "🧮 WalletPage - Withdrawal Data for Calculation:",
    withdrawalData?.data,
  );

  // Get recent transaction for display
  const recentTransaction = withdrawalData?.data?.[0];
  console.log("🕒 WalletPage - Recent Transaction:", recentTransaction);

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
          {showBalance
            ? `₦ ${formatNumberWithCommas(businessWallet ?? 0)}`
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
              ₦ {formatNumberWithCommas(totalIncome)}
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
              ₦ {formatNumberWithCommas(totalWithdrawals)}
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
        {recentTransaction ? (
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mt-2 hover:bg-gray-100 transition-all duration-300 ease-in-out card-hover-scale animate-slide-up">
            <div className="flex items-center gap-2">
              <div className="bg-red-100 p-4 rounded-full animate-pulse-scale">
                <FaArrowDown className="text-red-500" />
              </div>
              <div>
                <p className="text-sm">Withdrawal Request</p>
                <p className="text-xs text-gray-500">
                  {recentTransaction.created_at
                    ? new Date(recentTransaction.created_at).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        },
                      )
                    : "Recent"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-red-600">
                - ₦ {formatNumberWithCommas(recentTransaction.amount || 0)}
              </p>
              <p
                className={`text-xs ${
                  recentTransaction.status === "COMPLETED" ||
                  recentTransaction.status === "completed"
                    ? "text-green-500"
                    : recentTransaction.status === "PENDING" ||
                        recentTransaction.status === "pending"
                      ? "text-yellow-500"
                      : "text-red-500"
                }`}
              >
                {recentTransaction.status === "PENDING" ||
                recentTransaction.status === "pending"
                  ? "Pending"
                  : recentTransaction.status === "COMPLETED" ||
                      recentTransaction.status === "completed"
                    ? "Completed"
                    : "Failed"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center bg-gray-50 p-4 rounded-lg mt-2 opacity-60 animate-fade-in-out">
            <p className="text-gray-500 text-sm">No recent transactions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
