import { useMemo } from "react";

export default function StatsCard(vendorSummaryStat) {
  const cardValue = vendorSummaryStat?.vendorSummaryStat;
  const stats = useMemo(
    () => [
      {
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742827212/AoStyle/Group_38685_lvqmtr.png",
        value: cardValue?.totalOrders,
        label: "Total Orders",
      },
      {
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742827221/AoStyle/Group_38685_iz31fn.png",
        value: cardValue?.ongoingOrders,
        label: "Ongoing Orders",
      },
      {
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742827244/AoStyle/Group_38685_p4bgt4.png",
        value: cardValue?.totalProducts,
        label: "Total Styles",
      },
      {
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742827223/AoStyle/Group_38685_qx6z7j.png",
        value: `N${cardValue?.totalIncome}`,
        label: "Total Income",
      },
    ],
    [cardValue]
  );
  return (
    <div className="border-2 grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-4 gap-6">
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
