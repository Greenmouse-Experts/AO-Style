import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { useParams } from "react-router-dom";
import { Users, Shirt, Palette } from "lucide-react"; // Import Lucide icons
import useGetAdminBusinessDetails from "../../../../hooks/settings/useGetAdmnBusinessInfo";

interface MarketRepStats {
  statusCode: number;
  data: {
    total: number;
    fabricVendors: number;
    fashionDesigners: number;
  };
}
export default function MarketRepCard() {
  const { salesId } = useParams();
  const { data } = useGetAdminBusinessDetails();
  const query = useQuery<MarketRepStats>({
    queryKey: ["market-rep-stats", salesId],
    queryFn: async () => {
      let resp = await CaryBinApi.get(
        "/owner-analytics/market-rep-stats/" + data.data.id,
      );
      return resp.data;
    },
    retry: 1,
  });
  return <>{JSON.stringify(data.data.id)}</>;
  if (query.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm"
          >
            <div>
              {/* Placeholder for value */}
              <div className="h-7 w-20 bg-gray-200 rounded animate-pulse"></div>
              {/* Placeholder for label */}
              <div className="h-5 w-32 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
            {/* Placeholder for icon container */}
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div>
        Error fetching data.{" "}
        <button onClick={() => query.refetch()}>Retry</button>
      </div>
    );
  }

  const stats = [
    { label: "Total", value: query.data?.data?.total || 0, icon: Users }, // Use Users icon
    {
      label: "Fabric Vendors",
      value: query.data?.data?.fabricVendors || 0,
      icon: Shirt, // Use Shirt icon
    },
    {
      label: "Fashion Designers",
      value: query.data?.data?.fashionDesigners || 0,
      icon: Palette, // Use Palette icon
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm"
        >
          <div>
            <p className="text-xl font-bold leading-loose">{stat.value}</p>
            <p className="text-[#8299EA]">{stat.label}</p>
          </div>
          <div
            className={`w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-[#8299EA]`} // Adjusted size for icon container
          >
            {stat.icon && <stat.icon size={40} />}{" "}
            {/* Render the Lucide icon with adjusted size */}
          </div>
        </div>
      ))}
    </div>
  );
}
