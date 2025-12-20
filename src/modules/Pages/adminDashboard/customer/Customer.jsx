import { useState, useMemo, useEffect } from "react";
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
import useDebounce from "../../../../hooks/useDebounce";
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
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import DateFilter from "../../../../components/shared/DateFilter";
import ActiveFilters from "../../../../components/shared/ActiveFilters";
import useDateFilter from "../../../../hooks/useDateFilter";
import ViewDetailsModal from "../components/Viewdetailsmodal";
import PaginationButton from "../../../../components/PaginationButton";

const CustomersTable = () => {
  const [currView, setCurrView] = useState("registered");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("table");
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedItemForView, setSelectedItemForView] = useState(null);
  const [reason, setReason] = useState("");

  // Date filter functionality
  const {
    activeFilters,
    matchesDateFilter,
    handleFiltersChange,
    removeFilter,
    clearAllFilters: clearDateFilters,
  } = useDateFilter();

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const { queryParams, updateQueryParams } = useQueryParams({
    registered: true,
    "pagination[page]": 1,
    "pagination[limit]": 10,
  });

  // Fetch business data for invites
  const { data: businessData } = useQuery({
    queryKey: ["get-business-data-customer"],
    queryFn: async () => {
      const url = `/onboard/fetch-businesses?q=user`;
      const response = await CaryBinApi.get(url);
      return response.data;
    },
  });

  const [queryString, setQueryString] = useState(queryParams.q);
  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  // Query for registered customers (uses the registeredUsers endpoint with search)
  const { data: registeredUsers, isPending } = useQuery({
    queryKey: [queryParams, "customers", debouncedSearchTerm],
    queryFn: async () => {
      const response = await CaryBinApi.get("/auth/users/user", {
        params: {
          ...queryParams,
          q: debouncedSearchTerm,
        },
      });
      // Return full response object with count for pagination
      return {
        data: response.data.data,
        count: response.data.count,
      };
    },
  });

  // Query for pending customers (uses contact/invites endpoint with status=pending)
  const { data: getPendingInviteData, isPending: pendingInviteIsPending } =
    useQuery({
      queryKey: [
        "get-pending-customer-invites",
        businessData?.data?.[0]?.id,
        queryParams["pagination[page]"],
        queryParams["pagination[limit]"],
      ],
      queryFn: async () => {
        const page = queryParams["pagination[page]"] ?? 1;
        const limit = queryParams["pagination[limit]"] ?? 10;
        const url = `/contact/invites/${businessData?.data?.[0]?.id}?status=pending&role=user&pagination[page]=${page}&pagination[limit]=${limit}`;
        const response = await CaryBinApi.get(url);
        return response.data;
      },
      enabled: !!businessData?.data?.[0]?.id && currView === "pending",
    });

  // Query for rejected customers (uses contact/invites endpoint with status=expired)
  const { data: getRejectedInviteData, isPending: rejectedInviteIsPending } =
    useQuery({
      queryKey: [
        "get-rejected-customer-invites",
        businessData?.data?.[0]?.id,
        queryParams["pagination[page]"],
        queryParams["pagination[limit]"],
      ],
      queryFn: async () => {
        const page = queryParams["pagination[page]"] ?? 1;
        const limit = queryParams["pagination[limit]"] ?? 10;
        const url = `/contact/invites/${businessData?.data?.[0]?.id}?status=expired&role=user&pagination[page]=${page}&pagination[limit]=${limit}`;
        const response = await CaryBinApi.get(url);
        return response.data;
      },
      enabled: !!businessData?.data?.[0]?.id && currView === "rejected",
    });

  // Query for all invites (uses contact/invites endpoint with no status param)
  const { data: getAllInviteData, isPending: allInviteIsPending } = useQuery({
    queryKey: [
      "get-all-customer-invites",
      businessData?.data?.[0]?.id,
      queryParams["pagination[page]"],
      queryParams["pagination[limit]"],
    ],
    queryFn: async () => {
      const page = queryParams["pagination[page]"] ?? 1;
      const limit = queryParams["pagination[limit]"] ?? 10;
      const url = `/contact/invites/${businessData?.data?.[0]?.id}?role=user&pagination[page]=${page}&pagination[limit]=${limit}`;
      const response = await CaryBinApi.get(url);
      return response.data;
    },
    enabled: !!businessData?.data?.[0]?.id && currView === "invites",
  });

  // Determine which data to use based on currView
  const currentData = useMemo(() => {
    switch (currView) {
      case "pending":
        return getPendingInviteData;
      case "rejected":
        return getRejectedInviteData;
      case "invites":
        return getAllInviteData;
      case "registered":
      default:
        return registeredUsers;
    }
  }, [
    currView,
    getPendingInviteData,
    getRejectedInviteData,
    getAllInviteData,
    registeredUsers,
  ]);

  // Determine loading state based on currView
  const isLoading = useMemo(() => {
    switch (currView) {
      case "pending":
        return pendingInviteIsPending;
      case "rejected":
        return rejectedInviteIsPending;
      case "invites":
        return allInviteIsPending;
      case "registered":
      default:
        return isPending;
    }
  }, [
    currView,
    pendingInviteIsPending,
    rejectedInviteIsPending,
    allInviteIsPending,
    isPending,
  ]);

  // Handler for viewing details in modal
  const handleViewDetails = (item) => {
    setSelectedItemForView(item);
    setViewDetailsModalOpen(true);
  };

  const CustomerData = useMemo(() => {
    if (!registeredUsers?.data) return [];

    const mappedData = registeredUsers.data.map((details) => {
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
    return mappedData.filter((customer) =>
      matchesDateFilter(customer.rawDate),
    );
  }, [registeredUsers?.data, matchesDateFilter]);

  const InviteData = useMemo(() => {
    if (!currentData?.data) return [];

    const mappedData = currentData.data.map((details) => {
      return {
        ...details,
        name: `${details?.name}`,
        email: `${details?.email ?? ""}`,
        userType: `${details?.role?.name ?? ""}`,
        created_at: `${
          details?.created_at
            ? formatDateStr(details?.created_at.split(".").shift())
            : ""
        }`,
        rawDate: details?.created_at,
      };
    });

    // Apply date filters
    return mappedData.filter((invite) => matchesDateFilter(invite.rawDate));
  }, [currentData?.data, matchesDateFilter]);

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
      // {
      //   label: "Account Status",
      //   key: "status",
      //   render: (_, row) => (
      //     <span
      //       className={`px-3 py-1 text-sm rounded-md ${
      //         row.profile?.approved_by_admin === false
      //           ? "bg-red-100 text-red-600"
      //           : "bg-green-100 text-green-600"
      //       }`}
      //     >
      //       {row.profile?.approved_by_admin === false
      //         ? "Suspended"
      //         : "Active"}
      //     </span>
      //   ),
      // },
    ],
    [],
  );

  const totalPages = Math.ceil(
    (currentData?.count || 0) / (queryParams["pagination[limit]"] ?? 10),
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

  // Modified actions based on currView
  const row_actions = useMemo(() => {
    // For pending, invites, and rejected: only show "View Details" (opens modal)
    if (
      currView === "pending" ||
      currView === "invites" ||
      currView === "rejected"
    ) {
      return [
        {
          key: "view-details",
          label: "View Details",
          action: handleViewDetails,
        },
      ];
    }

    // For registered: show actions based on approval status
    return (item) => {
      const actions = [
        {
          key: "view_detail",
          label: "View Details",
          action: () => {
            return navigate(`/admin/view-customers/${item.id}`);
          },
        },
        // {
        //   key: "suspend-customer",
        //   label: item?.profile?.approved_by_admin === false ? "Unsuspend Customer" : "Suspend Customer",
        //   action: () => {
        //     setSuspendModalOpen(true);
        //     setNewCategory(item);
        //     setOpenDropdown(null);
        //   },
        // },
        {
          key: "delete_customer",
          label: "Delete Customer",
          action: () => {
            handleDeleteUser(item);
          },
        },
      ];

      return actions;
    };
  }, [currView, navigate]);

  // Table columns for invites/pending/rejected (from contact/invites endpoint)
  const inviteCustomerColumn = useMemo(
    () => [
      { label: "Name", key: "name" },
      { label: "Email", key: "email" },
      { label: "Date Added", key: "created_at" },
      {
        label: "Status",
        key: "status",
        render: (_, row) => (
          <span
            className={`px-3 py-1 text-sm rounded-md ${
              row?.status == "active"
                ? "bg-green-100 text-green-600"
                : row?.status == "pending"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
            }`}
          >
            {row?.status == "pending"
              ? "Pending"
              : row?.status == "active"
                ? "Active"
                : row?.status == "expired"
                  ? "Expired"
                  : "Rejected"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <h2 className="text-lg font-semibold">Customers</h2>
        </div>
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

          <DateFilter
            onFiltersChange={handleFiltersChange}
            activeFilters={activeFilters}
            onClearAll={clearDateFilters}
          />

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
            data={currView === "registered" ? CustomerData : InviteData}
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
        <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
          {["registered", "pending", "rejected", "invites"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setCurrView(tab);
                updateQueryParams({
                  "pagination[page]": 1,
                });
              }}
              className={`font-medium capitalize px-3 py-1 ${
                currView === tab
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              {tab === "rejected"
                ? "Expired"
                : tab === "pending"
                ? "pending invite"
                : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      <ActiveFilters
        activeFilters={activeFilters}
        onRemoveFilter={removeFilter}
        onClearAll={clearDateFilters}
      />

      <AddNewCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {activeTab === "table" ? (
        <>
          {!isLoading && (currView === "registered" ? CustomerData : InviteData).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Customers Found
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                {queryString
                  ? `No customers match your search "${queryString}"`
                  : activeFilters.length > 0
                    ? "No customers match the selected date filters. Try adjusting your filters."
                    : currView === "registered"
                      ? "There are no registered customers at the moment."
                      : currView === "pending"
                        ? "There are no pending customer invites."
                        : currView === "rejected"
                          ? "There are no expired customer invites."
                          : "There are no customer invites."}
              </p>
              {(queryString || activeFilters.length > 0) && (
                <button
                  onClick={() => {
                    setQueryString("");
                    clearDateFilters();
                  }}
                  className="mt-4 px-4 py-2 bg-[#9847FE] text-white rounded-lg text-sm hover:bg-[#8537ee] transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <CustomTable
              loading={isLoading}
              columns={currView === "registered" ? columns : inviteCustomerColumn}
              data={currView === "registered" ? CustomerData : InviteData}
              actions={row_actions}
            />
          )}
        </>
      ) : isLoading ? (
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

      {((currView === "registered" ? CustomerData : InviteData)?.length > 0 && totalPages > 1) && (
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
          <div className="flex gap-2">
            <PaginationButton
              onClick={() => {
                updateQueryParams({
                  "pagination[page]": +queryParams["pagination[page]"] - 1,
                });
              }}
              disabled={(queryParams["pagination[page]"] ?? 1) == 1}
            >
              ◀ Previous
            </PaginationButton>
            <PaginationButton
              onClick={() => {
                updateQueryParams({
                  "pagination[page]": +queryParams["pagination[page]"] + 1,
                });
              }}
              disabled={
                (queryParams["pagination[page]"] ?? 1) == totalPages
              }
            >
              Next ▶
            </PaginationButton>
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
              {newCategory?.profile?.approved_by_admin === false
                ? "Unsuspend Customer"
                : "Suspend Customer"}
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
                  {newCategory?.profile?.approved_by_admin === false
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
                  : newCategory?.profile?.approved_by_admin === false
                    ? "Unsuspend"
                    : "Suspend"}
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
