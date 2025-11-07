import useVendorTopSellingProduct from "../../../../hooks/analytics/useGetVendorTopSellingProducts";

export default function TopSellingProducts() {
  const {
    isPending,
    isLoading,
    isError,
    data: vendorTopSellingProduct,
  } = useVendorTopSellingProduct();

  console.log("Here is the data for the vendor top selling product", vendorTopSellingProduct);

  // Extract products array from the response
  const products = vendorTopSellingProduct?.data || [];
  const totalCount = vendorTopSellingProduct?.data?.count || 0;

  // Calculate max count for progress bar percentage
  const maxCount = products.length > 0 
    ? Math.max(...products.map(item => item.count)) 
    : 1;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Top Selling Products</h3>
          {totalCount > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Total: {totalCount} {totalCount === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>
        {/* <button className="bg-gray-100 text-gray-600 px-4 py-1 rounded-lg text-sm hover:bg-gray-200 transition">
          Monthly ⌄
        </button> */}
      </div>

      {/* Loading State */}
      {(isPending || isLoading) && (
        <div className="flex items-center justify-center flex-1 min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-center justify-center flex-1 min-h-[200px]">
          <p className="text-xs sm:text-sm text-red-500">Failed to load products. Please try again.</p>
        </div>
      )}

      {/* Empty State */}
      {!isPending && !isLoading && !isError && products.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 min-h-[200px] text-center px-4">
          <svg 
            className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
            />
          </svg>
          <p className="text-xs sm:text-sm text-gray-500">No top selling products yet.</p>
          <p className="text-xs text-gray-400 mt-1">Products will appear here once sales are made.</p>
        </div>
      )}

      {/* Products List */}
      {!isPending && !isLoading && !isError && products.length > 0 && (
        <div className="space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {products.map((item, index) => {
            const product = item.product || {};
            const progressPercentage = (item.count / maxCount) * 100;
            
            return (
              <div 
                key={product.id || index} 
                className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition"
              >
                {/* Fabric Icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center border border-purple-200">
                    <svg 
                      className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" 
                      />
                    </svg>
                  </div>
                  {/* Ranking Badge */}
                  <div className="absolute -top-1 -left-1 bg-purple-600 text-white text-[10px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-md">
                    {index + 1}
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                        {product.name || "Unnamed Product"}
                      </p>
                      <div className="flex items-center flex-wrap gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {item.count} {item.count === 1 ? 'Sale' : 'Sales'}
                        </p>
                        {product.sku && (
                          <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">
                            • SKU: {product.sku}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-bold text-purple-600 whitespace-nowrap">
                        ₦{parseInt(product.price || 0).toLocaleString()}
                      </p>
                      {product.original_price && product.original_price !== product.price && (
                        <p className="text-[10px] sm:text-xs text-gray-400 line-through">
                          ₦{parseInt(product.original_price).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative w-full h-1.5 sm:h-2 bg-purple-100 rounded-full mt-1.5 sm:mt-2 overflow-hidden">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}