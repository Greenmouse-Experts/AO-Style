import React, { act, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { toast, ToastContainer } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import CustomTable from "../../../components/CustomTable";

const OrderPage = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const nav = useNavigate();
  const dialogRef = useRef(null);
  const update_status = useMutation({
    mutationFn: async (status) => {
      return await CaryBinApi.put(`/orders/${currentItem.id}/status `, {
        status,
      });
    },
    onError: (err) => {
      console.error(err);
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
  const statusOptions = useMemo(
    () => [
      { value: "DELIVERED_TO_TAILOR", label: "Delivered to Tailor" },
      { value: "PROCESSING", label: "Processing" },
      { value: "SHIPPED", label: "Shipped" },
      { value: "IN_TRANSIT", label: "In Transit" },
      { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
      { value: "DELIVERED", label: "Delivered" },
      { value: "CANCELLED", label: "Cancelled" },
    ],
    [],
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
  console.log(orderData);
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
    ],
    [openDropdown],
  );
  const actions = [
    // {
    //   key: "update-status",
    //   label: "Update Status",
    //   action: (item) => {
    //     setCurrentItem(item);
    //     dialogRef.current.showModal();
    //   },
    // },
    {
      label: "View Details",
      key: "view-details",
      action: (item) => {
        return nav(`/tailor/orders/orders-details/${item.id}`);
        // <Link to={}>
        //   <button className="block cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100">
        //     View Details
        //   </button>
        // </Link>;
      },
    },
  ];

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
                details?.payment?.purchase?.items[1]?.vendor_amount ?? 0,
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
  console.log(fabricOrderData[2]);
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
        {/* <ReusableTable
          loading={isPending}
          columns={columns}
          data={fabricOrderData}
        />*/}

        {isPending ? (
          <div
            className="flex justify-center items-center h-full"
            data-theme="nord"
          >
            <div className="">
              <div className="loading loading-ball"></div>
              loading
            </div>
          </div>
        ) : (
          <CustomTable
            columns={columns}
            data={fabricOrderData}
            actions={actions}
          />
        )}

        {/* <CustomTable columns={columns} data={fabricOrderData} />*/}

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
      <dialog
        ref={dialogRef}
        data-theme="nord"
        id="my_modal_1"
        className="modal"
      >
        <ToastContainer />
        <div className="modal-box  max-w-2xl ">
          <h3 className="font-bold text-lg mb-4">Update Order Status</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              return console.log(currentItem);

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
            <></>
            {currentItem && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Order ID</span>
                  </label>
                  <input
                    disabled
                    type="text"
                    value={currentItem.id || ""}
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
                          (opt) => opt.value === currentItem.status,
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
                    {statusOptions.map((option, idx) => {
                      // Find the index of the current status in statusOptions
                      const currentStatusIndex = statusOptions.findIndex(
                        (opt) => opt.value === currentItem.orderStatus,
                      );
                      // Disable options that are before the current status
                      const isDisabled = idx < currentStatusIndex;
                      return (
                        <option
                          key={option.value}
                          value={option.value}
                          disabled={isDisabled}
                        >
                          {option.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </>
            )}

            <div className="modal-action">
              <button
                type="submit"
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
  );
};

export default OrderPage;
