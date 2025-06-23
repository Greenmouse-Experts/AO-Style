const ReusableTable = ({ columns, data }) => {
  return (
    <div className="bg-white overflow-x-visible">
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

      {/* Mobile View: Stacked Layout */}
      <div className="block sm:hidden">
        {data?.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="border border-gray-200 rounded-lg mb-4 p-4 bg-white"
          >
            {columns?.map((col, colIndex) => (
              <div
                key={colIndex}
                className="flex justify-between py-3 last:border-none"
              >
                <span className="font-medium text-gray-700">{col?.label}:</span>
                <span className="text-gray-600">
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
