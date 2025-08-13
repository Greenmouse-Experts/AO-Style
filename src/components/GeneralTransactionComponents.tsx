import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../services/CarybinBaseUrl";
import { useMemo, useRef, useState } from "react";
import { formatDateStr } from "../lib/helper";
import useQueryParams from "../hooks/useQueryParams";
import { Link, useNavigate } from "react-router-dom";
import CustomTable from "./CustomTable";

interface ApiResponse {
  statusCode: number;
  data: Withdraw[];
  count: number;
}

const withdrawStatusOptions = [
  { key: "PENDING", label: "Pending" },
  { key: "FAILED", label: "Failed" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "PAID", label: "Paid" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "RETURNED", label: "Returned" },
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

const dummy_transactions: ApiResponse = {
  statusCode: 200,
  data: [
    {
      id: "596e5a0d-42a5-4bb2-b880-320529dc37ec",
      user_id: "7750e65e-33c7-435d-b1ea-e37306cb02c3",
      amount: "4000",
      currency: "NGN",
      status: "PENDING",
      notes: null,
      processed_by: null,
      processed_at: null,
      created_at: "2025-07-28 13:23:21.914",
      updated_at: "2025-07-28 14:23:21.914",
      deleted_at: null,
      user: {
        id: "7750e65e-33c7-435d-b1ea-e37306cb02c3",
        name: "green market fabric vendor 07",
        email: "greenmousedev+fv007@gmail.com",
        phone: "+2348134656597",
        is_email_verified: true,
        created_at: "2025-06-26T21:05:23.979Z",
        role: {
          id: "147f6092-5727-43bd-8f2d-dd6ab70020b9",
          name: "Fashion Designer",
          role_id: "fashion-designer",
        },
      },
    },
  ],
  count: 1,
};
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
export function GeneralTransactionComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(default_filters);
  const query = useQuery<ApiResponse>({
    queryKey: ["transactions", "general", filters],
    queryFn: async () => {
      const response = await CaryBinApi.get("/withdraw/fetch", {
        params: {
          ...filters,
        },
      });
      return response.data;
    },
  });
  const { queryParams, updateQueryParams } = useQueryParams({
    ...filters,
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });
  const totalPages = 1;
  const modalRef = useRef<HTMLInputElement>(null);

  const nav = useNavigate();

  const TransactionData = useMemo(
    () =>
      query.data?.data
        ? query.data.data.map((details) => {
            return {
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
              transactionType: "Withdraw",
              status: details.status,
            };
          })
        : [],
    [query.data?.data],
  );

  interface COLUMN_TYPE {
    label: string;
    key: string;
    render?: (value: any, item: Withdraw) => React.ReactNode;
  }
  const columns = useMemo<COLUMN_TYPE[]>(
    () => [
      {
        label: "User",
        key: "user",
        render: (_, item: Withdraw) => {
          return item.user.name;
        },
      },
      {
        label: "email",
        key: "email",
        render: (_, item) => item.user.email,
      },
      {
        label: "Amount",
        key: "amount",
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
      // {
      //   label: "Transaction Type",
      //   key: "transactionType",
      // },
      {
        label: "Status",
        key: "status",
        render: (status) => (
          <span
            className={`px-2 py-1 text-sm rounded-full font-medium ${
              status === "PENDING"
                ? "bg-yellow-100 text-yellow-500"
                : status === "COMPLETED"
                  ? "bg-green-100 text-green-500"
                  : "bg-red-100 text-red-500"
            }`}
          >
            {status}
          </span>
        ),
      },
    ],
    [TransactionData],
  );
  const actions = [
    {
      key: "view Detail",
      label: "View Detail",
      action: (item: Withdraw) => {
        // setData(item);
        // modalRef.current?.click();
        let url = window.location.pathname;
        console.log();
        const nav_url = url + "/" + item.id;
        nav(nav_url);
      },
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between bg-white p-4 mb-4 rounded-md shadow">
        <div className="bg-white px-6 py-4 mb-6">
          <h1 className="text-2xl font-medium mb-3">Transactions</h1>
          <p className="text-gray-500">
            <Link to="/tailor" className="text-blue-500 hover:underline">
              Dashboard
            </Link>{" "}
            &gt; Transactions
          </p>
        </div>
      </div>
      <div className="" data-theme="nord">
        {/* Search + Info */}
        <div className="flex items-center p-3 rounded-md gap-2">
          <input
            type="text"
            placeholder="Search by transaction ID or user email"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // setCurrentPage(1);
            }}
            className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="ml-auto gap-2 flex items-center">
            <select
              name=""
              className="select"
              id=""
              onChange={(e) => {
                let value = e.target.value;
                setFilters((pre) => {
                  let new_val = { ...pre, status: value as WithdrawStatus };
                  return new_val;
                });
              }}
            >
              <option value={undefined}>Default</option>
              {withdrawStatusOptions.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center mt-2 gap-2 px-3">
          <div>
            <label htmlFor="" className="label mb-2">
              Start Date
            </label>
            <input
              onChange={(e) => {
                let date = e.target.value;
                let new_val: Filters = { ...filters, startDate: date };
                setFilters(new_val);
              }}
              type="date"
              className="input-sm input"
            />
          </div>
          <div>
            <label htmlFor="" className="label mb-2">
              End Date
            </label>
            <input
              onChange={(e) => {
                let date = e.target.value;
                let new_val: Filters = { ...filters, endDate: date };
                setFilters(new_val);
              }}
              type="date"
              className="input-sm input"
            />
          </div>
        </div>
      </div>
      {query.isFetching ? (
        <div data-theme="nord" className="px-4 py-12 bg-white shadow">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="mb-4">Loading Transactions...</p>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      ) : (
        <CustomTable
          data={query?.data?.data || []}
          columns={columns}
          actions={actions}
        />
      )}

      {/* Put this part before </body> tag */}
    </>
  );
}
