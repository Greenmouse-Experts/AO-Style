import Cards from "./components/Cards";
import AddedUser from "./components/AddedUser";
import UpcomingDelivery from "./components/UpcomingDelivery";
import IncomeExpensesChart from "./components/IncomeExpensesChart";
import WalletPage from "./components/WalletPage";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useVendorSummaryStat from "../../../hooks/analytics/useGetVendorSummmary";
import Loader from "../../../components/ui/Loader";
import TopSellingProducts from "../fabricDashboard/components/TopSelling";

export default function TailorDashboard() {
  const { carybinUser } = useCarybinUserStore();

  const {
    isPending,
    isLoading,
    isError,
    data: vendorSummaryStat,
  } = useVendorSummaryStat();

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
          <IncomeExpensesChart />
        </div>
        <div className="lg:col-span-1">
          <WalletPage />
        </div>
      </div>
    </>
  );
}
