import { useState, useRef, useEffect } from "react";
// import ReusableTable from "../logisticsDashboard/components/ReusableTable";
import { FaTimes, FaCheck, FaMapMarkerAlt, FaEllipsisH } from "react-icons/fa";
import { Link } from "react-router-dom";
import CustomTable from "../../../components/CustomTable";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import { AlertCircle, Loader2 } from "lucide-react";

const OrderRequests = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [];
  const query = useQuery({
    queryKey: ["logistics", "orders"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/orders");
      return resp.data;
    },
  });
  if (query.isFetching) {
    return (
      <div
        data-theme="nord"
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
        aria-live="polite"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-base-content text-lg">Loading Orders...</span>
      </div>
    );
  }

  // Error State
  if (query.isError) {
    return (
      <div
        data-theme="nord"
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
        aria-live="assertive"
      >
        <div className="alert alert-error max-w-md">
          <AlertCircle className="w-6 h-6 text-error-content" />
          <span className="text-error-content">
            {query.error?.message || "An error occurred while loading orders"}
          </span>
        </div>
        <button
          className="btn btn-primary btn-md"
          onClick={() => query.refetch()}
          aria-label="Retry loading orders"
        >
          Try Again
        </button>
      </div>
    );
  }
  const data = query.data?.data;
  return <>{JSON.stringify(data)}</>;
  return (
    <div data-theme="nord" className="min-h-screen flex flex-col  bg-base-100">
      <div className="p-4 rounded-box outline outline-current/20 m-4">
        <h2 className="font-bold text-2xl text-base-content mb-2">
          Orders Requested
        </h2>
        <div className="breadcrumbs text-base-content">
          <ul>
            <li>Dashboard</li>
            <li>Orders</li>
          </ul>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
          <h2 className="text-lg font-semibold">Order Requests</h2>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 py-2 px-3 border border-gray-200 rounded-md outline-none text-sm"
            />
            <div className="dropdown dropdown-end w-full sm:w-auto">
              <label
                tabIndex={0}
                className="btn m-1 bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md border-none hover:bg-gray-200"
              >
                Export As ▾
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <a>CSV</a>
                </li>
                <li>
                  <a>Excel</a>
                </li>
                <li>
                  <a>PDF</a>
                </li>
              </ul>
            </div>
            {/* <button className="w-full sm:w-auto bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md">
              Sort: Newest First ▾
            </button>*/}
          </div>
        </div>

        {/* Table */}
        <CustomTable data={[]} columns={[]} />
      </div>
    </div>
  );
};

export default OrderRequests;
