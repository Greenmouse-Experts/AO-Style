import React, { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import ReusableTable from "../adminDashboard/components/ReusableTable";
import useGetOrder from "../../../hooks/order/useGetOrder";
import { formatDateStr, formatNumberWithCommas } from "../../../lib/helper";
import useQueryParams from "../../../hooks/useQueryParams";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import CustomTable from "../../../components/CustomTable";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";

const SEARCH_FIELDS = [
  { label: "Order ID", value: "orderId" },
  { label: "Product", value: "product" },
  { label: "Amount", value: "amount" },
  { label: "Status", value: "status" },
  { label: "Date", value: "dateAdded" },
];

const OrderPage = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const [searchField, setSearchField] = useState("orderId");
  const [searchTerm, setSearchTerm] = useState("");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  // Here is the core: why does data not show even though we get a response in console from backend?
  // Usually, this is because how the response is shaped or how it's accessed.
  // The original expects orderData to be an array, but frequently APIs respond with { data: [], count: n }
  // Let's check/adjust that.

  const {
    isPending,
    isLoading,
    isError,
    data: orderDataRaw,
  } = useGetOrder({
    ...queryParams,
  });

  // Debug output
  console.log("orderDataRaw from backend hook:", orderDataRaw);

  // Defensive: sometimes orderDataRaw is undefined/null, or structure is { data: [ ... ], count }
  // Try to parse accordingly.
  // We want our orderData to be an array of orders.
  let orderData = [];
  if (Array.isArray(orderDataRaw)) {
    orderData = orderDataRaw;
  } else if (orderDataRaw && Array.isArray(orderDataRaw.data)) {
    orderData = orderDataRaw.data;
  }

  // If data is empty, but you see raw data in console, check here!
  // Now orderData is always an array. If orderDataRaw.data is not the array, adjust above accordingly.

  const columns = useMemo(
    () => [
      { key: "orderId", label: "Order ID" },
      // { key: "transactionId", label: "Transaction ID" },
      { key: "product", label: "Product" },
      { key: "amount", label: "Amount" },
      {
        label: "Order Date",
        key: "dateAdded",
      },
      {
        label: "Status",
        key: "status",
        render: (value) => (
          <span
            className={`px-3 py-1 text-sm font-light rounded-md ${
              value === "PENDING" || value === "SHIPPED"
                ? "bg-yellow-100 text-yellow-600"
                : value === "CANCELLED"
                  ? "bg-red-100 text-red-600"
                  : value === "DELIVERED" || value === "SUCCESS"
                    ? "bg-green-100 text-green-600"
                    : "bg-blue-100 text-blue-600"
            }`}
          >
            {value}
          </span>
        ),
      },

      {
        label: "Action",
        key: "action",
        render: (_, row, index) => (
          <div className="relative">
            <button
              onClick={(e) => {
                if (openDropdown === row.id) {
                  setOpenDropdown(null);
                } else {
                  const rect = e.target.getBoundingClientRect();
                  const shouldShowAbove =
                    (index >= filteredOrderData.length - 2 &&
                      filteredOrderData.length > 2) ||
                    filteredOrderData.length === 1;
                  setDropdownPosition({
                    top: shouldShowAbove ? rect.top - 100 : rect.bottom + 5,
                    left: rect.right - 160,
                  });
                  setOpenDropdown(row.id);
                }
              }}
              className="px-2 py-1 cursor-pointer rounded-md hover:bg-gray-100"
            >
              •••
            </button>
          </div>
        ),
      },
    ],
    [openDropdown],
  );

  const customersOrderData = useMemo(
    () =>
      orderData
        ? orderData.map((details) => {
            return {
              ...details,
              orderId: `${details?.payment?.id ? details.payment.id.replace(/-/g, "").slice(0, 12).toUpperCase() : ""}`,
              transactionId: `${details?.payment?.transaction_id || "N/A"}`,
              product:
                details?.payment?.purchase?.items &&
                details?.payment?.purchase?.items.length > 0
                  ? details?.payment?.purchase?.items[0]?.name?.length > 15
                    ? `${details?.payment?.purchase?.items[0]?.name.slice(
                        0,
                        15,
                      )}...`
                    : details?.payment?.purchase?.items[0]?.name
                  : "No items",
              amount: `N ${formatNumberWithCommas(
                details?.total_amount ?? details?.payment?.amount ?? 0,
              )}`,
              status: `${details?.status || details?.payment?.payment_status || "PENDING"}`,
              dateAdded: `${
                details?.created_at
                  ? (() => {
                      try {
                        const dateObj = new Date(details.created_at);
                        const opts = {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "Africa/Lagos",
                        };
                        // en-GB gives day/month/year order; remove any comma between date and time
                        return dateObj
                          .toLocaleString("en-GB", opts)
                          .replace(",", "");
                      } catch (err) {
                        // Fallback to existing formatting if something goes wrong
                        return formatDateStr(
                          details?.created_at.split(".").shift(),
                          "D/M/YYYY h:mm A",
                        );
                      }
                    })()
                  : ""
              }`,
            };
          })
        : [],
    [orderData],
  );

  const [filter, setFilter] = useState("all");

  // Client-side search filtering
  const filteredOrderData = useMemo(() => {
    if (!searchTerm.trim()) return customersOrderData;
    const term = searchTerm.toLowerCase().trim();

    return customersOrderData.filter((row) => {
      switch (searchField) {
        case "orderId":
          return row.orderId?.toLowerCase().includes(term);
        case "product":
          return row.product?.toLowerCase().includes(term);
        case "amount":
          return row.amount?.toString().toLowerCase().includes(term);
        case "status":
          return row.status?.toLowerCase().includes(term);
        case "dateAdded":
          return row.dateAdded?.toLowerCase().includes(term);
        default:
          return false;
      }
    });
  }, [customersOrderData, searchField, searchTerm]);

  // Count: Prefer .count from object if exists, or fallback to array length
  let totalItems =
    orderDataRaw && typeof orderDataRaw.count === "number"
      ? orderDataRaw.count
      : filteredOrderData?.length || 0;

  const totalPages = Math.ceil(
    totalItems / (queryParams["pagination[limit]"] ?? 10),
  );

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredOrderData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "MyOrders.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ["Order ID", "Transaction ID", "Product", "Amount", "Date", "Status"],
      ],
      body: filteredOrderData?.map((row) => [
        row.orderId,
        row.transactionId,
        row.product,
        row.amount,
        row.dateAdded,
        row.status,
      ]),
      headStyles: {
        fillColor: [209, 213, 219],
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
        fontSize: 10,
      },
    });
    doc.save("MyOrders.pdf");
  };

  return (
    <div className="">
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-2xl font-medium mb-3">Orders</h1>
        <p className="text-gray-500">
          <Link to="/customer" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Orders
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg">
        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
          {/* Order Filters */}
          {/* "ongoing", "completed", "cancelled" */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
            {["all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`font-medium capitalize px-3 py-1 ${
                  filter === tab
                    ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                    : "text-gray-500"
                }`}
              >
                {tab} Orders
              </button>
            ))}
          </div>
          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="bg-gray-100 outline-none text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
              >
                {SEARCH_FIELDS.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
              <div className="relative w-full sm:w-auto">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder={`Search by ${SEARCH_FIELDS.find((f) => f.value === searchField)?.label || "Keyword"}...`}
                  className="w-full sm:w-[200px] pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none"
                  value={searchTerm}
                  onChange={(evt) => setSearchTerm(evt.target.value)}
                />
              </div>
            </div>
            <select
              onChange={handleExport}
              className="bg-gray-100 outline-none text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
            >
              <option value="" disabled selected>
                Export As
              </option>
              <option value="csv">Export to CSV</option>
              <option value="excel">Export to Excel</option>
              <option value="pdf">Export to PDF</option>
            </select>
            <CSVLink
              id="csvDownload"
              data={filteredOrderData?.map((row) => ({
                "Order ID": row.orderId,
                "Transaction ID": row.transactionId,
                Product: row.product,
                Amount: row.amount,
                Date: row?.dateAdded,
                Status: row.status,
              }))}
              filename="MyOrders.csv"
              className="hidden"
            />
          </div>
        </div>

        {/* Table Section (Loader UI for fetching) */}
        {isLoading || isPending ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#A14DF6] mb-4"></div>
            <div className="text-[#A14DF6] text-base font-medium">
              Loading orders...
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white p-4 rounded-lg overflow-visible">
              <CustomTable
                loading={false}
                columns={columns}
                data={filteredOrderData}
              />
            </div>

            {!filteredOrderData?.length ? (
              <p className="flex-1 text-center text-sm md:text-sm">
                No Order found.
              </p>
            ) : null}

            {filteredOrderData?.length > 0 && (
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
                        "pagination[page]":
                          +queryParams["pagination[page]"] - 1,
                      });
                    }}
                    disabled={(queryParams["pagination[page]"] ?? 1) === 1}
                    className="px-3 py-1 rounded-md bg-gray-200"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => {
                      updateQueryParams({
                        "pagination[page]":
                          +queryParams["pagination[page]"] + 1,
                      });
                    }}
                    disabled={
                      (queryParams["pagination[page]"] ?? 1) === totalPages ||
                      totalPages === 0
                    }
                    className="px-3 py-1 rounded-md bg-gray-200"
                  >
                    ▶
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Dropdown rendered outside table */}
        {openDropdown && (
          <div
            style={{
              position: "fixed",
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              zIndex: 9999,
            }}
            className="w-40 bg-white shadow-lg rounded-md border border-gray-200"
          >
            <Link to={`/customer/orders/orders-details/${openDropdown}`}>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                View Details
              </button>
            </Link>
            {/* <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm border-t border-gray-100">
              Cancel Order
            </button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
