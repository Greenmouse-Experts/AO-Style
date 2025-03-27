import Cards from "./components/Cards";
import HeaderCard from "./components/HeaderCard";
import WalletPage from "./components/WalletPage";
import IncomeExpensesChart from "./components/IncomeExpensesChart";
import UserAnalyticsChart from "./components/UserAnalyticsChart";
import AddedUser from "./components/AddedUser";
import ProductInventory from "./components/ProductInventory";

export default function SuperDashboard() {
    return (
        <>
            <Cards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 flex flex-col">
                    <HeaderCard  />
                    <div className="mt-6">
                        <IncomeExpensesChart className="flex-grow" />
                    </div>
                    <div className="mt-6">
                        <AddedUser className="flex-grow" />
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <WalletPage />
                    <div className="mt-6">
                        <UserAnalyticsChart className="flex-grow" />
                    </div>
                    <div className="mt-6">
                        <ProductInventory className="flex-grow" />
                    </div>
                </div>
            </div>

        </>
    );
}
