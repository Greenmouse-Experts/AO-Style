import React, { useState, useRef, useMemo } from "react";
import ReusableTable from "../adminDashboard/components/ReusableTable";
import { Search } from "lucide-react";
import { FaEllipsisH } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import useGetBusinessDetails from "../../../hooks/settings/useGetBusinessDetails";

import useQueryParams from "../../../hooks/useQueryParams";

import useGetFabricProduct from "../../../hooks/fabric/useGetFabric";

import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";

import { formatDateStr, formatNumberWithCommas } from "../../../lib/helper";
import useUpdateFabric from "../../../hooks/fabric/useUpdateFabric";
import useDeleteFabric from "../../../hooks/fabric/useDeleteFabric";
import useGetAdminFabricProduct from "../../../hooks/fabric/useGetAdminFabricProduct";
import useUpdateAdminFabric from "../../../hooks/fabric/useUpdateAdminFabric";
import useDeleteAdminFabric from "../../../hooks/fabric/useDeleteAdminFabric";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import useGetAdminManageFabricProduct from "../../../hooks/fabric/useGetManageFabric";
import useToast from "../../../hooks/useToast";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import { toast } from "react-toastify";
import { useEffect } from "react";

const ProductPage = () => {
  const { data: businessDetails } = useGetBusinessDetails();
  const location = useLocation();
  useEffect(() => {
    console.log(businessDetails, "details");
  }, [businessDetails]);

  const isAdminFabricRoute = location.pathname === "/admin/fabrics-products";

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[page]": 1,
    "pagination[limit]": 10,
  });

  const {
    data: getAllFabricData,
    isPending,
    refetch,
  } = useGetFabricProduct({
    type: "FABRIC",
    id: businessDetails?.data?.id,
    ...queryParams,
  });

  const {
    data: getAllAdminFabricData,
    isPending: adminProductIsPending,
    refetch: adRefetch,
  } = useGetAdminFabricProduct({
    type: "FABRIC",
    id: businessDetails?.data?.id,
    ...queryParams,
  });

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    // aearch params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const [filter, setFilter] = useState("all");

  const [currProd, setCurrProd] = useState("all");

  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const toggleDropdown = (id, event) => {
    if (openDropdown === id) {
      setOpenDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        x: rect.left - 150,
        y: rect.top + rect.height + 5,
      });
      setOpenDropdown(id);
    }
  };

  const { isPending: updateIsPending, updateFabricMutate } = useUpdateFabric();

  const { isPending: updateAdminIsPending, updateAdminFabricMutate } =
    useUpdateAdminFabric();

  const updatedData = isAdminFabricRoute
    ? getAllAdminFabricData
    : getAllFabricData;

  const FabricData = useMemo(() => {
    if (!updatedData?.data) return [];

    // Remove duplicates based on unique product ID
    const uniqueProducts = updatedData.data.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );

    return uniqueProducts.map((details) => {
      console.log("🔍 Processing fabric item:", details);
      console.log("📸 Fabric photos:", details?.fabric?.photos);

      return {
        ...details,
        id: details?.id ?? "",
        category_id: `${details?.category?.id ?? ""}`,
        name: `${details?.name ?? ""}`,
        sku: `${details?.sku ?? ""}`,
        category: `${details?.category?.name ?? ""}`,
        qty: `${details?.fabric?.quantity ?? details?.fabric?.weight_per_unit ?? "0"} ${details?.fabric?.weight_per_unit ? "units" : ""}`.trim(),
        price: `₦${formatNumberWithCommas(details?.price ?? details?.original_price ?? 0)}`,
        status: details?.status ?? details?.approval_status ?? "DRAFT",
        fabric_type: `${details?.fabric?.type ?? "Cotton"}`,
        fabric_gender: `${details?.fabric?.gender ?? "Unisex"}`,
        fabric_id: `${details?.fabric?.id ?? ""}`,
        market_id: `${details?.fabric?.market_id ?? ""}`,
        business_name: `${details?.business_info?.Object?.business_name ?? ""}`,
        creator_name: `${details?.creator?.Object?.name ?? "Admin"}`,
        description: `${details?.description ?? ""}`,
        created_at: `${
          details?.created_at
            ? formatDateStr(details?.created_at.split(".").shift())
            : ""
        }`,
        // Store the full fabric object for image access
        fabric: details?.fabric,
        // Store original details for actions
        original: details,
      };
    });
  }, [updatedData]);
  // Debug logging for final fabric data
  console.log("🎯 FINAL FABRIC DATA FOR TABLE:", FabricData);
  console.log("📊 FABRIC DATA COUNT:", FabricData.length);
  console.log("🔍 RAW API DATA:", updatedData);

  let admin_id = businessDetails?.data?.user_id;
  // const admin_data =  FabricData.map((item)=> )
  const admin_data =
    FabricData.filter((item) => item.creator_id == admin_id) || [];
  const { isPending: deleteIsPending, deleteFabricMutate } = useDeleteFabric();

  const { isPending: deleteAdminIsPending, deleteAdminFabricMutate } =
    useDeleteAdminFabric();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const columns = useMemo(
    () => [
      {
        label: "SKU",
        key: "sku",
        width: "120px",
        render: (sku) => (
          <div className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border whitespace-nowrap">
            {sku || "N/A"}
          </div>
        ),
      },
      {
        label: "Product",
        key: "name",
        width: "280px",
        render: (name, row) => (
          <div className="min-w-[280px] max-w-xs">
            <div
              className="font-semibold text-gray-900 text-sm truncate"
              title={name}
            >
              {name || "Unnamed Product"}
            </div>
            <div className="text-xs text-gray-500 mt-1 truncate">
              {row.description && row.description.length > 50
                ? `${row.description.substring(0, 50)}...`
                : row.description || "No description"}
            </div>
          </div>
        ),
      },
      {
        label: "Image",
        key: "image",
        width: "80px",
        render: (image, row) => (
          <div className="flex items-center justify-center min-w-[80px]">
            {row?.fabric?.photos && row?.fabric?.photos.length > 0 ? (
              <img
                src={row.fabric.photos[0]}
                alt={row?.name || "Product"}
                className="w-14 h-14 rounded-lg object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-lg border-2 border-gray-200"
              style={{
                display:
                  row?.fabric?.photos && row?.fabric?.photos.length > 0
                    ? "none"
                    : "flex",
              }}
            >
              {row?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          </div>
        ),
      },
      {
        label: "Category",
        key: "category",
        width: "120px",
        render: (category) => (
          <div className="min-w-[120px]">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
              {category || "Uncategorized"}
            </span>
          </div>
        ),
      },
      {
        label: "Fabric Type",
        key: "fabric_type",
        width: "140px",
        render: (fabric_type, row) => (
          <div className="text-sm min-w-[140px]">
            <div className="font-medium text-gray-900 flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
              <span className="truncate">{fabric_type || "N/A"}</span>
            </div>
            {row.fabric_gender && (
              <div className="text-xs text-gray-500 ml-4 mt-1 italic truncate">
                {row.fabric_gender}
              </div>
            )}
          </div>
        ),
      },
      {
        label: "Price",
        key: "price",
        width: "120px",
        render: (price, row) => (
          <div className="text-right min-w-[120px]">
            <div className="text-lg font-bold text-green-700 whitespace-nowrap">
              {price}
            </div>
            <div className="text-xs text-gray-500">per unit</div>
          </div>
        ),
      },
      {
        label: "Stock",
        key: "qty",
        width: "100px",
        render: (qty) => (
          <div className="text-center min-w-[100px]">
            <div
              className={`text-sm font-semibold whitespace-nowrap ${qty === "0" || qty === "0 units" ? "text-red-600" : "text-gray-900"}`}
            >
              {qty || "0"}
            </div>
            <div
              className={`text-xs px-2 py-1 rounded-full mt-1 whitespace-nowrap ${
                qty === "0" || qty === "0 units"
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {qty === "0" || qty === "0 units" ? "Out of Stock" : "In Stock"}
            </div>
          </div>
        ),
      },
      {
        label: "Status",
        key: "status",
        width: "120px",
        render: (status) => (
          <div className="flex justify-center min-w-[120px]">
            <span
              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border-2 whitespace-nowrap ${
                status === "PUBLISHED"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : status === "Cancelled"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                  status === "PUBLISHED"
                    ? "bg-green-400"
                    : status === "Cancelled"
                      ? "bg-red-400"
                      : "bg-yellow-400"
                }`}
              ></span>
              {status}
            </span>
          </div>
        ),
      },
      {
        label: "Actions",
        key: "action",
        width: "100px",
        render: (_, row) => (
          <div className="min-w-[100px] flex justify-center">
            <button
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
              onClick={(e) => toggleDropdown(row.id, e)}
            >
              <FaEllipsisH className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [openDropdown, toggleDropdown],
  );

  const [newCategory, setNewCategory] = useState();

  const totalPages = Math.ceil(
    updatedData?.count / (queryParams["pagination[limit]"] ?? 10),
  );

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(FabricData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "MyProducts.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["SKU", "Product Name", "Category", "Price", "Qty", "Status"]],
      body: FabricData?.map((row) => [
        row.sku,
        row.name,
        row.category,
        row.qty,
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
    doc.save("MyProducts.pdf");
  };

  const { toastError } = useToast();
  return (
    <>
      <div className="bg-gradient-to-r from-white to-gray-50 px-6 py-8 mb-8 relative border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {!isAdminFabricRoute
                ? "My Products"
                : currProd == "all"
                  ? "All Products"
                  : "My Products"}
            </h1>
            <p className="text-gray-600 flex items-center">
              <Link
                to="/sales"
                className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <svg
                className="w-4 h-4 mx-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="font-medium text-gray-900">
                {currProd === "all" ? "All Products" : "My Products"}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {!isAdminFabricRoute ? (
              <Link
                to={
                  isAdminFabricRoute
                    ? "/admin/fabric/add-product"
                    : "/fabric/product/add-product"
                }
                className="w-full sm:w-auto"
              >
                <button className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto font-medium">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add New Product
                </button>
              </Link>
            ) : currProd == "all" ? (
              <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
                <svg
                  className="w-5 h-5 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-gray-600 text-sm font-medium">
                  {FabricData.length} Products Total
                </span>
              </div>
            ) : (
              <Link
                to={
                  isAdminFabricRoute
                    ? "/admin/fabric/add-product"
                    : "/fabric/product/add-product"
                }
                className="w-full sm:w-auto"
              >
                <button className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto font-medium">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add New Product
                </button>
              </Link>
            )}
          </div>
        </div>
        {isAdminFabricRoute && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {["all", "my"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setCurrProd(tab);
                  }}
                  className={`font-medium cursor-pointer capitalize px-4 py-2 rounded-lg transition-all duration-200 ${
                    currProd === tab
                      ? "bg-purple-100 text-purple-700 border-2 border-purple-200 shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <span className="flex items-center">
                    {tab === "all" ? (
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                    {tab === "all" ? "All" : "My"} Products
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-6">
          {/* Product Filters */}
          <div className="flex flex-wrap gap-2">
            {["all", "published", "unpublished"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setFilter(tab);
                  if (tab === "all") {
                    updateQueryParams({
                      ...queryParams,
                      status: undefined,
                    });
                  }

                  if (tab == "published") {
                    updateQueryParams({
                      ...queryParams,
                      status: "PUBLISHED",
                    });
                  }

                  if (tab == "unpublished") {
                    updateQueryParams({
                      ...queryParams,
                      status: "DRAFT",
                    });
                  }
                }}
                className={`font-medium capitalize px-4 py-2.5 rounded-lg transition-all duration-200 border-2 ${
                  filter === tab
                    ? "bg-purple-100 text-purple-700 border-purple-200 shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-transparent hover:border-gray-200"
                }`}
              >
                <span className="flex items-center">
                  {tab === "all" && (
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  )}
                  {tab === "published" && (
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {tab === "unpublished" && (
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  )}
                  {tab} Product{filter === tab && ` (${FabricData.length})`}
                </span>
              </button>
            ))}
          </div>
          {/* Search Bar */}
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full lg:w-auto">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search products, SKU, or category..."
                  className="w-full lg:w-80 pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg outline-none text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  value={queryString}
                  onChange={(evt) =>
                    setQueryString(
                      evt.target.value ? evt.target.value : undefined,
                    )
                  }
                />
              </div>
              <div className="flex gap-2">
                <select
                  onChange={handleExport}
                  className="bg-white border-2 border-gray-200 outline-none text-gray-700 px-4 py-3 text-sm rounded-lg whitespace-nowrap focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                >
                  <option value="" disabled selected>
                    📊 Export Data
                  </option>
                  <option value="csv">📄 Export to CSV</option>
                  <option value="excel">📊 Export to Excel</option>
                  <option value="pdf">📋 Export to PDF</option>
                </select>
                <button className="bg-white border-2 border-gray-200 text-gray-700 px-4 py-3 text-sm rounded-lg whitespace-nowrap hover:border-gray-300 transition-all duration-200 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                    />
                  </svg>
                  Filter
                </button>
              </div>
            </div>
            <CSVLink
              id="csvDownload"
              data={FabricData?.map((row) => ({
                SKU: row.sku,
                "Product Name": row.name,
                Category: row.category,
                "Fabric Type": row.fabric_type,
                Quantity: row.qty,
                Price: row.price,
                Status: row.status,
                Business: row.business_name,
                Creator: row.creator_name,
                "Created At": row.created_at,
              }))}
              filename="MyProducts.csv"
              className="hidden"
            />
          </div>
        </div>
        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <ReusableTable
              columns={columns}
              loading={isAdminFabricRoute ? adminProductIsPending : isPending}
              data={currProd == "all" ? FabricData : []}
              emptyStateMessage={
                !isAdminFabricRoute && !isPending && FabricData.length === 0
                  ? "🎨 No fabric products found. Create your first product to get started!"
                  : isAdminFabricRoute &&
                      !adminProductIsPending &&
                      FabricData.length === 0
                    ? "🏢 No admin fabric products found. Create your first product to get started!"
                    : undefined
              }
              className="border-0"
              style={{ minWidth: "1000px" }}
            />
          </div>
        </div>

        {!(FabricData?.length > 0) &&
          (isAdminFabricRoute ? adminProductIsPending : isPending) && (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">
                Loading products...
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Please wait while we fetch your data
              </p>
            </div>
          )}
      </div>
      {FabricData?.length ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600 font-medium">Show:</p>
              <select
                value={queryParams["pagination[limit]"] || 10}
                onChange={(e) =>
                  updateQueryParams({
                    "pagination[limit]": +e.target.value,
                  })
                }
                className="py-2 px-3 border border-gray-300 rounded-lg outline-none text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value={5}>5 items</option>
                <option value={10}>10 items</option>
                <option value={15}>15 items</option>
                <option value={20}>20 items</option>
              </select>
              <p className="text-sm text-gray-500">
                of {updatedData?.count || FabricData.length} total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  updateQueryParams({
                    "pagination[page]": +queryParams["pagination[page]"] - 1,
                  });
                }}
                disabled={(queryParams["pagination[page]"] ?? 1) == 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-purple-50 border border-purple-200 rounded-lg">
                Page {queryParams["pagination[page]"] ?? 1}
              </span>
              <button
                onClick={() => {
                  updateQueryParams({
                    "pagination[page]": +queryParams["pagination[page]"] + 1,
                  });
                }}
                disabled={(queryParams["pagination[page]"] ?? 1) == totalPages}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* Modal-style dropdown overlay */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        >
          <div
            className="absolute w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
            style={{
              left: `${dropdownPosition.x}px`,
              top: `${dropdownPosition.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const row = FabricData.find((item) => item.id === openDropdown);
              if (!row) return null;

              return (
                <>
                  {row?.status === "DRAFT" ? (
                    <button
                      onClick={() => {
                        console.log("🚀 Publishing fabric product:", row);
                        if (isAdminFabricRoute) {
                          updateAdminFabricMutate(
                            {
                              id: row?.id,
                              product: {
                                name: row?.name,
                                sku: row?.sku,
                                category_id: row?.category_id,
                                status: "PUBLISHED",
                                approval_status: "PUBLISHED",
                              },
                            },
                            {
                              onSuccess: (response) => {
                                console.log(
                                  "✅ Publish Success Response:",
                                  response,
                                );
                                setOpenDropdown(null);
                              },
                              onError: (error) => {
                                console.error("❌ Publish Error:", error);
                              },
                            },
                          );
                        } else {
                          updateFabricMutate(
                            {
                              id: row?.id,
                              business_id: businessDetails?.data?.id,
                              product: {
                                name: row?.name,
                                sku: row?.sku,
                                category_id: row?.category_id,
                                status: "PUBLISHED",
                                approval_status: "PUBLISHED",
                              },
                            },
                            {
                              onSuccess: (response) => {
                                console.log(
                                  "✅ Publish Success Response:",
                                  response,
                                );
                                setOpenDropdown(null);
                              },
                              onError: (error) => {
                                console.error("❌ Publish Error:", error);
                              },
                            },
                          );
                        }
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-green-700 hover:bg-green-50 transition-colors duration-150"
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {updateAdminIsPending || updateIsPending
                        ? "Publishing..."
                        : "Publish Product"}
                    </button>
                  ) : null}

                  {/* {row?.status === "PUBLISHED" ? (
                    <button
                      onClick={() => {
                        console.log("📝 Unpublishing fabric product:", row);
                        if (isAdminFabricRoute) {
                          updateAdminFabricMutate(
                            {
                              id: row?.id,
                              product: {
                                name: row?.name,
                                sku: row?.sku,
                                category_id: row?.category_id,
                                status: "DRAFT",
                                approval_status: "DRAFT",
                              },
                            },
                            {
                              onSuccess: (response) => {
                                console.log(
                                  "✅ Unpublish Success Response:",
                                  response,
                                );
                                setOpenDropdown(null);
                              },
                              onError: (error) => {
                                console.error("❌ Unpublish Error:", error);
                              },
                            },
                          );
                        } else {
                          updateFabricMutate(
                            {
                              id: row?.id,
                              business_id: businessDetails?.data?.id,
                              product: {
                                name: row?.name,
                                sku: row?.sku,
                                category_id: row?.category_id,
                                status: "DRAFT",
                                approval_status: "DRAFT",
                              },
                            },
                            {
                              onSuccess: (response) => {
                                console.log(
                                  "✅ Unpublish Success Response:",
                                  response,
                                );
                                setOpenDropdown(null);
                              },
                              onError: (error) => {
                                console.error("❌ Unpublish Error:", error);
                              },
                            },
                          );
                        }
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-yellow-700 hover:bg-yellow-50 transition-colors duration-150"
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      {updateAdminIsPending || updateIsPending
                        ? "Unpublishing..."
                        : "Unpublish Product"}
                    </button>
                  ) : null}*/}

                  <Link
                    state={{ info: row?.original || row }}
                    to={
                      isAdminFabricRoute
                        ? "/admin/fabric/edit-product"
                        : "/fabric/product/edit-product"
                    }
                    className="flex items-center w-full px-4 py-3 text-sm text-blue-700 hover:bg-blue-50 transition-colors duration-150"
                    onClick={() => {
                      console.log("👁️ Viewing fabric product:", row);
                      setOpenDropdown(null);
                    }}
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View/Edit Fabric
                  </Link>

                  {/* <Link
                    state={{ info: row?.original || row }}
                    to={
                      isAdminFabricRoute
                        ? "/admin/fabric/edit-product"
                        : "/fabric/product/edit-product"
                    }
                    className="flex items-center w-full px-4 py-3 text-sm text-indigo-700 hover:bg-indigo-50 transition-colors duration-150"
                    onClick={() => {
                      console.log("✏️ Editing fabric product:", row);
                      setOpenDropdown(null);
                    }}
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Product
                  </Link>*/}

                  <button
                    onClick={() => {
                      console.log("🗑️ Removing fabric product:", row);
                      setNewCategory(row?.original || row);
                      setIsAddModalOpen(true);
                      setOpenDropdown(null);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 border-t border-gray-100 transition-colors duration-150"
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove Product
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
          onClick={() => {
            setIsAddModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-4 -mt-7">
              {"Delete Product"}
            </h3>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                if (!navigator.onLine) {
                  toastError(
                    "No internet connection. Please check your network.",
                  );
                  return;
                }
                e.preventDefault();
                if (isAdminFabricRoute) {
                  deleteAdminFabricMutate(
                    {
                      id: newCategory?.id,
                    },
                    {
                      onSuccess: () => {
                        setIsAddModalOpen(false);
                        setNewCategory(null);
                      },
                    },
                  );
                } else {
                  deleteFabricMutate(
                    {
                      id: newCategory?.id,
                      business_id: businessDetails?.data?.id,
                    },
                    {
                      onSuccess: () => {
                        setIsAddModalOpen(false);
                        setNewCategory(null);
                      },
                    },
                  );
                }
              }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Are you sure you want to delete {newCategory?.name}
              </label>
              <div className="flex w-full justify-end gap-4 mt-6">
                <button
                  className="mt-6 cursor-pointer w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 text-sm rounded-md"
                  //   className="bg-gray-300 hover:bg-gray-400 text-gray-800 w-full rounded-md"
                  onClick={() => {
                    setIsAddModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteIsPending || deleteAdminIsPending}
                  className="mt-6 cursor-pointer w-full bg-gradient text-white px-4 py-3 text-sm rounded-md"
                >
                  {deleteIsPending || deleteAdminIsPending
                    ? "Please wait..."
                    : "Delete Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductPage;
