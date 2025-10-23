import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import ReusableTable from "../salesDashboard/components/ReusableTable";
import { GeneralTransactionComponent } from "../../../components/GeneralTransactionComponents";
import WalletPage from "./components/WalletPage";
import WithdrawalModal from "./components/WithdrawalModal";
import ViewWithdrawalsModal from "./components/ViewWithdrawalsModal";
import BarChartComponent from "../salesDashboard/components/BarChartComponent";
import useGetBusinessDetails from "../../../hooks/settings/useGetBusinessDetails";
import Cards from "./components/Cards";
import useVendorSummaryStat from "../../../hooks/analytics/useGetVendorSummmary";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";

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
const currentYear = new Date().getFullYear()
  const {data: tailorStats, isFetching, isLoading: tailorStatsLoading} = useQuery({
    queryKey: ["tailor-graph"],
    queryFn: async()=>{
      let response = await CaryBinApi.get(`/vendor-analytics/logistics-monthly-revenue?year=${currentYear}`)
      console.log("This is the tailor graph response", response)
      return response
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
        WithdrawalModal
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
