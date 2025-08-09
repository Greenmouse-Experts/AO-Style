import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import ReusableTable from "./components/ReusableTable";
import WalletPage from "./components/WalletPage";
import BarChartComponent from "./components/BarChartComponent";
import WithdrawalModal from "./components/WithdrawalModal";
import ViewWithdrawalsModal from "./components/ViewWithdrawalsModal";
import useGetBusinessDetails from "../../../hooks/settings/useGetBusinessDetails";
import useFetchWithdrawal from "../../../hooks/withdrawal/useFetchWithdrawal";
import { GeneralTransactionComponent } from "../../../components/GeneralTransactionComponents";

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
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);

  const { data: businessData, isLoading: businessLoading } =
    useGetBusinessDetails();
  const { data: withdrawalData, isLoading: withdrawalLoading } =
    useFetchWithdrawal({
      limit: 10,
    });

  console.log("📄 TransactionPage - Component state:", {
    searchTerm,
    filter,
    businessLoading,
    withdrawalLoading,
  });
  console.log("🏢 TransactionPage - Business data:", businessData);
  console.log("💸 TransactionPage - Withdrawal data:", withdrawalData);

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

  // Combine real withdrawal data with mock transactions
  const realWithdrawals =
    withdrawalData?.data?.map((withdrawal, index) => ({
      id: withdrawal.id || index + 1000,
      transactionId: `WD${withdrawal.id || 1000 + index}`,
      date: withdrawal.created_at
        ? new Date(withdrawal.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
        : "N/A",
      time: withdrawal.created_at
        ? new Date(withdrawal.created_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A",
      category: "Withdrawal",
      amount: `₦ ${withdrawal.amount?.toLocaleString() || 0}`,
      status:
        withdrawal.status === "PENDING"
          ? "Ongoing"
          : withdrawal.status === "COMPLETED"
            ? "Completed"
            : withdrawal.status === "FAILED"
              ? "Failed"
              : "Ongoing",
    })) || [];

  console.log(
    "🔄 TransactionPage - Real withdrawals processed:",
    realWithdrawals,
  );

  // Combine real and mock data
  const allTransactions = [...realWithdrawals, ...transactions];
  console.log("📊 TransactionPage - All transactions combined:", {
    realWithdrawalsCount: realWithdrawals.length,
    mockTransactionsCount: transactions.length,
    totalCount: allTransactions.length,
  });

  const filteredTransactions = allTransactions.filter((transaction) => {
    if (filter === "completed" && transaction.status !== "Completed")
      return false;
    if (filter === "pending" && transaction.status !== "Ongoing") return false;
    if (filter === "failed" && transaction.status !== "Failed") return false;
    return transaction.transactionId
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  console.log("🔍 TransactionPage - Filtering results:", {
    filter,
    searchTerm,
    originalCount: allTransactions.length,
    filteredCount: filteredTransactions.length,
  });

  return (
    <>
      <GeneralTransactionComponent />
    </>
  );
  if (businessLoading || withdrawalLoading) {
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
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading transactions...</span>
        </div>
      </div>
    );
  }

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
          <WalletPage
            onWithdrawClick={() => setIsWithdrawalModalOpen(true)}
            onViewAllClick={() => setIsViewAllModalOpen(true)}
          />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg">
        <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
          <div className="flex flex-wrap space-x-6 text-gray-600 text-sm font-medium">
            <button
              onClick={() => {
                console.log("🔘 TransactionPage - Filter changed to: all");
                setFilter("all");
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
                console.log(
                  "🔘 TransactionPage - Filter changed to: completed",
                );
                setFilter("completed");
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
                console.log("🔘 TransactionPage - Filter changed to: pending");
                setFilter("pending");
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
                console.log("🔘 TransactionPage - Filter changed to: failed");
                setFilter("failed");
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
                value={searchTerm}
                onChange={(e) => {
                  console.log(
                    "🔍 TransactionPage - Search term changed:",
                    e.target.value,
                  );
                  setSearchTerm(e.target.value);
                }}
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

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No Transactions Found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== "all"
                ? "No transactions match your current filters."
                : "You haven't made any transactions yet."}
            </p>
          </div>
        ) : (
          <ReusableTable columns={columns} data={filteredTransactions} />
        )}
      </div>

      {/* Modals - Rendered at root level for proper centering */}
      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        businessWallet={businessData?.data?.business_wallet}
        onClose={() => setIsWithdrawalModalOpen(false)}
      />
      <ViewWithdrawalsModal
        isOpen={isViewAllModalOpen}
        onClose={() => setIsViewAllModalOpen(false)}
      />
    </div>
  );
}
