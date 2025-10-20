import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../services/CarybinBaseUrl";
import { useMemo, useRef, useState } from "react";
import { formatDateStr } from "../lib/helper";
import useQueryParams from "../hooks/useQueryParams";
import { Link, useNavigate } from "react-router-dom";
import CustomTable from "./CustomTable";
import GeneralTransactionAnalysis from "./GeneralTransactionAnalysis";
import WalletPage from "../modules/Pages/salesDashboard/components/WalletPage";
import BarChartComponent from "../modules/Pages/salesDashboard/components/BarChartComponent";

interface ApiResponse {
  statusCode: number;
  data: Withdraw[];
  count: number;
}

// Update the status options to match your payment statuses
const withdrawStatusOptions = [
  { key: "SUCCESS", label: "Success" },
  { key: "PENDING", label: "Pending" },
  { key: "FAILED", label: "Failed" },
  { key: "CANCELLED", label: "Cancelled" },
  // { key: "COMPLETED", label: "Completed" },
] as const;

type WithdrawStatus = (typeof withdrawStatusOptions)[number]["key"];

interface Withdraw {
  id: string;
  user_id: string;
  amount: string;
  currency: string;
  status: WithdrawStatus | null;
  notes: null | string;
  processed_by: null | string;
  processed_at: null | string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  user: User;
  payment_status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_email_verified: boolean;
  created_at: string;
  role: Role;
}

interface Role {
  id: string;
  name: string;
  role_id: string;
}

interface Filters {
  page: number;
  status?: WithdrawStatus;
  limit: number;
  endDate?: Date | string;
  startDate?: Date | string;
}

const default_filters: Filters = {
  page: 1,
  limit: 10,
  status: undefined,
  endDate: undefined,
  startDate: undefined,
};

