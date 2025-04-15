import Cards from "./components/Cards";
import AddedUser from "./components/AddedUser";
import WalletPage from "./components/WalletPage";
import BarChartComponent from "./components/BarChartComponent";
export default function SalesDashboard() {
    return (
        <>
            <div className="bg-white px-4 sm:px-6 py-4 mb-6 relative">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                    <h1 className="text-xl sm:text-2xl font-medium">
                        Welcome back, Hamzat 👋
                    </h1>
                    {/* <button className="bg-gradient text-white px-6 sm:px-8 py-2 sm:py-3 cursor-pointer rounded-md hover:bg-purple-600 transition w-full sm:w-auto">
                        Add User
                    </button> */}
                </div>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">
                    Another day to earn from registering users on OAStyles
                </p>
            </div>

            <Cards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                    <AddedUser />
                </div>
                <div className="lg:col-span-1">
                    <WalletPage />
                </div>
            </div>
            <div className="mt-6">
                <BarChartComponent />
            </div>
        </>
    );
}
