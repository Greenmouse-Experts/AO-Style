import { useState, useRef, useEffect, useMemo } from "react";
import {
  FaEllipsisH,
  FaBars,
  FaTh,
  FaLayerGroup,
  FaCalendarAlt,
} from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { useFormik } from "formik";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import ReusableTable from "./adminDashboard/components/ReusableTable";
import useQueryParams from "../../hooks/useQueryParams";
import useGetProducts from "../../hooks/product/useGetProduct";
import { formatDateStr } from "../../lib/helper";
import useDebounce from "../../hooks/useDebounce";
import useCreateProduct from "../../hooks/product/useCreateProduct";
import useEditProduct from "../../hooks/product/useEditProduct";
import useDeleteProduct from "../../hooks/product/useDeleteProduct";
import useUpdatedEffect from "../../hooks/useUpdatedEffect";
import Select from "react-select";
import useCreateCoupon from "../../hooks/coupon/useCreateCoupon";
import useGetBusinessDetails from "../../hooks/settings/useGetBusinessDetails";
import useGetCoupon from "../../hooks/coupon/useGetCoupon";
import useToast from "../../hooks/useToast";
import useDeleteCoupon from "../../hooks/coupon/useDeleteCoupon";
import useEditCoupon from "../../hooks/coupon/useEditCoupon";
import { useLocation } from "react-router-dom";
import useGetAllCoupon from "../../hooks/coupon/useGetAllAdminCoupon";

