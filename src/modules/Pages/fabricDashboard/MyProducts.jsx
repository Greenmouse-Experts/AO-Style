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

import { formatDateStr } from "../../../lib/helper";
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

const ProductPage = () => {
  const { data: businessDetails } = useGetBusinessDetails();
  const location = useLocation();

  const isAdminFabricRoute = location.pathname === "/admin/fabrics-products";

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[page]": 1,
    "pagination[limit]": 10,
  });

  const { data: getAllFabricData, isPending } = useGetFabricProduct({
    type: "FABRIC",
    id: businessDetails?.data?.id,
    ...queryParams,
  });

  const { data: getAllAdminFabricData, isPending: adminProductIsPending } =
    useGetAdminFabricProduct({
      type: "FABRIC",
      id: businessDetails?.data?.id,
      ...queryParams,
    });

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const [filter, setFilter] = useState("all");

  const [currProd, setCurrProd] = useState("all");

  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const { isPending: updateIsPending, updateFabricMutate } = useUpdateFabric();

  const { isPending: updateAdminIsPending, updateAdminFabricMutate } =
    useUpdateAdminFabric();

  const updatedData = isAdminFabricRoute
    ? getAllAdminFabricData
    : getAllFabricData;

  const FabricData = useMemo(
    () =>
      updatedData?.data
        ? updatedData?.data?.map((details) => {
            return {
              ...details,
              category_id: `${details?.category?.id ?? ""}`,
              name: `${details?.name ?? ""}`,
              category: `${details?.category?.name ?? ""}`,
              qty: `${details?.fabric?.quantity ?? ""}`,

              created_at: `${
                details?.created_at
                  ? formatDateStr(details?.created_at.split(".").shift())
                  : ""
              }`,
            };
          })
        : [],
    [updatedData]
  );

  const { isPending: deleteIsPending, deleteFabricMutate } = useDeleteFabric();

  const { isPending: deleteAdminIsPending, deleteAdminFabricMutate } =
    useDeleteAdminFabric();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const columns = useMemo(
    () => [
      { label: "SKU", key: "sku" },
      { label: "Product Name", key: "name" },
      {
        label: "Image",
        key: "image",
        render: (image, row) => (
          <div>
            {row?.fabric?.photos[0] ? (
              <img
                src={row?.fabric?.photos[0]}
                alt="product"
                className="w-10 h-10 rounded"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-gray-300 flex items-center justify-center font-medium text-white">
                {row?.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
        ),
      },
      { label: "Category", key: "category" },
      { label: "Price", key: "price" },
      { label: "Qty", key: "qty" },
      {
        label: "Status",
        key: "status",
        render: (status) => (
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              status === "PUBLISHED"
                ? "bg-green-100 text-green-700"
                : status === "Cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
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
          <div className="relative" ref={dropdownRef}>
            <button
              className="text-gray-500 px-3 py-1 cursor-pointer rounded-md"
              onClick={() => toggleDropdown(row.id)}
            >
              <FaEllipsisH />
            </button>
            {openDropdown === row.id && (
              <div className="absolute cursor-pointer right-0 mt-2 w-40 bg-white rounded-md z-10">
                {row?.status === "DRAFT" ? (
                  <button
                    onClick={() => {
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
                            onSuccess: () => {
                              setOpenDropdown(null);
                            },
                          }
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
                            },
                          },
                          {
                            onSuccess: () => {
                              setOpenDropdown(null);
                            },
                          }
                        );
                      }
                    }}
                    className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                  >
                    {updateIsPending || updateAdminIsPending
                      ? "Please wait"
                      : "Publish Product"}
                  </button>
                ) : null}
                {row?.status === "PUBLISHED" ? (
                  <button
                    onClick={() => {
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
                            onSuccess: () => {
                              setOpenDropdown(null);
                            },
                          }
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
                            },
                          },
                          {
                            onSuccess: () => {
                              setOpenDropdown(null);
                            },
                          }
                        );
                      }
                    }}
                    className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                  >
                    {updateIsPending || updateAdminIsPending
                      ? "Please wait"
                      : "Draft Product"}
                  </button>
                ) : null}
                {currProd == "all" ? (
                  <></>
                ) : (
                  <Link
                    state={{ info: row }}
                    to={
                      isAdminFabricRoute
                        ? "/admin/fabric/edit-product"
                        : "/fabric/product/edit-product"
                    }
                    className="block cursor-pointer text-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                  >
                    {"Edit Product"}
                  </Link>
                )}

                <button
                  onClick={() => {
                    setNewCategory(row);
                    setIsAddModalOpen(true);
                    setOpenDropdown(null);
                  }}
                  className="block cursor-pointer px-4 py-2 text-red-500 hover:bg-red-100 w-full"
                >
                  Remove Product
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown, toggleDropdown]
  );

  const [newCategory, setNewCategory] = useState();

  const totalPages = Math.ceil(
    updatedData?.count / (queryParams["pagination[limit]"] ?? 10)
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

  console.log(currProd);

  return (
    <>
      <div className="bg-white px-4 sm:px-6 py-4 mb-6 relative">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-medium">
            {" "}
            {currProd == "all" ? "All" : "My"} Products
          </h1>
          <Link
            to={
              isAdminFabricRoute
                ? "/admin/fabric/add-product"
                : "/fabric/product/add-product"
            }
            className="w-full sm:w-auto"
          >
            {currProd === "all" ? (
              <></>
            ) : (
              <button className="bg-gradient text-white px-6 sm:px-8 py-3 sm:py-3 cursor-pointer rounded-md hover:bg-purple-600 transition w-full sm:w-auto">
                + Add New Product
              </button>
            )}
          </Link>
        </div>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          <Link to="/sales" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; {currProd === "all" ? "All Products" : "My Products"}
        </p>
        <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
          {["all", "my"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setCurrProd(tab);
              }}
              className={`font-medium cursor-pointer capitalize px-3 py-1 ${
                currProd === tab
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              {tab == "all" ? "All" : tab} Products
            </button>
          ))}{" "}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
          {/* Product Filters */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
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
                  if (tab === "unpublished") {
                    updateQueryParams({
                      ...queryParams,
                      status: "DRAFT",
                    });
                  }
                }}
                className={`font-medium cursor-pointer capitalize px-3 py-1 ${
                  filter === tab
                    ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                    : "text-gray-500"
                }`}
              >
                {tab} Products
              </button>
            ))}
          </div>
          {/* Search Bar */}
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                value={queryString}
                onChange={(evt) =>
                  setQueryString(
                    evt.target.value ? evt.target.value : undefined
                  )
                }
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none w-full sm:w-64"
              />
            </div>
            {/* <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
              Export As ▾
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
              data={FabricData?.map((row) => ({
                SKU: row.sku,
                "Product Name": row.name,
                Category: row.category,
                qty: row.location,
                Status: row.status,
              }))}
              filename="MyProducts.csv"
              className="hidden"
            />{" "}
            <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
              Sort: Newest First ▾
            </button>
          </div>
        </div>
        {/* Table Section */}
        <ReusableTable
          columns={columns}
          loading={isAdminFabricRoute ? adminProductIsPending : isPending}
          data={currProd == "all" ? FabricData : []}
        />
        {!FabricData?.length &&
        !(isAdminFabricRoute ? adminProductIsPending : isPending) ? (
          <p className="flex-1 text-center text-sm md:text-sm">
            No product found.
          </p>
        ) : (
          <></>
        )}
      </div>
      {FabricData?.length ? (
        <div className="flex  justify-between items-center mt-4">
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
      ) : (
        <></>
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
                    }
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
                    }
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
