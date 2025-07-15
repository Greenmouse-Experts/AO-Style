import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import ReusableTable from "./components/ReusableTable";
import WalletPage from "./components/WalletPage";
import BarChartComponent from "./components/BarChartComponent";

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

  const columns = [
    { key: "transactionId", label: "Transaction ID" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount" },
    {
      label: "Status",
      key: "status",
      render: (value) => (
        <span
          className={`px-3 py-1 text-sm font-light rounded-md ${
            value === "Ongoing"
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
  ];

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
          <Link to="/tailor" className="text-blue-500 hover:underline">
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
              onClick={() => setFilter("all")}
              className={`font-medium ${
                filter === "all"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              All Transaction
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`font-medium ${
                filter === "completed"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`font-medium ${
                filter === "pending"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("failed")}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 bg-gray-200 rounded-md">
              Export As ▼
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded-md">
              Sort: Newest First ▼
            </button>
          </div>
        </div>

        <ReusableTable columns={columns} data={filteredTransactions || []} />
      </div>
    </div>
  );
}
