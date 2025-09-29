import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";

interface MonthlyAnalytics {
  month: number;
  fabric: number;
  style: number;
}

interface AnalyticsResponse {
  statusCode: number;
  data: MonthlyAnalytics[];
}

// Define month names outside the component to avoid re-creation on re-renders
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function BarChartComponent() {
  // Removed the hardcoded 'data' array as it will be replaced by fetched analyticsData

  const query = useQuery<AnalyticsResponse>({
    queryKey: ["data"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/vendor-analytics/monthly-revenue");
      console.log("this is for the bar chat", resp);
      return resp.data;
    },
  });

  const { data: analyticsData } = query;
  console.log("this is the analytics data", analyticsData);
  // Transform the fetched analytics data into a format suitable for Recharts
  // Map month number to month name and use 'fabric' as the value for 'income'
  const chartData =
    analyticsData?.data?.map((item) => ({
      name: monthNames[item.month - 1], // month is 1-indexed, so subtract 1 for array index
      income: item.fabric, // Using 'fabric' as the income value for the bar chart
    })) || []; // Default to an empty array if data is not available or empty

  if (query.isFetching)
    return (
      <div className="bg-white p-6 rounded-lg" data-theme="nord">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Income</h2>
          {/*<select className="border p-2 rounded-md text-sm">
            <option>Annually</option>
            <option>Monthly</option>
          </select>*/}
        </div>
        <div className="grid place-items-center">
          <div className="loading-infinity"></div>
          <div>
            <span className="loading-spinner loading text-primary "></span>
            <span className="ml-2">Loading</span>
          </div>
        </div>
      </div>
    );

  if (query.error) {
    return (
      <div className="bg-white p-6 rounded-lg" data-theme="nord">
        {/*<div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Income</h2>
          <select className="border p-2 rounded-md text-sm">
            <option>Annually</option>
            <option>Monthly</option>
          </select>
        </div>*/}
        <div className="grid place-items-center">
          {/*<div className="loading-infinity"></div>*/}
          <span>Error Occured</span>
          <div className="mt-2">
            <button className="btn btn-error" onClick={() => query.refetch()}>
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white p-6 overflow-hidden rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Income</h2>
        {/*<select className="border p-2 rounded-md text-sm">
          <option>Annually</option>
          <option>Monthly</option>
        </select>*/}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" className={" "} height={360}>
        {/* Use the transformed chartData for the BarChart */}
        <BarChart data={chartData} barGap={2} barCategoryGap={10}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="income" // This dataKey now corresponds to the 'income' property in chartData
            fill="#A14DF6"
            radius={[5, 5, 0, 0]}
            barSize={10}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
