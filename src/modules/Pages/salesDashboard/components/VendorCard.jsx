import React from "react";
import { FaStore, FaCalendar, FaBox, FaArrowRight } from "react-icons/fa";
import { GiScissors } from "react-icons/gi";
import { formatDateStr } from "../../../../lib/helper";

const VendorCard = ({ vendor, vendorType, onViewProducts }) => {
  // Safety check for vendor
  if (!vendor) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600 text-center">Error: Vendor data missing</p>
      </div>
    );
  }

  const getVendorIcon = () => {
    return vendorType === "fabric-vendor" ? (
      <FaStore className="w-6 h-6 text-purple-600" />
    ) : (
      <GiScissors className="w-6 h-6 text-pink-600" />
    );
  };

  const getVendorTypeLabel = () => {
    return vendorType === "fabric-vendor"
      ? "Fabric Vendor"
      : "Fashion Designer";
  };

  const getGradientClass = () => {
    return vendorType === "fabric-vendor"
      ? "from-purple-400 to-purple-600"
      : "from-pink-400 to-pink-600";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Header with avatar and basic info */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div
              className={`w-12 h-12 bg-gradient-to-r ${getGradientClass()} rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0`}
            >
              {(vendor.name || vendor.email || vendor.displayName || "?")
                .charAt(0)
                .toUpperCase()}
            </div>

            {/* Vendor Info */}
            <div className="flex-1 min-w-0">
              <h3
                className="text-lg font-semibold text-gray-900 truncate"
                title={
                  vendor.displayName || vendor.name || vendor.email || "Unknown"
                }
              >
                {vendor.displayName ||
                  vendor.name ||
                  vendor.email ||
                  "Unknown Vendor"}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {vendor.businessName ||
                  vendor.business_info?.business_name ||
                  "No business name"}
              </p>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                {getVendorIcon()}
                <span className="ml-1">{getVendorTypeLabel()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-sm">
          <div className="flex items-center text-gray-600">
            <FaCalendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              Joined{" "}
              {vendor.joinDate ||
                (vendor.created_at
                  ? formatDateStr(vendor.created_at.split(".")[0])
                  : "N/A")}
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 truncate" title={vendor.email}>
            📧 {vendor.email}
          </p>
          {vendor.phone && (
            <p className="text-sm text-gray-600 mt-1">📞 {vendor.phone}</p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => {
            if (onViewProducts) {
              onViewProducts(vendor);
            }
          }}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium group-hover:shadow-md"
        >
          <FaBox className="mr-2 w-4 h-4" />
          View Products
          <FaArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
};

export default VendorCard;
