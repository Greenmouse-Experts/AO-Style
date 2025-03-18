import Cards from "./components/Cards";
import BarChartComponent from "./components/BarChartComponent";
import DoughnutChartComponent from "./components/DoughnutChartComponent";
import OrderRequests from "./components/OrderRequests";
export default function LogisticsDashboard() {
    return (
        <>
            <div className="bg-white px-6 py-4 mb-6">
                <h1 className="text-2xl font-medium mb-3">Welcome back, Hamzat 👋 </h1>
                <p className="text-gray-500">
                    Another day to earn by delivering goods
                </p>
            </div>
            <Cards />
            <OrderRequests />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                    <BarChartComponent />
                </div>
                <div className="lg:col-span-1">
                    <DoughnutChartComponent />
                </div>
            </div>
        </>
    );
}
