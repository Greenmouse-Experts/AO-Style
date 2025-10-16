import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import BarChartComponent from "./components/BarChartComponent";
import ExpensesChart from "./components/ExpensesChart";
import useQueryParams from "../../../hooks/useQueryParams";
import useGetMyPayment from "../../../hooks/payment/useGetPayment";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import { formatDateStr, formatNumberWithCommas } from "../../../lib/helper";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import ReusableTable from "../adminDashboard/components/ReusableTable";

export default function TransactionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[page]": 1,
    "pagination[limit]": 10,
  });

  const { data: getMyProductData, isPending } = useGetMyPayment({
    ...queryParams,
  });
  console.log("this is the transaction data", getMyProductData);
  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const totalPages = Math.ceil(
    getMyProductData?.count / (queryParams["pagination[limit]"] ?? 10),
  );
  console.log(getMyProductData);

  const transactionsData = useMemo(
    () =>
      getMyProductData?.data
        ? getMyProductData?.data.map((details) => {
            return {
              ...details,
              orderId: `${details?.id?.replace(/-/g, "").slice(0, 12).toUpperCase()}`,
              amount: `${formatNumberWithCommas(details?.amount)}`,
              status: `${details?.payment_status}`,
              type: `${details?.purchase_type}`,
              dateAdded: `${
                details?.created_at
                  ? formatDateStr(
                      details?.created_at.split(".").shift(),
                      "D/M/YYYY h:mm A",
                    )
                  : ""
              }`,
            };
          })
        : [],
    [getMyProductData?.data],
  );

  const columns = useMemo(
    () => [
      { key: "orderId", label: "Order ID" },

      { key: "type", label: "Type" },
      { key: "amount", label: "Amount" },
      {
        label: "Date",
        key: "dateAdded",
      },

      {
        label: "Status",
        key: "status",
        render: (value) => (
          <span
            className={`px-3 py-1 text-sm font-light rounded-md ${
              value === "PENDING"
                ? "bg-yellow-100 text-yellow-600"
                : value === "Cancelled"
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
            }`}
          >
            {value}
          </span>
        ),
      },
    ],
    [],
  );

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(getMyProductData?.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "MyPayment.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Transaction ID", "Type", "Amount", "Status", "Date"]],
      body: transactionsData?.map((row) => [
        row.transactionId,
        row.amount,
        row.status,
        row.dateAdded,
      ]),
      headStyles: {
        fillColor: [209, 213, 219],
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
        fontSize: 10,
      },
    });
    doc.save("Mypayment.pdf");
  };

  return (
    <div>
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-2xl font-medium mb-3">Transactions</h1>
        <p className="text-gray-500">
          <Link to="/customer" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Transactions
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
          <div className="flex flex-wrap space-x-6 text-gray-600 text-sm font-medium">
            <button
              onClick={() => {
                setFilter("all");
                updateQueryParams({
                  ...queryParams,
                  payment_status: undefined,
                });
              }}
              className={`font-medium ${
                filter === "all"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              All Transaction
            </button>
            <button
              onClick={() => {
                setFilter("completed");
                updateQueryParams({
                  ...queryParams,
                  payment_status: "SUCCESS",
                });
              }}
              className={`font-medium ${
                filter === "completed"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => {
                setFilter("pending");
                updateQueryParams({
                  ...queryParams,
                  payment_status: "PENDING",
                });
              }}
              className={`font-medium ${
                filter === "pending"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => {
                setFilter("failed");
                updateQueryParams({
                  ...queryParams,
                  payment_status: "FAILED",
                });
              }}
              className={`font-medium ${
                filter === "failed"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              Failed
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none"
                value={queryString}
                onChange={(evt) =>
                  setQueryString(
                    evt.target.value ? evt.target.value : undefined,
                  )
                }
              />
            </div>
            <select
              onChange={handleExport}
              className="bg-gray-100 outline-none text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
            >
              <option value="" disabled selected>
                Export As
              </option>
              <option value="csv">Export to CSV</option>{" "}
              <option value="excel">Export to Excel</option>{" "}
              <option value="pdf">Export to PDF</option>{" "}
            </select>
            <CSVLink
              id="csvDownload"
              data={transactionsData?.map((row) => ({
                "Transaction ID": row.transactionId,
                Amount: row.amount,
                Status: row?.status,
                Date: row.dateAdded,

                // Location: row.location,
                // "Date Joined": row.dateJoined,
              }))}
              filename="MyPayment.csv"
              className="hidden"
            />{" "}
            <button className="px-4 py-2 bg-gray-200 rounded-md">
              Sort: Newest First ▼
            </button>
          </div>
        </div>

        <ReusableTable
          loading={isPending}
          columns={columns}
          data={transactionsData || []}
        />

        {!transactionsData?.length && !isPending ? (
          <p className="flex-1 text-center text-sm md:text-sm">
            No Transaction found.
          </p>
        ) : (
          <></>
        )}

        {transactionsData?.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <p className="text-sm text-gray-600">Items per page: </p>
              <select
                value={queryParams["pagination[limit]"] || 10}
                onChange={(e) =>
                  updateQueryParams({
                    "pagination[limit]": +e.target.value,
                  })
                }
                className="py-2 px-3 border border-gray-200 ml-2 rounded-md outline-none text-sm w-auto"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  updateQueryParams({
                    "pagination[page]": +queryParams["pagination[page]"] - 1,
                  });
                }}
                disabled={(queryParams["pagination[page]"] ?? 1) == 1}
                className="px-3 py-1 rounded-md bg-gray-200"
              >
                ◀
              </button>
              <button
                onClick={() => {
                  updateQueryParams({
                    "pagination[page]": +queryParams["pagination[page]"] + 1,
                  });
                }}
                disabled={(queryParams["pagination[page]"] ?? 1) == totalPages}
                className="px-3 py-1 rounded-md bg-gray-200"
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </div>
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 mb-6">
        <div className="lg:col-span-2">
          <BarChartComponent />
        </div>
        <div className="lg:col-span-1">
          <ExpensesChart />
        </div>
      </div>*/}
    </div>
  );
}
