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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 w-full">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-white p-4 rounded-md w-full"
        >
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xl font-bold leading-loose truncate">
              {stat.value}
            </p>
            <p className="text-[#8299EA] text-sm leading-tight">{stat.label}</p>
          </div>
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full">
            <img
              src={stat.image}
              alt={stat.label}
              className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 object-contain"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Demo component to showcase the responsive behavior
function Demo() {
  const mockData = {
    fashionDesigners: 16,
    fabricVendors: 23,
    logisticsAgents: 13,
    marketReps: 8,
  };

  const mockExtraData = {
    totalCustomers: 38,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Responsive Stats Cards Demo</h1>
        <div className="bg-gray-50 p-4 rounded-lg">
          <StatsCard data={mockData} forExtraData={mockExtraData} />
        </div>
        <div className="mt-8 p-4 bg-white rounded-lg">
          <h2 className="text-lg font-semibold mb-2">
            Responsive Breakpoints:
          </h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • <strong>Mobile (default):</strong> 1 card per row - stacked
              vertically
            </li>
            <li>
              • <strong>Small (640px+):</strong> 2 cards per row
            </li>
            <li>
              • <strong>Large (1024px+):</strong> 3 cards per row
            </li>
            <li>
              • <strong>Extra Large (1280px+):</strong> 5 cards per row (all
              visible)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
