import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaRegCalendarAlt } from "react-icons/fa";

export const months = [
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

export const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded-md">
        <p className="text-gray-700 font-semibold">
          {payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">{payload[0].payload.month}</p>
      </div>
    );
  }
  return null;
};

const IncomeExpensesChart = (dataVal) => {
  console.log(dataVal?.dataVal?.monthlyRevenue);
  // If dataVal.dataVal.monthlyRevenue is an array of 12 numbers, map it to objects with month and income

  let chartData = [];
  if (
    Array.isArray(dataVal?.dataVal?.monthlyRevenue) &&
    dataVal.dataVal.monthlyRevenue.length === 12
  ) {
    chartData = dataVal.dataVal.monthlyRevenue.map((income, idx) => ({
      month: months[idx],
      income,
    }));
  }
  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-lg">
          Revenue Trend{" "}
          {/* <span className="text-green-600 text-sm bg-green-100 px-2 py-1 rounded">
            24.6% ⬆
          </span> */}
        </h2>
        {/* <button className="flex items-center bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md">
          <FaRegCalendarAlt className="mr-2" /> Jan 2025 - Dec 2025
        </button> */}
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartData}>
          <XAxis dataKey="month" tick={{ fill: "#A0AEC0" }} />
          <YAxis
            tickFormatter={(value) => `${Math.round(value / 1000)}`}
            tick={{ fill: "#A0AEC0" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#7B52D3"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#5AB2F8"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-purple-600 rounded-full"></span> Revenue
        </span>
        {/* <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-400 rounded-full"></span> Expenses
            </span> */}
      </div>
    </div>
  );
};

export default IncomeExpensesChart;
