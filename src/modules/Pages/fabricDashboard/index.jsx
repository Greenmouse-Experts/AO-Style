import Cards from "./components/Cards";
import AddedUser from "./components/AddedUser";
import TopSelling from "./components/TopSelling";
import IncomeExpensesChart from "./components/IncomeExpensesChart";
import Noti from "./components/Noti";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useVendorSummaryStat from "../../../hooks/analytics/useGetVendorSummmary";
import Loader from "../../../components/ui/Loader";
import NewOrders from "./components/AddedUser";

export default function FabricDashboard() {
  const { carybinUser } = useCarybinUserStore();

  const {
    isPending,
    isLoading,
    isError,
    data: vendorSummaryStat,
  } = useVendorSummaryStat();

  console.log(vendorSummaryStat);

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
          <h1 className="text-ls sm:text-2xl font-medium">
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
                    <span>Upgrade for more</span>
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
                    <span>Renew to unlock features</span>
                  </span>
                </div>
              ) : null
            ) : null}
          </div>
        </div>
        <p className="text-gray-500 mt-3 text-sm sm:text-base">
          Enjoy creating beautiful pieces for customers
        </p>
      </div>
      <Cards vendorSummaryStat={vendorSummaryStat?.data} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* <AddedUser />*/}
          <NewOrders />
        </div>
        <div className="lg:col-span-1">
          <TopSelling />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <IncomeExpensesChart />
        </div>
        <div className="lg:col-span-1">
          <Noti />
        </div>
      </div>
    </>
  );
}
