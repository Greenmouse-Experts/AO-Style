import AnalyticsCards from "../components/AnalyticsCards";
import RecentOrdersTable from "../components/RecentOrdersTable";
import SalesRevenueChart from "../components/RegisterChart";
import SalesSummaryChart from "../components/SalesSummaryChart";

export default function Analytics() {
  return (
    <>
      {/* <AnalyticsCards /> */}
      <div>
        <h2 className="text-lg font-medium mt-6 text-[#2B3674]">
          Track all Sales and Activities on Carybin
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 flex flex-col">
          <SalesRevenueChart />
        </div>
        <div className="lg:col-span-1">
          <SalesSummaryChart />
        </div>
      </div>
      <RecentOrdersTable />
    </>
  );
}
