import { useState, useMemo } from "react";
import ReusableTable from "../components/ReusableTable";
import {
  FaEllipsisH,
  FaBars,
  FaTh,
  FaCalendarAlt,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import useQueryParams from "../../../../hooks/useQueryParams";
import useGetAllUsersByRole from "../../../../hooks/admin/useGetAllUserByRole";
import useDebounce from "../../../../hooks/useDebounce";
import useUpdatedEffect from "../../../../hooks/useUpdatedEffect";
import { formatDateStr } from "../../../../lib/helper";
import Loader from "../../../../components/ui/Loader";
import ConfirmationModal from "../../../../components/ui/ConfirmationModal";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import useApproveMarketRep from "../../../../hooks/marketRep/useApproveMarketRep";
import useDeleteUser from "../../../../hooks/user/useDeleteUser";
import useToast from "../../../../hooks/useToast";
import CustomTable from "../../../../components/CustomTable";
import AddNewCustomer from "../components/AddCustomerModal";
import AddNewCustomerModal from "../components/AddCustomerModal";
import CustomTabs from "../../../../components/CustomTabs";

const CustomersTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("table");
  const [reason, setReason] = useState("");

  // Date filter states
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilters, setDateFilters] = useState({
    day: "",
    month: "",
    year: "",
    dateRange: {
      from: "",
      to: "",
    },
  });
  const [activeFilters, setActiveFilters] = useState([]);

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const [currTab, setCurrTab] = useState("All");

  const { queryParams, updateQueryParams } = useQueryParams({
    status: "",
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const {
    data: getAllCustomerRepData,
    isFetching,
    isPending,
  } = useGetAllUsersByRole({
    ...queryParams,
    role: "user",
    approved: (() => {
      switch (currTab) {
        case "All":
          return undefined;
        case "Pending":
          return false;
        case "Approved":
          return true;
        default:
          return undefined;
      }
    })(),
  });

  const [queryString, setQueryString] = useState(queryParams.q);
  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  // Generate years for dropdown (last 10 years)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, []);

  const monthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Function to check if a date matches the filter criteria
  const matchesDateFilter = (dateString) => {
    if (!dateString) return true;

    const date = new Date(dateString);
    const { day, month, year, dateRange } = dateFilters;

    // Check date range filter
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // Include the entire end date

      if (date < fromDate || date > toDate) {
        return false;
      }
    }

    // Check specific day filter
    if (day && date.getDate().toString().padStart(2, "0") !== day) {
      return false;
    }

    // Check month filter
    if (month && (date.getMonth() + 1).toString().padStart(2, "0") !== month) {
      return false;
    }

    // Check year filter
    if (year && date.getFullYear().toString() !== year) {
      return false;
    }

    return true;
  };

  const CustomerData = useMemo(() => {
    if (!getAllCustomerRepData?.data) return [];

    // Remove duplicates based on unique customer ID
    let uniqueCustomers = getAllCustomerRepData.data.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );

    // Transform data
    uniqueCustomers = uniqueCustomers.map((details) => {
      return {
        ...details,
        name: `${details?.name}`,
        phone: `${details?.phone ?? ""}`,
        email: `${details?.email ?? ""}`,
        location: `${details?.profile?.address ?? ""}`,
        dateJoined: `${
          details?.created_at
            ? formatDateStr(details?.created_at.split(".").shift())
            : ""
        }`,
        rawDate: details?.created_at,
      };
    });

    // Apply date filters
    return uniqueCustomers.filter((customer) =>
      matchesDateFilter(customer.rawDate),
    );
  }, [getAllCustomerRepData?.data, dateFilters, matchesDateFilter]);

  // Apply date filter
  const applyDateFilter = () => {
    const newActiveFilters = [];

    if (dateFilters.dateRange.from && dateFilters.dateRange.to) {
      newActiveFilters.push({
        type: "dateRange",
        label: `${dateFilters.dateRange.from} to ${dateFilters.dateRange.to}`,
        value: dateFilters.dateRange,
      });
    }

    if (dateFilters.day) {
      newActiveFilters.push({
        type: "day",
        label: `Day: ${dateFilters.day}`,
        value: dateFilters.day,
      });
    }

    if (dateFilters.month) {
      const monthLabel = monthOptions.find(
        (m) => m.value === dateFilters.month,
      )?.label;
      newActiveFilters.push({
        type: "month",
        label: `Month: ${monthLabel}`,
        value: dateFilters.month,
      });
    }

    if (dateFilters.year) {
      newActiveFilters.push({
        type: "year",
        label: `Year: ${dateFilters.year}`,
        value: dateFilters.year,
      });
    }

    setActiveFilters(newActiveFilters);
    setShowDateFilter(false);
  };

  // Clear specific filter
  const removeFilter = (filterType) => {
    const updatedFilters = { ...dateFilters };
    const updatedActiveFilters = activeFilters.filter(
      (filter) => filter.type !== filterType,
    );

    if (filterType === "dateRange") {
      updatedFilters.dateRange = { from: "", to: "" };
    } else {
      updatedFilters[filterType] = "";
    }

    setDateFilters(updatedFilters);
    setActiveFilters(updatedActiveFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setDateFilters({
      day: "",
      month: "",
      year: "",
      dateRange: { from: "", to: "" },
    });
    setActiveFilters([]);
  };

  const columns = useMemo(
    () => [
      {
        label: "Profile",
        key: "profile",
        render: (_, row) => {
          const profilePic = row.profile?.profile_picture;
          const initial = row.name?.charAt(0).toUpperCase() || "?";

          return profilePic ? (
            <img
              src={profilePic}
              alt="profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white">
              {initial}
            </div>
          );
        },
      },
      { label: "Name", key: "name" },
      { label: "Phone Number", key: "phone" },
      { label: "Email Address", key: "email" },
      {
        label: "Location",
        key: "location",
        render: (_, row) => {
          return <span className="max-w-md line-clamp-1">{row.location}</span>;
        },
      },
      { label: "Date Joined", key: "dateJoined" },
    ],
    [],
  );

  const totalPages = Math.ceil(
    getAllCustomerRepData?.count / (queryParams["pagination[limit]"] ?? 10),
  );

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(CustomerData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Customers.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ["Name", "Phone Number", "Email Address", "Location", "Date Joined"],
      ],
      body: CustomerData?.map((row) => [
        row.name,
        row.phone,
        row.email,
        row.location,
        row.dateJoined,
      ]),
      headStyles: {
        fillColor: [209, 213, 219],
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
        fontSize: 10,
      },
    });
    doc.save("Customers.pdf");
  };

  const { isPending: approoveIsPending, approveMarketRepMutate } =
    useApproveMarketRep();

  const { isPending: deleteIsPending, deleteUserMutate } = useDeleteUser();

  const [newCategory, setNewCategory] = useState();
  const { toastError } = useToast();

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
    setOpenDropdown(null);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutate(userToDelete.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        },
        onError: () => {
          // Error is handled in the hook
        },
      });
    }
  };

  const row_actions = [
    {
      key: "view_detail",
      label: "View Details",
      action: async (item) => {
        return navigate(`/admin/view-customers/${item.id}`);
      },
    },
    {
      key: "delete_customer",
      label: "Delete Customer",
      action: async (item) => {
        handleDeleteUser(item);
      },
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <h2 className="text-lg font-semibold">Customers</h2>
          {CustomerData?.length > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {CustomerData.length} customers
            </span>
          )}
        </div>
        <CustomTabs defaultValue={currTab} onChange={setCurrTab} />
        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end items-center">
          <div className="flex items-center space-x-2 border border-gray-200 rounded-md p-1">
            <button
              className={`p-2 rounded ${
                activeTab === "table" ? "text-[#9847FE]" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("table")}
            >
              <FaBars size={16} />
            </button>
            <button
              className={`p-2 rounded ${
                activeTab === "grid" ? "text-[#9847FE]" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("grid")}
            >
              <FaTh size={16} />
            </button>
          </div>

          {/* Date Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-lg transition-all duration-200 cursor-pointer font-medium ${
                activeFilters.length > 0
                  ? "bg-gradient-to-r from-[#9847FE] to-[#B347FE] text-white border-transparent shadow-lg shadow-purple-200 hover:shadow-purple-300"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#9847FE] hover:bg-purple-50 hover:text-[#9847FE]"
              }`}
            >
              <FaCalendarAlt size={14} />
              Date Filter
              {activeFilters.length > 0 && (
                <span className="bg-white text-[#9847FE] text-xs px-2 py-1 rounded-full font-semibold min-w-[20px] flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Date Filter Dropdown */}
            {showDateFilter && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDateFilter(false)}
                />

                {/* Dropdown Panel */}
                <div
                  className="fixed left-0 top-0 w-full h-full flex items-start justify-center z-50"
                  style={{ pointerEvents: "none" }}
                >
                  <div
                    className="mt-24 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200"
                    style={{
                      pointerEvents: "auto",
                      maxWidth: "95vw",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#9847FE] to-[#B347FE] p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-white" size={16} />
                          <h3 className="font-semibold text-white">
                            Filter by Date
                          </h3>
                        </div>
                        <button
                          onClick={() => setShowDateFilter(false)}
                          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="p-5 space-y-5">
                      {/* Quick Filter Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const today = new Date();
                            const lastMonth = new Date(
                              today.getFullYear(),
                              today.getMonth() - 1,
                              today.getDate(),
                            );
                            setDateFilters({
                              ...dateFilters,
                              dateRange: {
                                from: lastMonth.toISOString().split("T")[0],
                                to: today.toISOString().split("T")[0],
                              },
                            });
                          }}
                          className="px-3 py-2 text-xs bg-purple-50 text-[#9847FE] rounded-lg hover:bg-purple-100 transition-colors cursor-pointer border border-purple-200"
                        >
                          Last 30 Days
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            const currentYear = today.getFullYear();
                            setDateFilters({
                              ...dateFilters,
                              year: currentYear.toString(),
                              month: "",
                              day: "",
                              dateRange: { from: "", to: "" },
                            });
                          }}
                          className="px-3 py-2 text-xs bg-purple-50 text-[#9847FE] rounded-lg hover:bg-purple-100 transition-colors cursor-pointer border border-purple-200"
                        >
                          This Year
                        </button>
                      </div>

                      {/* Date Range Filter */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#9847FE] rounded-full"></span>
                          Date Range
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                          <div className="flex-1 min-w-0">
                            <label className="block text-xs text-gray-600 mb-1">
                              From
                            </label>
                            <input
                              type="date"
                              value={dateFilters.dateRange.from}
                              onChange={(e) =>
                                setDateFilters({
                                  ...dateFilters,
                                  dateRange: {
                                    ...dateFilters.dateRange,
                                    from: e.target.value,
                                  },
                                })
                              }
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9847FE] focus:border-transparent cursor-pointer"
                            />
                          </div>
                          <div className="flex items-center justify-center sm:pt-6">
                            <span className="text-gray-400 font-medium">→</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="block text-xs text-gray-600 mb-1">
                              To
                            </label>
                            <input
                              type="date"
                              value={dateFilters.dateRange.to}
                              onChange={(e) =>
                                setDateFilters({
                                  ...dateFilters,
                                  dateRange: {
                                    ...dateFilters.dateRange,
                                    to: e.target.value,
                                  },
                                })
                              }
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9847FE] focus:border-transparent cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="flex items-center">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="px-3 text-xs text-gray-500 font-medium">
                          OR FILTER BY
                        </span>
                        <div className="flex-1 border-t border-gray-200"></div>
                      </div>

                      {/* Specific Filters Grid */}
                      <div className="grid grid-cols-3 gap-4">
                        {/* Year Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Year
                          </label>
                          <select
                            value={dateFilters.year}
                            onChange={(e) =>
                              setDateFilters({
                                ...dateFilters,
                                year: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9847FE] focus:border-transparent cursor-pointer bg-white"
                          >
                            <option value="">All</option>
                            {yearOptions.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Month Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Month
                          </label>
                          <select
                            value={dateFilters.month}
                            onChange={(e) =>
                              setDateFilters({
                                ...dateFilters,
                                month: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9847FE] focus:border-transparent cursor-pointer bg-white"
                          >
                            <option value="">All</option>
                            {monthOptions.map((month) => (
                              <option key={month.value} value={month.value}>
                                {month.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Day Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Day
                          </label>
                          <select
                            value={dateFilters.day}
                            onChange={(e) =>
                              setDateFilters({
                                ...dateFilters,
                                day: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9847FE] focus:border-transparent cursor-pointer bg-white"
                          >
                            <option value="">All</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <option
                                  key={day}
                                  value={day.toString().padStart(2, "0")}
                                >
                                  {day}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 px-5 py-4 flex gap-3 border-t border-gray-100">
                      <button
                        onClick={applyDateFilter}
                        className="flex-1 bg-gradient-to-r from-[#9847FE] to-[#B347FE] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-200 transition-all duration-200 cursor-pointer"
                      >
                        Apply Filters
                      </button>
                      <button
                        onClick={clearAllFilters}
                        className="px-4 py-2.5 text-gray-600 text-sm font-medium hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer border border-gray-200"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <input
            type="text"
            placeholder="Search customers..."
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
            <option value="csv">Export to CSV</option>
            <option value="excel">Export to Excel</option>
            <option value="pdf">Export to PDF</option>
          </select>

          <CSVLink
            id="csvDownload"
            data={CustomerData?.map((row) => ({
              Name: row.name,
              "Phone Number": row.phone,
              "Email Address": row.email,
              Location: row.location,
              "Date Joined": row.dateJoined,
            }))}
            filename="Customers.csv"
            className="hidden"
          />

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#9847FE] text-white px-4 py-2 text-sm rounded-md"
          >
            + Invite New Customer
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-[#9847FE] bg-opacity-10 text-[#9847FE] px-3 py-1 rounded-full text-sm"
              >
                {filter.label}
                <button
                  onClick={() => removeFilter(filter.type)}
                  className="ml-1 hover:text-red-500"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-red-500 underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      <AddNewCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {activeTab === "table" ? (
        <>
          {isFetching ? (
            <div className="p-2">loading</div>
          ) : (
            <CustomTable
              columns={columns}
              data={CustomerData}
              actions={row_actions}
            />
          )}
        </>
      ) : isPending ? (
        <div className=" flex !w-full items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {CustomerData?.map((item) => (
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
                  <div className="absolute dropdown-menu right-0 mt-2 w-32 bg-white rounded-md z-10 border border-gray-200">
                    <Link
                      to={`/admin/view-customers/${item.id}`}
                      className="block px-4 py-2 cursor-pointer text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      View Details
                    </Link>
                    <button
                      className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full text-left"
                      onClick={() => handleDeleteUser(item)}
                    >
                      Delete User
                    </button>
                  </div>
                )}
              </div>
              <div className="text-center mx-auto">
                {item.profile?.profile_picture ? (
                  <img
                    src={item.profile?.profile_picture ?? null}
                    alt={item.name}
                    className="mx-auto w-16 h-16 rounded-full mb-2"
                  />
                ) : (
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center text-xl font-medium text-white">
                    {item?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <h3 className="text-dark-blue font-medium mb-1 mt-2">
                  {item.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{item.email}</p>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <span className="text-gray-600 text-sm">
                    Location: {item.location}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <span className="text-purple-600 text-sm">
                    Phone: {item.phone}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <span className="text-gray-600 text-sm">
                    Date Joined: {item.dateJoined}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {CustomerData?.length > 0 && (
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

      {suspendModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
          onClick={() => {
            setSuspendModalOpen(false);
            setReason("");
          }}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSuspendModalOpen(false);
                  setReason("");
                  setNewCategory(null);
                }}
                className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-4 -mt-7">
              {newCategory?.profile?.approved_by_admin
                ? "Suspend User"
                : "Unsuspend User"}
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
                approveMarketRepMutate(
                  {
                    user_id: newCategory?.id,
                    suspension_reason: reason,
                    approved: newCategory?.profile?.approved_by_admin
                      ? false
                      : true,
                  },
                  {
                    onSuccess: () => {
                      setSuspendModalOpen(false);
                      setNewCategory(null);
                      setReason("");
                    },
                  },
                );
              }}
            >
              <div>
                <label className="block text-black mb-2">
                  Reasons for{" "}
                  {!newCategory?.profile?.approved_by_admin
                    ? "unsuspending"
                    : "suspending"}
                </label>
                <textarea
                  placeholder="Reasons"
                  className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg resize-none"
                  name="reason"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                disabled={approoveIsPending}
                className="w-full bg-gradient cursor-pointer text-white py-4 rounded-lg font-normal"
                type="submit"
              >
                {approoveIsPending
                  ? "Please wait..."
                  : newCategory?.profile?.approved_by_admin
                    ? "Suspend"
                    : "Unsuspend"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone and will permanently remove the user from the system.`}
        confirmText="Delete User"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteIsPending}
      />
    </div>
  );
};

export default CustomersTable;
