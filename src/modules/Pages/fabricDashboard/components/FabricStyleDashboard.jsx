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

export default function FabricStyleDashboard({ data: passedData = null }) {
  const [chartType, setChartType] = useState("fabric");

  // Use passed data or fallback to sample data
  const data =
    passedData && Array.isArray(passedData) && passedData.length > 0
      ? passedData
      : [
          { month: 1, fabric: 150, style: 200 },
          { month: 2, fabric: 180, style: 220 },
          { month: 3, fabric: 165, style: 210 },
          { month: 4, fabric: 195, style: 240 },
          { month: 5, fabric: 210, style: 250 },
          { month: 6, fabric: 225, style: 270 },
          { month: 7, fabric: 240, style: 290 },
          { month: 8, fabric: 230, style: 280 },
          { month: 9, fabric: 250, style: 300 },
          { month: 10, fabric: 260, style: 310 },
          { month: 11, fabric: 275, style: 330 },
          { month: 12, fabric: 290, style: 350 },
        ];

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

  const formattedData = data.map((item) => ({
    month: item.month,
    fabric: item.fabric,
    styleCount: item.style, // Rename 'style' to 'styleCount' to avoid conflict
    name: monthNames[item.month - 1],
  }));

  const totalFabric = data.reduce((sum, item) => sum + (item.fabric || 0), 0);
  const totalStyle = data.reduce((sum, item) => sum + (item.style || 0), 0);

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">
            Fabric & Style Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Yearly overview of fabric and style metrics
          </p>
        </div>*/}

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-amber-500">
            <p className="text-slate-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">
              TOTAL FABRIC
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
              {totalFabric.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-pink-500">
            <p className="text-slate-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">
              TOTAL STYLE
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
              {totalStyle.toLocaleString()}
            </p>
          </div>
        </div>*/}

        {/* Chart Type Selector */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => setChartType("fabric")}
            className={`px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all cursor-pointer ${
              chartType === "fabric"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white text-purple-700 border border-purple-200 hover:shadow-md"
            }`}
          >
            Fabric
          </button>
          {/* <button
            onClick={() => setChartType("style")}
            className={`px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all cursor-pointer ${
              chartType === "style"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-blue-700 border border-blue-200 hover:shadow-md"
            }`}
          >
            Style
          </button>*/}
          {/* <button
            onClick={() => setChartType("both")}
            className={`px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all cursor-pointer ${
              chartType === "both"
                ? "bg-indigo-500 text-white shadow-lg"
                : "bg-white text-indigo-700 border border-indigo-200 hover:shadow-md"
            }`}
          >
            Both
          </button>*/}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 overflow-x-auto">
          <div className="w-full h-64 sm:h-80 lg:h-96 min-w-full">
            {chartType === "fabric" && (
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
                    formatter={(value) => value.toLocaleString()}
                  />
                  <Bar dataKey="fabric" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === "style" && (
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
                    formatter={(value) => value.toLocaleString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="styleCount"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: "#2563eb", r: 5 }}
                    activeDot={{ r: 7 }}
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
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="fabric"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", r: 4 }}
                    name="Fabric"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="styleCount"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: "#2563eb", r: 4 }}
                    name="Style"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-500">
          Data represents monthly fabric and style metrics for the year
        </div>
      </div>
    </div>
  );
}
