import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";

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

// Helper function to parse currency strings like "₦1,000.00" → 1000
const parseCurrency = (value: string | undefined): number => {
  if (!value) return 0;
  return Number(value.replace(/[^0-9.-]+/g, "").replace(/,/g, ""));
};

// Utility to format number into Nigerian Naira currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(value);
};

export default function AnalyticsCards() {
  const { data, isLoading, isError } = useQuery<AnalyticsResponse>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const resp = await CaryBinApi.get(
        "/owner-analytics/fetch-revenue?year=2025",
      );
      console.log(resp.data, "analytics data");
      return resp.data;
    },
  });

  // Extract and compute revenue values
  const totalProductRevenue = parseCurrency(data?.data.totals.product_revenue);
  const totalSubscriptionRevenue = parseCurrency(
    data?.data.totals.subscription_revenue,
  );
  const totalRevenue = totalProductRevenue + totalSubscriptionRevenue;
  const totalPayouts = parseCurrency(data?.data.totals.withdrawals);

  // Use the latest month (assumed to be the last with non-zero values)
  const breakdown = data?.data.monthly_breakdown || [];
  const latestMonth =
    [...breakdown]
      .reverse()
      .find(
        (m) =>
          parseCurrency(m.product_revenue) > 0 ||
          parseCurrency(m.subscription_revenue) > 0 ||
          parseCurrency(m.withdrawals) > 0,
      ) || breakdown[breakdown.length - 1];

  const monthlyProduct = parseCurrency(latestMonth?.product_revenue);
  const monthlySub = parseCurrency(latestMonth?.subscription_revenue);
  const monthlyWithdrawals = parseCurrency(latestMonth?.withdrawals);
  const monthlyRevenue = monthlyProduct + monthlySub;

  const stats = [
    {
      icon: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1746536471/AoStyle/Group1_vg0mlf.png",
      value: isLoading
        ? "Loading..."
        : isError
          ? "Error"
          : formatCurrency(monthlyRevenue),
      label: "Total Revenue",
      subtext: "This Month",
      bgColor: "bg-[#F4EFFF]",
    },
    {
      icon: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1746536471/AoStyle/Group2_mhpszt.png",
      value: isLoading
        ? "Loading..."
        : isError
          ? "Error"
          : data?.data?.totals?.withdrawals, // Placeholder value
      label: "Withdrawals",
      subtext: " This Year",
      bgColor: "bg-[#F4EFFF]",
    },
    {
      icon: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1746536472/AoStyle/Group3_t9ofqe.png",
      value: isLoading
        ? "Loading..."
        : isError
          ? "Error"
          : formatCurrency(monthlyWithdrawals),
      label: "Total Payouts",
      subtext: "This Month",
      bgColor: "bg-[#FFE4E1]",
    },
    {
      icon: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1746536473/AoStyle/Group4_ogapaw.png",
      value: isLoading
        ? "Loading..."
        : isError
          ? "Error"
          : data?.data.totals.product_revenue, // Placeholder
      label: "Total Revenue",
      subtext: "This Year",
      bgColor: "bg-[#E0FFFF]",
    },
  ];

  return (
    <>
      <div>
        <h2 className="text-lg font-medium mb-4 text-[#2B3674]">
          View, track, and manage all financial activities across the platform.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white p-4 rounded-md"
          >
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-medium text-gray-800">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.subtext}</p>
              </div>
              <p className="text-gray-600 mt-1">{stat.label}</p>
            </div>
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full ${stat.bgColor}`}
            >
              <img src={stat.icon} alt={stat.label} className="w-8 h-8" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
