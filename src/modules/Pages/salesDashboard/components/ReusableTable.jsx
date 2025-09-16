const ReusableTable = ({
  columns,
  data,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
  totalItems = 0,
}) => {
  return (
    <div className="bg-white overflow-x-auto">
      <table className="w-full border-collapse rounded-lg hidden sm:table">
        {/* Table Header */}
        <thead>
          <tr className="text-left text-gray-600">
            {columns.map((col, index) => (
              <th key={index} className="py-6 px-4 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
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

      {/* Mobile View: Stacked Layout */}
      <div className="block sm:hidden">
        {data.map((row, rowIndex) => (
          <div
            key={row.id || rowIndex}
            className="border border-gray-200 rounded-lg mb-4 p-4 bg-white"
          >
            {columns.map((col, colIndex) => (
              <div
                key={colIndex}
                className="flex justify-between py-3 last:border-none border-b border-gray-100"
              >
                <span className="font-medium text-gray-700">{col.label}:</span>
                <span className="text-gray-600">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* Items per page and info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) =>
                    onItemsPerPageChange &&
                    onItemsPerPageChange(parseInt(e.target.value))
                  }
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} results
              </div>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  onPageChange && onPageChange(Math.max(1, currentPage - 1))
                }
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {(() => {
                  const pages = [];
                  const showPages = 5;
                  let start = Math.max(
                    1,
                    currentPage - Math.floor(showPages / 2),
                  );
                  let end = Math.min(totalPages, start + showPages - 1);

                  if (end - start + 1 < showPages) {
                    start = Math.max(1, end - showPages + 1);
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => onPageChange && onPageChange(i)}
                        className={`px-3 py-1.5 text-sm rounded-md ${
                          i === currentPage
                            ? "bg-purple-500 text-white"
                            : "bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {i}
                      </button>,
                    );
                  }
                  return pages;
                })()}
              </div>

              <button
                onClick={() =>
                  onPageChange &&
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReusableTable;
