import React from "react";
import { FaPlus, FaSync } from "react-icons/fa";
import { Link } from "react-router-dom";

const QuickActions = ({
  selectedVendor,
  onRefresh,
  totalProducts = 0,
  isLoading = false,
  vendorType = "fabric-vendor",
}) => {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Left side - Product count and vendor info */}
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Product Management
            </h3>
            <p className="text-sm text-gray-600">
              {totalProducts} products •{" "}
              {selectedVendor?.businessName || selectedVendor?.displayName}
            </p>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors disabled:opacity-50"
            title="Refresh products"
          >
            <FaSync className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Add Fabric button - only show for fabric vendors */}
          {vendorType === "fabric-vendor" && (
            <Link
              to="/sales/add-fabric"
              state={{ selectedVendor }}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <FaPlus className="mr-2 w-4 h-4" />
              Add Fabric
            </Link>
          )}

          {/* Add Style button - only show for fashion designers */}
          {vendorType === "fashion-designer" && (
            <Link
              to="/sales/add-style"
              state={{ selectedVendor }}
              className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            >
              <FaPlus className="mr-2 w-4 h-4" />
              Add Style
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
