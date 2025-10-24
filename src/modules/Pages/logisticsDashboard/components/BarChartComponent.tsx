import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Typesafe for API data like:
 * [
 *   { month: 1, transactions: 0, revenue: 0 },
 *   { month: 2, transactions: 0, revenue: 0 },
 *   ...
 * ]
 */
type TailorDataItem = {
  month: number;
  transactions: number;
  revenue: number;
};

type DashboardGraphProps = {
  data?: TailorDataItem[] | null;
};

export default function DashboardGraph({ data: passedData = null }: DashboardGraphProps) {
  const [chartType, setChartType] = useState<"revenue" | "transactions" | "both">("revenue");

  // Use passed data or fallback to sample data with "transactions" and "revenue"
  const data: TailorDataItem[] =
    passedData && Array.isArray(passedData) && passedData.length > 0
      ? passedData
      : [
          { month: 1, transactions: 45, revenue: 2400 },
          { month: 2, transactions: 52, revenue: 2810 },
          { month: 3, transactions: 48, revenue: 2290 },
          { month: 4, transactions: 61, revenue: 2000 },
          { month: 5, transactions: 55, revenue: 2181 },
          { month: 6, transactions: 67, revenue: 2500 },
          { month: 7, transactions: 72, revenue: 2100 },
          { month: 8, transactions: 68, revenue: 2200 },
          { month: 9, transactions: 73, revenue: 2290 },
          { month: 10, transactions: 80, revenue: 2000 },
          { month: 11, transactions: 85, revenue: 2181 },
          { month: 12, transactions: 92, revenue: 2500 },
        ];

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Add readable name field for Recharts per month
  const formattedData = data.map((item) => ({
    ...item,
    name: monthNames[item.month - 1] ?? `M${item.month}`,
  }));

  const totalRevenue = data.reduce((sum, item) => sum + (item.revenue ?? 0), 0);
  const totalTransactions = data.reduce((sum, item) => sum + (item.transactions ?? 0), 0);

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">

        {/* Chart Type Selector */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => setChartType("revenue")}
            className={`cursor-pointer px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all ${
              chartType === "revenue"
                ? "bg-purple-500 text-white shadow-lg"
                : "bg-white text-slate-700 border border-slate-200 hover:shadow-md"
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setChartType("transactions")}
            className={`cursor-pointer px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all ${
              chartType === "transactions"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-white text-slate-700 border border-slate-200 hover:shadow-md"
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setChartType("both")}
            className={`cursor-pointer px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all ${
              chartType === "both"
                ? "bg-teal-500 text-white shadow-lg"
                : "bg-white text-slate-700 border border-slate-200 hover:shadow-md"
            }`}
          >
            Both
          </button>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 overflow-x-auto">
          <div className="w-full h-64 sm:h-80 lg:h-96 min-w-full">
            {chartType === "revenue" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(value) => `₦${Number(value).toLocaleString()}`}
                  />
                  {/* Revenue is now purple */}
                  <Bar dataKey="revenue" fill="#a855f7" radius={[8, 8, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === "transactions" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  {/* Transactions is now blue */}
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Transactions"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {chartType === "both" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#64748b"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748b"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(value) => value.toLocaleString()}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  />
                  {/* Revenue is now purple */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ fill: "#a855f7", r: 4 }}
                    name="Revenue"
                  />
                  {/* Transactions is now blue */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="transactions"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    name="Transactions"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-500">
          Data represents monthly performance metrics for the year
        </div>
      </div>
    </div>
  );
}
