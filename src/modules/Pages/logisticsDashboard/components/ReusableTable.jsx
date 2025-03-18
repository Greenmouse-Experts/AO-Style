const ReusableTable = ({ columns, data }) => {
    return (
      <div className="bg-white overflow-x-auto">
        <table className="w-full border-collapse rounded-lg">
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
      </div>
    );
  };
  
  export default ReusableTable;
  