const Coupons = () => {
  const location = useLocation();

  const currUrl = location.pathname;
  console.log(currUrl);
  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState();

  const [type, setType] = useState("Add");

  const initialValues = {
    code: newCategory?.code ?? "",
    type: newCategory?.type ?? "",
    value: newCategory?.value ?? "",
    start_date: newCategory?.start_date ?? "",
    end_date: newCategory?.end_date ?? "",
    usage_limit: newCategory?.usage_limit ?? "",
    user_limit: newCategory?.user_limit ?? "",
    min_purchase: newCategory?.min_purchase ?? "",
  };

  const { data: businessDetails } = useGetBusinessDetails();

  const [activeTab, setActiveTab] = useState("table");

  const { isPending: createIsPending, createCouponMutate } = useCreateCoupon();

  const { isPending: editIsPending, editCouponMutate } = useEditCoupon();

  const { isPending: deleteIsPending, deleteCouponMutate } = useDeleteCoupon();

  const { toastError } = useToast();

  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleChange,
    setFieldValue,
    resetForm,
    // setFieldError,
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

      if (type == "Remove") {
        return deleteCouponMutate(
          { ...val, id: newCategory?.id },
          {
            onSuccess: () => {
              setIsAddModalOpen(false);
              setNewCategory(null);
              setType("Add");
              resetForm();
            },
          }
        );
      }

      if (type == "Edit") {
        return editCouponMutate(
          {
            ...val,
            value: +val?.value,
            id: newCategory?.id,
            business_id: businessDetails?.data?.id,
          },
          {
            onSuccess: () => {
              setIsAddModalOpen(false);
              setNewCategory(null);
              resetForm();
              setType("Add");
            },
          }
        );
      }

      createCouponMutate(
        { ...val, business_id: businessDetails?.data?.id },
        {
          onSuccess: () => {
            setIsAddModalOpen(false);
            setNewCategory(null);
            resetForm();
            setType("Add");
          },
        }
      );
    },
  });

  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { data, isPending, error, isError } = useGetCoupon({
    ...queryParams,
    business_id: businessDetails?.data?.id,
  });

  const { data: allData, isPending: allIsPending } = useGetAllCoupon({
    ...queryParams,
    business_id: businessDetails?.data?.id,
  });

  useEffect(() => {
    if (error?.data?.message) {
      toastError(error?.data?.message);
    }
  }, [error?.data?.message]);

  const [queryString, setQueryString] = useState(queryParams.q);

  const couponData = currUrl == "/admin/coupon" ? allData : data;

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  const fabricData = useMemo(
    () =>
      couponData?.data
        ? couponData?.data?.map((details) => {
            return {
              ...details,
              code: `${details?.code}`,
              type: `${details?.type}`,
              value: `${details?.value}`,
              dateAdded: `${
                details?.created_at
                  ? formatDateStr(details?.created_at.split(".").shift())
                  : ""
              }`,
            };
          })
        : [],
    [data?.data]
  );

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
      //   { label: "S/N", key: "id" },
      { label: "Code", key: "code" },
      //   { label: "Total Fabrics", key: "totalFabrics" },
      { label: "Type", key: "type" },
      { label: "Value", key: "value" },
      //   { label: "Usage Limit", key: "usage_limit" },
      //   { label: "Usage Limit", key: "usage_limit" },

      {
        label: "Action",
        key: "action",
        render: (_, row) => (
          <div className="relative inline-block ">
            <button
              className="bg-gray-100 cursor-pointer text-gray-500 px-3 py-1 rounded-md"
              onClick={() => toggleDropdown(row.id)}
            >
              <FaEllipsisH />
            </button>

            {openDropdown === row.id && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-md z-50 shadow-lg">
                <button
                  onClick={() => {
                    setIsAddModalOpen(true);
                    handleDropdownToggle(null);
                    setNewCategory(row);
                    setType("Edit");
                  }}
                  className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                >
                  View/Edit Coupon
                </button>
                <button
                  onClick={() => {
                    setIsAddModalOpen(true);
                    handleDropdownToggle(null);
                    setNewCategory(row);
                    setType("Remove");
                  }}
                  className="block cursor-pointer px-4 py-2 text-red-500 hover:bg-red-100 w-full"
                >
                  Delete Coupon
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown]
  );

  const totalPages = Math.ceil(
    data?.count / (queryParams["pagination[limit]"] ?? 10)
  );

  const actionText = `${type} Coupon`;

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Code", "Type", "Value"]],
      body: fabricData?.map((row) => [
        row.code,
        row.type,
        row.value,
        // row.dateJoined,
      ]),
      headStyles: {
        fillColor: [209, 213, 219],
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
        fontSize: 10,
      },
    });
    doc.save("Coupons.pdf");
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
    saveAs(blob, "Coupons.xlsx");
  };

  return (
    <div className="bg-white p-6 z-0 rounded-xl overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <h2 className="text-lg font-semibold">Coupons</h2>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
          {/* <div className="flex items-center space-x-2 border border-gray-200 rounded-md p-1">
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
          </div> */}
          <input
            type="text"
            placeholder="Search coupon..."
            value={queryString}
            onChange={(evt) =>
              setQueryString(evt.target.value ? evt.target.value : undefined)
            }
            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
          />
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
            data={fabricData?.map((row) => ({
              Code: row.code,
              Type: row.type,
              value: row.value,
              // "Date Joined": row.dateJoined,
            }))}
            filename="Coupons.csv"
            className="hidden"
          />{" "}
          <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Sort: Newest First ▾
          </button>
          {!isError && !isPending ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient cursor-pointer text-white px-4 py-2 text-sm rounded-md"
            >
              + Add Coupons
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>

      {activeTab === "table" ? (
        <>
          <ReusableTable
            loading={isPending}
            columns={columns}
            data={fabricData}
          />

          {!fabricData?.length && !isPending ? (
            <p className="flex-1 text-center text-sm md:text-sm">
              No coupon found.
            </p>
          ) : (
            <></>
          )}
        </>
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
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-md z-10 border border-gray-200">
                    <button
                      to={`.`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
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
                {/* <div className="flex items-center justify-center space-x-2 mt-2">
                  <FaLayerGroup className="text-[#9847FE]" size={14} />
                  <span className="text-gray-600 text-sm">
                    {item.totalFabrics}
                  </span>
                </div> */}
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

      {fabricData?.length > 0 && (
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

      {/* Add Fabric Category Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
          onClick={() => {
            setIsAddModalOpen(false);
            resetForm();
            setNewCategory(null);

            setType("Add");
          }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-lg"
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
                className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto px-1">
              {" "}
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {type == "Remove" ? (
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Are you sure you want to delete {newCategory?.code}
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Code
                      </label>
                      <input
                        type="text"
                        name={"code"}
                        required
                        value={values.code}
                        onChange={handleChange}
                        className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                        placeholder="Enter the coupon"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Type
                      </label>
                      <Select
                        options={[
                          { label: "Flat", value: "FLAT" },
                          { label: "Percentage", value: "PERCENTAGE" },
                        ]}
                        name="type"
                        value={[
                          { label: "Flat", value: "FLAT" },
                          { label: "Percentage", value: "PERCENTAGE" },
                        ]?.find((opt) => opt.value === values.type)}
                        onChange={(selectedOption) => {
                          console.log(selectedOption.value);
                          setFieldValue("type", selectedOption.value);
                        }}
                        isSearchable={false}
                        required
                        placeholder="Select"
                        className="w-full p-[8px] text-gray-500 border border-[#CCCCCC] outline-none rounded-lg"
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            border: "none",
                            boxShadow: "none",
                            outline: "none",
                            backgroundColor: "#fff",
                            "&:hover": {
                              border: "none",
                            },
                          }),
                          indicatorSeparator: () => ({
                            display: "none",
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />{" "}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Value
                      </label>
                      <input
                        max={values?.type === "PERCENTAGE" ? 100 : undefined}
                        type="number"
                        name={"value"}
                        required
                        value={values.value}
                        onChange={handleChange}
                        className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                        placeholder="Enter the value"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Start Date
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        name="start_date"
                        required
                        value={values.start_date?.split(" ")[0]}
                        onChange={handleChange}
                        className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        End Date
                      </label>
                      <input
                        type="date"
                        min={values.start_date?.split(" ")[0]}
                        name="end_date"
                        required
                        value={values.end_date?.split(" ")[0]}
                        onChange={handleChange}
                        className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Usage Limit
                      </label>
                      <input
                        type="number"
                        name={"usage_limit"}
                        required
                        value={values.usage_limit}
                        onChange={handleChange}
                        className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                        placeholder="Enter usage limit"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        User Limit
                      </label>
                      <input
                        type="number"
                        name={"user_limit"}
                        required
                        value={values.user_limit}
                        onChange={handleChange}
                        className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                        placeholder="Enter user limit"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Minimum Purchase
                      </label>
                      <input
                        type="number"
                        name={"min_purchase"}
                        required
                        value={values.min_purchase}
                        onChange={handleChange}
                        className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                        placeholder="Enter min purchase"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-6 space-x-4">
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetForm();
                      setNewCategory(null);

                      setType("Add");
                    }}
                    className="w-full bg-purple-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createIsPending || editIsPending || deleteIsPending
                    }
                    className="w-full cursor-pointer bg-gradient text-white px-4 py-4 rounded-md text-sm font-medium"
                  >
                    {createIsPending || editIsPending || deleteIsPending
                      ? "Please wait..."
                      : actionText}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
