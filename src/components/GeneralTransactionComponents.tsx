import { useQuery } from "@tanstack/react-query";
import useFetchAllCartTransactions from "../hooks/admin/useFetchAllCartTransactions";
import CaryBinApi from "../services/CarybinBaseUrl";
import ReusableTable from "../modules/Pages/tailorDashboard/components/ReusableTable";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaEllipsisH } from "react-icons/fa";
import { formatDateStr } from "../lib/helper";
import useQueryParams from "../hooks/useQueryParams";
import useUpdatedEffect from "../hooks/useUpdatedEffect";
import useDebounce from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
// export function GeneralTransactionComponent() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [activeTab, setActiveTab] = useState("All Transactions");
//   const [selectAll, setSelectAll] = useState(false);
//   const [selectedRows, setSelectedRows] = useState(new Set());

//   const query = useQuery<Api_response>({
//     queryKey: ["orders"],
//     queryFn: async () => {
//       let resp = await CaryBinApi.get("/payment/fetch-all");
//       console.log(resp.data);
//       return resp.data;
//     },
//   });

//   return (
//     <div>
//       {/*{JSON.stringify(query.data)}*/}
//       <div className="space-y-6">
//         {/* Search + Info */}
//         <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 mb-2  rounded-md shadow">
//           <input
//             type="text"
//             placeholder="Search by transaction ID or user email"
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setCurrentPage(1);
//             }}
//             className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />

//           <div className="text-sm text-gray-600">
//             Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
//             <span className="font-medium">
//               {Math.min(endIndex, filteredData.length)}
//             </span>{" "}
//             of <span className="font-medium">{filteredData.length}</span>{" "}
//             results
//           </div>
//         </div>
//       </div>
//       <ReusableTable columns={columns} data={TransactionData || []} />
//       <div className="bg-white mb-12 px-2 rounded-md flex  py-6">
//         <div className="flex items-center gap-2 ml-auto ">
//           <button
//             onClick={() => {
//               updateQueryParams({
//                 "pagination[page]": +queryParams["pagination[page]"] - 1,
//               });
//             }}
//             disabled={Number(queryParams["pagination[page]"] ?? 1) == 1}
//             className="px-3 py-1 rounded-md bg-gray-200"
//           >
//             ◀
//           </button>
//           <button
//             onClick={() => {
//               updateQueryParams({
//                 "pagination[page]": +queryParams["pagination[page]"] + 1,
//               });
//             }}
//             disabled={
//               Number(queryParams["pagination[page]"] ?? 1) == totalPages
//             }
//             className="px-3 py-1 rounded-md bg-gray-200"
//           >
//             ▶
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

interface ApiResponse {
  statusCode: number;
  data: Withdraw[];
  count: number;
}

