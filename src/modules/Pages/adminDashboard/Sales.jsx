import Cards from "./components/Cards";
import NewApplicants from "./components/NewApplicants";
import BarChartComponent from "./components/BarChartComponent";
import AddedUser from "./components/AddedUser";
// import MarketRepCard from "./sales-rep/Cards";
import MarketRepBarComponent from "./sales-rep/Chart";
import MarketRepCard from "./sales-rep/Cards";
import SalesCards from "./components/SalesCards";

export default function SuperDashboard() {
  return (
    <>
      {/* <MarketRepCard />*/}
      {/* <SalesCards />*/}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        <div className="lg:col-span-5 flex flex-col">
          <AddedUser className="flex-grow" />
        </div>
      </div>
    </>
  );
}
