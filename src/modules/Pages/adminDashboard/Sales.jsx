import Cards from "./components/Cards";
import WalletPage from "./components/WalletPage";
import NewApplicants from "./components/NewApplicants";
import BarChartComponent from "./components/BarChartComponent";
import UserAnalyticsChart from "./components/UserAnalyticsChart";
import AddedUser from "./components/AddedUser";
import ProductInventory from "./components/ProductInventory";

export default function SuperDashboard() {
    return (
        <>
            <Cards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 flex flex-col">
                    <BarChartComponent />
                </div>
                <div className="lg:col-span-1">
                    <NewApplicants />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-5 flex flex-col">
                    <AddedUser className="flex-grow" />
                </div>
            </div>
        </>
    );
}
