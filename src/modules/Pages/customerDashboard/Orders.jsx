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

const SEARCH_FIELDS = [
  { label: "Order ID", value: "orderId" },
  { label: "Product", value: "product" },
  { label: "Amount", value: "amount" },
  { label: "Status", value: "status" },
  { label: "Date", value: "dateAdded" },
];

const OrderPage = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
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

  const {
    isPending,
    isLoading,
    isError,
    data: orderData,
  } = useGetOrder({
    ...queryParams,
  });

  console.log(orderData, "orders");

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
          <div
            className="relative"
            ref={openDropdown === row.id ? dropdownRef : null}
          >
            <button
              onClick={() => {
                setOpenDropdown(openDropdown === row.id ? null : row.id);
              }}
              className="px-2 py-1 cursor-pointer rounded-md hover:bg-gray-100"
            >
              •••
            </button>
            {openDropdown === row.id && (
              <div
                className={`absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-[9999] border border-gray-200 ${
                  // Check if this is one of the last 2 rows, then position dropdown above
                  index >= filteredOrderData.length - 2
                    ? "bottom-full mb-2"
                    : ""
                }`}
              >
                <Link to={`/customer/orders/orders-details/${row.id}`}>
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                    View Details
                  </button>
                </Link>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm border-t border-gray-100">
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown],
  );

  const customersOrderData = useMemo(
    () =>
      orderData?.data
        ? orderData?.data.map((details) => {
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
                  ? formatDateStr(
                      details?.created_at.split(".").shift(),
                      "D/M/YYYY h:mm A",
                    )
                  : ""
              }`,
            };
          })
        : [],
    [orderData?.data],
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

  const totalPages = Math.ceil(
    (orderData?.count || filteredOrderData?.length || 0) /
      (queryParams["pagination[limit]"] ?? 10),
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
            {/* <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">
              Export As ▼
            </button> */}
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

        {/* Table Section */}
        {/* <div className="overflow-visible relative">*/}
        <div className="bg-white p-4 rounded-lg overflow-visible">
          <CustomTable
            loading={isPending}
            columns={columns}
            data={filteredOrderData}
          />
        </div>

        {!filteredOrderData?.length && !isPending ? (
          <p className="flex-1 text-center text-sm md:text-sm">
            No Order found.
          </p>
        ) : (
          <></>
        )}

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
    </div>
  );
};

export default OrderPage;
