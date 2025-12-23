const ReusableTable = ({ columns, data }) => {
  return (
    <div className="bg-white overflow-x-auto">
      <table className="w-full border-collapse rounded-lg hidden sm:table">
        {/* Table Header */}
        <thead>
          <tr className="text-left text-gray-600">
            {columns.map((col, index) => (
              <th key={index} className="py-6 px-4 font-medium">{col.label}</th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-gray-200 ${
                rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
              } hover:bg-gray-100`}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="py-5 px-4 font-light">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile View: Optimized Card Layout */}
      <div className="block sm:hidden space-y-4 px-2">
        {data.map((row, rowIndex) => {
          // Find specific columns for better mobile layout
          const imageCol = columns.find((col) => col.key === "image");
          const nameCol = columns.find((col) => col.key === "name");
          const skuCol = columns.find((col) => col.key === "sku");
          const categoryCol = columns.find((col) => col.key === "category");
          const fabricTypeCol = columns.find((col) => col.key === "fabric_type");
          const priceCol = columns.find((col) => col.key === "price");
          const stockCol = columns.find((col) => col.key === "qty");
          const statusCol = columns.find((col) => col.key === "admin-status");
          const actionCol = columns.find((col) => col.key === "action");
          const otherCols = columns.filter(
            (col) =>
              !["image", "name", "sku", "category", "fabric_type", "price", "qty", "admin-status", "action"].includes(
                col.key
              )
          );

          return (
            <div
              key={rowIndex}
              className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden"
            >
              {/* Top Section: Image and Actions Row */}
              <div className="p-4 pb-3 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-3">
                  {/* Product Image - Full Width on Top */}
                  {imageCol && (
                    <div className="flex-shrink-0">
                      {imageCol.render
                        ? imageCol.render(row[imageCol.key], row)
                        : row[imageCol.key]}
                    </div>
                  )}
                  
                  {/* Actions - Top Right */}
                  {actionCol && (
                    <div className="flex-shrink-0">
                      {actionCol.render
                        ? actionCol.render(row[actionCol.key], row)
                        : row[actionCol.key]}
                    </div>
                  )}
                </div>

                {/* Product Name - Full Width Below Image */}
                {nameCol && (
                  <div className="w-full mb-2">
                    {nameCol.render
                      ? nameCol.render(row[nameCol.key], row)
                      : row[nameCol.key]}
                  </div>
                )}

                {/* SKU - Full Width */}
                {skuCol && (
                  <div className="w-full">
                    {skuCol.render
                      ? skuCol.render(row[skuCol.key], row)
                      : row[skuCol.key]}
                  </div>
                )}
              </div>

              {/* Main Info Section */}
              <div className="p-4 space-y-3">
                {/* Category and Fabric Type - Full Width Stacked */}
                {(categoryCol || fabricTypeCol) && (
                  <div className="space-y-2">
                    {categoryCol && (
                      <div className="w-full">
                        <div className="text-xs font-medium text-gray-500 mb-1">Category:</div>
                        <div>
                          {categoryCol.render
                            ? categoryCol.render(row[categoryCol.key], row)
                            : row[categoryCol.key]}
                        </div>
                      </div>
                    )}
                    {fabricTypeCol && (
                      <div className="w-full">
                        <div className="text-xs font-medium text-gray-500 mb-1">Fabric Type:</div>
                        <div>
                          {fabricTypeCol.render
                            ? fabricTypeCol.render(row[fabricTypeCol.key], row)
                            : row[fabricTypeCol.key]}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Price - Full Width */}
                {priceCol && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-500 mb-1">Price:</div>
                    <div className="w-full">
                      {priceCol.render
                        ? priceCol.render(row[priceCol.key], row)
                        : row[priceCol.key]}
                    </div>
                  </div>
                )}

                {/* Stock - Full Width */}
                {stockCol && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-500 mb-1">Stock:</div>
                    <div className="w-full">
                      {stockCol.render
                        ? stockCol.render(row[stockCol.key], row)
                        : row[stockCol.key]}
                    </div>
                  </div>
                )}

                {/* Admin Status - Full Width */}
                {statusCol && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-500 mb-1">Admin Status:</div>
                    <div className="w-full">
                      {statusCol.render
                        ? statusCol.render(row[statusCol.key], row)
                        : row[statusCol.key]}
                    </div>
                  </div>
                )}

                {/* Other columns if any */}
                {otherCols.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    {otherCols.map((col, colIndex) => (
                      <div
                        key={colIndex}
                        className="w-full"
                      >
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          {col.label}:
                        </div>
                        <div className="text-gray-700 break-words">
                          {col.render
                            ? col.render(row[col.key], row)
                            : row[col.key] || "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReusableTable;
