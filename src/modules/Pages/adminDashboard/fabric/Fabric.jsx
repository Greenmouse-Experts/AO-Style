import { useState, useRef, useEffect, useMemo } from "react";
import ReusableTable from "../components/ReusableTable";
import { FaEllipsisH, FaBars, FaTh, FaPhone, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import useQueryParams from "../../../../hooks/useQueryParams";
import useDebounce from "../../../../hooks/useDebounce";
import { formatDateStr } from "../../../../lib/helper";
import Loader from "../../../../components/ui/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import useApproveMarketRep from "../../../../hooks/marketRep/useApproveMarketRep";
import ConfirmationModal from "../../../../components/ui/ConfirmationModal";
import useDeleteUser from "../../../../hooks/user/useDeleteUser";
import useToast from "../../../../hooks/useToast";
import { useTempStore } from "../../../../store/useTempStore";
import AddFabricModal from "../components/AddFabricModal";
import CustomTabs from "../../../../components/CustomTabs";
import CustomTable from "../../../../components/CustomTable";
import DateFilter from "../../../../components/shared/DateFilter";
import ActiveFilters from "../../../../components/shared/ActiveFilters";
import useDateFilter from "../../../../hooks/useDateFilter";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import ViewDetailsModal from "../components/Viewdetailsmodal";
import PaginationButton from "../../../../components/PaginationButton";

const CustomersTable = () => {
  const [currView, setCurrView] = useState("registered");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedItemForView, setSelectedItemForView] = useState(null);
  const dropdownRef = useRef(null);

  const [activeTab, setActiveTab] = useState("table");
  const [reason, setReason] = useState("");
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Date filter functionality
  const {
    activeFilters,
    matchesDateFilter,
    handleFiltersChange,
    removeFilter,
    clearAllFilters: clearDateFilters,
  } = useDateFilter();

  const { isPending: approoveIsPending, approveMarketRepMutate } =
    useApproveMarketRep();

  const { isPending: deleteIsPending, deleteUserMutate } = useDeleteUser();

  const [newCategory, setNewCategory] = useState();

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
    queryKey: ["get-business-data-fabric"],
    queryFn: async () => {
      const url = `/onboard/fetch-businesses?q=fabric-vendor`;
      const response = await CaryBinApi.get(url);
      return response.data;
    },
  });

  const [queryString, setQueryString] = useState(queryParams.q);
  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  // Query for registered fabric vendors (uses the registeredUsers endpoint with search)
  const { data: registeredUsers, isPending } = useQuery({
    queryKey: [queryParams, "fabric-vendors", debouncedSearchTerm],
    queryFn: async () => {
      const response = await CaryBinApi.get("/auth/users/fabric-vendor", {
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

  // Query for pending fabric vendors (uses contact/invites endpoint with status=pending)
  const { data: getPendingInviteData, isPending: pendingInviteIsPending } =
    useQuery({
      queryKey: [
        "get-pending-fabric-invites",
        businessData?.data?.[0]?.id,
        queryParams["pagination[page]"],
        queryParams["pagination[limit]"],
      ],
      queryFn: async () => {
        const page = queryParams["pagination[page]"] ?? 1;
        const limit = queryParams["pagination[limit]"] ?? 10;
        const url = `/contact/invites/${businessData?.data?.[0]?.id}?status=pending&role=fabric-vendor&pagination[page]=${page}&pagination[limit]=${limit}`;
        const response = await CaryBinApi.get(url);
        return response.data;
      },
      enabled: !!businessData?.data?.[0]?.id && currView === "pending",
    });

  // Query for rejected fabric vendors (uses contact/invites endpoint with status=expired)
  const { data: getRejectedInviteData, isPending: rejectedInviteIsPending } =
    useQuery({
      queryKey: [
        "get-rejected-fabric-invites",
        businessData?.data?.[0]?.id,
        queryParams["pagination[page]"],
        queryParams["pagination[limit]"],
      ],
      queryFn: async () => {
        const page = queryParams["pagination[page]"] ?? 1;
        const limit = queryParams["pagination[limit]"] ?? 10;
        const url = `/contact/invites/${businessData?.data?.[0]?.id}?status=expired&role=fabric-vendor&pagination[page]=${page}&pagination[limit]=${limit}`;
        const response = await CaryBinApi.get(url);
        return response.data;
      },
      enabled: !!businessData?.data?.[0]?.id && currView === "rejected",
    });

  // Query for all invites (uses contact/invites endpoint with no status param)
  const { data: getAllInviteData, isPending: allInviteIsPending } = useQuery({
    queryKey: [
      "get-all-fabric-invites",
      businessData?.data?.[0]?.id,
      queryParams["pagination[page]"],
      queryParams["pagination[limit]"],
    ],
    queryFn: async () => {
      const page = queryParams["pagination[page]"] ?? 1;
      const limit = queryParams["pagination[limit]"] ?? 10;
      const url = `/contact/invites/${businessData?.data?.[0]?.id}?role=fabric-vendor&pagination[page]=${page}&pagination[limit]=${limit}`;
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

  const FabricData = useMemo(() => {
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
    return mappedData.filter((vendor) => matchesDateFilter(vendor.rawDate));
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
  // Table Columns
  const nav = useNavigate();
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
      { label: "Location", key: "location" },
      { label: "Date Joined", key: "dateJoined" },
    ],
    [],
  );
  // Modified actions based on currView
  const actions = useMemo(() => {
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

    // For registered: show full actions including navigation to view page
    return [
      {
        key: "view-details",
        label: "View Details",
        action: (item) => {
          return nav(`/admin/fabric-vendor/view/${item.id}`);
        },
      },
      {
        key: "suspend-vendor",
        label: "Suspend Vendor",
        action: (item) => {
          setSuspendModalOpen(true);
          setNewCategory(item);
          setOpenDropdown(null);
        },
      },
      {
        key: "delete-vendor",
        label: "Delete Vendor",
        action: (item) => {
          handleDeleteUser(item);
        },
      },
    ];
  }, [currView, nav]);

  // Table columns for invites/pending/rejected (from contact/invites endpoint)
  const inviteFabricColumn = useMemo(
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mouseown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pagination Logic

  const totalPages = Math.ceil(
    (currentData?.count || 0) / (queryParams["pagination[limit]"] ?? 10),
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
      head: [
        ["Name", "Phone Number", "Email Address", "Location", "Date Joined"],
      ],
      body: FabricData?.map((row) => [
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
    doc.save("vendor(fabric seller).pdf");
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
    saveAs(blob, "vendor(fabric seller).xlsx");
  };

  const { toastError } = useToast();

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <h2 className="text-lg font-semibold">Vendors (Fabric Sellers)</h2>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
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
          <input
            type="text"
            placeholder="Search fabrics..."
            value={queryString}
            onChange={(evt) =>
              setQueryString(evt.target.value ? evt.target.value : undefined)
            }
            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
          />
          <DateFilter
            onFiltersChange={handleFiltersChange}
            activeFilters={activeFilters}
            onClearAll={clearDateFilters}
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
            data={currView === "registered" ? FabricData : InviteData}
            filename="FabricVendors.csv"
            className="hidden"
          />
          {/* <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Sort: Newest First ▾
          </button> */}
          {/* <Link to="/admin/fabric/add-fabric-vendor"> */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#9847FE] cursor-pointer text-white px-4 py-2 text-sm rounded-md"
          >
            + Invite A New Vendor
          </button>
          {/* </Link> */}
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

      <AddFabricModal
        businessId={businessData?.data?.[0]?.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewDetailsModalOpen}
        onClose={() => {
          setViewDetailsModalOpen(false);
          setSelectedItemForView(null);
        }}
        data={selectedItemForView}
        dataType={currView}
      />

      {activeTab === "table" ? (
        <>
          {!isLoading && (currView === "registered" ? FabricData : InviteData).length === 0 ? (
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
                No Fabric Vendors Found
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                {queryString
                  ? `No fabric vendors match your search "${queryString}"`
                  : activeFilters.length > 0
                    ? "No fabric vendors match the selected date filters. Try adjusting your filters."
                    : currView === "registered"
                      ? "There are no registered fabric vendors at the moment."
                      : currView === "pending"
                        ? "There are no pending fabric vendor invites."
                        : currView === "rejected"
                          ? "There are no expired fabric vendor invites."
                          : "There are no fabric vendor invites."}
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
              columns={currView === "registered" ? columns : inviteFabricColumn}
              data={currView === "registered" ? FabricData : InviteData}
              actions={actions}
            />
          )}
          {/* <ReusableTable
            loading={isPending}
            columns={columns}
            data={FabricData}
          />*/}
          {((currView === "registered" ? FabricData : InviteData)?.length > 0 || isLoading) && (
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
        </>
      ) : isPending ? (
        <div className=" flex !w-full items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FabricData?.map((item) => (
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
                    <Link
                      to={`/admin/fabric-vendor/view/${item.id}`}
                      state={{ info: item.id }}
                      className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      View Details
                    </Link>
                    {/* <Link
                      state={{ info: item.id }}
                      to={`/admin/fabric-vendor/view?tab=personal`}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Edit User
                    </Link>*/}
                    {/* <button
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => console.log("Edit user", item.id)}
                    >
                      Edit User
                    </button>
                    <button
                      className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full text-left"
                      onClick={() => console.log("Remove user", item.id)}
                    >
                      Remove User
                    </button>*/}
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
                  <>
                    <div className="mx-auto w-16 h-16 mb-2 cursor-pointer rounded-full bg-gray-300 flex items-center justify-center text-xl font-medium text-white">
                      {item?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  </>
                )}

                <h3 className="text-dark-blue font-medium mb-1 mt-2">
                  {item?.name}
                </h3>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <FaPhone className="text-[#9847FE]" size={14} />
                  <span className="text-gray-600 text-sm">{item?.phone}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <FaEnvelope className="text-[#9847FE]" size={14} />
                  <span className="text-[#9847FE] text-sm">{item?.email}</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">{item?.location}</p>
                <p className="text-gray-500 text-sm mt-1">{item?.dateJoined}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === "grid" && (
        <>
          {((currView === "registered" ? FabricData : InviteData)?.length > 0 || isLoading) && (
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
        </>
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
                ? "Suspend Fabric Vendor"
                : "Unsuspend Fabric Vendor"}
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
        title="Delete Fabric Vendor"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone and will permanently remove the fabric vendor from the system.`}
        confirmText="Delete Vendor"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteIsPending}
      />
    </div>
  );
};

export default CustomersTable;
