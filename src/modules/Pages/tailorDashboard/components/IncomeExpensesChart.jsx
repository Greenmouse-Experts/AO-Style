import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FaRegCalendarAlt } from "react-icons/fa";

const data = [
  { month: "Jan", income: 0, expenses: 20000 },
  { month: "Feb", income: 10000, expenses: 15000 },
  { month: "Mar", income: 30000, expenses: 25000 },
  { month: "Apr", income: 60000, expenses: 50000 },
  { month: "May", income: 100000, expenses: 70000 },
  { month: "Jun", income: 120000, expenses: 90000 },
  { month: "Jul", income: 150000, expenses: 110000 },
  { month: "Aug", income: 170000, expenses: 140000 },
  { month: "Sep", income: 200000, expenses: 100000 },
  { month: "Oct", income: 220000, expenses: 80000 },
  { month: "Nov", income: 250000, expenses: 50000 },
  { month: "Dec", income: 270000, expenses: 70000 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded-md">
        <p className="text-gray-700 font-semibold">${payload[0]?.value?.toLocaleString()}</p>
        <p className="text-xs text-gray-500">{payload[0].payload.month}</p>
      </div>
    );
  }
  return null;
};

const IncomeExpensesChart = () => {
  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-lg">
          Today <span className="text-green-600 text-sm bg-green-100 px-2 py-1 rounded">24.6% ⬆</span>
        </h2>
        <button className="flex items-center bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md">
          <FaRegCalendarAlt className="mr-2" /> Jan 2024 - Dec 2024
        </button>
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data}>
          <XAxis dataKey="month" tick={{ fill: "#A0AEC0" }} />
          <YAxis tickFormatter={(value) => `${value / 1000}K`} tick={{ fill: "#A0AEC0" }} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="income" stroke="#7B52D3" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="expenses" stroke="#5AB2F8" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-4 text-sm">
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-600 rounded-full"></span> Income</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-400 rounded-full"></span> Expenses</span>
      </div>
    </div>
  );
};

export default IncomeExpensesChart;
