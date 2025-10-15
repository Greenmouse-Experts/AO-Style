import { useMemo } from "react";
import useGetMarketRepProfile from "./useGetMarketRepProfile";
import useGetMarketRepPayments from "./useGetMarketRepPayments";
import useGetMarketRepAnalyticsSummary from "./useGetMarketRepAnalyticsSummary";
import useFetchWithdrawal from "../withdrawal/useFetchWithdrawal";

const useMarketRepWalletData = () => {
  // Fetch market rep profile and wallet data
  const {
    walletData,
    userProfile,
    isLoading: profileLoading,
    isError: profileError,
  } = useGetMarketRepProfile();

  // Fetch recent successful payments for income calculation
  const {
    paymentsData,
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useGetMarketRepPayments({
    payment_status: "SUCCESS",
    limit: 100, // Get more data for accurate income calculation
  });

  // Fetch analytics summary
  const {
    summaryData,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useGetMarketRepAnalyticsSummary();

  // Fetch withdrawal data
  const {
    data: withdrawalData,
    isLoading: withdrawalsLoading,
    isError: withdrawalsError,
  } = useFetchWithdrawal({ limit: 50 });

  // Calculate comprehensive wallet metrics
  const walletMetrics = useMemo(() => {
    console.log("🔧 WALLET METRICS: Calculating comprehensive data");

    // Current wallet balance from profile
    const currentBalance = parseFloat(walletData?.balance || 0);
    const currency = walletData?.currency || "NGN";

    // Calculate total income from successful payments
    const totalIncomeFromPayments =
      paymentsData?.data?.reduce((total, payment) => {
        if (payment.payment_status === "SUCCESS") {
          return total + parseFloat(payment.amount || 0);
        }
        return total;
      }, 0) || 0;

    // Get commission from analytics (fallback to payments calculation)
    const totalCommission = parseFloat(
      summaryData?.data?.total_commission || totalIncomeFromPayments
    );

    // Calculate total withdrawals
    const totalWithdrawals =
      withdrawalData?.data?.reduce((total, withdrawal) => {
        if (
          withdrawal.status === "COMPLETED" ||
          withdrawal.status === "completed"
        ) {
          return total + parseFloat(withdrawal.amount || 0);
        }
        return total;
      }, 0) || 0;

    // Recent transaction (most recent payment)
    const recentTransaction = paymentsData?.data?.[0] || null;

    // Withdrawal account info
    const withdrawalAccount = userProfile?.withdrawal_account || null;

    console.log("🔧 WALLET METRICS: Calculated values", {
      currentBalance,
      totalIncomeFromPayments,
      totalCommission,
      totalWithdrawals,
      currency,
      hasRecentTransaction: !!recentTransaction,
      hasWithdrawalAccount: !!withdrawalAccount,
    });

    return {
      currentBalance,
      totalIncome: totalCommission,
      totalWithdrawals,
      currency,
      recentTransaction,
      withdrawalAccount,
      // Additional metrics
      netEarnings: totalCommission - totalWithdrawals,
      pendingBalance: currentBalance,
    };
  }, [
    walletData,
    paymentsData,
    summaryData,
    withdrawalData,
    userProfile,
  ]);

  // Combined loading and error states
  const isLoading =
    profileLoading || paymentsLoading || analyticsLoading || withdrawalsLoading;

  const isError =
    profileError || paymentsError || analyticsError || withdrawalsError;

  // Helper functions for formatting
  const formatAmount = (amount, showCurrency = true) => {
    const formattedNumber = new Intl.NumberFormat("en-NG").format(amount || 0);
    return showCurrency ? `₦${formattedNumber}` : formattedNumber;
  };

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

  const getTransactionType = (transaction) => {
    if (!transaction) return "";
    if (transaction.purchase_type === "SUBSCRIPTION") {
      return transaction.subscription_plan?.name || "Subscription";
    } else if (transaction.purchase_type === "PRODUCT") {
      const item = transaction.purchase?.items?.[0];
      return item?.name || "Product Purchase";
    }
    return transaction.purchase_type || "Payment";
  };

  console.log("🔧 MARKET REP WALLET DATA: Hook return values", {
    isLoading,
    isError,
    walletBalance: walletMetrics.currentBalance,
    totalIncome: walletMetrics.totalIncome,
    totalWithdrawals: walletMetrics.totalWithdrawals,
  });

  return {
    // Core data
    walletMetrics,
    userProfile,

    // Raw data for advanced usage
    rawData: {
      walletData,
      paymentsData,
      summaryData,
      withdrawalData,
    },

    // Loading and error states
    isLoading,
    isError,

    // Helper functions
    formatAmount,
    formatDate,
    getTransactionType,

    // Individual loading states for granular control
    loadingStates: {
      profile: profileLoading,
      payments: paymentsLoading,
      analytics: analyticsLoading,
      withdrawals: withdrawalsLoading,
    },

    // Individual error states
    errorStates: {
      profile: profileError,
      payments: paymentsError,
      analytics: analyticsError,
      withdrawals: withdrawalsError,
    },
  };
};

export default useMarketRepWalletData;
