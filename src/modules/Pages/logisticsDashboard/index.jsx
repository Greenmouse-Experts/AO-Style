import { useState, useMemo } from "react";
import Cards from "./components/Cards";
import BarChartComponent from "./components/BarChartComponent";
import DoughnutChartComponent from "./components/DoughnutChartComponent";
import OrderRequests from "./components/OrderRequests";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import DashOrderRequests from "./components/DashOrderRequests";
import WithdrawalModal from "./components/WithdrawalModal";
import WalletPage from "./components/WalletPage";
import ViewWithdrawalsModal from "./components/ViewWithdrawalsModal";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import useGetBusinessDetails from "../../../hooks/settings/useGetBusinessDetails";

export default function LogisticsDashboard() {
  const { carybinUser } = useCarybinUserStore();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isViewWithdrawalsModalOpen, setIsViewWithdrawalsModalOpen] =
    useState(false);

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

  const currentYear = new Date().getFullYear();
  const {
    data: graphData,
    // Removed unused vars: isLoading: graphDataLoading, isFetching: graphDataFetching,
  } = useQuery({
    queryKey: ["logistics-graph"],
    queryFn: async () => {
      let resp = await CaryBinApi.get(
        `/vendor-analytics/logistics-monthly-revenue?year=${currentYear}`,
      );
      console.log("This is the grah endpoint", resp.data);
      return resp.data;
    },
  });

  const isIndividualAgent = useMemo(() => {
    return !!userProfile?.individual_agent_wallet
      ?.individual_logistics_agent_id;
  }, [userProfile]);

  // Fetch business details for businessWallet (mimic TransactionPage)
  const {
    data: businessData,
    error: businessError,
    isLoading: businessLoading,
    // isFetching: businessFetching,
  } = useGetBusinessDetails();

  // Memoize businessWallet construction (as in TransactionPage)
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

  return (
    <>
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-2xl font-medium mb-3">
          Welcome back, {carybinUser?.name} 👋
        </h1>
        <p className="text-gray-500">Another day to earn by delivering goods</p>
      </div>
      {/* <Cards />*/}
      {/* <OrderRequests />*/}
      <DashOrderRequests />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <BarChartComponent data={graphData?.data}/>
        </div>
        <div className="lg:col-span-1">
          {/* <DoughnutChartComponent />*/}
          <WalletPage
            onWithdrawClick={handleWithdrawClick}
            onViewAllClick={handleViewAllClick}
            businessWallet={businessWallet}
            isLoading={businessLoading}
          />
        </div>
      </div>
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
