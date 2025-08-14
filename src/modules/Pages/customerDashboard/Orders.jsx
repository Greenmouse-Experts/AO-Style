/**
 * Customer Orders Page
 *
 * Updated to use the /orders/fetch endpoint instead of static data.
 * Features:
 * - Displays orders with proper data mapping from API
 * - View Details button that navigates to order details page
 * - Correct status handling (PENDING, SHIPPED, DELIVERED, CANCELLED)
 * - Export functionality for orders data
 * - Search and pagination support
 */
import React, { useMemo, useState } from "react";
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

// Static data commented out - now using API endpoint
// const orders = [
//   {
//     id: "01",
//     orderId: "QWER123DFDG324R",
//     date: "15-02-25",
//     vendor: "Sandra Fabrics",
//     designer: "Jude Stitches",
//     delivery: "21-05-25",
//     status: "Ongoing",
//   },
//   {
//     id: "02",
//     orderId: "QWER123DFDG324R",
//     date: "15-02-25",
//     vendor: "Sandra Fabrics",
//     designer: "Hamzat Stitches",
//     delivery: "21-05-25",
//     status: "Ongoing",
//   },
//   {
//     id: "03",
//     orderId: "QWER123DFDG324R",
//     date: "15-02-25",
//     vendor: "Sandra Fabrics",
//     designer: "Jude Stitches",
//     delivery: "21-05-25",
//     status: "Ongoing",
//   },
//   {
//     id: "04",
//     orderId: "QWER123DFDG324R",
//     date: "15-02-25",
//     vendor: "Sandra Fabrics",
//     designer: "Jude Stitches",
//     delivery: "21-05-25",
//     status: "Cancelled",
//   },
//   {
//     id: "05",
//     orderId: "QWER123DFDG324R",
//     date: "15-02-25",
//     vendor: "Sandra Fabrics",
//     designer: "Jude Stitches",
//     delivery: "21-05-25",
//     status: "Ongoing",
//   },
//   {
//     id: "06",
//     orderId: "QWER123DFDG324R",
//     date: "15-02-25",
//     vendor: "Sandra Fabrics",
//     designer: "Jude Stitches",
//     delivery: "21-05-25",
//     status: "Completed",
//   },
// ];

const OrderPage = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
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
      { key: "transactionId", label: "Transaction ID" },
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
        render: (_, row) => (
          <div className="relative">
            <button
              onClick={() => {
                setOpenDropdown(openDropdown === row.id ? null : row.id);
              }}
              className="px-2 py-1 cursor-pointer rounded-md"
            >
              •••
            </button>
            {openDropdown === row.id && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
                <Link to={`/customer/orders/orders-details/${row.id}`}>
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    View Details
                  </button>
                </Link>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
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
              orderId: `#${details?.id?.slice(-8).toUpperCase()}`,
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
    (orderData?.count || customersOrderData?.length || 0) /
      (queryParams["pagination[limit]"] ?? 10),
  );

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(customersOrderData);
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
      body: customersOrderData?.map((row) => [
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
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                className="w-full sm:w-[200px] pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none"
                value={queryString}
                onChange={(evt) =>
                  setQueryString(
                    evt.target.value ? evt.target.value : undefined,
                  )
                }
              />
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
              data={customersOrderData?.map((row) => ({
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
            <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">
              Sort: Newest First ▼
            </button>
          </div>
        </div>

        {/* Table Section */}
        <ReusableTable
          loading={isPending}
          columns={columns}
          data={customersOrderData}
        />

        {!customersOrderData?.length && !isPending ? (
          <p className="flex-1 text-center text-sm md:text-sm">
            No Order found.
          </p>
        ) : (
          <></>
        )}

        {customersOrderData?.length > 0 && (
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
