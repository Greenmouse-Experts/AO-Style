import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import useGetOrder from "../../../hooks/order/useGetOrder";
import useQueryParams from "../../../hooks/useQueryParams";
import { formatDateStr, formatNumberWithCommas } from "../../../lib/helper";
import ReusableTable from "../adminDashboard/components/ReusableTable";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import useGetVendorOrder from "../../../hooks/order/useGetVendorOrder";

// Static data commented out - now using API endpoint
// const orders = [
//   {
//     id: "01",
//     orderId: "ORD-123RFWJ2",
//     customer: "Funmi Daniels",
//     product: "Ankara, Silk X2...",
//     amount: "N 50,000",
//     location: "Lekki, Lagos",
//     orderDate: "24-02-25",
//     status: "Ongoing",
//   },
// ];

const OrderPage = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  // Removed static filteredOrders - now using API data
  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const {
    isPending,
    isLoading,
    isError,
    data: orderData,
  } = useGetVendorOrder({
    ...queryParams,
  });

  console.log("Vendor Orders Data:", orderData);
  console.log("Raw vendor orders array:", orderData?.data);
  console.log("First vendor order item:", orderData?.data?.[0]);
  console.log("Payment object:", orderData?.data?.[0]?.payment);
  console.log(
    "Purchase items:",
    orderData?.data?.[0]?.payment?.purchase?.items,
  );

  const updatedColumn = useMemo(
    () => [
      {
        label: "Order ID",
        key: "orderId",
        width: "w-28",
        render: (value) => (
          <span className="font-mono text-xs text-gray-600">{value}</span>
        ),
      },
      {
        label: "Customer",
        key: "customer",
        width: "w-32",
      },
      {
        label: "Product",
        key: "product",
        width: "w-48",
        render: (value) => (
          <div className="truncate" title={value}>
            {value}
          </div>
        ),
      },
      {
        label: "Qty",
        key: "quantity",
        width: "w-16",
        render: (value) => <span className="text-center block">{value}</span>,
      },
      {
        label: "Amount",
        key: "amount",
        width: "w-24",
        render: (value) => (
          <span className="font-medium text-gray-900">{value}</span>
        ),
      },
      {
        label: "Date",
        key: "dateAdded",
        width: "w-32",
        render: (value) => (
          <span className="text-xs text-gray-600">{value}</span>
        ),
      },
      {
        label: "Payment",
        key: "productStatus",
        width: "w-24",
        render: (status) => (
          <span
            className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
              status === "SUCCESS"
                ? "bg-green-100 text-green-600"
                : status === "PENDING"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            {status}
          </span>
        ),
      },
      {
        label: "Status",
        key: "orderStatus",
        width: "w-28",
        render: (status) => (
          <span
            className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
              status === "DELIVERED"
                ? "bg-green-100 text-green-600"
                : status === "CANCELLED"
                  ? "bg-red-100 text-red-600"
                  : status === "SHIPPED" ||
                      status === "IN_TRANSIT" ||
                      status === "OUT_FOR_DELIVERY"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-blue-100 text-blue-600"
            }`}
          >
            {status}
          </span>
        ),
      },
      {
        label: "Actions",
        key: "action",
        width: "w-24",
        render: (_, row) => (
          <div className="relative">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === row.id ? null : row.id)
              }
              className="px-3 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              •••
            </button>
            {openDropdown === row.id && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-20 border border-gray-200">
                <Link to={`/fabric/orders/orders-details/${row.id}`}>
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700">
                    View Details
                  </button>
                </Link>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 border-t border-gray-100">
                  Update Status
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown],
  );

  const columns = [
    { label: "#", key: "id" },
    { label: "Order ID", key: "orderId" },
    { label: "Customer", key: "customer" },
    { label: "Product", key: "product" },
    { label: "Amount", key: "amount" },
    // { label: "Location", key: "location" },
    { label: "Order Date", key: "dateAdded" },
    {
      label: "Status",
      key: "status",
      render: (status) => (
        <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
          {status}
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
        <div className="relative">
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === row.id ? null : row.id)
            }
            className="px-2 py-1 cursor-pointer rounded-md"
          >
            •••
          </button>
          {openDropdown === row.id && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
              <Link to={`/fabric/orders/orders-details/${row.id}`}>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  View Details
                </button>
              </Link>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Cancel Order
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Track Order
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const fabricOrderData = useMemo(
    () =>
      orderData?.data
        ? orderData?.data.map((details) => {
            const firstItem = details?.payment?.purchase?.items?.[0];
            return {
              ...details,
              id: details?.id,
              orderId: details?.id,
              productId: firstItem?.product_id || firstItem?.id,
              customer:
                details?.user?.email?.split("@")[0] ||
                details?.user_id?.slice(-8)?.toUpperCase() ||
                "Unknown",
              product: firstItem?.name || "Product Item",
              quantity: firstItem?.quantity || 1,
              amount: `₦${formatNumberWithCommas(details?.total_amount || details?.payment?.amount || 0)}`,
              productStatus: details?.payment?.payment_status || "PENDING",
              orderStatus: details?.status || "PENDING",
              dateAdded: details?.created_at
                ? formatDateStr(
                    details?.created_at.split(".").shift(),
                    "D/M/YYYY h:mm A",
                  )
                : "N/A",
            };
          })
        : [],
    [orderData?.data],
  );

  const totalPages = Math.ceil(
    (orderData?.count || fabricOrderData?.length || 0) /
      (queryParams["pagination[limit]"] ?? 10),
  );

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(fabricOrderData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "FabricOrders.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          "Order ID",
          "Customer",
          "Product",
          "Quantity",
          "Amount",
          "Date",
          "Product Status",
          "Order Status",
        ],
      ],
      body: fabricOrderData?.map((row) => [
        row.orderId,
        row.customer,
        row.product,
        row.quantity,
        row.amount,
        row.dateAdded,
        row.productStatus,
        row.orderStatus,
      ]),
      headStyles: {
        fillColor: [209, 213, 219],
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
        fontSize: 10,
      },
    });
    doc.save("FabricVendorOrders.pdf");
  };

  return (
    <div className="">
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-2xl font-medium mb-3">Fabric Vendor Orders</h1>
        <p className="text-gray-500">
          <Link to="/fabric" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Orders
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
            {["all", "ongoing", "completed", "cancelled"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setFilter(tab);
                  if (tab == "all") {
                    updateQueryParams({
                      ...queryParams,
                      status: undefined,
                    });
                  }
                  if (tab == "ongoing") {
                    updateQueryParams({
                      ...queryParams,
                      status: "PROCESSING",
                    });
                  }
                  if (tab == "completed") {
                    updateQueryParams({
                      ...queryParams,
                      status: "DELIVERED",
                    });
                  }
                  if (tab == "cancelled") {
                    updateQueryParams({
                      ...queryParams,
                      status: "CANCELLED",
                    });
                  }
                }}
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
              <select
                onChange={handleExport}
                className="bg-gray-100 mt-2  md:ml-8 outline-none text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
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
                data={fabricOrderData?.map((row) => ({
                  "Order ID": row.orderId,
                  Customer: row.customer,
                  Product: row.product,
                  Quantity: row.quantity,
                  Amount: row.amount,
                  Date: row?.dateAdded,
                  "Product Status": row.productStatus,
                  "Order Status": row.orderStatus,
                }))}
                filename="FabricVendorOrders.csv"
                className="hidden"
              />{" "}
            </div>
            {/* <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">Export As ▼</button>
                        <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">Sort: Newest First ▼</button> */}
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {updatedColumn.map((column, index) => (
                      <th
                        key={index}
                        className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width || "w-auto"}`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isPending ? (
                    <tr>
                      <td
                        colSpan={updatedColumn.length}
                        className="px-4 py-8 text-center"
                      >
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                          <span className="ml-2 text-gray-500">
                            Loading orders...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : fabricOrderData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={updatedColumn.length}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    fabricOrderData.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {updatedColumn.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className={`px-4 py-3 text-sm text-gray-900 ${column.width || "w-auto"}`}
                          >
                            {column.render
                              ? column.render(row[column.key], row)
                              : row[column.key]}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {!fabricOrderData?.length && !isPending ? (
          <p className="flex-1 text-center text-sm md:text-sm py-8">
            No orders found.
          </p>
        ) : null}
        {fabricOrderData?.length > 0 && (
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
