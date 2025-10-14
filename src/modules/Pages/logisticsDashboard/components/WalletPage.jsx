import { useState, useMemo } from "react";
import { FaEye, FaEyeSlash, FaArrowUp, FaArrowDown } from "react-icons/fa";
import useVendorSummaryStat from "../../../../hooks/analytics/useGetVendorSummmary";
import useFetchWithdrawal from "../../../../hooks/withdrawal/useFetchWithdrawal";
import { formatNumberWithCommas } from "../../../../lib/helper";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import useGetBusinessDetails from "../../../../hooks/settings/useGetBusinessDetails";

const WalletPage = ({
  onWithdrawClick,
  onViewAllClick,
  // ⭐ NEW: Receive data and loading states as props
  isLoading,
}) => {
  const {
    data: userProfile,
    isLoading: userProfileLoading,
    isFetching: userProfileFetching,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/auth/view-profile");
      console.log("THIS IS FROM THE SECOND ENDPOINT.", resp.data);
      return resp.data;
    },
  });

  // ⭐ Step 2: Check if user is an individual logistics agent
  const isIndividualAgent = useMemo(() => {
    return !!userProfile?.individual_agent_wallet
      ?.individual_logistics_agent_id;
  }, [userProfile]);

  console.log("🔍 Is Individual Agent:", isIndividualAgent);

  // ⭐ Step 3: Only fetch business details if NOT an individual agent
  const {
    data: businessData,
    error: businessError,
    isLoading: businessLoading,
    // isFetching: businessFetching,
  } = useGetBusinessDetails({
    enabled: !userProfileLoading && !isIndividualAgent, // ⭐ Conditional fetching
  });

  // ⭐ Step 4: Calculate loading state based on which query is active
  const isLoadingWallet =
    userProfileLoading ||
    userProfileFetching ||
    (!isIndividualAgent && businessLoading);

  console.log(
    "this is the user profile for the individual logistics agent",
    userProfile,
  );

  // ⭐ Step 5: Simplified wallet calculation
  const businessWallet = useMemo(() => {
    console.log("🔄 TransactionPage - Recalculating businessWallet");

    // Priority 1: Individual agent wallet (if they are an individual agent)
    if (isIndividualAgent) {
      const individualAgent = userProfile.individual_agent_wallet;
      console.log("✅ Using individual agent wallet");
      return {
        balance: individualAgent.balance ?? 0,
        currency: individualAgent.currency || "NGN",
      };
    }

    // Priority 2: Business wallet (only fetched if not individual agent)
    if (!businessError && businessData?.data?.business_wallet) {
      console.log("✅ Using business wallet");
      return {
        balance: businessData.data.business_wallet.balance ?? 0,
        currency: businessData.data.business_wallet.currency || "NGN",
      };
    }

    // Priority 3: User profile wallet balance (fallback for business users)
    if (
      userProfile?.wallet_balance !== undefined &&
      userProfile?.wallet_balance !== null
    ) {
      console.log("✅ Using user profile wallet balance");
      return {
        balance: userProfile.wallet_balance ?? 0,
        currency: "NGN",
      };
    }

    // Fallback
    console.log("⚠️ Using fallback wallet");
    return {
      balance: 0,
      currency: "NGN",
    };
  }, [userProfile, businessData, businessError, isIndividualAgent]);
  const [showBalance, setShowBalance] = useState(true);

  const { data: vendorSummary } = useVendorSummaryStat();
  const { data: withdrawalData } = useFetchWithdrawal({ limit: 10 });

  // Calculate total income from vendor summary
  const totalIncome = vendorSummary?.data?.total_revenue || 0;

  // Calculate total withdrawals from withdrawal data
  const totalWithdrawals = useMemo(() => {
    const total =
      withdrawalData?.data?.reduce((sum, withdrawal) => {
        if (
          withdrawal.status === "COMPLETED" ||
          withdrawal.status === "completed"
        ) {
          return sum + (withdrawal.amount || 0);
        }
        return sum;
      }, 0) || 0;

    return total;
  }, [withdrawalData]);

  // Get recent transaction for display
  const recentTransaction = withdrawalData?.data?.[0];

  // ⭐ Use balance from props (already calculated in parent)
  const balanceToShow = businessWallet?.balance ?? 0;

  return (
    <div className="bg-white p-6 rounded-xl lg:max-w-md md:max-w-auto mx-auto stagger-animation">
      {/* Wallet Header */}
      <div className="flex justify-between items-center mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold">Wallet</h2>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient text-white p-6 h-28 rounded-lg relative smooth-transition card-hover-scale">
        <p className="text-sm mb-3">TOTAL BALANCE</p>
        <h1 className="text-3xl font-bold animate-fade-in-up">
          {isLoading ? (
            <span className="inline-block animate-pulse">Loading...</span>
          ) : showBalance ? (
            `₦ ${formatNumberWithCommas(balanceToShow)}`
          ) : (
            "******"
          )}
        </h1>
        <button
          className="absolute top-6 right-6 text-white text-xl hover:scale-110 transition-transform duration-200 ease-in-out animate-pulse-scale"
          onClick={() => setShowBalance(!showBalance)}
          disabled={isLoading}
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
          className="border border-purple-600 w-full text-purple-600 px-6 py-4 rounded-lg font-light cursor-pointer hover:bg-purple-600 hover:text-white transform transition-all duration-300 ease-in-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onWithdrawClick}
          disabled={isLoading}
        >
          Withdraw
        </button>
        <button
          className="bg-purple-600 w-full text-white px-6 py-3 rounded-lg font-light cursor-pointer hover:bg-purple-700 hover:shadow-lg transform transition-all duration-300 ease-in-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onViewAllClick}
          disabled={isLoading}
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