interface Withdraw {
  id: string;
  user_id: string;
  amount: string;
  currency: string;
  status: string;
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
export function GeneralTransactionComponent() {
  const query = useQuery<ApiResponse>({
    queryKey: ["transactions", "general"],
    queryFn: async () => {
      const response = await CaryBinApi.get("/withdraw/fetch");
      return response.data;
    },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("All Transactions");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const { queryParams, updateQueryParams } = useQueryParams({
    status: "",
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });
  const totalPages = 1;

  const TransactionData = useMemo(
    () =>
      query.data?.data
        ? query.data.data.map((details) => {
            return {
              ...details,
              transactionID: `${details.payment?.transaction_id ?? ""}`,
              userName: `${details.user?.email ?? ""}`,
              amount: `${
                details.payment?.purchase?.items?.reduce((acc, item) => {
                  return acc + Number(item.price) * item.quantity;
                }, 0) ?? "0"
              }`,
              date: `${
                details.created_at
                  ? formatDateStr(
                      details.created_at.split(".").shift(),
                      "DD MMM YYYY - hh:mm a",
                    )
                  : ""
              }`,
              transactionType: `${details.payment?.purchase_type ?? ""}`,
            };
          })
        : [],
    [query.data?.data],
  );
  const filteredData = useMemo(() => {
    if (!TransactionData) return [];
    return TransactionData.filter((item) => {
      const term = searchTerm.toLowerCase();
      return (
        item.transactionID.toLowerCase().includes(term) ||
        item.userName.toLowerCase().includes(term)
      );
    });
  }, [TransactionData, searchTerm]);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, startIndex, endIndex]);
  const navigate = useNavigate();
  const [queryString, setQueryString] = useState(queryParams.q);
  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };
  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);
  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const columns = useMemo(
    () => [
      {
        label: () => (
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => {
              const newSelectAll = e.target.checked;
              setSelectAll(newSelectAll);
              const newSelected = new Set(
                newSelectAll ? TransactionData.map((item) => item.id) : [],
              );
              setSelectedRows(newSelected);
            }}
            className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
        ),
        key: "checkbox",
        render: (value, row) => (
          <input
            type="checkbox"
            checked={selectedRows.has(row.id)}
            onChange={(e) => {
              const newSelected = new Set(selectedRows);
              if (e.target.checked) {
                newSelected.add(row.id);
              } else {
                newSelected.delete(row.id);
              }
              setSelectedRows(newSelected);
              setSelectAll(newSelected.size === TransactionData.length);
            }}
            className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
        ),
        className: "text-gray-500 font-medium text-sm py-4 w-10",
      },
      {
        label: "Transaction ID",
        key: "transactionID",
        className: "text-gray-500 font-medium text-sm py-4",
      },
      {
        label: "Date and Time",
        key: "date",
        className: "text-gray-500 font-medium text-sm py-4",
      },
      {
        label: "User Name",
        key: "userName",
        className: "text-gray-500 font-medium text-sm py-4",
      },
      {
        label: "User Type",
        key: "userType",
        className: "text-gray-500 font-medium text-sm py-4",
      },
      {
        label: "Amount",
        key: "amount",
        className: "text-gray-500 font-medium text-sm py-4",
      },
      {
        label: "Transaction Type",
        key: "transactionType",
        className: "text-gray-500 font-medium text-sm py-4",
      },
      {
        label: "Status",
        key: "status",
        className: "text-gray-500 font-medium text-sm py-4",
        render: (status) => (
          <span
            className={`px-2 py-1 text-sm rounded-full font-medium ${
              status === "In-Progress"
                ? "bg-blue-100 text-blue-500"
                : "bg-green-100 text-green-500"
            }`}
          >
            {status}
          </span>
        ),
      },
      {
        label: "Action",
        key: "action",
        render: (_, row) => (
          <div className="relative" ref={dropdownRef}>
            <button
              className="p-2 text-gray-600"
              onClick={() => toggleDropdown(row.id)}
            >
              <FaEllipsisH />
            </button>
            {openDropdown === row.id && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10 shadow-lg">
                <>
                  <button
                    onMouseDown={() => {
                      navigate("/admin/transactions/" + row.id);
                    }}
                    // to={"/admin/transactions/" + row.id}
                    className="p-2 w-full"
                  >
                    View Details
                  </button>
                  <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                    Edit Transaction
                  </button>
                  <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full">
                    Remove Transaction
                  </button>
                </>
              </div>
            )}
          </div>
        ),
        className: "text-gray-500 font-medium text-sm py-4 w-20",
      },
    ],
    [selectAll, selectedRows, openDropdown, TransactionData],
  );
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
      <ReusableTable
        isLoading={query.isFetching}
        columns={columns}
        data={TransactionData}
      />
      <div className="bg-white mb-12 px-2 rounded-md flex  py-6">
        <div className="flex items-center gap-2 ml-auto ">
          <button
            onClick={() => {
              updateQueryParams({
                "pagination[page]": +queryParams["pagination[page]"] - 1,
              });
            }}
            disabled={Number(queryParams["pagination[page]"] ?? 1) == 1}
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
            disabled={
              Number(queryParams["pagination[page]"] ?? 1) == totalPages
            }
            className="px-3 py-1 rounded-md bg-gray-200"
          >
            ▶
          </button>
        </div>
      </div>
    </>
  );
}
