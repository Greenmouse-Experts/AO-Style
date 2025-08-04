import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import WalletPage from "./components/WalletPage";
import BarChartComponent from "./components/BarChartComponent";
import useQueryParams from "../../../hooks/useQueryParams";
import useGetMyPayment from "../../../hooks/payment/useGetPayment";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import useDebounce from "../../../hooks/useDebounce";
import { formatDateStr } from "../../../lib/helper";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import useFetchWithdrawal from "../../../hooks/withdrawal/useFetchWithdrawal";
import ReusableTable from "../adminDashboard/components/ReusableTable";

const transactions = [
  {
    id: 1,
    transactionId: "TXNRIO1234FNK",
    date: "19-02-25",
    time: "12:30pm",
    category: "Fabric & Tailor",
    amount: "N 200,000",
    status: "Completed",
  },
  {
    id: 2,
    transactionId: "TXNRIO1234FNK",
    date: "19-02-25",
    time: "12:30pm",
    category: "Fabric & Tailor",
    amount: "N 200,000",
    status: "Completed",
  },
  {
    id: 3,
    transactionId: "TXNRIO1234FNK",
    date: "19-02-25",
    time: "12:30pm",
    category: "Fabric",
    amount: "N 200,000",
    status: "Ongoing",
  },
  {
    id: 4,
    transactionId: "TXNRIO1234FNK",
    date: "19-02-25",
    time: "12:30pm",
    category: "Fabric & Tailor",
    amount: "N 200,000",
    status: "Failed",
  },
  {
    id: 5,
    transactionId: "TXNRIO1234FNK",
    date: "19-02-25",
    time: "12:30pm",
    category: "Fabric",
    amount: "N 200,000",
    status: "Completed",
  },
  {
    id: 6,
    transactionId: "TXNRIO1234FNK",
    date: "19-02-25",
    time: "12:30pm",
    category: "Fabric & Tailor",
    amount: "N 200,000",
    status: "Completed",
  },
];

export default function TransactionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[page]": 1,
    "pagination[limit]": 10,
  });

  const { data: getMyProductData, isPending } = useFetchWithdrawal({
    ...queryParams,
  });

  console.log(getMyProductData?.data);

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
    getMyProductData?.count / (queryParams["pagination[limit]"] ?? 10)
  );
  console.log(getMyProductData);

  const location = useLocation();

  const transactionsData = useMemo(
    () =>
      getMyProductData?.data
        ? getMyProductData?.data.map((details) => {
            return {
              ...details,
              amount: `${details?.amount}`,
              currency: `${details?.currency}`,
              status: `${details?.status}`,
              dateAdded: `${
                details?.created_at
                  ? formatDateStr(details?.created_at.split(".").shift())
                  : ""
              }`,
            };
          })
        : [],
    [getMyProductData?.data]
  );

  const columns = useMemo(
    () => [
      { key: "amount", label: "Amount" },
      { key: "currency", label: "currency" },
      {
        label: "Date",
        key: "date",
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
                : value === "APPROVED"
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {value}
          </span>
        ),
      },
    ],
    []
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
      head: [["Transaction ID", "Category", "Amount", "Status", "Date"]],
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

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "completed" && transaction.status !== "Completed")
      return false;
    if (filter === "pending" && transaction.status !== "Ongoing") return false;
    if (filter === "failed" && transaction.status !== "Failed") return false;
    return transaction.transactionId
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-2xl font-medium mb-3">Transactions</h1>
        <p className="text-gray-500">
          <Link to="/fabric" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Transactions
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 mb-6">
        <div className="lg:col-span-2">
          <BarChartComponent />
        </div>
        <div className="lg:col-span-1">
          <WalletPage />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg">
        <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
          <div className="flex flex-wrap space-x-6 text-gray-600 text-sm font-medium">
            <button
              onClick={() => {
                setFilter("all");
                updateQueryParams({
                  ...queryParams,
                  status: undefined,
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
                  status: "APPROVED",
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
                  status: "PENDING",
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
                setFilter("rejected");
                updateQueryParams({
                  ...queryParams,
                  status: "REJECTED",
                });
              }}
              className={`font-medium ${
                filter === "rejected"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              Rejected
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
                    evt.target.value ? evt.target.value : undefined
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
                Amount: row.amount,
                currency: row.currency,
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
      </div>
    </div>
  );
}
