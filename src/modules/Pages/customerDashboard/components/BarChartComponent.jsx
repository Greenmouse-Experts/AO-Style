import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const BarChartComponent = () => {
  const data = [
    { name: "Jan", income: 150000 },
    { name: "Feb", income: 100000 },
    { name: "Mar", income: 120000 },
    { name: "Apr", income: 170000 },
    { name: "May", income: 50000 },
    { name: "Jun", income: 110000 },
    { name: "Jul", income: 70000 },
    { name: "Aug", income: 220000 },
    { name: "Sep", income: 80000 },
    { name: "Oct", income: 160000 },
    { name: "Nov", income: 90000 },
    { name: "Dec", income: 130000 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Income</h2>
        <select className="border p-2 rounded-md text-sm">
          <option>Annually</option>
          <option>Monthly</option>
        </select>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} barGap={2} barCategoryGap={10}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="income" fill="#A14DF6" radius={[5, 5, 0, 0]} barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
