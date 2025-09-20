import React from "react";
import { FaStore, FaBox, FaUsers } from "react-icons/fa";
import { GiScissors } from "react-icons/gi";

const VendorStats = ({ vendorType, vendors, totalProducts = 0 }) => {
  const getVendorTypeLabel = () => {
    return vendorType === "fabric-vendor"
      ? "Fabric Vendors"
      : "Fashion Designers";
  };

  const getVendorIcon = () => {
    return vendorType === "fabric-vendor" ? (
      <FaStore className="w-6 h-6" />
    ) : (
      <GiScissors className="w-6 h-6" />
    );
  };

  const activeVendors = vendors.filter(
    (vendor) => vendor.status !== "inactive",
  ).length;
  const avgProductsPerVendor =
    vendors.length > 0 ? Math.round(totalProducts / vendors.length) : 0;

  const stats = [
    {
      label: `Total ${getVendorTypeLabel()}`,
      value: vendors.length,
      icon: getVendorIcon(),
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Active Vendors",
      value: activeVendors,
      icon: <FaUsers className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Total Products",
      value: totalProducts,
      icon: <FaBox className="w-6 h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Avg Products/Vendor",
      value: avgProductsPerVendor,
      icon: "",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:shadow-sm transition-shadow duration-200"
          >
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} ${stat.color} mr-4 flex-shrink-0`}
            >
              {stat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-gray-900">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 truncate">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorStats;
