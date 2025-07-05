import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const data = [
    { name: "Tailors", value: 2500000, color: "#7B4FEC" },
    { name: "Vendor", value: 100000, color: "#B38DFB" },
];

export default function ExpensesChart() {
    return (
        <div className="bg-white p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Expenses</h3>
                <button className="bg-gray-200 text-gray-600 px-4 py-1 rounded-lg text-sm">Monthly ⌄</button>
            </div>
            <PieChart width={250} height={200}>
                <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {data.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
            <div className="mt-4">
                {data.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm font-medium">
                        <span className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                            {item.name}
                        </span>
                        <span>N {item.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
