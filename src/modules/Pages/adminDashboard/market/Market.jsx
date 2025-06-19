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

const MarketsTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const dropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [newCategory, setNewCategory] = useState();

  const [type, setType] = useState("Add");

  const initialValues = {
    name: newCategory?.name ?? "",
    state: newCategory?.location ?? "",
    multimedia_url: newCategory?.multimedia_url ?? null,
  };

  const { isPending: createIsPending, createMarketMutate } = useCreateMarket();

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
    [data?.data]
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
                <button className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                  View Details
                </button>
                <button
                  onClick={() => {
                    setIsAddModalOpen(true);
                    handleDropdownToggle(null);
                    setNewCategory(row);
                    setType("Edit");
                  }}
                  className="block px-4 cursor-pointer py-2 text-gray-700 hover:bg-gray-100 w-full"
                >
                  Edit Market
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
    [openDropdown]
  );

  const [upload, setUpload] = useState(null);

  const { isPending: deleteIsPending, deleteMarketMutate } = useDeleteMarket();

  const { isPending: editIsPending, editMarketMutate } = useEditMarket();

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
      console.log(val);
      if (type == "Edit") {
        if (val.multimedia_url) {
          editMarketMutate(
            { ...val, id: newCategory?.id },
            {
              onSuccess: () => {
                setIsAddModalOpen(false);
                setNewCategory(null);
                setUpload(null);
                resetForm();
              },
            }
          );
        } else {
          const formData = new FormData();
          formData.append("image", upload);
          uploadImageMutate(formData, {
            onSuccess: (data) => {
              editMarketMutate(
                {
                  ...val,
                  multimedia_url: data?.data?.data?.url,
                  id: newCategory?.id,
                },
                {
                  onSuccess: () => {
                    setIsAddModalOpen(false);
                    setNewCategory(null);
                    setUpload(null);
                    resetForm();
                  },
                }
              );
            },
          });
        }
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
        const formData = new FormData();
        formData.append("image", upload);
        uploadImageMutate(formData, {
          onSuccess: (data) => {
            createMarketMutate(
              { ...val, multimedia_url: data?.data?.data?.url },
              {
                onSuccess: () => {
                  setIsAddModalOpen(false);
                  setNewCategory(null);
                  setUpload(null);
                  resetForm();
                },
              }
            );
          },
        });
      } else {
        deleteMarketMutate(
          { ...val, id: newCategory?.id },
          {
            onSuccess: () => {
              setIsAddModalOpen(false);
              setNewCategory(null);
              setUpload(null);
              resetForm();
            },
          }
        );
      }
    },
  });

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const actionText = `${type}  Marketplace`;

  const totalPages = Math.ceil(
    data?.count / (queryParams["pagination[limit]"] ?? 10)
  );

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
          <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Export As ▾
          </button>
          <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Sort: Newest First ▾
          </button>
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
          <ReusableTable columns={columns} data={MarketData} />
        </>
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
                      <p className="text-sm text-gray-500">
                        Upload Picture of Market
                      </p>
                      <input
                        type="file"
                        name="marketImage"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => {
                          if (e.target.files) {
                            setUpload(e.target.files[0]);
                            setFieldValue("multimedia_url", null);
                          }

                          e.target.value = "";
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Market Name
                    </label>
                    <input
                      type="text"
                      name={"name"}
                      required
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
