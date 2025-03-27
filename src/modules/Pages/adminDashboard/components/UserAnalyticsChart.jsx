import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const data = [
  { name: "Customers", value: 40, color: "#4C6EF5" },
  { name: "Tailors", value: 25, color: "#E3B448" },
  { name: "Fabric Vendors", value: 15, color: "#8CE99A" },
  { name: "Logistics Agents", value: 10, color: "#E599F7" },
  { name: "Market Reps", value: 10, color: "#A5B4FC" },
];

const UserAnalyticsChart = () => {
  const [timeRange, setTimeRange] = useState("This Week");

  return (
    <div className="bg-white p-6 rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">User Analytics</h2>
        <button className="flex items-center text-gray-500 hover:text-gray-700">
          {timeRange} <ChevronDown size={16} className="ml-1" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center text-sm text-gray-600">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
            {item.name}
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <div className="flex justify-center">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserAnalyticsChart;
