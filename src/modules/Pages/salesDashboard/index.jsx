import { useState } from "react";
import Cards from "./components/Cards";
import AddedUser from "./components/AddedUser";
import WalletPage from "./components/WalletPage";
import BarChartComponent from "./components/BarChartComponent";
import RecentTransactions from "./components/RecentTransactions";
import WithdrawalModal from "./components/WithdrawalModal";
import ViewWithdrawalsModal from "./components/ViewWithdrawalsModal";
import useMarketRepWalletData from "../../../hooks/marketRep/useMarketRepWalletData";
import { useCarybinUserStore } from "../../../store/carybinUserStore";

export default function SalesDashboard() {
  const { carybinUser } = useCarybinUserStore();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isViewWithdrawalsModalOpen, setIsViewWithdrawalsModalOpen] =
    useState(false);
  const { walletMetrics } = useMarketRepWalletData();

  console.log("🔧 SALES DASHBOARD: Wallet Metrics:", walletMetrics);
  console.log(
    "🔧 SALES DASHBOARD: Current Balance:",
    walletMetrics?.currentBalance,
  );
  console.log("🔧 SALES DASHBOARD: Currency:", walletMetrics?.currency);

  const marketRepWallet = {
    balance: walletMetrics?.currentBalance || 0,
    currency: walletMetrics?.currency || "NGN",
  };

  console.log("🔧 SALES DASHBOARD: Market Rep Wallet:", marketRepWallet);

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
      <div className="bg-white px-4 sm:px-6 py-4 mb-6 relative">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-medium">
            Welcome back, {carybinUser?.name} 👋
          </h1>
          {/* <button className="bg-gradient text-white px-6 sm:px-8 py-2 sm:py-3 cursor-pointer rounded-md hover:bg-purple-600 transition w-full sm:w-auto">
                        Add User
                    </button> */}
        </div>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Another day to earn from registering users on Carybin
        </p>
      </div>

      <Cards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <AddedUser />
        </div>
        <div className="lg:col-span-1">
          <WalletPage
            onWithdrawClick={handleWithdrawClick}
            onViewAllClick={handleViewAllClick}
          />
        </div>
      </div>
      <div className="mt-6">{/* <BarChartComponent />*/}</div>
      <div className="mt-6">
        <RecentTransactions />
      </div>

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
