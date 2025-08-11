import Loader from "../../../../components/ui/Loader";

const ReusableTable = ({ columns, data, loading }) => {
  return (
    <div className="bg-white overflow-x-visible">
      {loading ? (
        <div className=" flex !w-full items-center justify-center">
          <Loader />
        </div>
      ) : (
        <table className="w-full  border-collapse rounded-lg hidden  sm:table">
          {/* Table Header */}
          <thead>
            <tr className="text-left text-gray-600">
              {columns.map((col, index) => (
                <th
                  key={`header-${col.key || index}`}
                  className="py-6 px-4 font-medium"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}

          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || `row-${rowIndex}`}
                className={`border-b border-gray-200 ${
                  rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100`}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={`${row.id || rowIndex}-${col.key || colIndex}`}
                    className="py-5 px-4 font-light"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Mobile View: Stacked Layout */}
      <div className="block sm:hidden">
        {data?.map((row, rowIndex) => (
          <div
            key={`mobile-${row.id || rowIndex}`}
            className="border border-gray-200 rounded-lg mb-4 p-4 bg-white"
          >
            {columns?.map((col, colIndex) => (
              <div
                key={`mobile-${row.id || rowIndex}-${col.key || colIndex}`}
                className="flex justify-between py-2 border-b border-gray-100 last:border-none"
              >
                <span className="text-sm text-gray-600 font-normal">
                  {col?.label}:
                </span>
                <span className="text-sm text-gray-800 font-medium">
                  {col?.render ? col?.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReusableTable;
