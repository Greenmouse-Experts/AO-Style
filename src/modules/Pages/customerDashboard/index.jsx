import HeaderCard from "./components/HeaderCard";
import StatsCard from "./components/StatCard";
import CalendarWidget from "./components/CalendarWidget";
import OrdersTable from "./components/OrdersTable";
import NotificationsCard from "./components/NotificationsCard";
import UpcomingDelivery from "./components/UpcomingDelivery";
import ExpensesChart from "./components/ExpensesChart";
import useGetCustomerRecentOrdersStat from "../../../hooks/analytics/useGetCustomerRecentOrders";

export default function CustomerDashboard() {
  const {
    isPending,
    isLoading,
    isError,
    data: customerRecentOrderStat,
  } = useGetCustomerRecentOrdersStat();

  if (isPending) return;
  return (
    <div className="max-w-full overflow-hidden">
      {/* Main Header and Stats Section */}
      <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-1 gap-6 min-h-0">
        <div className="xl:col-span-3 lg:col-span-1 min-w-0">
          <HeaderCard />
          <StatsCard />
        </div>
        <div className="xl:col-span-1 lg:col-span-1 min-w-0">
          <CalendarWidget />
        </div>
      </div>

      {/* Orders Section */}
      <div className="mt-6 bg-white p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Recent Orders</h2>

          {/* <div className="hidden md:flex gap-4">
                        <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">
                            Export As ⌄
                       </button>
                        <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">
                            Sort: Newest First ⌄
                        </button>
                    </div> */}
        </div>
        <OrdersTable customerRecentOrderStat={customerRecentOrderStat} />
      </div>

      {/* New Section for Orders & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-1 gap-6 mt-6">
        <NotificationsCard />
        <UpcomingDelivery />
        <ExpensesChart />
      </div>
    </div>
  );
}
