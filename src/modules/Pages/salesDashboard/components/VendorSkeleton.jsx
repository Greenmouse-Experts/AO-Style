import React from "react";

const VendorSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
        >
          {/* Header */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {/* Avatar skeleton */}
                <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>

                {/* Vendor Info skeleton */}
                <div className="flex-1 min-w-0">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="flex items-center mt-1">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>

              {/* Status skeleton */}
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            </div>

            {/* Additional Info skeleton */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>

            {/* Contact Info skeleton */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>

          {/* Action Footer skeleton */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="h-10 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorSkeleton;
