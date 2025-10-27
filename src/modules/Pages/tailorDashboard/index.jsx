import { useState } from "react";
import Cards from "./components/Cards";
import AddedUser from "./components/AddedUser";
import UpcomingDelivery from "./components/UpcomingDelivery";
import IncomeExpensesChart from "./components/IncomeExpensesChart";
import WalletPage from "./components/WalletPage";
import WithdrawalModal from "./components/WithdrawalModal";
import ViewWithdrawalsModal from "./components/ViewWithdrawalsModal";
// hi
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useVendorSummaryStat from "../../../hooks/analytics/useGetVendorSummmary";
import useGetBusinessDetails from "../../../hooks/settings/useGetBusinessDetails";
import Loader from "../../../components/ui/Loader";
import TopSellingProducts from "../fabricDashboard/components/TopSelling";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import BarChartComponent from "./components/BarChartComponent"
import { useQuery } from "@tanstack/react-query";

export default function TailorDashboard() {
  const { carybinUser } = useCarybinUserStore();
  // Removed unused state for currentSubscriptionPlan
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isViewWithdrawalsModalOpen, setIsViewWithdrawalsModalOpen] = useState(false);

  console.log(carybinUser);
  const {
    isPending,
    // Removed unused isLoading and isError
    data: vendorSummaryStat,
  } = useVendorSummaryStat();

  const currentYear = new Date().getFullYear();

  const { data: tailorStats } = useQuery({
    queryKey: ["tailor-graph"],
    queryFn: async () => {
      let response = await CaryBinApi.get(`/vendor-analytics/logistics-monthly-revenue?year=${currentYear}`);
      console.log("This is the tailor graph response", response);
      return response?.data?.data;
    }
  });

  const { data: businessData } = useGetBusinessDetails();
  const businessWallet = businessData?.data?.business_wallet;

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

  if (isPending) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white px-4 sm:px-6 py-4 mb-6 relative">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-medium">
            Welcome back, {carybinUser?.name} 👋
          </h1>
          <div className="w-full sm:w-auto">
            {carybinUser?.subscriptions &&
            carybinUser.subscriptions.length > 0 ? (
              carybinUser.subscriptions[carybinUser.subscriptions.length - 1]
                .name === "Free Plan" ? (
                <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-md px-4 py-2 text-sm flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>
                  <span>
                    <span className="font-semibold">Free Plan</span>
                    <span className="mx-1">·</span>
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() =>
                        (window.location.href =
                          "/tailor/subscription?pagination[limit]=10&pagination[page]=1")
                      }
                    >
                      Upgrade for more
                    </span>
                  </span>
                </div>
              ) : !carybinUser.subscriptions[
                  carybinUser.subscriptions.length - 1
                ]?.is_active ? (
                <div className="bg-yellow-50 border border-yellow-100 text-red-700 rounded-md px-4 py-2 text-sm flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z"
                    />
                  </svg>
                  <span>
                    <span className="font-semibold">Plan inactive</span>
                    <span className="mx-1">·</span>
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() =>
                        (window.location.href =
                          "/tailor/subscription?pagination[limit]=10&pagination[page]=1")
                      }
                    >
                      renew to unlock features
                    </span>
                  </span>
                </div>
              ) : null
            ) : null}
          </div>
        </div>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Enjoy creating beautiful pieces for customers
        </p>
      </div>
      <Cards vendorSummaryStat={vendorSummaryStat?.data} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <AddedUser />
        </div>
        <div className="lg:col-span-1">
          <TopSellingProducts />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          {/* Here we fill the vacant space with the BarChartComponent, passing tailorStats?.data */}
          <BarChartComponent data={tailorStats} />
        </div>
        <div className="lg:col-span-1">
          <WalletPage
            onWithdrawClick={handleWithdrawClick}
            onViewAllClick={handleViewAllClick}
          />
        </div>
      </div>

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
