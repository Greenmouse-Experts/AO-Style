import useGetMarketRepAnalyticsSummary from "../../../../hooks/marketRep/useGetMarketRepAnalyticsSummary";

export default function StatsCard() {
  const { summaryData, isLoading, isError } = useGetMarketRepAnalyticsSummary();

  // Format commission value with proper number formatting
  const formatCommission = (value) => {
    if (!value) return "₦0";
    const numValue = parseFloat(value);
    return `₦${numValue.toLocaleString()}`;
  };

  const stats = [
    {
      image:
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742273107/AoStyle/Group_38685_ycsbd5.png",
      value: isLoading ? "..." : summaryData?.data?.total_vendors || 0,
      label: "Total Registered Users",
    },
    {
      image:
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742498125/AoStyle/Group_38685_alonno.png",
      value: isLoading
        ? "..."
        : summaryData?.data?.total_fashion_designers || 0,
      label: "Tailor/Fashion Designers",
    },
    {
      image:
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742498126/AoStyle/Group_386852_asfflk.png",
      value: isLoading ? "..." : summaryData?.data?.total_fabric_vendors || 0,
      label: "Materials Vendors",
    },
    {
      image:
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742498126/AoStyle/Group_38686_aoujfx.png",
      value: isLoading ? "..." : `₦${summaryData?.data?.total_commission || 0}`,
      label: "Commission Earned",
    },
  ];

  if (isError) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full bg-red-50 border border-red-200 rounded-md p-4 text-center">
          <p className="text-red-600">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2  gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-white p-4 rounded-md"
        >
          <div>
            <p className="text-xl font-bold leading-loose">{stat.value}</p>
            <p className="text-[#8299EA]">{stat.label}</p>
          </div>
          <div
            className={`w-20 h-20 flex items-center justify-center rounded-full`}
          >
            <img src={stat.image} alt={stat.label} className="w-14 h-14" />
          </div>
        </div>
      ))}
    </div>
  );
}
