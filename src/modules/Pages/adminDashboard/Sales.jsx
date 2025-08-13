import Cards from "./components/Cards";
import NewApplicants from "./components/NewApplicants";
import BarChartComponent from "./components/BarChartComponent";
import AddedUser from "./components/AddedUser";
import MarketRepCard from "./sales-rep/Cards";
import MarketRepBarComponent from "./sales-rep/Chart";

export default function SuperDashboard() {
  // <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
  //   <div className="lg:col-span-2 flex flex-col">
  //     {/* <MarketRepBarComponent />*/}
  //   </div>
  //   <div className="lg:col-span-1">{/* <NewApplicants />*/}</div>
  // </div>
  return (
    <>
      <MarketRepCard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-5 flex flex-col">
          <AddedUser className="flex-grow" />
        </div>
      </div>
    </>
  );
}
