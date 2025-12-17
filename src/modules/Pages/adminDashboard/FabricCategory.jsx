import { useState, useRef, useEffect, useMemo } from "react";
// import ReusableTable from "./components/ReusableTable"; // Commented out as you are using CustomTable in the render
import {
  FaEllipsisH,
  FaBars,
  FaTh,
  FaCalendarAlt,
} from "react-icons/fa";
import useQueryParams from "../../../hooks/useQueryParams";
import useGetProducts from "../../../hooks/product/useGetProduct";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import { formatDateStr } from "../../../lib/helper";
import { useFormik } from "formik";
import useCreateProduct from "../../../hooks/product/useCreateProduct";
import useEditProduct from "../../../hooks/product/useEditProduct";
import useDeleteProduct from "../../../hooks/product/useDeleteProduct";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import useToast from "../../../hooks/useToast";
import CustomTable from "../../../components/CustomTable";
import PaginationButton from "../../../components/PaginationButton";

const FabricCategoryTable = () => {
  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState();

  const [type, setType] = useState("Add");

  const initialValues = {
    name: newCategory?.name ?? "",
  };

  const [activeTab, setActiveTab] = useState("table");

  const { isPending: createIsPending, createProductMutate } =
    useCreateProduct();

  const { isPending: editIsPending, editProductMutate } = useEditProduct();

  const { isPending: deleteIsPending, deleteProductMutate } =
    useDeleteProduct();

  const { toastError } = useToast();

  const {
    handleSubmit,
    values,
    handleChange,
    resetForm,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      if (type == "Edit") {
        editProductMutate(
          { ...val, id: newCategory?.id },
          {
            onSuccess: () => {
              setIsAddModalOpen(false);
              setNewCategory(null);
              resetForm();
              setType("Add");
            },
          },
        );
      } else if (type == "Add") {
        createProductMutate(
          { ...val, type: "fabric" },
          {
            onSuccess: () => {
              setIsAddModalOpen(false);
              setNewCategory(null);
              resetForm();
              setType("Add");
            },
          },
        );
      } else {
        deleteProductMutate(
          { ...val, id: newCategory?.id },
          {
            onSuccess: () => {
              setIsAddModalOpen(false);
              setNewCategory(null);
              resetForm();
              setType("Add");
            },
          },
        );
      }
    },
  });

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { data, isPending } = useGetProducts({
    ...queryParams,
    type: "fabric",
  });

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  const fabricData = useMemo(() => {
    if (!data?.data) return [];

    // Remove duplicates based on unique category ID
    const uniqueCategories = data.data.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );

    return uniqueCategories.map((details) => {
      return {
        ...details,
        name: `${details?.name}`,
        dateAdded: `${
          details?.created_at
            ? formatDateStr(details?.created_at.split(".").shift())
            : ""
        }`,
      };
    });
  }, [data?.data]);

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const columns = useMemo(
    () => [
      { label: "Category Name", key: "name" },
      { label: "Date Added", key: "dateAdded" },
    ],
    []
  );

  const actions = [
    {
      key: "view-details",
      label: "View Details",
      action: (item) => {
        setIsAddModalOpen(true);
        handleDropdownToggle(null);
        setNewCategory(item);
        setType("Edit");
      },
    },
    {
      key: "edit-fabric",
      label: "Edit Fabric",
      action: (item) => {
        setIsAddModalOpen(true);
        handleDropdownToggle(null);
        setNewCategory(item);
        setType("Edit"); 
      },
    },
    {
      key: "remove-fabric",
      label: "Remove Fabric",
      action: (item) => {
        setIsAddModalOpen(true);
        handleDropdownToggle(null);
        setNewCategory(item);
        setType("Remove");
      },
    },
  ];

  // --- PAGINATION CALCULATIONS ---
  // Ensure these are numbers to prevent string concatenation errors
  const limit = Number(queryParams["pagination[limit]"] ?? 10);
  const currentPage = Number(queryParams["pagination[page]"] ?? 1);
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Calculate range for "Showing X-Y of Z"
  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endEntry = Math.min(currentPage * limit, totalCount);

  const actionText = `${type} Fabric Category`;

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Category Name", "Date Added"]],
      body: fabricData?.map((row) => [
        row.name,
        row.dateAdded,
      ]),
      headStyles: {
        fillColor: [209, 213, 219],
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
        fontSize: 10,
      },
    });
    doc.save("Fabricategory.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(fabricData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Fabricategory.xlsx");
  };

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <h2 className="text-lg font-semibold">Fabric Categories</h2>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-2 border border-gray-200 rounded-md p-1">
            <button
              className={`p-2 rounded ${
                activeTab === "table" ? "text-[#9847FE]" : "text-gray-600"
              }`}
              onClick={() => {
                setActiveTab("table");
                setType("Add");
              }}
            >
              <FaBars size={16} />
            </button>
            <button
              className={`p-2 rounded ${
                activeTab === "grid" ? "text-[#9847FE]" : "text-gray-600"
              }`}
              onClick={() => {
                setActiveTab("grid");
                setType("Add");
              }}
            >
              <FaTh size={16} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search fabrics categories..."
            value={queryString}
            onChange={(evt) =>
              setQueryString(evt.target.value ? evt.target.value : undefined)
            }
            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
          />
          <select
            onChange={handleExport}
            className="bg-gray-100 outline-none text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
            defaultValue=""
          >
            <option value="" disabled>
              Export As
            </option>
            <option value="csv">Export to CSV</option>{" "}
            <option value="excel">Export to Excel</option>{" "}
            <option value="pdf">Export to PDF</option>{" "}
          </select>
          <CSVLink
            id="csvDownload"
            data={fabricData?.map((row) => ({
              "Market Name": row.name,
              "Date Added": row.dateAdded,
            }))}
            filename="Fabricategory.csv"
            className="hidden"
          />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient cursor-pointer text-white px-4 py-2 text-sm rounded-md"
          >
            + Add a Fabric Category
          </button>
        </div>
      </div>

      {activeTab === "table" ? (
        <div key="fabric-table">
          <CustomTable data={fabricData} columns={columns} actions={actions} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fabricData?.map((item) => (
            <div
              key={item.id}
              className="relative bg-white rounded-lg p-4 border border-gray-100 flex justify-between"
            >
              <div className="absolute top-3 right-3">
                <button
                  className="bg-gray-100 cursor-pointer text-gray-500 px-2 py-1 rounded-md"
                  onClick={() => handleDropdownToggle(item.id)}
                >
                  <FaEllipsisH size={14} />
                </button>

                {openDropdown === item.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-md z-10 border border-gray-200 shadow-lg">
                    <button
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        // Assuming View details just opens edit modal or specific logic
                        setIsAddModalOpen(true);
                        handleDropdownToggle(null);
                        setNewCategory(item);
                        setType("Edit");
                      }}
                    >
                      View Details
                    </button>
                    <button
                      className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setIsAddModalOpen(true);
                        handleDropdownToggle(null);
                        setNewCategory(item);
                        setType("Edit");
                      }}
                    >
                      Edit Fabric
                    </button>
                    <button
                      className="block cursor-pointer px-4 py-2 text-red-500 hover:bg-red-100 w-full text-left"
                      onClick={() => {
                        setIsAddModalOpen(true);
                        handleDropdownToggle(null);
                        setNewCategory(item);
                        setType("Remove");
                      }}
                    >
                      Remove Fabric
                    </button>
                  </div>
                )}
              </div>

              <div className="text-center mx-auto">
                <h3 className="text-[#1E293B] font-medium mb-2">{item.name}</h3>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <FaCalendarAlt className="text-[#9847FE]" size={14} />
                  <span className="text-gray-600 text-sm">
                    {item.dateAdded}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- REVISED PAGINATION SECTION --- */}
      {/* Logic: Only render if we have data AND more than 1 page is required */}
      {totalCount > 0 && totalPages > 1 && (
        <div className="flex flex-wrap justify-between items-center mt-6 gap-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-4">
            {/* Limit Selector */}
            <div className="flex items-center">
              <p className="text-sm text-gray-600">Items per page:</p>
              <select
                value={limit}
                onChange={(e) =>
                  updateQueryParams({
                    "pagination[limit]": Number(e.target.value),
                    "pagination[page]": 1, // Reset to page 1 on limit change
                  })
                }
                className="py-1 px-2 border border-gray-200 ml-2 rounded-md outline-none text-sm w-auto bg-white cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* Range Display */}
            <p className="text-sm text-gray-500 hidden sm:block">
              Showing <span className="font-medium text-gray-700">{startEntry}</span> to{" "}
              <span className="font-medium text-gray-700">{endEntry}</span> of{" "}
              <span className="font-medium text-gray-700">{totalCount}</span> entries
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-2 items-center">
             <span className="text-sm text-gray-600 mr-2 sm:hidden">
                 {currentPage} / {totalPages}
            </span>
            <PaginationButton
              onClick={() => {
                updateQueryParams({
                  "pagination[page]": currentPage - 1,
                });
              }}
              disabled={currentPage === 1}
            >
             ◀ Previous
            </PaginationButton>
            
            <PaginationButton
              onClick={() => {
                updateQueryParams({
                  "pagination[page]": currentPage + 1,
                });
              }}
              disabled={currentPage >= totalPages}
            >
              Next ▶
            </PaginationButton>
          </div>
        </div>
      )}

      {/* Add Fabric Category Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/20"
          onClick={() => {
            setIsAddModalOpen(false);
            resetForm();
            setNewCategory(null);
            setType("Add");
          }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {actionText}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                  setNewCategory(null);
                  setType("Add");
                }}
                className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {type == "Remove" ? (
                <div className="text-center py-4">
                    <p className="block text-gray-700 mb-4 text-lg">
                    Are you sure you want to delete <span className="font-semibold">{newCategory?.name}</span>?
                    </p>
                    <p className="text-sm text-red-500">This action cannot be undone.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      name={"name"}
                      required
                      maxLength={40}
                      value={values.name}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 outline-none rounded-lg focus:border-purple-500 transition-colors"
                      placeholder="Enter the category name"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8 space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                    setNewCategory(null);
                    setType("Add");
                  }}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-3 rounded-md text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createIsPending || editIsPending || deleteIsPending}
                  className={`w-full text-white px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      type === "Remove" ? "bg-red-500 hover:bg-red-600" : "bg-gradient cursor-pointer"
                  }`}
                >
                  {createIsPending || editIsPending || deleteIsPending
                    ? "Please wait..."
                    : type === "Remove" ? "Delete Category" : actionText}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricCategoryTable;