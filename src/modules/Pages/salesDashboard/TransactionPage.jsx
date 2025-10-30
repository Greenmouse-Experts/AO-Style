import { useState } from "react";
import { GeneralTransactionComponent } from "../../../components/GeneralTransactionComponents";
import WalletPage from "./components/WalletPage";
import WithdrawalModal from "./components/WithdrawalModal";
import ViewWithdrawalsModal from "./components/ViewWithdrawalsModal";
import BarChartComponent from "../salesDashboard/components/BarChartComponent";
import useGetBusinessDetails from "../../../hooks/settings/useGetBusinessDetails";
import Cards from "./components/Cards";
import useVendorSummaryStat from "../../../hooks/analytics/useGetVendorSummmary";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import { useQuery } from "@tanstack/react-query";
import useMarketRepWalletData from "../../../hooks/marketRep/useMarketRepWalletData";

export default function TransactionPage() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isViewWithdrawalsModalOpen, setIsViewWithdrawalsModalOpen] =
    useState(false);
  const {
    isPending,
    isLoading,
    isError,
    data: vendorSummaryStat,
  } = useVendorSummaryStat();
  const { data: businessData } = useGetBusinessDetails();
  const businessWallet = businessData?.data?.business_wallet;

  const { walletMetrics } = useMarketRepWalletData();

  const marketRepWallet = {
    balance: walletMetrics?.currentBalance || 0,
    currency: walletMetrics?.currency || "NGN",
  };
  // const currentYear = new Date().getFullYear()
  const {data: repStats, isFetching, isLoading: tailorStatsLoading} = useQuery({
    queryKey: ["rep-graph"],
    queryFn: async()=>{
      let response = await CaryBinApi.get(`/market-rep-analytics/monthly-revenue`)
      console.log("This is the rep graph response", response)
      return response?.data?.data
    }
  })

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
      {/* <Cards vendorSummaryStat={vendorSummaryStat?.data} />*/}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 mb-6">
        <div className="lg:col-span-2">
          <BarChartComponent data={repStats}/>
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
        businessWallet={marketRepWallet}
      />

      {/* View All Withdrawals Modal */}
      <ViewWithdrawalsModal
        isOpen={isViewWithdrawalsModalOpen}
        onClose={handleCloseViewWithdrawalsModal}
      />
    </>
  );
}
