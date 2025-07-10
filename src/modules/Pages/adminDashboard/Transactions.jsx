import { useState, useRef, useEffect, useMemo } from "react";
import ReusableTable from "./components/ReusableTable";
import TransactionPayment from "./components/TransactionPayment";
import RegisterChart from "./components/RegisterChart";
import SalesSummaryChart from "./components/SalesSummaryChart";
import { FaEllipsisH } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { BsFilter } from "react-icons/bs";
import useDebounce from "../../../hooks/useDebounce";
import useQueryParams from "../../../hooks/useQueryParams";
import useFetchAllCartTransactions from "../../../hooks/admin/useFetchAllCartTransactions";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import { formatDateStr } from "../../../lib/helper";

const PaymentTransactionTable = () => {
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

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  const { data: getAllTransactionData, isPending } =
    useFetchAllCartTransactions({
      ...queryParams,
    });

  console.log(getAllTransactionData, "console.log");

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const totalTransactionPages = Math.ceil(
    getAllTransactionData?.count / (queryParams["pagination[limit]"] ?? 10)
  );

  const data = [
    {
      id: 1,
      transactionID: "TRX215465789123",
      date: "12 Aug 2025 - 12:25 am",
      userName: "Chukka Uzo",
      userType: "Customer",
      amount: "₦25,000.00",
      transactionType: "Payment",
      status: "In-Progress",
    },
    {
      id: 2,
      transactionID: "TRX215465789123",
      date: "12 Aug 2025 - 12:25 am",
      userName: "Chukka Uzo",
      userType: "Tailor",
      amount: "₦25,000.00",
      transactionType: "Refund",
      status: "In-Progress",
    },
    {
      id: 3,
      transactionID: "TRX215465789123",
      date: "12 Aug 2025 - 12:25 am",
      userName: "Chukka Uzo",
      userType: "Vendors",
      amount: "₦25,000.00",
      transactionType: "Payment",
      status: "Completed",
    },
    {
      id: 4,
      transactionID: "TRX215465789123",
      date: "12 Aug 2025 - 12:25 am",
      userName: "Chukka Uzo",
      userType: "Sales Rep",
      amount: "₦25,000.00",
      transactionType: "Payout",
      status: "In-Progress",
    },
    {
      id: 5,
      transactionID: "TRX215465789123",
      date: "12 Aug 2025 - 12:25 am",
      userName: "Chukka Uzo",
      userType: "Logistics",
      amount: "₦25,000.00",
      transactionType: "Payment",
      status: "Completed",
    },
  ];

  const tabs = ["All Transactions", "Income", "Payouts"];

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
                newSelectAll ? data.map((item) => item.id) : []
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
              setSelectAll(newSelected.size === data.length);
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
                <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                  View Details
                </button>
                <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                  Edit Transaction
                </button>
                <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full">
                  Remove Transaction
                </button>
              </div>
            )}
          </div>
        ),
        className: "text-gray-500 font-medium text-sm py-4 w-20",
      },
    ],
    [selectAll, selectedRows, getAllTransactionData?.data, openDropdown]
  );

  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

  const filteredData = data.filter((transaction) => {
    const matchesSearch = Object.values(transaction).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesTab =
      activeTab === "All Transactions" ||
      (activeTab === "Income" &&
        ["Payment"].includes(transaction.transactionType)) ||
      (activeTab === "Payouts" &&
        ["Payout", "Refund"].includes(transaction.transactionType));
    return matchesSearch && matchesTab;
  });

  const TransactionData = useMemo(
    () =>
      getAllTransactionData?.data
        ? getAllTransactionData?.data.map((details) => {
            return {
              ...details,
              transactionID: `${details?.transaction_id ?? ""}`,
              userName: `${details?.user?.name ?? ""}`,
              amount: `${details?.items?.reduce((acc, item) => {
                return acc + Number(item.price_at_time) * item.quantity;
              }, 0)}`,
              location: `${details?.profile?.address ?? ""}`,
              date: `${
                details?.created_at
                  ? formatDateStr(
                      details?.created_at.split(".").shift(),
                      "DD MMM YYYY - hh:mm a"
                    )
                  : ""
              }`,
            };
          })
        : [],
    [getAllTransactionData?.data]
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    getAllTransactionData?.count / (queryParams["pagination[limit]"] ?? 10)
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <TransactionPayment />
      <div className="bg-white p-6 rounded-xl overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`text-sm font-medium ${
                  activeTab === tab
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                  setSelectAll(false);
                  setSelectedRows(new Set());
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
            <div className="relative">
              <input
                type="text"
                placeholder="Search ..."
                value={queryString}
                onChange={(evt) =>
                  setQueryString(
                    evt.target.value ? evt.target.value : undefined
                  )
                }
                className="py-2 pl-10 pr-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
              />
              <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap flex items-center">
              <BsFilter className="mr-1" /> Filter
            </button>
            <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
              Report ▾
            </button>
            <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
              Bulk Action ▾
            </button>
          </div>
        </div>
        <div className="flex border-b border-gray-200 mb-4"></div>
        {activeTab === "All Transactions" && (
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={(e) => {
                const newSelectAll = e.target.checked;
                setSelectAll(newSelectAll);
                const newSelected = new Set(
                  newSelectAll ? data.map((item) => item.id) : []
                );
                setSelectedRows(newSelected);
              }}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-2"
            />
            <span className="text-sm text-gray-600">Select All</span>
          </div>
        )}
        <ReusableTable
          columns={columns}
          loading={isPending}
          data={TransactionData}
          rowClassName="border-none text-gray-700 text-sm"
          cellClassName="py-4"
        />

        {TransactionData?.length > 0 ? (
          <>
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
                  disabled={
                    (queryParams["pagination[page]"] ?? 1) == totalPages
                  }
                  className="px-3 py-1 rounded-md bg-gray-200"
                >
                  ▶
                </button>
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 flex flex-col">
          <RegisterChart />
        </div>
        <div className="lg:col-span-1">
          <SalesSummaryChart />
        </div>
      </div>
    </>
  );
};

export default PaymentTransactionTable;
