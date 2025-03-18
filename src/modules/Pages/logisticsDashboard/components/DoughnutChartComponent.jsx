import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const DoughnutChartComponent = () => {
  const data = [
    { name: "Income", value: 2500000, color: "#9847FE" },
    { name: "Expenses", value: 1000000, color: "#DA6DC1" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Income Vs Expense</h2>
        <select className="border p-2 rounded-md text-sm">
          <option>Annually</option>
          <option>Monthly</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={80} outerRadius={120}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: item.color }}></span>
              {item.name}
            </span>
            <span>₦ {item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoughnutChartComponent;
