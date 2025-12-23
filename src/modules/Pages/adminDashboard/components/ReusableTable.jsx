import Loader from "../../../../components/ui/Loader";

const ReusableTable = ({ columns, data, loading }) => {
  // Safety check: ensure columns is an array
  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    return (
      <div className="bg-white overflow-visible p-6 text-center text-gray-500">
        No columns defined
      </div>
    );
  }

  // Safety check: ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white overflow-visible">
      {loading ? (
        <div className=" flex !w-full items-center justify-center">
          <Loader />
        </div>
      ) : (
        <table className="w-full border-collapse rounded-lg hidden sm:table relative</div>">
          {/* Table Header */}
          <thead>
            <tr className="text-left text-gray-600">
              {columns.map((col, index) => {
                if (!col) return null;
                const alignClass = col.align === "right" 
                  ? "text-right" 
                  : col.align === "center" 
                    ? "text-center" 
                    : "text-left";
                return (
                  <th
                    key={`header-${col.key || index}`}
                    className={`py-6 px-4 font-medium ${alignClass}`}
                    style={{ 
                      width: col.width || "auto",
                      minWidth: col.width || "auto",
                      maxWidth: col.width || "none"
                    }}
                  >
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}

          <tbody>
            {safeData.map((row, rowIndex) => (
              <tr
                key={row.id || `row-${rowIndex}`}
                className={`border-b border-gray-200 ${
                  rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100`}
              >
                {columns.map((col, colIndex) => {
                  if (!col || !col.key) return null;
                  const alignClass = col.align === "right" 
                    ? "text-right" 
                    : col.align === "center" 
                      ? "text-center" 
                      : "text-left";
                  return (
                    <td
                      key={`${row.id || rowIndex}-${col.key || colIndex}`}
                      className={`py-5 px-4 font-light relative overflow-visible align-top ${alignClass}`}
                      style={{ 
                        width: col.width || "auto",
                        minWidth: col.width || "auto"
                      }}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Mobile View: Custom Card Layout Designed for Mobile */}
      <div className="block sm:hidden">
        {safeData?.map((row, rowIndex) => {
          // Safety check: ensure columns exist and is an array
          if (!columns || !Array.isArray(columns) || columns.length === 0) {
            return null;
          }
          
          // Find specific columns for mobile layout - with null safety
          const imageCol = columns.find((col) => col && col.key === "image");
          const nameCol = columns.find((col) => col && col.key === "name");
          const skuCol = columns.find((col) => col && col.key === "sku");
          const categoryCol = columns.find((col) => col && col.key === "category");
          const fabricTypeCol = columns.find((col) => col && col.key === "fabric_type");
          const priceCol = columns.find((col) => col && col.key === "price");
          const stockCol = columns.find((col) => col && col.key === "qty");
          const statusCol = columns.find((col) => col && col.key === "admin-status");
          const actionCol = columns.find((col) => col && col.key === "action");
          
          // Get other columns that aren't the special ones
          const otherCols = columns.filter(
            (col) => col && col.key && !["image", "name", "sku", "category", "fabric_type", "price", "qty", "admin-status", "action"].includes(col.key)
          );


          return (
            <div
              key={`mobile-${row.id || rowIndex}`}
              className="mb-4 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Top Section: Image, Product Info, and Actions */}
              <div className="p-4">
                <div className="flex gap-3 items-start">
                  {/* Product Image */}
                  {imageCol && imageCol.key && (
                    <div className="flex-shrink-0">
                      {imageCol.render
                        ? imageCol.render(row[imageCol.key], row)
                        : row[imageCol.key]}
                    </div>
                  )}
                  
                  {/* Product Name, Description, SKU */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      {/* Product Name - Takes available space */}
                      <div className="flex-1 min-w-0">
                        {nameCol && nameCol.key ? (
                          nameCol.render ? (
                            <div className="pr-2">
                              {nameCol.render(row[nameCol.key], row)}
                            </div>
                          ) : (
                            <div className="font-semibold text-gray-900 text-sm leading-tight pr-2">
                              {row[nameCol.key] || "Unnamed Product"}
                            </div>
                          )
                        ) : (
                          <div className="font-semibold text-gray-900 text-sm leading-tight pr-2">
                            {row.name || "Unnamed Product"}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions Button - Fixed on right */}
                      {actionCol && actionCol.key && (
                        <div className="flex-shrink-0">
                          {actionCol.render
                            ? actionCol.render(row[actionCol.key], row)
                            : row[actionCol.key]}
                        </div>
                      )}
                    </div>
                    
                    {/* SKU */}
                    {skuCol && skuCol.key && (
                      <div className="mt-2">
                        {skuCol.render
                          ? skuCol.render(row[skuCol.key], row)
                          : row[skuCol.key]}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100"></div>

              {/* Details Section - All items stacked vertically */}
              <div className="px-4 py-3 space-y-3">
                {/* Category */}
                {categoryCol && categoryCol.key && (
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Category
                    </div>
                    <div>
                      {categoryCol.render
                        ? categoryCol.render(row[categoryCol.key], row)
                        : row[categoryCol.key]}
                    </div>
                  </div>
                )}

                {/* Fabric Type */}
                {fabricTypeCol && fabricTypeCol.key && (
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Fabric Type
                    </div>
                    <div>
                      {fabricTypeCol.render
                        ? fabricTypeCol.render(row[fabricTypeCol.key], row)
                        : row[fabricTypeCol.key]}
                    </div>
                  </div>
                )}

                {/* Price */}
                {priceCol && priceCol.key && (
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Price
                    </div>
                    <div>
                      {priceCol.render
                        ? priceCol.render(row[priceCol.key], row)
                        : row[priceCol.key]}
                    </div>
                  </div>
                )}

                {/* Stock */}
                {stockCol && stockCol.key && (
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Stock
                    </div>
                    <div>
                      {stockCol.render
                        ? stockCol.render(row[stockCol.key], row)
                        : row[stockCol.key]}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100"></div>

              {/* Status Section */}
              {statusCol && statusCol.key && (
                <div className="px-4 py-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </div>
                    <div>
                      {statusCol.render
                        ? statusCol.render(row[statusCol.key], row)
                        : row[statusCol.key]}
                    </div>
                  </div>
                </div>
              )}

              {/* Other columns that don't match the special keys */}
              {otherCols.length > 0 && (
                <>
                  <div className="border-t border-gray-100"></div>
                  <div className="px-4 py-3 space-y-3">
                    {otherCols.map((col, colIndex) => {
                      if (!col || !col.key) return null;
                      return (
                        <div key={`other-${colIndex}`}>
                          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            {col.label || col.key}
                          </div>
                          <div>
                            {col.render
                              ? col.render(row[col.key], row)
                              : row[col.key] || "N/A"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReusableTable;
