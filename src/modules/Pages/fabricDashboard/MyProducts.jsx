import React, { useState, useMemo, useCallback } from "react";
import ReusableTable from "../adminDashboard/components/ReusableTable";
import { Search } from "lucide-react";
import { FaEllipsisH } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

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
import useUpdateAdminStyle from "../../../hooks/style/useUpdateAdminStyle";
import useDeleteAdminStyle from "../../../hooks/style/useDeleteAdminStyle";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import useGetAdminManageStyleProduct from "../../../hooks/style/useGetManageStyle";
import useToast from "../../../hooks/useToast";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import { useEffect } from "react";
import useGetAdminBusinessDetails from "../../../hooks/settings/useGetAdmnBusinessInfo";
import { useQuery } from "@tanstack/react-query";

const ProductPage = () => {
  const { data: businessDetails } = useGetAdminBusinessDetails();
  const location = useLocation();
  useEffect(() => {
    console.log(businessDetails, "details");
  }, [businessDetails]);
  // console.log("This is the admin business details ", businessDetails);
  const isAdminFabricRoute = location.pathname === "/admin/fabrics-products";
  const isAdminStyleRoute = location.pathname === "/admin/styles-products";
  const isAdminRoute = isAdminFabricRoute || isAdminStyleRoute;
  const productType = isAdminStyleRoute ? "STYLE" : "FABRIC";

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[page]": 1,
    "pagination[limit]": 10,
  });

  const { data: vendorOrStyleBusinessDetails } = useQuery({
    queryKey: ["vendor-and-tailor-businessdetails"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/onboard/fetch-business-details");
      console.log(
        "This is the fabrc vendor and the tailor business details response",
        resp,
      );
      return resp?.data?.data;
    },
  });

  console.log("This is the busness details", vendorOrStyleBusinessDetails);

  const {
    data: getAllFabricData,
    isPending,
    refetch,
  } = useGetFabricProduct({
    type: productType,
    id: vendorOrStyleBusinessDetails?.id,
    ...queryParams,
  });

  const {
    data: getAllAdminFabricData,
    isPending: adminProductIsPending,
    refetch: adRefetch,
  } = useGetAdminFabricProduct({
    type: productType,
    id: businessDetails?.data?.id,
    ...queryParams,
  });
  console.log(businessDetails);

  // Move currProd declaration above its usage
  const [currProd, setCurrProd] = useState("all");

  // Add hook for managing fabric products (admin only) - for "My Products"
  const {
    data: getAllAdminManageFabricData,
    isPending: adminManageFabricIsPending,
    refetch: adManageFabricRefetch,
  } = useGetAdminFabricProduct({
    type: productType,
    // CHANGE: If in "my fabrics" tab, use business_id param instead of id
    ...(isAdminRoute && !isAdminStyleRoute && currProd === "my"
      ? { business_id: businessDetails?.data?.id }
      : {}),
    ...queryParams,
  });
  console.log("Testing out the admin products", getAllAdminManageFabricData);
  // Add hook for managing style products (admin only) - for "My Products"
  const {
    data: getAllAdminManageStyleData,
    isPending: adminManageStyleIsPending,
    refetch: adManageStyleRefetch,
  } = useGetAdminManageStyleProduct({
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

  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const toggleDropdown = useCallback(
    (id, event) => {
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
    },
    [openDropdown],
  );

  const { isPending: updateIsPending } = useUpdateFabric();

  const { isPending: updateAdminIsPending, updateAdminFabricMutate } =
    useUpdateAdminFabric();

  const { isPending: updateAdminStyleIsPending, updateAdminStyleMutate } =
    useUpdateAdminStyle();

  const { isPending: deleteAdminStyleIsPending, deleteAdminStyleMutate } =
    useDeleteAdminStyle();

  // For "All Products" - use general admin data
  const allProductsData = isAdminRoute
    ? isAdminStyleRoute
      ? getAllAdminFabricData // Using general endpoint for styles
      : getAllAdminFabricData
    : getAllFabricData;

  // For "My Products" - use manage endpoints
  const myProductsData = isAdminRoute
    ? isAdminStyleRoute
      ? getAllAdminManageStyleData
      : getAllAdminManageFabricData
    : getAllFabricData;

  // Choose data source based on current tab
  const updatedData = currProd === "all" ? allProductsData : myProductsData;

  // Debug logging for data source selection
  console.log("🔄 DATA SOURCE DEBUG:", {
    currProd,
    isAdminRoute,
    isAdminStyleRoute,
    productType,
    allProductsCount: allProductsData?.count || 0,
    myProductsCount: myProductsData?.count || 0,
    usingDataSource: currProd === "all" ? "allProductsData" : "myProductsData",
    currentDataCount: updatedData?.count || 0,
  });

  // Debug API endpoint usage
  console.log("🌐 ENDPOINT USAGE DEBUG:", {
    businessId: businessDetails?.data?.id,
    allProductsEndpoint: isAdminRoute
      ? "/product-general/fetch"
      : "/product-general",
    myFabricsEndpoint: `/manage-fabric/${businessDetails?.data?.id}`,
    myStylesEndpoint: `/manage-style/${businessDetails?.data?.id}`,
    currentEndpoint:
      currProd === "all"
        ? isAdminRoute
          ? "/product-general/fetch"
          : "/product-general"
        : isAdminStyleRoute
          ? `/manage-style/${businessDetails?.data?.id}`
          : `/manage-fabric/${businessDetails?.data?.id}`,
    hasBusinessDetails: !!businessDetails?.data,
    hasBusinessId: !!businessDetails?.data?.id,
  });

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
        qty: `${
          details?.fabric?.quantity ?? details?.fabric?.weight_per_unit ?? "0"
        } ${details?.fabric?.weight_per_unit ? "units" : ""}`.trim(),
        price: `₦${formatNumberWithCommas(
          details?.price ?? details?.original_price ?? 0,
        )}`,
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

  // For "My Products", we now use the manage endpoints directly, so no filtering needed
  // admin_id is kept for potential future use in non-admin routes
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
          <div className="min-w-0 sm:min-w-[200px] md:min-w-[280px] max-w-xs">
            <div
              className="font-semibold text-gray-900 text-xs sm:text-sm truncate"
              title={name}
            >
              {name || "Unnamed Product"}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">
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
          <div className="flex items-center justify-center min-w-[60px] sm:min-w-[80px]">
            {row?.fabric?.photos && row?.fabric?.photos.length > 0 ? (
              <img
                src={row.fabric.photos[0]}
                alt={row?.name || "Product"}
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm sm:text-base md:text-lg border-2 border-gray-200"
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
            {row.gender && (
              <div className="text-xs text-gray-500 ml-4 mt-1 italic truncate">
                {row.gender}
              </div>
            )}
          </div>
        ),
      },
      {
        label: "Price",
        key: "price",
        width: "120px",
        render: (price) => (
          <div className="text-right min-w-[100px] sm:min-w-[120px]">
            <div className="text-sm sm:text-base md:text-lg font-bold text-green-700 whitespace-nowrap">
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
              className={`text-sm font-semibold whitespace-nowrap ${
                qty === "0" || qty === "0 units"
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
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
        label: "Admin Status",
        key: "admin-status",
        width: "120px",
        render: (_, row) => (
          <div className="flex justify-center min-w-[120px]">
            <span
              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border-2 whitespace-nowrap ${
                row?.approval_status === "PUBLISHED"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : status === "Cancelled"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                  row?.approval_status === "PUBLISHED"
                    ? "bg-green-400"
                    : row?.approval_status === "Cancelled"
                      ? "bg-red-400"
                      : "bg-yellow-400"
                }`}
              ></span>
              {row?.approval_status}
            </span>
          </div>
        ),
      },
      {
        label: "Actions",
        key: "action",
        width: "100px",
        render: (_, row) => (
          <div className="min-w-[80px] sm:min-w-[100px] flex justify-center">
            <button
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 cursor-pointer"
              onClick={(e) => toggleDropdown(row.id, e)}
            >
              <FaEllipsisH className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        ),
      },
    ],
    [toggleDropdown],
  );

  const [newCategory, setNewCategory] = useState();

  const currentData = currProd === "all" ? allProductsData : myProductsData;
  const totalPages = Math.ceil(
    currentData?.count / (queryParams["pagination[limit]"] ?? 10),
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
    saveAs(
      blob,
      `${currProd === "all" ? "All" : "My"}_${productType}_Products.xlsx`,
    );
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
    doc.save(
      `${currProd === "all" ? "All" : "My"}_${productType}_Products.pdf`,
    );
  };

  const { toastError } = useToast();
  return (
    <>
      <div className="bg-gradient-to-r from-white to-gray-50 px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 mb-4 sm:mb-6 md:mb-8 relative border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center space-y-3 sm:space-y-4 lg:space-y-0">
          <div className="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {!isAdminRoute
                ? "My Products"
                : currProd == "all"
                  ? `All ${productType === "STYLE" ? "Styles" : "Fabrics"}`
                  : `My ${productType === "STYLE" ? "Styles" : "Fabrics"}`}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 flex items-center flex-wrap">
              <Link
                to={isAdminFabricRoute ? "/admin" : "/fabric"}
                className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-gray-400"
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

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {!isAdminRoute ? (
              <Link
                to="/fabric/product/add-product"
                className="w-full sm:w-auto"
              >
                <button className="flex items-center justify-center bg-gradient text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto font-medium text-sm sm:text-base cursor-pointer">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
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
              <div className="flex items-center bg-gray-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-gray-500 flex-shrink-0"
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
                <span className="text-gray-600 text-xs sm:text-sm font-medium whitespace-nowrap">
                  {FabricData.length} Products Total
                </span>
              </div>
            ) : (
              <Link
                to={
                  isAdminRoute
                    ? isAdminStyleRoute
                      ? "/admin/style/add-product"
                      : "/admin/fabric/add-product"
                    : "/fabric/product/add-product"
                }
                className="w-full sm:w-auto"
              >
                <button className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto font-medium text-sm sm:text-base cursor-pointer">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
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
                  Add New {productType === "STYLE" ? "Style" : "Fabric"}
                </button>
              </Link>
            )}
          </div>
        </div>
        {isAdminRoute && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0 pb-2 sm:pb-0">
              {["all", "my"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setCurrProd(tab);
                  }}
                  className={`font-medium cursor-pointer capitalize px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                    currProd === tab
                      ? "bg-purple-100 text-purple-700 border-2 border-purple-200 shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <span className="flex items-center">
                    {tab === "all" ? (
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
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
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
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
                    {tab === "all" ? "All" : "My"}{" "}
                    {productType === "STYLE" ? "Styles" : "Fabrics"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          {/* Product Filters */}
          <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0 pb-2 sm:pb-0">
            {["all", "published", "unpublished"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setFilter(tab);
                  if (tab === "all") {
                    updateQueryParams({
                      ...queryParams,
                      approval_status: undefined,
                    });
                  }

                  if (tab == "published") {
                    updateQueryParams({
                      ...queryParams,
                      approval_status: "PUBLISHED",
                    });
                  }

                  if (tab == "unpublished") {
                    updateQueryParams({
                      ...queryParams,
                      approval_status: "DRAFT",
                    });
                  }
                }}
                className={`font-medium capitalize px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 border-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                  filter === tab
                    ? "bg-purple-100 text-purple-700 border-purple-200 shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-transparent hover:border-gray-200"
                }`}
              >
                <span className="flex items-center">
                  {tab === "all" && (
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
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
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
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
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
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
                  <span className="hidden sm:inline">{tab} Product</span>
                  <span className="sm:hidden">{tab}</span>
                  {filter === tab && (
                    <span className="ml-1">({FabricData.length})</span>
                  )}
                </span>
              </button>
            ))}
          </div>
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search
                  className="absolute left-2 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full sm:w-64 lg:w-80 pl-8 sm:pl-10 md:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 border-2 border-gray-200 rounded-lg outline-none text-xs sm:text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  value={queryString}
                  onChange={(evt) =>
                    setQueryString(
                      evt.target.value ? evt.target.value : undefined,
                    )
                  }
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  onChange={handleExport}
                  className="bg-white border-2 border-gray-200 outline-none text-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm rounded-lg whitespace-nowrap focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 flex-1 sm:flex-initial cursor-pointer"
                >
                  <option value="" disabled selected>
                    📊 Export Data
                  </option>
                  <option value="csv">📄 Export to CSV</option>
                  <option value="excel">📊 Export to Excel</option>
                  <option value="pdf">📋 Export to PDF</option>
                </select>
                <button className="bg-white border-2 border-gray-200 text-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm rounded-lg whitespace-nowrap hover:border-gray-300 transition-all duration-200 flex items-center justify-center cursor-pointer">
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
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
                  <span className="hidden sm:inline">Filter</span>
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
              }))}
              filename={`${
                currProd === "all" ? "All" : "My"
              }_${productType}_Products.csv`}
              className="hidden"
            />
          </div>
        </div>
        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <ReusableTable
              columns={columns}
              loading={
                currProd === "all"
                  ? isAdminRoute
                    ? adminProductIsPending
                    : isPending
                  : isAdminRoute
                    ? isAdminStyleRoute
                      ? adminManageStyleIsPending
                      : adminManageFabricIsPending
                    : isPending
              }
              data={FabricData}
              emptyStateMessage={
                !isAdminRoute && !isPending && FabricData.length === 0
                  ? `🎨 No ${productType.toLowerCase()} products found. Create your first product to get started!`
                  : isAdminRoute &&
                      !(currProd === "all"
                        ? adminProductIsPending
                        : isAdminStyleRoute
                          ? adminManageStyleIsPending
                          : adminManageFabricIsPending) &&
                      FabricData.length === 0
                    ? `🏢 No ${
                        currProd === "all" ? "admin" : "your"
                      } ${productType.toLowerCase()} products found. Create your first product to get started!`
                    : undefined
              }
              className="border-0"
              style={{ minWidth: "1000px" }}
            />
          </div>
        </div>

            {!(FabricData?.length > 0) &&
              (currProd === "all"
                ? isAdminRoute
                  ? adminProductIsPending
                  : isPending
                : isAdminRoute
                  ? isAdminStyleRoute
                    ? adminManageStyleIsPending
                    : adminManageFabricIsPending
                  : isPending) && (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 bg-white rounded-xl shadow-sm border border-gray-200 px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
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
                  <p className="text-gray-500 text-base sm:text-lg font-medium">
                    Loading products...
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-2 text-center">
                    Please wait while we fetch your data
                  </p>
                </div>
              )}
      </div>
      {FabricData?.length ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
              <p className="text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap">Show:</p>
              <select
                value={queryParams["pagination[limit]"] || 10}
                onChange={(e) =>
                  updateQueryParams({
                    "pagination[limit]": +e.target.value,
                  })
                }
                className="py-1.5 sm:py-2 px-2 sm:px-3 border border-gray-300 rounded-lg outline-none text-xs sm:text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 cursor-pointer"
              >
                <option value={5}>5 items</option>
                <option value={10}>10 items</option>
                <option value={15}>15 items</option>
                <option value={20}>20 items</option>
              </select>
              <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                of {currentData?.count || FabricData.length} total
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <button
                onClick={() => {
                  updateQueryParams({
                    "pagination[page]": +queryParams["pagination[page]"] - 1,
                  });
                }}
                disabled={(queryParams["pagination[page]"] ?? 1) == 1}
                className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0"
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
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              <span className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-purple-50 border border-purple-200 rounded-lg whitespace-nowrap">
                Page {queryParams["pagination[page]"] ?? 1}
              </span>
              <button
                onClick={() => {
                  updateQueryParams({
                    "pagination[page]": +queryParams["pagination[page]"] + 1,
                  });
                }}
                disabled={(queryParams["pagination[page]"] ?? 1) == totalPages}
                className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-2 flex-shrink-0"
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
            className="absolute w-40 sm:w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[10000] overflow-hidden"
            style={{
              left: `${Math.max(10, Math.min(dropdownPosition.x, window.innerWidth - 170))}px`,
              top: `${dropdownPosition.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const row = FabricData.find((item) => item.id === openDropdown);
              if (!row) return null;

              return (
                <>
                  {isAdminRoute && row?.approval_status === "DRAFT" ? (
                    <button
                      onClick={() => {
                        console.log("🚀 Publishing product:", row);
                        // Extract business_id from product owner (fabric vendor or tailor)
                        const productBusinessId =
                          row?.original?.business_info?.id ||
                          row?.original?.business_info?.Object?.id ||
                          row?.original?.business_id ||
                          row?.original?.vendor?.business_id;
                        
                        console.log("🔧 Product Owner Business ID:", productBusinessId);
                        console.log("🔧 Available business_id sources:", {
                          "business_info.id": row?.original?.business_info?.id,
                          "business_info.Object.id": row?.original?.business_info?.Object?.id,
                          "business_id": row?.original?.business_id,
                          "vendor.business_id": row?.original?.vendor?.business_id,
                        });

                        const updateData = {
                          id: row?.id,
                          business_id: productBusinessId, // Product owner's business_id for header
                          product: {
                            name: row?.name,
                            sku: row?.sku,
                            category_id: row?.category_id,
                            status: "PUBLISHED",
                            approval_status: "PUBLISHED",
                          },
                        };

                        if (isAdminStyleRoute) {
                          updateAdminStyleMutate(updateData, {
                            onSuccess: (response) => {
                              console.log(
                                "✅ Publish Style Success:",
                                response,
                              );
                              setOpenDropdown(null);
                              adManageStyleRefetch();
                            },
                            onError: (error) => {
                              console.error("❌ Publish Style Error:", error);
                            },
                          });
                        } else {
                          updateAdminFabricMutate(updateData, {
                            onSuccess: (response) => {
                              console.log(
                                "✅ Publish Fabric Success:",
                                response,
                              );
                              setOpenDropdown(null);
                              if (currProd === "my") {
                                adManageFabricRefetch();
                              } else {
                                adRefetch();
                              }
                            },
                            onError: (error) => {
                              console.error("❌ Publish Fabric Error:", error);
                            },
                          });
                        }
                      }}
                      className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-green-700 hover:bg-green-50 transition-colors duration-150 cursor-pointer"
                    >
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0"
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
                      {updateAdminIsPending ||
                      updateIsPending ||
                      updateAdminStyleIsPending
                        ? "Publishing..."
                        : `Publish ${
                            productType === "STYLE" ? "Style" : "Fabric"
                          }`}
                    </button>
                  ) : null}

                  {isAdminRoute && row?.approval_status === "PUBLISHED" ? (
                    <button
                      onClick={() => {
                        console.log("📝 Unpublishing product:", row);
                        // Extract business_id from product owner (fabric vendor or tailor)
                        const productBusinessId =
                          row?.original?.business_info?.id ||
                          row?.original?.business_info?.Object?.id ||
                          row?.original?.business_id ||
                          row?.original?.vendor?.business_id;
                        
                        console.log("🔧 Product Owner Business ID:", productBusinessId);
                        console.log("🔧 Available business_id sources:", {
                          "business_info.id": row?.original?.business_info?.id,
                          "business_info.Object.id": row?.original?.business_info?.Object?.id,
                          "business_id": row?.original?.business_id,
                          "vendor.business_id": row?.original?.vendor?.business_id,
                        });

                        const updateData = {
                          id: row?.id,
                          business_id: productBusinessId, // Product owner's business_id for header
                          product: {
                            name: row?.name,
                            sku: row?.sku,
                            category_id: row?.category_id,
                            status: "DRAFT",
                            approval_status: "DRAFT",
                          },
                        };

                        if (isAdminStyleRoute) {
                          updateAdminStyleMutate(updateData, {
                            onSuccess: (response) => {
                              console.log(
                                "✅ Unpublish Style Success:",
                                response,
                              );
                              setOpenDropdown(null);
                              adManageStyleRefetch();
                            },
                            onError: (error) => {
                              console.error("❌ Unpublish Style Error:", error);
                            },
                          });
                        } else {
                          updateAdminFabricMutate(updateData, {
                            onSuccess: (response) => {
                              console.log(
                                "✅ Unpublish Fabric Success:",
                                response,
                              );
                              setOpenDropdown(null);
                              if (currProd === "my") {
                                adManageFabricRefetch();
                              } else {
                                adRefetch();
                              }
                            },
                            onError: (error) => {
                              console.error(
                                "❌ Unpublish Fabric Error:",
                                error,
                              );
                            },
                          });
                        }
                      }}
                      className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-yellow-700 hover:bg-yellow-50 transition-colors duration-150 cursor-pointer"
                    >
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0"
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
                      {updateAdminIsPending ||
                      updateIsPending ||
                      updateAdminStyleIsPending
                        ? "Unpublishing..."
                        : `Unpublish ${
                            productType === "STYLE" ? "Style" : "Fabric"
                          }`}
                    </button>
                  ) : null}

                  <Link
                    state={{ info: row?.original || row }}
                    to={
                      isAdminRoute
                        ? isAdminStyleRoute
                          ? "/admin/style/view-product"
                          : "/admin/fabric/view-product"
                        : "/fabric/product/view-product"
                    }
                    className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-blue-700 hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => {
                      console.log("👁️ Viewing fabric product:", row);
                      setOpenDropdown(null);
                    }}
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0"
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
                    View {productType === "STYLE" ? "Style" : "Fabric"}
                  </Link>

                  <Link
                    state={{ info: row?.original || row }}
                    to={
                      isAdminRoute
                        ? isAdminStyleRoute
                          ? "/admin/style/edit-product"
                          : "/admin/fabric/edit-product"
                        : "/fabric/product/edit-product"
                    }
                    className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-indigo-700 hover:bg-indigo-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => {
                      console.log("✏️ Editing product:", row);
                      setOpenDropdown(null);
                    }}
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0"
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
                    Edit {productType === "STYLE" ? "Style" : "Fabric"}
                  </Link>

                  <button
                    onClick={() => {
                      console.log("🗑️ Removing fabric product:", row);
                      setNewCategory(row?.original || row);
                      setIsAddModalOpen(true);
                      setOpenDropdown(null);
                    }}
                    className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-700 hover:bg-red-50 border-t border-gray-100 transition-colors duration-150 cursor-pointer"
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0"
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
                    Remove {productType === "STYLE" ? "Style" : "Fabric"}
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-[10000] backdrop-blur-sm p-3 sm:p-4"
          onClick={() => {
            setIsAddModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl cursor-pointer"
              >
                ×
              </button>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 -mt-7 sm:-mt-7">
              {`Delete ${productType === "STYLE" ? "Style" : "Fabric"}`}
            </h3>
            <form
              className="mt-4 sm:mt-6 space-y-4"
              onSubmit={(e) => {
                if (!navigator.onLine) {
                  toastError(
                    "No internet connection. Please check your network.",
                  );
                  return;
                }
                e.preventDefault();
                if (isAdminRoute) {
                  const deleteData = { id: newCategory?.id };

                  if (isAdminStyleRoute) {
                    deleteAdminStyleMutate(deleteData, {
                      onSuccess: () => {
                        setIsAddModalOpen(false);
                        setNewCategory(null);
                        if (currProd === "all") {
                          adRefetch();
                        } else {
                          adManageStyleRefetch();
                        }
                      },
                    });
                  } else {
                    deleteAdminFabricMutate(deleteData, {
                      onSuccess: () => {
                        setIsAddModalOpen(false);
                        setNewCategory(null);
                        if (currProd === "all") {
                          adRefetch();
                        } else {
                          adManageFabricRefetch();
                        }
                      },
                    });
                  }
                } else {
                  deleteFabricMutate(
                    {
                      id: newCategory?.id,
                      businessId: vendorOrStyleBusinessDetails?.id,
                    },
                    {
                      onSuccess: () => {
                        setIsAddModalOpen(false);
                        setNewCategory(null);
                        refetch();
                      },
                    },
                  );
                }
              }}
            >
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">
                Are you sure you want to delete {newCategory?.name}
              </label>
              <div className="flex flex-col sm:flex-row w-full justify-end gap-2 sm:gap-4 mt-4 sm:mt-6">
                <button
                  type="button"
                  className="cursor-pointer w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-md transition-colors"
                  onClick={() => {
                    setIsAddModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    deleteIsPending ||
                    deleteAdminIsPending ||
                    deleteAdminStyleIsPending
                  }
                  className="cursor-pointer w-full sm:w-auto bg-gradient text-white px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-md transition-colors disabled:opacity-50"
                >
                  {deleteIsPending ||
                  deleteAdminIsPending ||
                  deleteAdminStyleIsPending
                    ? "Please wait..."
                    : `Delete ${productType === "STYLE" ? "Style" : "Fabric"}`}
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
