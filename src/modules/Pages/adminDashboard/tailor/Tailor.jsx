import { useState, useRef, useEffect, useMemo } from "react";
import ReusableTable from "../components/ReusableTable";
import { FaEllipsisH, FaBars, FaTh, FaPhone, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { BsFilter } from "react-icons/bs";
import useQueryParams from "../../../../hooks/useQueryParams";

import { formatDateStr } from "../../../../lib/helper";
import useDebounce from "../../../../hooks/useDebounce";

import Loader from "../../../../components/ui/Loader";
import useApproveMarketRep from "../../../../hooks/marketRep/useApproveMarketRep";
import ConfirmationModal from "../../../../components/ui/ConfirmationModal";
import useDeleteUser from "../../../../hooks/user/useDeleteUser";
import useToast from "../../../../hooks/useToast";
import AddNewTailorModal from "./AddNewTailorModal";
import CustomTable from "../../../../components/CustomTable";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import DateFilter from "../../../../components/shared/DateFilter";
import ActiveFilters from "../../../../components/shared/ActiveFilters";
import useDateFilter from "../../../../hooks/useDateFilter";
import ViewDetailsModal from "../components/Viewdetailsmodal";

const CustomersTable = () => {
  const [currView, setCurrView] = useState("registered");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeTab, setActiveTab] = useState("table");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedItemForView, setSelectedItemForView] = useState(null);

  // Date filter functionality
  const {
    activeFilters,
    matchesDateFilter,
    handleFiltersChange,
    removeFilter,
    clearAllFilters: clearDateFilters,
  } = useDateFilter();

  const { toastError } = useToast();

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [newCategory, setNewCategory] = useState();

  const [reason, setReason] = useState("");

  const { isPending: approoveIsPending, approveMarketRepMutate } =
    useApproveMarketRep();

  const { isPending: deleteIsPending, deleteUserMutate } = useDeleteUser();

  const { queryParams, updateQueryParams } = useQueryParams({
    registered: true,
    "pagination[page]": 1,
    "pagination[limit]": 10,
  });

  // Fetch business data for invites
  const { data: businessData } = useQuery({
    queryKey: ["get-business-data-tailor"],
    queryFn: async () => {
      const url = `/onboard/fetch-businesses?q=fashion-designer`;
      const response = await CaryBinApi.get(url);
      return response.data;
    },
  });

  // Query for registered tailors
  const { data: registeredUsers } = useQuery({
    queryKey: ["get-registered-tailors"],
    queryFn: async () => {
      const url = `/auth/users/fashion-designer`;
      const response = await CaryBinApi.get(url);
      return response.data;
    },
  });

  const [queryString, setQueryString] = useState(queryParams.q);
  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  // Query for registered tailors (uses the registeredUsers endpoint)
  const { data: getAllTailorRepData, isPending } = useQuery({
    queryKey: [queryParams, "tailors", debouncedSearchTerm],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/auth/users/fashion-designer", {
        params: {
          ...queryParams,
          q: debouncedSearchTerm,
        },
      });
      // Return full response object with count for pagination
      return {
        data: resp.data.data,
        count: resp.data.count,
      };
    },
  });

  useEffect(() => {
    updateQueryParams({
      registered: true,
    });
  }, [updateQueryParams]);

  // Query for pending tailors (uses contact/invites endpoint with status=pending)
  const { data: getPendingInviteData, isPending: pendingInviteIsPending } =
    useQuery({
      queryKey: [
        "get-pending-tailor-invites",
        businessData?.data?.[0]?.id,
        queryParams["pagination[page]"],
        queryParams["pagination[limit]"],
      ],
      queryFn: async () => {
        const page = queryParams["pagination[page]"] ?? 1;
        const limit = queryParams["pagination[limit]"] ?? 10;
        const url = `/contact/invites/${businessData?.data?.[0]?.id}?status=pending&role=fashion-designer&pagination[page]=${page}&pagination[limit]=${limit}`;
        const response = await CaryBinApi.get(url);
        return response.data;
      },
      enabled: !!businessData?.data?.[0]?.id && currView === "pending",
    });

  // Query for rejected tailors (uses contact/invites endpoint with status=expired)
  const { data: getRejectedInviteData, isPending: rejectedInviteIsPending } =
    useQuery({
      queryKey: [
        "get-rejected-tailor-invites",
        businessData?.data?.[0]?.id,
        queryParams["pagination[page]"],
        queryParams["pagination[limit]"],
      ],
      queryFn: async () => {
        const page = queryParams["pagination[page]"] ?? 1;
        const limit = queryParams["pagination[limit]"] ?? 10;
        const url = `/contact/invites/${businessData?.data?.[0]?.id}?status=expired&role=fashion-designer&pagination[page]=${page}&pagination[limit]=${limit}`;
        const response = await CaryBinApi.get(url);
        return response.data;
      },
      enabled: !!businessData?.data?.[0]?.id && currView === "rejected",
    });

  // Query for all invites (uses contact/invites endpoint with no status param)
  const { data: getAllInviteData, isPending: allInviteIsPending } = useQuery({
    queryKey: [
      "get-all-tailor-invites",
      businessData?.data?.[0]?.id,
      queryParams["pagination[page]"],
      queryParams["pagination[limit]"],
    ],
    queryFn: async () => {
      const page = queryParams["pagination[page]"] ?? 1;
      const limit = queryParams["pagination[limit]"] ?? 10;
      const url = `/contact/invites/${businessData?.data?.[0]?.id}?role=fashion-designer&pagination[page]=${page}&pagination[limit]=${limit}`;
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
        return getAllTailorRepData;
    }
  }, [
    currView,
    getPendingInviteData,
    getRejectedInviteData,
    getAllInviteData,
    getAllTailorRepData,
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

  const TailorData = useMemo(() => {
    if (!getAllTailorRepData?.data) return [];

    const mappedData = getAllTailorRepData.data.map((details) => {
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
    return mappedData.filter((tailor) => matchesDateFilter(tailor.rawDate));
  }, [getAllTailorRepData?.data, matchesDateFilter]);

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

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

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

  const dropdownRef = useRef(null);
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
      // {
      //   label: "Action",
      //   key: "action",
      //   render: (_, row) => (
      //     <div className="relative">
      //       <button
      //         className="bg-gray-100 cursor-pointer text-gray-500 px-3 py-1 rounded-md"
      //         onClick={() => {
      //           toggleDropdown(row.id);
      //         }}
      //       >
      //         <FaEllipsisH />
      //       </button>
      //       {openDropdown === row.id && (
      //         <div className="dropdown-menu absolute z-[99999] right-2 rounded mt-2 w-50 bg-white rounded-md border-gray-200">
      //           <Link
      //             to={`/admin/tailors/view-tailor/${row.id}`}
      //             className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center"
      //           >
      //             View Tailors Details
      //           </Link>
      //           {/* <button className="block cursor-pointer px-4 cursor-pointer py-2 text-gray-700 hover:bg-gray-100 w-full text-center">
      //             Edit User
      //           </button> */}
      //           {row?.profile?.approved_by_admin ? (
      //             <>
      //               {" "}
      //               <button
      //                 onClick={() => {
      //                   setSuspendModalOpen(true);
      //                   setNewCategory(row);
      //                   setOpenDropdown(null);
      //                 }}
      //                 className="block text-red-500 hover:bg-red-100 cursor-pointer px-4 py-2  w-full text-center"
      //               >
      //                 {"Suspend Tailor"}
      //               </button>
      //             </>
      //           ) : (
      //             <>
      //               {" "}
      //               <button
      //                 onClick={() => {
      //                   setSuspendModalOpen(true);
      //                   setNewCategory(row);
      //                   setOpenDropdown(null);
      //                 }}
      //                 className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center"
      //               >
      //                 {"Unsuspend Tailor"}
      //               </button>
      //             </>
      //           )}
      //           <button
      //             onClick={() => handleDeleteUser(row)}
      //             className="block cursor-pointer px-4 py-2 text-red-500 hover:bg-red-100 w-full text-center"
      //           >
      //             Delete Tailor
      //           </button>
      //         </div>
      //       )}
      //     </div>
      //   ),
      // },
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
          return nav(`/admin/tailors/view-tailor/${item.id}`);
        },
      },
      {
        key: "suspend-tailor",
        label: "Suspend Tailor",
        action: (item) => {
          setSuspendModalOpen(true);
          setNewCategory(item);
          setOpenDropdown(null);
        },
      },
      {
        key: "delete-tailor",
        label: "Delete Tailor",
        action: (item) => {
          handleDeleteUser(item);
        },
      },
    ];
  }, [currView, nav]);

  // Table columns for invites/pending/rejected (from contact/invites endpoint)
  const inviteTailorColumn = useMemo(
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPages = Math.ceil(
    (currentData?.count || 0) / (queryParams["pagination[limit]"] ?? 10),
  );

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <h2 className="text-lg font-semibold">Tailors/Designers</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
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
            placeholder="Search"
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

          {/* <Link to="/admin/tailors/add-tailor"> */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 cursor-pointer text-white px-4 py-2 text-sm rounded-md"
          >
            + Invite New Tailor/Designer
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

      <AddNewTailorModal
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
          <CustomTable
            loading={isLoading}
            columns={currView === "registered" ? columns : inviteTailorColumn}
            data={currView === "registered" ? TailorData : InviteData}
            actions={actions}
          />
          {/* <ReusableTable
            columns={columns}
            data={TailorData}
            loading={isPending}
          />*/}
          {((currView === "registered" ? TailorData : InviteData)?.length > 0 || isLoading) && (
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
                  disabled={
                    (queryParams["pagination[page]"] ?? 1) == totalPages
                  }
                  className="px-3 py-1 rounded-md bg-gray-200"
                >
                  ▶
                </button>
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
          {TailorData?.map((item) => (
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
                      to={`/admin/tailors/view-tailor/${item.id}`}
                      className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      View Details
                    </Link>
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
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center text-xl font-medium text-white">
                      {item?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  </>
                )}
                <h3 className="text-dark-blue font-medium mb-1 mt-2">
                  {item.name}
                </h3>
                {/* <p className="text-gray-500 text-sm mt-1">{item.business}</p> */}
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <FaPhone className="text-purple-600" size={14} />
                  <span className="text-gray-600 text-sm">{item.phone}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <FaEnvelope className="text-purple-600" size={14} />
                  <span className="text-purple-600 text-sm">{item.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "grid" && (
        <>
          {((currView === "registered" ? TailorData : InviteData)?.length > 0 || isLoading) && (
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
                  disabled={
                    (queryParams["pagination[page]"] ?? 1) == totalPages
                  }
                  className="px-3 py-1 rounded-md bg-gray-200"
                >
                  ▶
                </button>
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
                ? "Suspend Tailor"
                : "Unsuspend Tailor"}
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
        title="Delete Tailor"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone and will permanently remove the tailor from the system.`}
        confirmText="Delete Tailor"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteIsPending}
      />
    </div>
  );
};

export default CustomersTable;
