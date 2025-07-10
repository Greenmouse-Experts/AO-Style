export default function AnalyticsCards() {
  const stats = [
    {
      icon: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1746536471/AoStyle/Group1_vg0mlf.png",
      value: "12,432",
      label: "Number of Sales",
      subtext: "This Month",
      bgColor: "bg-[#F4EFFF]",
    },
    {
      icon: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1746536471/AoStyle/Group2_mhpszt.png",
      value: "₦280,000",
      label: "Profit by Sale",
      subtext: "This Month",
      bgColor: "bg-[#F4EFFF]",
    },
    {
      icon: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1746536472/AoStyle/Group3_t9ofqe.png",
      value: "₦319,000",
      label: "Total Revenue",
      subtext: "This Month",
      bgColor: "bg-[#FFE4E1]",
    },
    {
      icon: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1746536473/AoStyle/Group4_ogapaw.png",
      value: "102",
      label: "Total Customers",
      subtext: "This Month",
      bgColor: "bg-[#E0FFFF]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-white p-4 rounded-md"
        >
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-meduim text-gray-800">{stat.value}</p>
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
  );
}
