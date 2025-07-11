import HeaderCard from "./components/HeaderCard";
import StatsCard from "./components/StatCard";
import CalendarWidget from "./components/CalendarWidget";
import OrdersTable from "./components/OrdersTable";
import NotificationsCard from "./components/NotificationsCard";
import UpcomingDelivery from "./components/UpcomingDelivery";
import ExpensesChart from "./components/ExpensesChart";


export default function CustomerDashboard() {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                    <HeaderCard />
                    <StatsCard />
                </div>
                <CalendarWidget />
            </div>

            {/* Orders Section */}
            <div className="mt-6 bg-white p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium">All Orders</h2>

                    {/* <div className="hidden md:flex gap-4">
                        <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">
                            Export As ⌄
                        </button>
                        <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">
                            Sort: Newest First ⌄
                        </button>
                    </div> */}

                </div>
                <OrdersTable />
            </div>
            {/* New Section for Orders & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <NotificationsCard />
                <UpcomingDelivery />
                <ExpensesChart />
            </div>

        </>
    );
}
