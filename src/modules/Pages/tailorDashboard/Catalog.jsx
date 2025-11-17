import React, { useState, useMemo, useCallback } from "react";
import ReusableTable from "../adminDashboard/components/ReusableTable";
import { Search, Plus, Eye, Edit3, Trash2 } from "lucide-react";
import { FaEllipsisH } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import useGetBusinessDetails from "../../../hooks/settings/useGetBusinessDetails";
import useQueryParams from "../../../hooks/useQueryParams";
import useGetFabricProduct from "../../../hooks/fabric/useGetFabric";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import { formatDateStr, formatNumberWithCommas } from "../../../lib/helper";
import useDeleteStyle from "../../../hooks/style/useDeleteFabric";
import useGetAdminFabricProduct from "../../../hooks/fabric/useGetAdminFabricProduct";
import useDeleteAdminStyle from "../../../hooks/style/useDeleteAdminStyle";
import useUpdateAdminStyle from "../../../hooks/style/useUpdateAdminStyle";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import { toast } from "react-toastify";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";

export default function StylesTable() {
  const location = useLocation();
  const isAdminStyleRoute = location.pathname === "/admin/styles-products";

  const [filter, setFilter] = useState("all");
  const [currProd, setCurrProd] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState();

  const { data: businessDetails } = useGetBusinessDetails();

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[page]": 1,
    "pagination[limit]": 10,
  });

  const {
    data: getAllStylesData,
    isPending,
    refetch,
  } = useGetFabricProduct({
    type: "STYLE",
    id: businessDetails?.data?.id,
    ...queryParams,
  });

  const { data: getAllAdminStylesData, isPending: adminProductIsPending } =
    useGetAdminFabricProduct({
      type: "STYLE",
      id: businessDetails?.data?.id,
      ...queryParams,
    });

  const { isPending: deleteIsPending, deleteStyleMutate } = useDeleteStyle();
  const { isPending: deleteAdminIsPending, deleteAdminStyleMutate } =
    useDeleteAdminStyle();
  const { isPending: updateAdminIsPending, updateAdminStyleMutate } =
    useUpdateAdminStyle();

  const [queryString, setQueryString] = useState(queryParams.q);
  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

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

  useUpdatedEffect(() => {
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const updatedData = isAdminStyleRoute
    ? getAllAdminStylesData
    : getAllStylesData;
  const totalPages = Math.ceil(
    updatedData?.count / (queryParams["pagination[limit]"] ?? 10),
  );
  console.log("hsi is the updated data", updatedData);
  const dataRes =
    currProd === "all"
      ? updatedData?.data
      : updatedData?.data?.filter(
          (item) => item.creator_id === businessDetails?.data?.user_id,
        );

  const filteredData = useMemo(() => {
    if (!dataRes) return [];
    return dataRes.map((style) => ({
      ...style,
      image: style?.style?.photos?.[0] || null,
      category: style?.category?.name || "Uncategorized",
      price: `₦${formatNumberWithCommas(style.price ?? 0)}`,
      created_date: style?.created_at
        ? formatDateStr(style?.created_at?.split(".").shift(), "DD-MM-YY")
        : "N/A",
    }));
  }, [dataRes]);

  const columns = useMemo(
    () => [
      {
        label: "SKU",
        key: "sku",
        width: "140px",
        render: (sku) => (
          <div className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border whitespace-nowrap">
            {sku || "N/A"}
          </div>
        ),
      },
      {
        label: "Style",
        key: "name",
        width: "300px",
        render: (name, row) => (
          <div className="flex items-center gap-3 min-w-[300px]">
            <div className="relative">
              {row.image ? (
                <img
                  src={row.image}
                  alt={name}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center border-2 border-purple-200">
                  <span className="text-xs font-bold text-purple-600">
                    {name?.charAt(0)?.toUpperCase() || "S"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="font-semibold text-gray-900 text-sm truncate"
                title={name}
              >
                {name || "Unnamed Style"}
              </div>
              <div className="text-xs text-gray-500 mt-1">{row.category}</div>
              <div className="text-xs text-gray-400 mt-1">
                Uploaded on {row.created_date}
              </div>
            </div>
          </div>
        ),
      },
      {
        label: "Price",
        key: "price",
        width: "120px",
        render: (price) => (
          <div className="text-right min-w-[120px]">
            <div className="text-lg font-bold text-purple-700 whitespace-nowrap">
              {price}
            </div>
            <div className="text-xs text-gray-500">per piece</div>
          </div>
        ),
      },

      {
        label: "Admin Status",
        key: "admin-status",
        width: "200px",
        render: (_, row) => (
          <div className="flex flex-col items-center min-w-[200px] gap-1">
            {/* Product Status */}
            <span
              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border-2 whitespace-nowrap ${
                row.approval_status === "PUBLISHED"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : row.approval_status === "DRAFT"
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : row.approval_status === "ARCHIVED"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
              title="Product Status"
            >
              {row.approval_status}
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
    [toggleDropdown],
  );

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "StylesCatalog.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Style Name", "Price", "Status"]],
      body: filteredData?.map((row) => [row.name, row.price, row.status]),
      headStyles: {
        fillColor: [147, 51, 234],
        textColor: [255, 255, 255],
        halign: "center",
        valign: "middle",
        fontSize: 10,
      },
    });
    doc.save("StylesCatalog.pdf");
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Style Catalog
                </h1>
                <p className="text-gray-600 mt-1">
                  <Link
                    to={isAdminStyleRoute ? "/admin" : "/tailor"}
                    className="text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    Dashboard
                  </Link>{" "}
                  / {currProd === "all" ? "All Styles" : "My Styles"}
                </p>
              </div>

              {(!isAdminStyleRoute || currProd !== "all") && (
                <Link
                  to={
                    isAdminStyleRoute
                      ? "/admin/style/add-product"
                      : "/tailor/catalog-add-style"
                  }
                  className="w-full sm:w-auto"
                >
                  <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 w-full sm:w-auto justify-center">
                    <Plus className="w-4 h-4" />
                    Add Style
                  </button>
                </Link>
              )}
            </div>

            {/* Tab Navigation for Admin */}
            {isAdminStyleRoute && (
              <div className="flex gap-6 mt-6 border-b border-gray-200">
                {["all", "my"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCurrProd(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      currProd === tab
                        ? "border-purple-600 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab === "all" ? "All" : "My"} Styles
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Filters & Controls */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Filter Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  {[
                    { key: "all", label: "All Styles", status: undefined },
                    {
                      key: "published",
                      label: "Published",
                      status: "PUBLISHED",
                    },
                    {
                      key: "unpublished",
                      label: "Unpublished",
                      status: "DRAFT",
                    },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setFilter(tab.key);
                        updateQueryParams({
                          ...queryParams,
                          status: tab.status,
                          "pagination[page]": 1,
                        });
                      }}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        filter === tab.key
                          ? "bg-white text-purple-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search & Export */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search styles..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full sm:w-64"
                      value={queryString || ""}
                      onChange={(evt) =>
                        setQueryString(evt.target.value || undefined)
                      }
                    />
                  </div>
                  <select
                    onChange={handleExport}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
                    data={
                      filteredData?.map((row) => ({
                        Style: row.name,
                        Price: row.price,
                        Status: row.status,
                        Category: row.category,
                        Created: row.created_date,
                      })) || []
                    }
                    filename="StylesCatalog.csv"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <ReusableTable
                columns={columns}
                loading={isAdminStyleRoute ? adminProductIsPending : isPending}
                data={filteredData}
              />
            </div>

            {/* Pagination */}
            {filteredData?.length > 0 && (
              <div className="flex justify-between items-center mt-6 px-6 pb-6">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">Items per page:</p>
                  <select
                    value={queryParams["pagination[limit]"] || 10}
                    onChange={(e) =>
                      updateQueryParams({
                        "pagination[limit]": +e.target.value,
                        "pagination[page]": 1,
                      })
                    }
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateQueryParams({
                        "pagination[page]":
                          +(queryParams["pagination[page]"] || 1) - 1,
                      })
                    }
                    disabled={(queryParams["pagination[page]"] ?? 1) <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Page {queryParams["pagination[page]"] || 1} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      updateQueryParams({
                        "pagination[page]":
                          +(queryParams["pagination[page]"] || 1) + 1,
                      })
                    }
                    disabled={
                      (queryParams["pagination[page]"] ?? 1) >= totalPages
                    }
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredData?.length === 0 &&
              !isPending &&
              !adminProductIsPending && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No styles found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filter === "published"
                      ? "No published styles available"
                      : filter === "unpublished"
                        ? "No unpublished styles found"
                        : "Create your first style to get started"}
                  </p>
                  {(!isAdminStyleRoute || currProd !== "all") && (
                    <Link
                      to={
                        isAdminStyleRoute
                          ? "/admin/style/add-product"
                          : "/tailor/catalog-add-style"
                      }
                    >
                      <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mx-auto">
                        <Plus className="w-4 h-4" />
                        Add Style
                      </button>
                    </Link>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Actions Dropdown Overlay */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        >
          <div
            className="absolute bg-white shadow-lg rounded-lg border border-gray-200 py-2 w-48 z-50"
            style={{
              left: `${dropdownPosition.x}px`,
              top: `${dropdownPosition.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const row = filteredData.find((item) => item.id === openDropdown);
              if (!row) return null;

              return (
                <>
                  {/* View/Edit Action */}
                  <Link
                    to={
                      isAdminStyleRoute
                        ? "/admin/style/edit-product"
                        : "/tailor/catalog-edit-style"
                    }
                    state={{ info: row }}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors text-gray-700"
                    onClick={() => setOpenDropdown(null)}
                  >
                    {isAdminStyleRoute ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                    {isAdminStyleRoute ? "View" : "View/Edit"}
                  </Link>

                  {/* Admin-specific actions */}
                  {isAdminStyleRoute && (
                    <>
                      <button
                        onClick={() => {
                          const newStatus =
                            row.approval_status === "PUBLISHED"
                              ? "DRAFT"
                              : "PUBLISHED";

                          updateAdminStyleMutate(
                            {
                              id: row.id,
                              product: {
                                status: newStatus,
                                approval_status: newStatus,
                              },
                              style: {},
                            },
                            {
                              onSuccess: () => {
                                setOpenDropdown(null);
                                refetch();
                              },
                              onError: (error) => {
                                console.error("Status update failed:", error);
                              },
                            },
                          );
                        }}
                        disabled={updateAdminIsPending}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors w-full text-left text-gray-700 disabled:opacity-50"
                      >
                        <Eye className="w-4 h-4" />
                        {updateAdminIsPending
                          ? "Updating..."
                          : row.approval_status === "PUBLISHED"
                            ? "Unpublish"
                            : "Publish"}
                      </button>

                      {currProd === "my" && (
                        <Link
                          to="/admin/style/edit-product"
                          state={{ info: row }}
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors text-gray-700"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </Link>
                      )}
                    </>
                  )}

                  {/* Delete Action */}
                  <button
                    onClick={() => {
                      setNewCategory(row);
                      setIsAddModalOpen(true);
                      setOpenDropdown(null);
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-red-50 transition-colors w-full text-left text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Style
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{newCategory?.name}"? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewCategory(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (isAdminStyleRoute) {
                    deleteAdminStyleMutate(newCategory?.id, {
                      onSuccess: () => {
                        setIsAddModalOpen(false);
                        setNewCategory(null);
                        refetch();
                      },
                    });
                  } else {
                    deleteStyleMutate(
                      {
                        id: newCategory?.id,
                        business_id: businessDetails?.data?.id,
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
                disabled={deleteIsPending || deleteAdminIsPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteIsPending || deleteAdminIsPending
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
