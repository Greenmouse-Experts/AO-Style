import Cards from "./components/Cards";
import AddedUser from "./components/AddedUser";
import TopSelling from "./components/TopSelling";
import IncomeExpensesChart from "./components/IncomeExpensesChart";
import Noti from "./components/Noti";
import { useCarybinUserStore } from "../../../store/carybinUserStore";

export default function FabricDashboard() {
  const { carybinUser } = useCarybinUserStore();

  return (
    <>
      <div className="bg-white px-4 sm:px-6 py-4 mb-6 relative">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <h1 className="text-ls sm:text-2xl font-medium">
            Welcome back, {carybinUser?.name} 👋
          </h1>
        </div>
        <p className="text-gray-500 mt-3 text-sm sm:text-base">
          Enjoy creating beautiful pieces for customers
        </p>
      </div>
      <Cards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <AddedUser />
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
