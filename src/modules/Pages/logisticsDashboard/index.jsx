import { useState } from "react";
import Cards from "./components/Cards";
import BarChartComponent from "./components/BarChartComponent";
import DoughnutChartComponent from "./components/DoughnutChartComponent";
import OrderRequests from "./components/OrderRequests";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import DashOrderRequests from "./components/DashOrderRequests";
import WithdrawalModal from "./components/WithdrawalModal";
// import WalletPage from "../salesDashboard/components/WalletPage";
import WalletPage from "./components/WalletPage";
import ViewWithdrawalsModal from "./components/ViewWithdrawalsModal";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";
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
const currentYear = new Date().getFullYear()
  const {
    data: graphData,
    isLoading: graphDataLoading,
    isFetching: graphDataFetching,
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
            // businessWallet={businessWallet}
            // isLoading={isLoadingWallet}
          />
        </div>
      </div>
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={handleCloseWithdrawModal}
        // businessWallet={businessWallet}
      />

      {/* View All Withdrawals Modal */}
      <ViewWithdrawalsModal
        isOpen={isViewWithdrawalsModalOpen}
        onClose={handleCloseViewWithdrawalsModal}
      />
    </>
  );
}
