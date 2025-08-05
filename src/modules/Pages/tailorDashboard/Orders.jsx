import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { formatDateStr, formatNumberWithCommas } from "../../../lib/helper";
import useQueryParams from "../../../hooks/useQueryParams";
import useGetAllOrder from "../../../hooks/order/useGetOrder";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import ReusableTable from "../adminDashboard/components/ReusableTable";
import useGetVendorOrder from "../../../hooks/order/useGetVendorOrder";
import { useEffect } from "react";

const orders = [
  {
    id: "01",
    orderId: "ORD-123RFWJ2",
    customer: "Funmi Daniels",
    measurement: "View Measurement",
    amount: "N 50,000",
    dueDate: "10 Days Left",
    status: "Ongoing",
  },
  {
    id: "02",
    orderId: "ORD-123RFWJ2",
    customer: "Funmi Daniels",
    measurement: "View Measurement",
    amount: "N 50,000",
    dueDate: "10 Days Left",
    status: "Ongoing",
  },
  {
    id: "03",
    orderId: "ORD-123RFWJ2",
    customer: "Funmi Daniels",
    measurement: "View Measurement",
    amount: "N 50,000",
    dueDate: "10 Days Left",
    status: "Completed",
  },
  {
    id: "04",
    orderId: "ORD-123RFWJ2",
    customer: "Funmi Daniels",
    measurement: "View Measurement",
    amount: "N 50,000",
    dueDate: "10 Days Left",
    status: "Ongoing",
  },
  {
    id: "05",
    orderId: "ORD-123RFWJ2",
    customer: "Funmi Daniels",
    measurement: "View Measurement",
    amount: "N 50,000",
    dueDate: "10 Days Left",
    status: "Cancelled",
  },
  {
    id: "06",
    orderId: "ORD-123RFWJ2",
    customer: "Funmi Daniels",
    measurement: "View Measurement",
    amount: "N 50,000",
    dueDate: "10 Days Left",
    status: "Ongoing",
  },
];

const OrderPage = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const filteredOrders = orders.filter(
    (order) =>
      (filter === "all" || order.status.toLowerCase() === filter) &&
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  const columns = useMemo(
    () => [
      { label: "Transaction ID", key: "transactionId" },
      { label: "Customer", key: "customer" },
      { label: "Product", key: "product" },
      // {
      //   label: "Body Measurement",
      //   key: "measurement",
      //   render: (text) => (
      //     <Link to="#" className="text-blue-500 hover:underline">
      //       {text}
      //     </Link>
      //   ),
      // },
      { label: "Amount", key: "amount" },
      { label: "Order Date", key: "dateAdded" },
      {
        label: "Status",
        key: "status",
        render: (status) => (
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              status === "Ongoing"
                ? "bg-yellow-100 text-yellow-700"
                : status === "Cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
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
                <Link to={`/tailor/orders/orders-details?id=${row.id}`}>
                  <button className="block cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100">
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
    ],
    [openDropdown],
  );

  const fabricOrderData = useMemo(
    () =>
      orderData?.data
        ? orderData?.data.map((details) => {
            return {
              ...details,
              transactionId: `${details?.payment?.transaction_id}`,
              customer:
                details?.user?.email?.length > 15
                  ? `${details?.user?.email.slice(0, 15)}...`
                  : details?.user?.email,
              product:
                details?.payment?.purchase?.items[0]?.name?.length > 15
                  ? `${details?.payment?.purchase?.items[0]?.name.slice(
                      0,
                      15,
                    )}...`
                  : details?.payment?.purchase?.items[0]?.name,
              amount: `${formatNumberWithCommas(
                details?.payment?.amount ?? 0,
              )}`,

              status: `${details?.payment?.payment_status}`,
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

  const totalPages = Math.ceil(
    orderData?.count / (queryParams["pagination[limit]"] ?? 10),
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
    saveAs(blob, "TailorOrders.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ["Transaction ID", "Customer", "Product", "Amount", "Date", "Status"],
      ],
      body: fabricOrderData?.map((row) => [
        row.transactionId,
        row.customer,
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
    doc.save("TailorOrders.pdf");
  };

  return (
    <div className="">
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-2xl font-medium mb-3">Orders</h1>
        <p className="text-gray-500">
          <Link to="/admin" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Orders
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg">
        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
          {/* Order Filters */}
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
            {/* <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">Export As ▼</button>
                        <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">Sort: Newest First ▼</button> */}
            <select
              onChange={handleExport}
              className="bg-gray-100 mt-2  md:ml-8 outline-none text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
            >
              <option value="" disabled selected>
                Export As
              </option>
              8<option value="csv">Export to CSV</option>{" "}
              <option value="excel">Export to Excel</option>{" "}
              <option value="pdf">Export to PDF</option>{" "}
            </select>
            <CSVLink
              id="csvDownload"
              data={fabricOrderData?.map((row) => ({
                "Transaction ID": row.transactionId,
                Customer: row.customer,
                Product: row.product,
                Amount: row.amount,
                Date: row?.dateAdded,
                Status: row.status,
              }))}
              filename="TailorOrders.csv"
              className="hidden"
            />{" "}
          </div>
        </div>

        {/* Table Section */}
        <ReusableTable
          loading={isPending}
          columns={columns}
          data={fabricOrderData}
        />

        {!fabricOrderData?.length && !isPending ? (
          <p className="flex-1 text-center text-sm md:text-sm">
            No Order found.
          </p>
        ) : (
          <></>
        )}

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
