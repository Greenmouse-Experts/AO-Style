import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
} from "chart.js";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
);

interface MonthlyBreakdown {
  month: string;
  product_revenue: string;
  subscription_revenue: string;
  withdrawals: string;
}

interface AnalyticsData {
  year: string;
  monthly_breakdown: MonthlyBreakdown[];
  totals: {
    product_revenue: string;
    subscription_revenue: string;
    withdrawals: string;
  };
}

interface AnalyticsResponse {
  statusCode: number;
  data: AnalyticsData;
}

// Utility to convert "₦1,000.00" -> 1000
const parseNairaToNumber = (nairaStr: string): number => {
  return parseFloat(nairaStr.replace(/[₦,]/g, "")) || 0;
};

export default function SalesRevenueChart() {
  const query_data = useQuery<AnalyticsResponse>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const resp = await CaryBinApi.get(
        "/owner-analytics/fetch-revenue?year=2025",
      );
      return resp.data;
    },
  });

  const monthly = query_data.data?.data.monthly_breakdown ?? [];

  const labels = monthly.map((item) => item.month);

  const subscriptionData = monthly.map((item) =>
    parseNairaToNumber(item.subscription_revenue),
  );

  const productData = monthly.map((item) =>
    parseNairaToNumber(item.product_revenue),
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Subscription",
        data: subscriptionData,
        borderColor: "#CB3CFF",
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#8B5CF6",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#8B5CF6",
      },
      {
        label: "Product",
        data: productData,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#3B82F6",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ₦${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `₦${value.toLocaleString()}`,
          color: "#6B7280",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Sales Revenue
        </h3>
        <select className="border border-gray-300 rounded-md p-2 text-sm text-gray-600">
          <option>Jan 2025 - Dec 2025</option>
        </select>
      </div>
      <div className="h-82">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
