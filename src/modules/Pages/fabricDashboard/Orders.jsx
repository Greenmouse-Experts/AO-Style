import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, Upload, Image, Loader2 } from "lucide-react";

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
import useUploadImage from "../../../hooks/multimedia/useUploadImage";
import useToast from "../../../hooks/useToast";

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
  const dialogRef = useRef(null);
  const [currentItem, setCurrentItem] = useState(null);

  // Image upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [pendingStatus, setPendingStatus] = useState(null);
  // Removed static filteredOrders - now using API data
  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });
  const nav = useNavigate();

  // Add debounced search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Update query params when search term changes
  useUpdatedEffect(() => {
    // Remove API-side search, always show all and filter client-side
    // if (debouncedSearchTerm) {
    //   updateQueryParams({ q: debouncedSearchTerm });
    // } else {
    //   updateQueryParams({ q: undefined });
    // }
  }, [debouncedSearchTerm]);

  const { uploadImageMutate } = useUploadImage();
  const { toastSuccess, toastError } = useToast();

  const update_status = useMutation({
    mutationFn: async ({ status, imageUrl }) => {
      return await CaryBinApi.put(`/orders/${currentItem.id}/status `, {
        status,
        image: imageUrl,
        q: debouncedSearchTerm,
      });
    },
    onError: (err) => {
      toast.error(err?.data?.message || "error occured");
      setIsUploading(false);
    },
    onSuccess: () => {
      toast.success("status updated");
      refetch();
      handleCloseUploadModal();

      setTimeout(() => {
        toast.dismiss();
      }, 800);
    },
  });

  const {
    isPending,
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
      {
        value: "PROCESSING",
        label: "Processing",
        to: [],
      },
      { value: "DISPATCHED_TO_AGENT", label: "Dispatched to Agent", to: [] },
      { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", to: [] },
      {
        value: "DELIVERED_TO_TAILOR",
        label: "Delivered to Tailor",
        to: [],
      },
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

  // Helper function to check if an order contains style items
  const checkOrderHasStyles = useMemo(() => {
    return (orderItem, ordersData) => {
      if (!orderItem) return false;

      // Find the original order data from orderData
      const originalOrder = ordersData?.data?.find(
        (order) => order.id === orderItem.id,
      );
      if (!originalOrder) return false;

      const purchaseItems = originalOrder?.payment?.purchase?.items || [];

      // Check if any purchase item has style information
      const hasStyles = purchaseItems.some((item) => {
        const isStyle =
          item?.purchase_type === "STYLE" ||
          item?.product?.type?.toUpperCase() === "STYLE" ||
          item?.type?.toUpperCase() === "STYLE" ||
          item?.product?.style || // Check for style object
          (item?.product && item?.product?.purchase_type === "STYLE") ||
          item?.name?.toLowerCase().includes("style") ||
          item?.product?.name?.toLowerCase().includes("style");

        console.log("Item check:", {
          item_id: item?.id || item?.product_id,
          purchase_type: item?.purchase_type,
          product_type: item?.product?.type,
          type: item?.type,
          has_style_object: !!item?.product?.style,
          name: item?.name || item?.product?.name,
          is_style: isStyle,
        });

        return isStyle;
      });

      console.log("=== STYLE CHECK DEBUG ===");
      console.log("Order ID:", orderItem.id);
      console.log("Purchase Items Count:", purchaseItems.length);
      console.log("Purchase Items:", purchaseItems);
      console.log("Has Styles:", hasStyles);
      console.log("========================");

      return hasStyles;
    };
  }, []);

  const status_select = useMemo(() => {
    // Check if current order has styles
    const hasStyles = checkOrderHasStyles(currentItem, orderData);

    let data = {
      PAID: {
        value: "PAID",
        label: "Paid",
        to: hasStyles
          ? [
              { value: "DISPATCHED_TO_AGENT", label: "Dispatched to Agent" },
              { value: "CANCELLED", label: "Cancel" },
            ]
          : [
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
        to: hasStyles
          ? [{ value: "DISPATCHED_TO_AGENT", label: "Dispatched to Agent" }]
          : [{ value: "OUT_FOR_DELIVERY", label: "Out for Delivery" }],
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
        to: [], // No further updates allowed once OUT_FOR_DELIVERY is reached
      },
      DISPATCHED_TO_AGENT: {
        value: "DISPATCHED_TO_AGENT",
        label: "Dispatched to Agent",
        to: [], // No further updates allowed once DISPATCHED_TO_AGENT is reached
      },
      DELIVERED: {
        value: "DELIVERED",
        label: "Delivered",
        to: [],
      },
      CANCELLED: {
        value: "CANCELLED",
        label: "Cancelled",
        to: [],
      },
    };
    return data;
  }, [currentItem, orderData, checkOrderHasStyles]);

  // File upload handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastError("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Upload image to multimedia endpoint
  const uploadImageToMultimedia = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return new Promise((resolve, reject) => {
      uploadImageMutate(formData, {
        onSuccess: (result) => {
          console.log(result);
          const imageUrl =
            result?.data?.data?.url ||
            result?.url ||
            result?.data?.image_url ||
            result?.imageUrl;
          resolve(imageUrl);
        },
        onError: (error) => {
          console.error("Upload failed:", error);
          reject(error);
        },
      });
    });
  };

  const handleCompleteUpload = async () => {
    if (!selectedFile) {
      toastError("Please select an image first.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading image...");

    try {
      // Step 1: Upload image to multimedia endpoint
      console.log("📤 Step 1: Uploading to multimedia endpoint...");
      const imageUrl = await uploadImageToMultimedia(selectedFile);

      if (!imageUrl) {
        throw new Error("No image URL received from multimedia upload");
      }

      console.log("✅ Image uploaded successfully, URL:", imageUrl);
      setUploadStatus("Updating order status...");

      // Step 2: Update order status with image URL
      console.log("🔄 Step 2: Updating order status with image...");
      await update_status.mutateAsync({
        status: pendingStatus,
        imageUrl: imageUrl,
      });

      console.log("✅ Order status updated successfully");
      toastSuccess("Order status updated successfully with image!");
    } catch (error) {
      console.error("❌ Error in upload process:", error);
      toastError(
        error?.message ||
          error?.data?.message ||
          "Failed to upload image and update status",
      );
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setImagePreview(null);
    setPendingStatus(null);
    setIsUploading(false);
    setUploadStatus("");
  };

  // Handle status update - open modal for image upload
  const handleStatusUpdate = (newStatus) => {
    console.log("🔄 Opening upload modal for status:", newStatus);
    setPendingStatus(newStatus);
    setShowUploadModal(true);
    dialogRef.current.close();
  };

  const getActionTitle = () => {
    if (pendingStatus === "DISPATCHED_TO_AGENT")
      return "Mark as Dispatched to Agent";
    if (pendingStatus === "OUT_FOR_DELIVERY") return "Mark as Out for Delivery";
    return "Upload Image & Update Status";
  };

  console.log("=== VENDOR ORDERS DATA DEBUG ===");
  console.log("Vendor Orders Data:", orderData);
  console.log("Raw vendor orders array:", orderData?.data);
  if (orderData?.data?.[0]) {
    console.log("First vendor order item:", orderData?.data?.[0]);
    console.log("Payment object:", orderData?.data?.[0]?.payment);
    console.log(
      "Purchase items:",
      orderData?.data?.[0]?.payment?.purchase?.items,
    );

    // Check structure of purchase items
    const firstPurchaseItems = orderData?.data?.[0]?.payment?.purchase?.items;
    if (firstPurchaseItems && firstPurchaseItems.length > 0) {
      console.log("First purchase item structure:", firstPurchaseItems[0]);
      console.log(
        "First purchase item product:",
        firstPurchaseItems[0]?.product,
      );
    }
  }
  console.log("================================");

  // --- DATE RENDERING LOGIC REWRITE STARTS HERE ---
  // Helper to format ISO date string to "D/M/YYYY HH:mm (GMT+1)" in 24hr format
  // function formatDateToGMTPlus1(dateStr) {
  //   if (!dateStr) return "";

  //   try {
  //     // Remove milliseconds if present
  //     const cleanDateStr = dateStr.split(".")[0];

  //     // Parse as UTC (the 'Z' suffix ensures UTC interpretation)
  //     const date = new Date(cleanDateStr + "Z");

  //     if (isNaN(date.getTime())) return dateStr;

  //     // Add 1 hour for GMT+1
  //     date.setUTCHours(date.getUTCHours() + 1);

  //     // Get date parts with proper padding
  //     const day = date.getUTCDate().toString().padStart(2, "0");
  //     const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  //     const year = date.getUTCFullYear();
  //     const hour = date.getUTCHours().toString().padStart(2, "0");
  //     const minute = date.getUTCMinutes().toString().padStart(2, "0");

  //     return `${day}/${month}/${year} ${hour}:${minute} (GMT+1)`;
  //   } catch (err) {
  //     console.error("Date formatting error:", err);
  //     return dateStr;
  //   }
  // }
  //
  function formatDateToLocalTime(dateStr) {
    if (!dateStr) return "";

    try {
      // Extract date and time parts directly from the string
      const datePart = dateStr.substring(0, 10); // "2025-09-26"
      const timePart = dateStr.substring(11, 16); // "18:15"

      // Split date
      const [year, month, day] = datePart.split("-");

      // Split time
      const [hour24, minute] = timePart.split(":");
      const hourNum = parseInt(hour24, 10);

      // Convert to 12-hour format
      const period = hourNum >= 12 ? "PM" : "AM";
      const hour12 = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;

      return `${day}/${month}/${year} ${hour12}:${minute} ${period}`;
    } catch (err) {
      return dateStr;
    }
  }
  // --- END DATE RENDERING LOGIC ---

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
                      status === "OUT_FOR_DELIVERY" ||
                      status === "DISPATCHED_TO_AGENT"
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
    [],
  );

  const actions = useMemo(() => {
    return [
      {
        key: "view-details",
        label: "View Details",
        action: (item) => {
          return nav(`/fabric/orders/orders-details/${item.id}`);
        },
      },
      // {
      //   key: "update status",
      //   label: "Update Status",
      //   action: (item) => {
      //     setCurrentItem(item);
      //     return dialogRef.current.showModal();
      //   },
      // },
    ];
  }, [nav]);
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
  const fabricOrderData = useMemo(
    () =>
      orderData?.data
        ? orderData?.data.map((details) => {
            const firstItem = details?.payment?.purchase?.items?.[0];
            return {
              ...details,
              id: details?.id,
              orderId: `${details?.payment?.id ? details?.payment?.id.replace(/-/g, "").slice(0, 12).toUpperCase() : ""}`,
              productId: firstItem?.product_id || firstItem?.id,
              customer:
                details?.user?.email?.split("@")[0] ||
                details?.user_id?.slice(-8)?.toUpperCase() ||
                "Unknown",
              product: firstItem?.name || "Product Item",
              quantity: firstItem?.quantity || 1,
              amount: `₦${formatNumberWithCommas(details?.payment?.purchase?.items?.[0]?.vendor_amount ?? 0)}`,
              productStatus: details?.payment?.payment_status || "PENDING",
              orderStatus: details?.status || "PENDING",
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
          // If no field matches, search all fields
          return (
            row.orderId?.toLowerCase().includes(term) ||
            row.customer?.toLowerCase().includes(term) ||
            row.product?.toLowerCase().includes(term) ||
            row.amount?.toString().toLowerCase().includes(term) ||
            row.productStatus?.toLowerCase().includes(term) ||
            row.orderStatus?.toLowerCase().includes(term)
          );
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
        formatDateToLocalTime(row.dateAdded),
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
                  Date: formatDateToLocalTime(row?.dateAdded),
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
              data={filteredFabricOrderData || []}
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

                // Instead of direct update, open image upload modal
                handleStatusUpdate(status);
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
                  {/* Status Update Information */}
                  {currentItem && (
                    <div className="form-control">
                      <div className="alert alert-info">
                        <div className="flex-col items-start">
                          <div className="font-medium">
                            Status Update Rules:
                          </div>
                          <div className="text-sm mt-1">
                            {checkOrderHasStyles(currentItem, orderData) ? (
                              <span>
                                📦 This order contains{" "}
                                <strong>style items</strong>. You can only
                                update status to{" "}
                                <strong>"Dispatched to Agent"</strong>.
                              </span>
                            ) : (
                              <span>
                                🚛 This order contains{" "}
                                <strong>fabric only</strong>. You can only
                                update status to{" "}
                                <strong>"Out for Delivery"</strong>.
                              </span>
                            )}
                          </div>
                          {(currentItem.orderStatus === "OUT_FOR_DELIVERY" ||
                            currentItem.orderStatus ===
                              "DISPATCHED_TO_AGENT") && (
                            <div className="text-sm mt-1 text-success">
                              ✅ Order has reached final vendor status. No
                              further updates needed.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Select */}
                  {status_select[currentItem?.status]?.to?.length > 0 ? (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Update Order Status</span>
                      </label>
                      <select
                        name="status"
                        className="select select-bordered w-full"
                        defaultValue=""
                        required
                      >
                        <option value="" disabled>
                          Select new status...
                        </option>
                        {status_select[currentItem?.status]?.to?.map(
                          (status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  ) : (
                    <div className="form-control">
                      <div className="alert alert-warning">
                        <div className="flex-col items-start">
                          <div className="font-medium">
                            No Status Updates Available
                          </div>
                          <div className="text-sm mt-1">
                            {currentItem?.orderStatus === "OUT_FOR_DELIVERY" ||
                            currentItem?.orderStatus === "DISPATCHED_TO_AGENT"
                              ? "This order has reached the final status for fabric vendors. You can only view progress from here."
                              : currentItem?.orderStatus === "DELIVERED"
                                ? "This order has been completed and delivered."
                                : currentItem?.orderStatus === "CANCELLED"
                                  ? "This order has been cancelled."
                                  : "No status updates are available for this order at the moment."}
                          </div>
                        </div>
                      </div>
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
                {status_select[currentItem?.status]?.to?.length > 0 && (
                  <button
                    disabled={update_status.isPending}
                    type="submit"
                    className="btn btn-primary text-white"
                  >
                    {update_status.isPending
                      ? "Updating..."
                      : "Continue with Image"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </dialog>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {getActionTitle()}
                  </h3>
                  <button
                    onClick={handleCloseUploadModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isUploading}
                  >
                    <X size={24} />
                  </button>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Upload a clear picture of the{" "}
                  {checkOrderHasStyles(currentItem, orderData)
                    ? "dispatched fabric package"
                    : "prepared fabric order"}{" "}
                  to update the order status to{" "}
                  <span className="font-semibold text-purple-600">
                    {pendingStatus?.replace("_", " ")}
                  </span>
                  . Image upload is required to proceed.
                </p>

                {/* File Upload Area */}
                <div className="mb-6">
                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                      <div className="flex justify-center mb-4">
                        <Upload className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium mb-2">
                        Click to upload photo
                      </p>
                      <p className="text-gray-400 text-sm mb-4">
                        Max file size: 5MB • JPG, PNG, GIF
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="fabric-upload"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="fabric-upload"
                        className={`inline-block px-6 py-2 rounded-lg cursor-pointer font-medium transition-colors ${
                          isUploading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                        }`}
                      >
                        Browse Files
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Image Preview */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>

                      {/* File Details */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Image className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(selectedFile.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              setImagePreview(null);
                              const fileInput =
                                document.getElementById("fabric-upload");
                              if (fileInput) fileInput.value = "";
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            disabled={isUploading}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Status */}
                  {uploadStatus && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {isUploading && (
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        )}
                        <p className="text-sm font-medium text-blue-800">
                          {uploadStatus}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseUploadModal}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompleteUpload}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      selectedFile && !isUploading
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Update Status
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default OrderPage;
