import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SalesSummaryChart() {
  const { data: queryData, isLoading } = useQuery({
    queryKey: ["sales_analytics"],
    queryFn: async () => {
      const resp = await CaryBinApi.get("/owner-analytics/fetch-metrics");
      return resp.data;
    },
  });

  const metrics = queryData?.data || {
    total_organizations: 0,
    total_product_orders: 0,
    total_withdrawals: 0,
    total_revenue: "₦0.00",
  };

  const chartData = {
    labels: ["Organizations", "Orders", "Withdrawals"],
    datasets: [
      {
        data: [
          metrics.total_organizations,
          metrics.total_product_orders,
          metrics.total_withdrawals,
        ],
        backgroundColor: ["#3B82F6", "#8B5CF6", "#34D399"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}`,
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">Sales Summary</h2>
        <select className="border border-gray-300 rounded-md p-2 text-sm text-gray-600">
          <option>Sort by -</option>
        </select>
      </div>

      <div className="h-64 mb-4">
        {isLoading ? (
          <div className="text-gray-500 text-sm">Loading chart...</div>
        ) : (
          <Pie data={chartData} options={options} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LegendItem
          color="#3B82F6"
          label="Organizations"
          value={metrics.total_organizations}
        />
        <LegendItem
          color="#8B5CF6"
          label="Orders"
          value={metrics.total_product_orders}
        />
        <LegendItem
          color="#34D399"
          label="Withdrawals"
          value={metrics.total_withdrawals}
        />
        <div className="text-sm text-gray-800 col-span-2 mt-2">
          <strong>Total Revenue:</strong> {metrics.total_revenue}
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
      <span className="text-sm text-gray-800">
        {label}: {value.toLocaleString()}
      </span>
    </div>
  );
}
