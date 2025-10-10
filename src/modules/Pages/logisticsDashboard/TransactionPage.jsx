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

  const { data: businessData, error: businessError } = useGetBusinessDetails();
  const { data: userProfile, isLoading: userProfileLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/auth/view-profile");
      console.log("THIS IS FROM THE SECOND ENDPOINT.", resp.data);
      return resp.data;
    },
  });

  console.log(
    "this is the user profile for the individual logistics agent",
    userProfile,
  );

  // ✅ Use useMemo to recalculate wallet whenever data changes
  const businessWallet = useMemo(() => {
    console.log("🔄 TransactionPage - Recalculating businessWallet");

    const individualAgent = userProfile?.individual_agent_wallet;

    // Priority 1: Individual agent wallet
    if (
      individualAgent?.balance !== undefined &&
      individualAgent?.balance !== null
    ) {
      console.log("✅ Using individual agent wallet");
      return {
        balance: individualAgent.balance ?? 0,
        currency: individualAgent.currency || "NGN",
      };
    }

    // Priority 2: Business wallet (if no business error)
    if (!businessError && businessData?.data?.business_wallet) {
      console.log("✅ Using business wallet");
      return {
        balance: businessData.data.business_wallet.balance ?? 0,
        currency: businessData.data.business_wallet.currency || "NGN",
      };
    }

    // Priority 3: User profile wallet balance
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
  }, [userProfile, businessData, businessError]);

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