export function GeneralTransactionComponent({ hideWallet = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(default_filters);
  const [activeTab, setActiveTab] = useState<"transactions" | "withdrawals">(
    "transactions",
  );

  // Fetch payments and withdraws
  const paymentsQuery = useQuery<ApiResponse>({
    queryKey: ["payments", filters, searchTerm],
    queryFn: async () => {
      const response = await CaryBinApi.get("/payment/my-payments", {
        params: {
          ...filters,
          search: searchTerm || undefined,
        },
      });
      return response.data;
    },
  });

  const withdrawsQuery = useQuery<ApiResponse>({
    queryKey: ["withdraws", filters, searchTerm],
    queryFn: async () => {
      const response = await CaryBinApi.get("/withdraw/fetch", {
        params: {
          ...filters,
          search: searchTerm || undefined,
        },
      });
      return response.data;
    },
  });

  // Memoized filtered payments
  const filteredPayments = useMemo(() => {
    let data = paymentsQuery.data?.data || [];

    // Status filter
    if (filters.status) {
      data = data.filter(
        (item) =>
          (item.payment_status && item.payment_status === filters.status) ||
          (item.status && item.status === filters.status),
      );
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          item.user?.email?.toLowerCase().includes(searchLower) ||
          item.user?.name?.toLowerCase().includes(searchLower) ||
          item.amount?.toString().includes(searchLower) ||
          item.currency?.toLowerCase().includes(searchLower) ||
          item.payment_status?.toLowerCase().includes(searchLower),
      );
    }

    // Date filters
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      data = data.filter((item) => new Date(item.created_at) >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      data = data.filter((item) => new Date(item.created_at) <= endDate);
    }

    return data.map((details) => ({
      ...details,
      transactionID: details.id,
      userName: details.user?.email ?? "",
      amount: details.amount,
      date: details.created_at
        ? formatDateStr(
            details.created_at.split(".").shift(),
            "DD MMM YYYY - hh:mm a",
          )
        : "",
      _transactionType: "payment", // Add transaction type for routing
      status: details.payment_status || details?.status || "N/A",
    }));
  }, [paymentsQuery.data?.data, filters, searchTerm]);

  // Memoized filtered withdrawals
  const filteredWithdrawals = useMemo(() => {
    let data = withdrawsQuery.data?.data || [];

    // Status filter
    if (filters.status) {
      data = data.filter(
        (item) =>
          (item.payment_status && item.payment_status === filters.status) ||
          (item.status && item.status === filters.status),
      );
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          item.user?.email?.toLowerCase().includes(searchLower) ||
          item.user?.name?.toLowerCase().includes(searchLower) ||
          item.amount?.toString().includes(searchLower) ||
          item.currency?.toLowerCase().includes(searchLower) ||
          item.payment_status?.toLowerCase().includes(searchLower),
      );
    }

    // Date filters
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      data = data.filter((item) => new Date(item.created_at) >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      data = data.filter((item) => new Date(item.created_at) <= endDate);
    }

    return data.map((details) => ({
      ...details,
      transactionID: details.id,
      userName: details.user?.email ?? "",
      amount: details.amount,
      date: details.created_at
        ? formatDateStr(
            details.created_at.split(".").shift(),
            "DD MMM YYYY - hh:mm a",
          )
        : "",
      _transactionType: "withdrawal", // Add transaction type for routing
      status: details.payment_status || details?.status || "N/A",
    }));
  }, [withdrawsQuery.data?.data, filters, searchTerm]);

  // Columns for table
  interface COLUMN_TYPE {
    label: string;
    key: string;
    render?: (
      value: any,
      item: Withdraw & { _transactionType?: string },
    ) => React.ReactNode;
  }

  const columns = useMemo<COLUMN_TYPE[]>(
    () => [
      {
        label: "User Email",
        key: "email",
        render: (_, item) => item.user.email,
      },
      {
        label: "Amount",
        key: "amount",
        render: (_, item) =>
          `${item.currency} ${Number(item.amount).toLocaleString()}`,
      },
      {
        label: "Currency",
        key: "currency",
      },
      {
        label: "Date",
        key: "date",
        render: (_, item) => formatDateStr(item.created_at),
      },
      {
        label: "Type",
        key: "transactionType",
        render: (_, item) => (
          <span className="capitalize">
            {item._transactionType === "withdrawal"
              ? "Withdraw"
              : item._transactionType === "payment"
                ? "Payment"
                : "Payment"}
          </span>
        ),
      },
      {
        label: "Status",
        key: "status",
        render: (_, item) => (
          <span
            className={`px-2 py-1 text-sm rounded-full font-medium ${
              item?.payment_status === "PENDING" || item?.status === "PENDING"
                ? "bg-yellow-100 text-yellow-500"
                : item?.payment_status === "COMPLETED" ||
                    item?.payment_status === "SUCCESS" ||
                    item?.status === "SUCCESS" ||
                    item?.status === "COMPLETED"
                  ? "bg-green-100 text-green-500"
                  : item?.payment_status === "FAILED" ||
                      item?.payment_status === "CANCELLED" ||
                      item?.status === "FAILED" ||
                      item?.status === "CANCELLED"
                    ? "bg-red-100 text-red-500"
                    : "bg-gray-100 text-gray-500"
            }`}
          >
            {item?.payment_status || item?.status || "N/A"}
          </span>
        ),
      },
    ],
    [],
  );

  const nav = useNavigate();

  // Pass transaction type in route so details page can use it to determine endpoint
  const actions = [
    {
      key: "view Detail",
      label: "View Detail",
      action: (item: Withdraw & { _transactionType?: string }) => {
        let url = window.location.pathname;
        // Pass transaction type as a query param
        const nav_url =
          url + "/" + item.id + "?type=" + (item._transactionType || "payment");
        nav(nav_url);
      },
    },
  ];

  // Hide actions on the table when current path includes logistics (or common typo logictcs)
  const hideActions =
    window.location.pathname.includes("logistics") ||
    window.location.pathname.includes("logictcs");
  const tableActions = actions;

  // Handle search with debouncing effect
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(default_filters);
    setSearchTerm("");
  };

  // For pagination, use the count for the active tab
  const totalCount =
    activeTab === "transactions"
      ? paymentsQuery.data?.count || 0
      : withdrawsQuery.data?.count || 0;
  const totalPages = Math.ceil(totalCount / filters.limit);
  const next_page_disabled = filters.page >= totalPages;

  const isFetching =
    activeTab === "transactions"
      ? paymentsQuery.isFetching
      : withdrawsQuery.isFetching;

  // Data for current tab
  const currentData =
    activeTab === "transactions" ? filteredPayments : filteredWithdrawals;

  return (
    <>
      <div className="flex items-center justify-between bg-white p-4 mb-4 rounded-md shadow">
        <div className="bg-white px-6 py-4 mb-6">
          <h1 className="text-2xl font-medium mb-3">Transactions</h1>
          <p className="text-gray-500">
            <Link
              to={
                window.location.pathname.includes("tailor")
                  ? "/tailor"
                  : window.location.pathname.includes("fabric")
                    ? "/fabric"
                    : window.location.pathname.includes("customer")
                      ? "/customer"
                      : window.location.pathname.includes("logistics")
                        ? "/logistics"
                        : window.location.pathname.includes("admin")
                          ? "/admin"
                          : "/"
              }
              className="text-blue-500 hover:underline"
            >
              Dashboard
            </Link>{" "}
            &gt; Transactions
          </p>
        </div>
      </div>

      {!hideWallet && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 mb-6">
          <div className="lg:col-span-2">
            <BarChartComponent />
          </div>
          <div className="lg:col-span-1">
            <WalletPage />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            className={`btn btn-sm ${activeTab === "transactions" ? "btn-primary" : "btn-outline"}`}
            onClick={() => {
              setActiveTab("transactions");
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
          >
            Transactions
          </button>
          <button
            className={`btn btn-sm ${activeTab === "withdrawals" ? "btn-primary" : "btn-outline"}`}
            onClick={() => {
              setActiveTab("withdrawals");
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
          >
            Withdrawals
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4" data-theme="nord">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Search */}
          <div className="form-control w-full md:w-80">
            <label className="label">
              <span className="label-text font-medium">Search</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by email, amount, currency..."
                className="input input-bordered input-sm w-full pr-10"
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="form-control w-full md:w-56">
            <label className="label">
              <span className="label-text font-medium">Status</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={filters.status || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: (e.target.value as WithdrawStatus) || undefined,
                  page: 1, // Reset to first page when filtering
                }))
              }
            >
              <option value="">All Status</option>
              {withdrawStatusOptions.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Start Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered input-sm"
              value={(filters.startDate as string) || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value || undefined,
                  page: 1,
                }))
              }
            />
          </div>

          {/* End Date */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">End Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered input-sm"
              value={(filters.endDate as string) || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value || undefined,
                  page: 1,
                }))
              }
            />
          </div>

          {/* Clear Filters Button */}
          <div className="form-control">
            <label className="label">
              <span className="label-text opacity-0">Clear</span>
            </label>
            <button
              type="button"
              onClick={clearFilters}
              className="btn btn-outline btn-sm"
              disabled={
                !searchTerm &&
                !filters.status &&
                !filters.startDate &&
                !filters.endDate
              }
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Active filters display */}
        {(searchTerm ||
          filters.status ||
          filters.startDate ||
          filters.endDate) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-600">
              Active filters:
            </span>
            {searchTerm && (
              <span className="badge badge-primary badge-sm">
                Search: "{searchTerm}"
              </span>
            )}
            {filters.status && (
              <span className="badge badge-secondary badge-sm">
                Status:{" "}
                {
                  withdrawStatusOptions.find(
                    (opt) => opt.key === filters.status,
                  )?.label
                }
              </span>
            )}
            {filters.startDate && (
              <span className="badge badge-accent badge-sm">
                From:{" "}
                {typeof filters.startDate === "string" ? filters.startDate : ""}
              </span>
            )}
            {filters.endDate && (
              <span className="badge badge-accent badge-sm">
                To: {typeof filters.endDate === "string" ? filters.endDate : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results summary */}
      {/*<div className="bg-white p-2 mb-4 rounded-md shadow">
        <p className="text-sm text-gray-600">
          Showing {currentData.length} of {totalCount || 0} transactions
          {(searchTerm ||
            filters.status ||
            filters.startDate ||
            filters.endDate) &&
            " (filtered)"}
        </p>
      </div>*/}

      {isFetching ? (
        <div data-theme="nord" className="px-4 py-12 bg-white shadow">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="mb-4">
              Loading{" "}
              {activeTab === "transactions" ? "Transactions" : "Withdrawals"}...
            </p>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      ) : currentData.length === 0 ? (
        <div data-theme="nord" className="px-4 py-12 bg-white shadow">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 text-lg mb-2">
              No {activeTab === "transactions" ? "transactions" : "withdrawals"}{" "}
              found
            </p>
            {(searchTerm ||
              filters.status ||
              filters.startDate ||
              filters.endDate) && (
              <p className="text-gray-400 text-sm mb-4">
                Try adjusting your search criteria or filters
              </p>
            )}
            {(searchTerm ||
              filters.status ||
              filters.startDate ||
              filters.endDate) && (
              <button onClick={clearFilters} className="btn btn-primary btn-sm">
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <CustomTable
          data={currentData}
          columns={columns}
          actions={tableActions}
        />
      )}

      {/* Pagination */}
      <div
        data-theme="nord"
        className="mx-auto mt-4 w-full py-2 flex justify-center bg-white shadow"
      >
        <div className="join">
          <button
            className="join-item btn"
            onClick={() => {
              setFilters((prevFilters) => ({
                ...prevFilters,
                page: prevFilters.page - 1,
              }));
            }}
            disabled={filters.page === 1 || isFetching}
          >
            «
          </button>

          {[...Array(Math.min(4, totalPages))].map((_, index) => {
            const pageNumber =
              filters.page > 2 ? filters.page - 1 + index : index + 1;
            if (pageNumber > totalPages) return null;

            return (
              <button
                key={pageNumber}
                className={`join-item btn ${
                  filters.page === pageNumber ? "btn-active" : ""
                }`}
                onClick={() => {
                  setFilters((prevFilters) => ({
                    ...prevFilters,
                    page: pageNumber,
                  }));
                }}
                disabled={isFetching}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            className="join-item btn"
            onClick={() => {
              setFilters((prevFilters) => ({
                ...prevFilters,
                page: prevFilters.page + 1,
              }));
            }}
            disabled={
              next_page_disabled || isFetching || currentData.length === 0
            }
          >
            »
          </button>

          <form
            className=""
            onSubmit={(e) => {
              e.preventDefault();
              let form = new FormData(e.target as unknown as HTMLFormElement);
              let page = parseInt(form.get("page") as string);
              if (page && page > 0 && page <= totalPages) {
                setFilters({ ...filters, page });
              }
            }}
          >
            <input
              type="number"
              name="page"
              className="input w-14 join-item"
              placeholder={filters.page.toString()}
              min={1}
              max={totalPages}
            />
          </form>
        </div>
      </div>
    </>
  );
}
