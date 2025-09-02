import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import { useMutation } from "@tanstack/react-query";
import CustomTable from "../../../components/CustomTable";

const SEARCH_FIELDS = [
  { label: "Order ID", value: "orderId" },
  { label: "Customer", value: "customer" },
  { label: "Product", value: "product" },
  { label: "Amount", value: "amount" },
  { label: "Product Status", value: "productStatus" },
  { label: "Order Status", value: "orderStatus" },
];

const OrderPage = () => {
  const [filter, setFilter] = useState("all");
  const [searchField, setSearchField] = useState("orderId");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const dialogRef = useRef(null);
  const [currentItem, setCurrentItem] = useState(null);
  // Removed static filteredOrders - now using API data
  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });
  const nav = useNavigate();
  const update_status = useMutation({
    mutationFn: async (status) => {
      return await CaryBinApi.put(`/orders/${currentItem.id}/status `, {
        status,
        q: debouncedSearchTerm,
      });
    },
    onError: (err) => {
      toast.error(err?.data?.message || "error occured");
    },
    onSuccess: () => {
      toast.success("status updated");
      refetch();

      setTimeout((handler) => {
        toast.dismiss();
        dialogRef.current.close();
      }, 800);
    },
  });

  const {
    isPending,
    isLoading,
    isError,
    data: orderData,
    refetch,
  } = useGetVendorOrder({
    ...queryParams,
  });

  const statusOptions = useMemo(
    () => [
      {
        value: "PAID",
        label: "Paid",
        to: [
          { value: "DISPATCHED_TO_AGENT", label: "Dispatched" },
          {
            value: "PROCESSING",
            label: "Processing",
          },
        ],
      },
      { value: "DISPATCHED_TO_AGENT", label: "Dispatched to Agent", to: [] },
      {
        value: "DELIVERED_TO_TAILOR",
        label: "Delivered to Tailor",
        to: [],
      },
      {
        value: "PROCESSING",
        label: "Processing",
        to: [],
      },
      { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", to: [] },
      {
        value: "IN_TRANSIT",
        label: "In Transit",
        to: [],
      },

      { value: "DELIVERED", label: "Delivered", to: [] },
      { value: "CANCELLED", label: "Cancelled", to: [] },
    ],
    [],
  );

  const status_select = useMemo(() => {
    let data = {
      PAID: {
        value: "PAID",
        label: "Paid",
        to: [
          { value: "DISPATCHED_TO_AGENT", label: "Dispatched to Agent" },
          { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
          { value: "CANCELLED", label: "Cancel" },
        ],
      },
      DELIVERED_TO_TAILOR: {
        value: "DELIVERED_TO_TAILOR",
        label: "Delivered to Tailor",
        to: [],
      },
      PROCESSING: {
        value: "PROCESSING",
        label: "Processing",
        to: [{ value: "SHIPPED", label: "Shipped" }],
      },
      SHIPPED: {
        value: "SHIPPED",
        label: "Shipped",
        to: [],
      },
      IN_TRANSIT: {
        value: "IN_TRANSIT",
        label: "In Transit",
        to: [],
      },
      OUT_FOR_DELIVERY: {
        value: "OUT_FOR_DELIVERY",
        label: "Out for Delivery",
        to: [],
      },
      DELIVERED: {
        value: "DELIVERED",
        label: "Delivered",
        to: [{ value: "CANCELLED", label: "Cancelled" }],
      },
      CANCELLED: {
        value: "CANCELLED",
        label: "Cancelled",
        to: [],
      },
    };
    return data;
  }, [currentItem]);

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
        label: "Unit Price",
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
      // {
      //   label: "Actions",
      //   key: "action",
      //   width: "w-24",
      //   render: (_, row) => (
      //     <div className="relative">
      //       <button
      //         onClick={() =>
      //           setOpenDropdown(openDropdown === row.id ? null : row.id)
      //         }
      //         className="px-3 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      //       >
      //         •••
      //       </button>
      //       {openDropdown === row.id && (
      //         <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-20 border border-gray-200">
      //           <Link to={`/fabric/orders/orders-details/${row.id}`}>
      //             <button className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700">
      //               View Details
      //             </button>
      //           </Link>
      //           <button
      //             onClick={() => {
      //               setCurrentItem(row);
      //               dialogRef.current.showModal();
      //             }}
      //             className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 border-t border-gray-100"
      //           >
      //             Update Status
      //           </button>
      //         </div>
      //       )}
      //     </div>
      //   ),
      // },
    ],
    [openDropdown],
  );

  const actions = [
    {
      key: "view-details",
      label: "View Details",
      action: (item) => {
        return nav(`/fabric/orders/orders-details/${item.id}`);
      },
    },
    {
      key: "update status",
      label: "Update Status",
      action: (item) => {
        setCurrentItem(item);
        return dialogRef.current.showModal();
      },
    },
    // {
    //   key: "suspend-vendor",
    //   label: "Suspend",
    //   action: (item) => {
    //     setSuspendModalOpen(true);
    //     setNewCategory(row);
    //     setOpenDropdown(null);
    //   },
    // },
    // {
    //   key: "delete-vendor",
    //   label: "Delete",
    //   action: (item) => {
    //     handleDeleteUser(item);
    //   },
    // },
  ];
  const fabricOrderData = useMemo(
    () =>
      orderData?.data
        ? orderData?.data.map((details) => {
            const firstItem = details?.payment?.purchase?.items?.[0];
            return {
              ...details,
              id: details?.id,
              orderId: `${details?.id ? details.id.replace(/-/g, "").slice(0, 12).toUpperCase() : ""}`,
              productId: firstItem?.product_id || firstItem?.id,
              customer:
                details?.user?.email?.split("@")[0] ||
                details?.user_id?.slice(-8)?.toUpperCase() ||
                "Unknown",
              product: firstItem?.name || "Product Item",
              quantity: firstItem?.quantity || 1,
              amount: `₦${formatNumberWithCommas(details?.payment?.purchase?.items?.[0]?.price ?? 0)}`,
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

  // Advanced search filtering with field selection
  const filteredFabricOrderData = useMemo(() => {
    if (!searchTerm.trim()) return fabricOrderData;
    const term = searchTerm.toLowerCase().trim();

    return fabricOrderData.filter((row) => {
      switch (searchField) {
        case "orderId":
          return row.orderId?.toLowerCase().includes(term);
        case "customer":
          return row.customer?.toLowerCase().includes(term);
        case "product":
          return row.product?.toLowerCase().includes(term);
        case "amount":
          return row.amount?.toString().toLowerCase().includes(term);
        case "productStatus":
          return row.productStatus?.toLowerCase().includes(term);
        case "orderStatus":
          return row.orderStatus?.toLowerCase().includes(term);
        default:
          return false;
      }
    });
  }, [fabricOrderData, searchField, searchTerm]);

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredFabricOrderData);
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
      body: filteredFabricOrderData?.map((row) => [
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
    <>
      <ToastContainer />
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
                className="bg-gray-100 mt-2  md:ml-8 outline-none text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
                defaultValue=""
              >
                <option value="" disabled>
                  Export As
                </option>
                <option value="csv">Export to CSV</option>
                <option value="excel">Export to Excel</option>
                <option value="pdf">Export to PDF</option>
              </select>
              <CSVLink
                id="csvDownload"
                data={filteredFabricOrderData?.map((row) => ({
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
              />
            </div>
            {/* <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">Export As ▼</button>
                        <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">Sort: Newest First ▼</button> */}
          </div>
          {
            <CustomTable
              columns={updatedColumn}
              data={fabricOrderData || []}
              actions={actions}
            />
          }

          {!filteredFabricOrderData?.length && !isPending ? (
            <p className="flex-1 text-center text-sm md:text-sm py-8">
              No orders found.
            </p>
          ) : null}
          {filteredFabricOrderData?.length > 0 && (
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
          )}
        </div>

        <dialog
          ref={dialogRef}
          data-theme="nord"
          id="my_modal_1"
          className="modal"
        >
          <div className="modal-box  max-w-2xl ">
            <h3 className="font-bold text-lg mb-4">Update Order Status</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                let form = new FormData(e.target);
                let status = form.get("status");
                // return console.log(status);
                toast.promise(
                  async () =>
                    // .catch((err) =>
                    //   toast.error(
                    //     err?.data?.message.toLowerCase() || "failed",
                    //   ),
                    // )
                    (await update_status.mutateAsync(status)).data,
                  {
                    pending: "pending",
                    // success: `status changed ${status}`,
                  },
                );
              }}
              className="space-y-4"
            >
              {currentItem && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Order ID</span>
                    </label>
                    <input
                      disabled
                      type="text"
                      value={currentItem.orderId || ""}
                      readOnly
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Customer Name</span>
                    </label>
                    <input
                      disabled
                      type="text"
                      value={currentItem.customer || ""}
                      readOnly
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Product</span>
                    </label>
                    <input
                      disabled
                      type="text"
                      value={currentItem.product || ""}
                      readOnly
                      className="input input-bordered w-full"
                    />
                  </div>

                  {/* Status Progress Bar */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Order Status Progress</span>
                    </label>
                    <div className="w-full flex flex-col gap-2">
                      <ul className="steps w-full">
                        {statusOptions.map((option, idx) => {
                          // Find the index of the current status in statusOptions
                          const currentStatusIndex = statusOptions.findIndex(
                            (opt) => opt.value === currentItem.orderStatus,
                          );
                          // DaisyUI: step-primary for completed, step for pending
                          const stepClass =
                            idx <= currentStatusIndex
                              ? "step step-primary"
                              : "step";
                          return (
                            <li key={option.value} className={stepClass}>
                              <span className="text-xs">{option.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                  {/* Status Select */}
                  {status_select[currentItem?.status]?.to?.length > 0 && (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Order Status</span>
                      </label>
                      <select
                        name="status"
                        className="select select-bordered w-full"
                        defaultValue={currentItem.orderStatus || "PROCESSING"}
                        onChange={(e) => {
                          // In a real application, you'd likely manage this with useState for actual updates
                          // For now, we're just displaying the selected value.
                          // This would be the place to call a function to update the backend.
                          console.log("Selected new status:", e.target.value);
                        }}
                      >
                        {/* <option value={currentItem.status} readonly>
                        {" "}
                        {currentItem.status}
                      </option>*/}
                        {status_select[currentItem?.status]?.to?.map(
                          (status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ),
                        )}
                        {/* <option key={"Cancel"} value={"CANCELLED"}>
                        Cancel
                      </option>*/}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => dialogRef.current.close()}
                >
                  Close
                </button>
                <button
                  disabled={update_status.isPending}
                  type="submit"
                  className="btn btn-primary text-white"
                >
                  Update Status
                </button>
                {/* In a real scenario, you'd have an update button here */}
                {/* <button type="button" className="btn btn-primary">Update Status</button> */}
              </div>
            </form>
          </div>
        </dialog>
      </div>
    </>
  );
};
export default OrderPage;
