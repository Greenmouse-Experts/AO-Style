import { useState, useMemo } from "react";
import { GeneralTransactionComponent } from "../../../components/GeneralTransactionComponents";
import WalletPage from "./components/WalletPage";
import WithdrawalModal from "./components/WithdrawalModal";
import ViewWithdrawalsModal from "./components/ViewWithdrawalsModal";
import BarChartComponent from "../salesDashboard/components/BarChartComponent";
import useGetBusinessDetails from "../../../hooks/settings/useGetBusinessDetails";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import { useQuery } from "@tanstack/react-query";

export default function TransactionPage() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isViewWithdrawalsModalOpen, setIsViewWithdrawalsModalOpen] =
    useState(false);

  // ⭐ Step 1: Always fetch user profile first
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

  console.log("💰 TransactionPage - Business Wallet Object:", businessWallet);

  const handleWithdrawClick = () => {
    console.log("🎯 Opening withdrawal modal");
    setIsWithdrawModalOpen(true);
  };

  const handleViewAllClick = () => {
    console.log("👁️ Opening view all withdrawals modal");
    setIsViewWithdrawalsModalOpen(true);
  };

  const handleCloseWithdrawModal = () => {
    console.log("🚪 Closing withdrawal modal");
    setIsWithdrawModalOpen(false);
  };

  const handleCloseViewWithdrawalsModal = () => {
    console.log("🚪 Closing view withdrawals modal");
    setIsViewWithdrawalsModalOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 mb-6">
        <div className="lg:col-span-2">
          <BarChartComponent />
        </div>
        <div className="lg:col-span-1">
          <WalletPage
            onWithdrawClick={handleWithdrawClick}
            onViewAllClick={handleViewAllClick}
            // businessWallet={businessWallet}
            isLoading={isLoadingWallet}
          />
        </div>
      </div>
      <GeneralTransactionComponent hideWallet={true} />

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={handleCloseWithdrawModal}
        businessWallet={businessWallet}
      />

      {/* View All Withdrawals Modal */}
      <ViewWithdrawalsModal
        isOpen={isViewWithdrawalsModalOpen}
        onClose={handleCloseViewWithdrawalsModal}
      />
    </>
  );
}
