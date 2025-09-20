import { useMemo } from "react";

export default function StatsCard({ data, forExtraData }) {
  const stats = useMemo(
    () => [
      {
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742827212/AoStyle/Group_38685_lvqmtr.png",
        value: forExtraData?.totalCustomers ?? 0,
        label: "Customers",
      },
      {
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742827212/AoStyle/Group_38685_lvqmtr.png",
        value: data?.fashionDesigners ?? 0,
        label: "Tailors/Designers",
      },
      {
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742827221/AoStyle/Group_38685_iz31fn.png",
        value: data?.fabricVendors ?? 0,
        label: "Fabric Vendors",
      },
      {
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742827244/AoStyle/Group_38685_p4bgt4.png",
        value: data?.logisticsAgents ?? 0,
        label: "Logistics Agents",
      },
      {
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742827223/AoStyle/Group_38685_qx6z7j.png",
        value: data?.marketReps ?? 0,
        label: "Market Representatives",
      },
    ],
    [data, forExtraData],
  );

  return (
    <div
      className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-white p-4 rounded-md min-w-[240px] flex-shrink-0"
        >
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xl font-bold leading-loose">{stat.value}</p>
            <p className="text-[#8299EA] text-sm leading-tight">{stat.label}</p>
          </div>
          <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-full">
            <img src={stat.image} alt={stat.label} className="w-12 h-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
