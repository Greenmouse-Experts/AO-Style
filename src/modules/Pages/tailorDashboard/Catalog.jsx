import { useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import useGetBusinessDetails from "../../../hooks/settings/useGetBusinessDetails";
import useQueryParams from "../../../hooks/useQueryParams";
import useGetFabricProduct from "../../../hooks/fabric/useGetFabric";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import { formatDateStr, formatNumberWithCommas } from "../../../lib/helper";
import useUpdateStyle from "../../../hooks/style/useUpdateStyle";
import Loader from "../../../components/ui/Loader";
import useDeleteStyle from "../../../hooks/style/useDeleteFabric";
import useGetAdminFabricProduct from "../../../hooks/fabric/useGetAdminFabricProduct";
import useUpdateAdminStyle from "../../../hooks/style/useUpdateAdminStyle";
import useDeleteAdminStyle from "../../../hooks/style/useDeleteAdminStyle";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import useToast from "../../../hooks/useToast";

export default function StylesTable() {
  const [newCategory, setNewCategory] = useState();

  const [currProd, setCurrProd] = useState("all");

  const isAdminStyleRoute = location.pathname === "/admin/styles-products";

  const [filter, setFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: businessDetails } = useGetBusinessDetails();

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[page]": 1,
    "pagination[limit]": 10,
  });

  const { data: getAllStylesData, isPending } = useGetFabricProduct({
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

  const { isPending: updateIsPending, updateStyleMutate } = useUpdateStyle();

  const { isPending: updateAdminIsPending, updateAdminStyleMutate } =
    useUpdateAdminStyle();

  const { isPending: deleteIsPending, deleteStyleMutate } = useDeleteStyle();

  const { isPending: deleteAdminIsPending, deleteAdminStyleMutate } =
    useDeleteAdminStyle();

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  const { toastError } = useToast();

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const updatedData = isAdminStyleRoute
    ? getAllAdminStylesData
    : getAllStylesData;

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
    const worksheet = XLSX.utils.json_to_sheet(updatedData?.data);
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
      body: updatedData?.data?.map((row) => [
        row.name,
        row.phone,
        row.email,
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
    doc.save("StylesCatalog.pdf");
  };

  const dataRes = currProd == "all" ? updatedData?.data : [];

  return (
    <>
      <div className="bg-white px-4 sm:px-6 py-4 mb-6 relative">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-medium">All Styles</h1>

          {!isAdminStyleRoute ? (
            <Link
              to={
                isAdminStyleRoute
                  ? "/admin/style/add-product"
                  : "/tailor/catalog-add-style"
              }
              className="w-full sm:w-auto"
            >
              <button className="bg-gradient text-white px-6 sm:px-8 py-3 sm:py-3 cursor-pointer rounded-md hover:bg-purple-600 transition w-full sm:w-auto">
                + Add Styles
              </button>
            </Link>
          ) : currProd === "all" ? (
            <></>
          ) : (
            <Link
              to={
                isAdminStyleRoute
                  ? "/admin/style/add-product"
                  : "/tailor/catalog-add-style"
              }
              className="w-full sm:w-auto"
            >
              <button className="bg-gradient text-white px-6 sm:px-8 py-3 sm:py-3 cursor-pointer rounded-md hover:bg-purple-600 transition w-full sm:w-auto">
                + Add Styles
              </button>
            </Link>
          )}
        </div>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          <Link to="/tailor" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt;{currProd === "all" ? "All Styles" : "My Styles"}
        </p>

        {isAdminStyleRoute ? (
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
                {tab == "all" ? "All" : tab} Styles
              </button>
            ))}{" "}
          </div>
        ) : (
          <></>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg">
        {/* Filters & Search Bar - Responsive */}
        <div className="flex flex-col md:flex-row justify-between md:items-center pb-3 mb-4 space-y-3 md:space-y-0">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 text-sm font-medium">
            <button
              onClick={() => {
                setOpenDropdown(null);

                setFilter("all");
                updateQueryParams({
                  ...queryParams,
                  status: undefined,
                });
              }}
              className={`px-3 py-1 rounded-md ${
                filter === "all"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              All Styles
            </button>
            <button
              onClick={() => {
                setOpenDropdown(null);
                setFilter("published");
                updateQueryParams({
                  ...queryParams,
                  status: "PUBLISHED",
                });
              }}
              className={`px-3 py-1 rounded-md ${
                filter === "published"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              Published
            </button>

            <button
              onClick={() => {
                setOpenDropdown(null);
                setFilter("unpublished");
                updateQueryParams({
                  ...queryParams,
                  status: "DRAFT",
                });
              }}
              className={`px-3 py-1 rounded-md ${
                filter === "unpublished"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              Unpublished
            </button>
          </div>

          {/* Search & Actions */}
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full md:w-auto">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                className="w-full md:w-52 pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none"
                value={queryString}
                onChange={(evt) =>
                  setQueryString(
                    evt.target.value ? evt.target.value : undefined
                  )
                }
              />
            </div>
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
              data={
                updatedData?.data
                  ? updatedData?.data?.map((row) => ({
                      Style: row.name,
                      Price: row.phone,
                      Status: row.status,
                    }))
                  : []
              }
              filename="StylesCatalog.csv"
              className="hidden"
            />{" "}
            <button className="px-4 py-2 bg-gray-200 rounded-md text-sm">
              Sort: Newest ▼
            </button>
          </div>
        </div>

        {/* Table - Responsive */}
        {(isAdminStyleRoute ? adminProductIsPending : isPending) ? (
          <>
            {" "}
            <div className=" flex !w-full items-center justify-center">
              <Loader />
            </div>
          </>
        ) : (
          <>
            {" "}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 text-sm">
                    <th className="py-3">Style</th>
                    <th className="hidden md:table-cell">Price</th>
                    {/* <th className="hidden md:table-cell">Sold</th> */}
                    <th>Status</th>
                    <th className="hidden md:table-cell">Rating</th>
                    <th className="hidden md:table-cell">Income</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {dataRes?.map((style) => (
                    <tr
                      key={style.id}
                      className="border-b border-gray-200 text-sm"
                    >
                      <td className="flex items-center space-x-3 py-4">
                        {style?.style?.photos[0] ? (
                          <img
                            src={style?.style?.photos[0]}
                            alt={style.name}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-md">
                            {style.name}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm md:text-base">
                            {style.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {style?.category?.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Uploaded on{" "}
                            {style?.created_at
                              ? formatDateStr(
                                  style?.created_at?.split(".").shift(),
                                  "DD-MM-YY"
                                )
                              : ""}
                          </p>
                        </div>
                      </td>
                      <td className="hidden md:table-cell">
                        {" "}
                        {formatNumberWithCommas(style.price ?? 0)}
                      </td>
                      {/* <td className="hidden md:table-cell">{style.sold}</td> */}
                      <td>
                        <span
                          className={`px-3 py-1 text-xs md:text-sm rounded-md ${
                            style.status === "PUBLISHED"
                              ? "bg-green-100 text-green-600"
                              : style.status === "DRAFT"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {style.status}
                        </span>
                      </td>
                      <td className="hidden md:table-cell">{style.rating}</td>
                      <td className="hidden md:table-cell">{style.income}</td>
                      <td className="relative">
                        <button
                          className="cursor-pointer"
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === style.id ? null : style.id
                            )
                          }
                        >
                          <MoreVertical className="text-gray-500" />
                        </button>
                        {openDropdown === style.id && (
                          <div className="absolute cursor-pointer right-0 mt-2 bg-white shadow-md rounded-md py-2 w-32 z-50">
                            {!isAdminStyleRoute || isAdminStyleRoute ? (
                              <Link
                                to={
                                  isAdminStyleRoute
                                    ? "/admin/style/edit-product"
                                    : "/tailor/catalog-edit-style"
                                }
                                state={{ info: style }}
                                className="block  cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                              >
                                {isAdminStyleRoute ? "View" : "Edit"}
                              </Link>
                            ) : currProd == "all" ? (
                              <></>
                            ) : (
                              <Link
                                to={
                                  isAdminStyleRoute
                                    ? "/admin/style/edit-product"
                                    : "/tailor/catalog-edit-style"
                                }
                                state={{ info: style }}
                                className="block  cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                              >
                                Edit
                              </Link>
                            )}

                            {style?.status === "DRAFT" ? (
                              <button
                                onClick={() => {
                                  if (isAdminStyleRoute) {
                                    updateAdminStyleMutate(
                                      {
                                        id: style?.id,
                                        product: {
                                          name: style?.name,
                                          sku: style?.sku,
                                          category_id: style?.category_id,
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
                                    updateStyleMutate(
                                      {
                                        id: style?.id,
                                        business_id: businessDetails?.data?.id,
                                        product: {
                                          name: style?.name,
                                          sku: style?.sku,
                                          category_id: style?.category_id,
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
                                className="block w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-100"
                              >
                                {updateIsPending || updateAdminIsPending
                                  ? "Please wait..."
                                  : "Publish Style"}
                              </button>
                            ) : null}

                            {style?.status === "PUBLISHED" ? (
                              <button
                                onClick={() => {
                                  if (isAdminStyleRoute) {
                                    updateAdminStyleMutate(
                                      {
                                        id: style?.id,
                                        product: {
                                          name: style?.name,
                                          sku: style?.sku,
                                          category_id: style?.category_id,
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
                                    updateStyleMutate(
                                      {
                                        id: style?.id,
                                        business_id: businessDetails?.data?.id,
                                        product: {
                                          name: style?.name,
                                          sku: style?.sku,
                                          category_id: style?.category_id,
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
                                className="block w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-100"
                              >
                                {updateIsPending || updateAdminIsPending
                                  ? "Please wait..."
                                  : "Draft Style"}
                              </button>
                            ) : null}

                            <button
                              onClick={() => {
                                setNewCategory(style);
                                setIsAddModalOpen(true);
                                setOpenDropdown(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm cursor-pointer text-red-500 hover:bg-red-100"
                            >
                              Delete
                            </button>
                            {/* <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                          View Details
                        </button> */}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {updatedData?.data?.length ? (
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
                        "pagination[page]":
                          +queryParams["pagination[page]"] - 1,
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
                        "pagination[page]":
                          +queryParams["pagination[page]"] + 1,
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
            ) : (
              <>
                {" "}
                <p className="flex-1 text-center text-sm md:text-sm">
                  No style found.
                </p>
              </>
            )}
          </>
        )}
      </div>

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
                className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-4 -mt-7">
              {"Delete Style"}
            </h3>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                if (!navigator.onLine) {
                  toastError(
                    "No internet connection. Please check your network."
                  );
                  return;
                }
                e.preventDefault();
                if (isAdminStyleRoute) {
                  deleteAdminStyleMutate(
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
                  deleteStyleMutate(
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
                    : "Delete Style"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
