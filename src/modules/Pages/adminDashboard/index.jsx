import Cards from "./components/Cards";
import HeaderCard from "./components/HeaderCard";
import WalletPage from "./components/WalletPage";
import IncomeExpensesChart from "./components/IncomeExpensesChart";
import UserAnalyticsChart from "./components/UserAnalyticsChart";
import AddedUser from "./components/AddedUser";
import ProductInventory from "./components/ProductInventory";
import RecentActivitiesTable from "./components/RecentActivities";
import useGetDashboardStat from "../../../hooks/analytics/useGetAnalytics";
import Loader from "../../../components/ui/Loader";

export default function SuperDashboard() {
  const { isPending, isLoading, isError, data } = useGetDashboardStat();

  if (isPending) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  console.log("Dashboard Data:", data?.data);

  return (
    <>
      <Cards data={data?.data?.userCounts} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 flex flex-col">
          <HeaderCard />
          <div className="mt-6">
            <IncomeExpensesChart dataVal={data?.data} className="flex-grow" />
          </div>
          <div className="mt-6">
            <RecentActivitiesTable dataVal={data?.data} className="flex-grow" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <WalletPage data={data?.data} />
          <div className="mt-6">
            <UserAnalyticsChart dataVal={data?.data} className="flex-grow" />
          </div>
          <div className="mt-6">
            <ProductInventory dataVal={data?.data} className="flex-grow" />
          </div>
        </div>
      </div>
    </>
  );
}
