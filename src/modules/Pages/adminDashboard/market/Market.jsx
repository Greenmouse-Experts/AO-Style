import { useState, useRef, useEffect, useMemo } from "react";
import ReusableTable from "../components/ReusableTable";
import {
  FaEllipsisH,
  FaBars,
  FaTh,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import useQueryParams from "../../../../hooks/useQueryParams";
import useGetMarket from "../../../../hooks/market/useGetMarket";
import { formatDateStr } from "../../../../lib/helper";
import { useFormik } from "formik";
import useCreateMarket from "../../../../hooks/market/useCreateMarket";
import useDebounce from "../../../../hooks/useDebounce";
import useUpdatedEffect from "../../../../hooks/useUpdatedEffect";
import useUploadImage from "../../../../hooks/multimedia/useUploadImage";
import useDeleteMarket from "../../../../hooks/market/useDeleteMarket";
import useEditMarket from "../../../../hooks/market/useEditMarket";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import ConfirmationModal from "../../../../components/ui/ConfirmationModal";
import useDeleteUser from "../../../../hooks/user/useDeleteUser";
import useToast from "../../../../hooks/useToast";

const MarketsTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const dropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [newCategory, setNewCategory] = useState();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [type, setType] = useState("Add");

  const initialValues = {
    name: newCategory?.name ?? "",
    state: newCategory?.location ?? "",
    multimedia_url: newCategory?.multimedia_url ?? null,
  };

  const { isPending: createIsPending, createMarketMutate } = useCreateMarket();
  const { isPending: deleteUserIsPending, deleteUserMutate } = useDeleteUser();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { isPending: uploadIsPending, uploadImageMutate } = useUploadImage();

  const [activeTab, setActiveTab] = useState("table");

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
    "FCT",
  ];

  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { data, isPending } = useGetMarket({
    ...queryParams,
  });

  const fileInputRef = useRef(null);

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const {
    isPending: uploadFrontIsPending,
    uploadImageMutate: uploadFrontMutate,
  } = useUploadImage();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const MarketData = useMemo(
    () =>
      data?.data
        ? data?.data.map((details) => {
            return {
              ...details,
              name: `${details?.name}`,
              location: `${details?.state}`,
              dateAdded: `${
                details?.created_at
                  ? formatDateStr(details?.created_at.split(".").shift())
                  : ""
              }`,
            };
          })
        : [],
    [data?.data],
  );

  const columns = useMemo(
    () => [
      // { label: "S/N", key: "id" },
      { label: "Market Name", key: "name" },
      { label: "Market Location", key: "location" },
      // { label: "Total Fabrics", key: "totalFabrics" },
      { label: "Date Added", key: "dateAdded" },
      {
        label: "Action",
        key: "action",
        render: (_, row) => (
          <div className="relative">
            <button
              className="bg-gray-100 cursor-pointer text-gray-500 px-3 py-1 rounded-md"
              onClick={() => toggleDropdown(row.id)}
            >
              <FaEllipsisH />
            </button>
            {openDropdown === row.id && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10 shadow-lg">
                {/* <button className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                  View Details
                </button> */}
                <button
                  onClick={() => {
                    setIsAddModalOpen(true);
                    handleDropdownToggle(null);
                    setNewCategory(row);
                    setType("Edit");
                  }}
                  className="block px-4 cursor-pointer py-2 text-gray-700 hover:bg-gray-100 w-full"
                >
                  View/Edit Market
                </button>
                <button
                  onClick={() => {
                    setIsAddModalOpen(true);
                    handleDropdownToggle(null);
                    setNewCategory(row);
                    setType("Remove");
                  }}
                  className="block cursor-pointer  px-4 py-2 text-red-500 hover:bg-red-100 w-full"
                >
                  Remove Market
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown],
  );

  const [upload, setUpload] = useState(null);

  const { isPending: deleteIsPending, deleteMarketMutate } = useDeleteMarket();

  const { isPending: editIsPending, editMarketMutate } = useEditMarket();

  const { toastError } = useToast();

  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleChange,
    resetForm,
    setFieldValue,
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
      if (type == "Edit") {
        editMarketMutate(
          { ...val, id: newCategory?.id },
          {
            onSuccess: () => {
              setIsAddModalOpen(false);
              setNewCategory(null);
              setUpload(null);
              resetForm();
              setType("Add");
            },
          },
        );

        // If editing an existing style category
        // editProductMutate(
        //   { ...val, id: newStyleCategory.id },
        //   {
        //     onSuccess: () => {
        //       setIsAddModalOpen(false);
        //       setNewStyleCategory(null);
        //     },
        //   }
        // );
      } else if (type == "Add") {
        createMarketMutate(
          { ...val },
          {
            onSuccess: () => {
              setIsAddModalOpen(false);
              setNewCategory(null);
              setUpload(null);
              resetForm();
              setType("Add");
            },
          },
        );
      } else {
        deleteMarketMutate(
          { ...val, id: newCategory?.id },
          {
            onSuccess: () => {
              setIsAddModalOpen(false);
              setNewCategory(null);
              setUpload(null);
              resetForm();
              setType("Add");
            },
          },
        );
      }
    },
  });

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const actionText = `${type}  Marketplace`;

  const totalPages = Math.ceil(
    data?.count / (queryParams["pagination[limit]"] ?? 10),
  );

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Market Name", "Market Location", "Date Added"]],
      body: MarketData?.map((row) => [
        row.name,
        row.location,
        row.dateAdded,
        // row.location,
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
    doc.save("Market.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(MarketData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Market.xlsx");
  };

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <h2 className="text-lg font-semibold">Markets</h2>
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
            placeholder="Search market..."
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
            data={MarketData?.map((row) => ({
              "Market Name": row.name,
              "Market Location": row.location,
              "Date Added": row.dateAdded,
              // Location: row.location,
              // "Date Joined": row.dateJoined,
            }))}
            filename="Market.csv"
            className="hidden"
          />{" "}
          {/* <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Sort: Newest First ▾
          </button>*/}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient text-white px-6 py-3 text-sm rounded-md whitespace-nowrap cursor-pointer"
          >
            + Add a New Market
          </button>
        </div>
      </div>

      {activeTab === "table" ? (
        <>
          <ReusableTable
            loading={isPending}
            columns={columns}
            data={MarketData}
          />
        </>
      ) : isPending ? (
        <div className=" flex !w-full items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MarketData?.map((item) => (
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
                      className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      View Details
                    </button>
                    <button
                      className="block px-4 cursor-pointer py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setIsAddModalOpen(true);
                        handleDropdownToggle(null);
                        setNewCategory(item);
                        setType("Edit");
                      }}
                    >
                      Edit Market
                    </button>
                    <button
                      className="block px-4 cursor-pointer py-2 text-red-500 hover:bg-red-100 w-full text-left"
                      onClick={() => {
                        setIsAddModalOpen(true);
                        handleDropdownToggle(null);
                        setNewCategory(item);
                        setType("Remove");
                      }}
                    >
                      Remove Market
                    </button>
                  </div>
                )}
              </div>

              <div className="text-center mx-auto">
                <h3 className="text-[#1E293B] font-medium">{item.name}</h3>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <FaMapMarkerAlt className="text-[#9847FE]" size={14} />
                  <span className="text-gray-600 text-sm">{item.location}</span>
                </div>
                {/* <p className="text-gray-500 text-sm mt-1">
                  {item.totalFabrics}
                </p> */}
                <div className="flex items-center justify-center space-x-2 mt-1">
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

      {MarketData?.length > 0 && (
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

      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
          onClick={() => {
            setIsAddModalOpen(false);
            resetForm();
            setType("Add");
            setNewCategory(null);
            setUpload(null);
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
                  resetForm();
                  setType("Add");
                  setNewCategory(null);

                  setUpload(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-4 -mt-7">{actionText}</h3>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {type == "Remove" ? (
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Are you sure you want to delete {newCategory?.name}
                </label>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Market Image
                    </label>
                    <div
                      onClick={() =>
                        document.getElementById("multimedia_url").click()
                      }
                      className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg flex flex-col items-center"
                    >
                      <p className="cursor-pointer flex flex-col items-center space-y-2 text-gray-500">
                        <span>⬆️</span> <span> Upload Picture of Market</span>
                      </p>

                      <input
                        type="file"
                        name="multimedia_url"
                        onChange={(e) => {
                          if (e.target.files) {
                            if (e.target.files[0].size > 5 * 1024 * 1024) {
                              alert("File size exceeds 5MB limit");
                              return;
                            }
                            const file = e.target.files[0];
                            const formData = new FormData();
                            formData.append("image", file);
                            uploadFrontMutate(formData, {
                              onSuccess: (data) => {
                                setFieldValue(
                                  "multimedia_url",
                                  data?.data?.data?.url,
                                );
                              },
                            });
                            e.target.value = "";
                          }
                        }}
                        className="hidden"
                        id="multimedia_url"
                      />

                      {uploadFrontIsPending ? (
                        <p className="cursor-pointer text-gray-400">
                          please wait...{" "}
                        </p>
                      ) : values.multimedia_url ? (
                        <a
                          onClick={(e) => e.stopPropagation()}
                          href={values.multimedia_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                        >
                          View file upload
                        </a>
                      ) : (
                        <></>
                      )}
                    </div>

                    {/* <div
                      role="button"
                      onClick={handleButtonClick}
                      className="border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center"
                    >
                      {values?.multimedia_url ? (
                        <img
                          src={values?.multimedia_url}
                          alt="User"
                          className="w-8 h-8 rounded-full cursor-pointer"
                        />
                      ) : upload ? (
                        upload?.name
                      ) : (
                        <svg
                          className="w-8 h-8 text-gray-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      )}
                      {uploadFrontIsPending ? (
                        <>
                          {" "}
                          <p className="cursor-pointer text-gray-400">
                            please wait...{" "}
                          </p>
                        </>
                      ) : (
                        <></>
                      )}
                      <p className="text-sm text-gray-500">
                        Upload Picture of Market
                      </p>
                      <input
                        type="file"
                        name="doc_front"
                        onChange={(e) => {
                          if (e.target.files) {
                            if (e.target.files[0].size > 5 * 1024 * 1024) {
                              alert("File size exceeds 5MB limit");
                              return;
                            }
                            const file = e.target.files[0];
                            const formData = new FormData();
                            formData.append("image", file);
                            uploadFrontMutate(formData, {
                              onSuccess: (data) => {
                                setFieldValue(
                                  "multimedia_url",
                                  data?.data?.data?.url
                                );
                              },
                            });
                            e.target.value = "";
                          }
                        }}
                        className="hidden"
                        id="doc_back"
                      />
                    </div> */}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Market Name
                    </label>
                    <input
                      type="text"
                      name={"name"}
                      required
                      maxLength={40}
                      value={values.name}
                      onChange={handleChange}
                      className="mt-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-lg text-sm"
                      placeholder="Enter the market name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Market State
                    </label>
                    <select
                      name="state"
                      value={values.state}
                      onChange={handleChange}
                      className="mt-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-lg text-sm text-gray-500"
                    >
                      <option value="" disabled>
                        Choose the state the market is in
                      </option>
                      {nigerianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={
                  createIsPending ||
                  uploadIsPending ||
                  deleteIsPending ||
                  editIsPending
                }
                className="mt-6 cursor-pointer w-full bg-gradient text-white px-4 py-3 text-sm rounded-md"
              >
                {createIsPending ||
                uploadIsPending ||
                deleteIsPending ||
                editIsPending
                  ? "Please wait..."
                  : actionText}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketsTable;
