import { useState, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import { FaEllipsisH } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import useQueryParams from "../../../../hooks/useQueryParams";
import { useMemo } from "react";
import { formatDateStr } from "../../../../lib/helper";
import useGetAllUsersByRole from "../../../../hooks/admin/useGetAllUserByRole";
import useDebounce from "../../../../hooks/useDebounce";
import useUpdatedEffect from "../../../../hooks/useUpdatedEffect";
import useApproveMarketRep from "../../../../hooks/marketRep/useApproveMarketRep";
import ConfirmationModal from "../../../../components/ui/ConfirmationModal";
import useDeleteUser from "../../../../hooks/user/useDeleteUser";
import useToast from "../../../../hooks/useToast";
import AddMarketModal from "./AddMarketModal";
import ViewDetailsModal from "./Viewdetailsmodal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import CustomTable from "../../../../components/CustomTable";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import DateFilter from "../../../../components/shared/DateFilter";
import ActiveFilters from "../../../../components/shared/ActiveFilters";
import useDateFilter from "../../../../hooks/useDateFilter";
import PaginationButton from "../../../../components/PaginationButton";

const NewlyAddedUsers = () => {
  const [currView, setCurrView] = useState("registered");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedItemForView, setSelectedItemForView] = useState(null);

  const { isPending: approoveIsPending, approveMarketRepMutate } =
    useApproveMarketRep();

  const { isPending: deleteIsPending, deleteUserMutate } = useDeleteUser();

  const [reason, setReason] = useState("");

  const { toastError } = useToast();

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const nav = useNavigate();
  const [newCategory, setNewCategory] = useState();

  // Date filter functionality
  const {
    activeFilters,
    matchesDateFilter,
    handleFiltersChange,
    removeFilter,
    clearAllFilters: clearDateFilters,
  } = useDateFilter();

  // const { data: businessData } = useGetBusinessDetails();

  const { data: businessData } = useQuery({
    queryKey: ["get-business-data"],
    queryFn: async () => {
      const url = `/onboard/fetch-businesses?q=market-representative`;
      const response = await CaryBinApi.get(url);
      console.log("This are the businesses data", response);
      return response.data;
    },
  });

  const { queryParams, updateQueryParams } = useQueryParams({
    registered: true,
    "pagination[page]": 1,
    "pagination[limit]": 10,
  });

  // Query for registered market reps (uses the registeredUsers endpoint)
  const { data: getAllMarketRepData, isPending } = useGetAllUsersByRole({
    ...queryParams,
    role: "market-representative",
  });

  // Query for pending market reps (uses contact/invites endpoint with status=pending)
  const { data: getPendingInviteData, isPending: pendingInviteIsPending } =
    useQuery({
      queryKey: [
        "get-pending-rep-invites",
        businessData?.data?.[0]?.id,
        queryParams["pagination[page]"],
        queryParams["pagination[limit]"],
      ],
      queryFn: async () => {
        const page = queryParams["pagination[page]"] ?? 1;
        const limit = queryParams["pagination[limit]"] ?? 10;
        const url = `/contact/invites/${businessData?.data?.[0]?.id}?status=pending&role=market-representative&pagination[page]=${page}&pagination[limit]=${limit}`;
        const response = await CaryBinApi.get(url);
        console.log("This is the pending market rep invitees", response);
        return response.data;
      },
      enabled: !!businessData?.data?.[0]?.id && currView === "pending",
    });

  // Query for rejected market reps (uses contact/invites endpoint with status=expired)
  const { data: getRejectedInviteData, isPending: rejectedInviteIsPending } =
    useQuery({
      queryKey: [
        "get-rejected-rep-invites",
        businessData?.data?.[0]?.id,
        queryParams["pagination[page]"],
        queryParams["pagination[limit]"],
      ],
      queryFn: async () => {
        const page = queryParams["pagination[page]"] ?? 1;
        const limit = queryParams["pagination[limit]"] ?? 10;
        const url = `/contact/invites/${businessData?.data?.[0]?.id}?status=expired&role=market-representative&pagination[page]=${page}&pagination[limit]=${limit}`;
        const response = await CaryBinApi.get(url);
        console.log("This is the rejected market rep invitees", response);
        return response.data;
      },
      enabled: !!businessData?.data?.[0]?.id && currView === "rejected",
    });

  // Query for all invites (uses contact/invites endpoint with no status param)
  const { data: getAllInviteData, isPending: allInviteIsPending } = useQuery({
    queryKey: [
      "get-admin-rep-invites",
      businessData?.data?.[0]?.id,
      queryParams["pagination[page]"],
      queryParams["pagination[limit]"],
    ],
    queryFn: async () => {
      const page = queryParams["pagination[page]"] ?? 1;
      const limit = queryParams["pagination[limit]"] ?? 10;
      const url = `/contact/invites/${businessData?.data?.[0]?.id}?role=market-representative&pagination[page]=${page}&pagination[limit]=${limit}`;
      const response = await CaryBinApi.get(url);
      console.log("This is the markt rep invitees", response);
      return response.data;
    },
    enabled: !!businessData?.data?.[0]?.id && currView === "invites",
  });

  console.log("This is all the invites data", getAllInviteData);

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

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
        return getAllMarketRepData;
    }
  }, [
    currView,
    getPendingInviteData,
    getRejectedInviteData,
    getAllInviteData,
    getAllMarketRepData,
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

  const totalPages = Math.ceil(
    currentData?.count / (queryParams["pagination[limit]"] ?? 10),
  );

  const totalPageCount = totalPages;

  // Handler for viewing details in modal
  const handleViewDetails = (item) => {
    setSelectedItemForView(item);
    setViewDetailsModalOpen(true);
  };

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

    // For registered: return a function that generates actions based on item
    return (item) => {
      const itemActions = [
        {
          key: "view-details",
          label: "View Market Rep",
          action: () => {
            return nav(`/admin/sales-rep/view-sales/${item.id}`);
          },
        },
      ];

      // Only show suspend/unsuspend if not pending (approved_by_admin !== null)
      if (item?.profile?.approved_by_admin !== null) {
        itemActions.push({
          key: "suspend-market-rep",
          label: item?.profile?.approved_by_admin ? "Suspend Market Rep" : "Unsuspend Market Rep",
          action: () => {
            setSuspendModalOpen(true);
            setNewCategory(item);
          },
        });
      }

      itemActions.push({
        key: "delete-market-rep",
        label: "Delete Market Rep",
        action: () => {
          handleDeleteUser(item);
        },
      });

      return itemActions;
    };
  }, [currView, nav]);

  const MarketRepData = useMemo(() => {
    if (!getAllMarketRepData?.data) return [];

    const mappedData = getAllMarketRepData.data.map((details) => {
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
    return mappedData.filter((marketRep) =>
      matchesDateFilter(marketRep.rawDate),
    );
  }, [getAllMarketRepData?.data, matchesDateFilter]);

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
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

  // Table Columns for registered market reps
  const columns = useMemo(
    () => [
      { label: "Name", key: "name" },
      // { label: "User Type", key: "userType" },
      { label: "Date Added", key: "created_at" },
      {
        label: "Onboarding Status",
        key: "status",
        render: (_, row) => (
          <span
            className={`px-3 py-1 text-sm rounded-md ${
              row.profile?.approved_by_admin
                ? "bg-green-100 text-green-600"
                : row.profile?.approved_by_admin == null
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
            }`}
          >
            {row.profile?.approved_by_admin == null
              ? "Pending"
              : row.profile?.approved_by_admin
                ? "Approved"
                : "Suspended"}
          </span>
        ),
      },
    ],
    [],
  );

  // Table columns for invites/pending/rejected (from contact/invites endpoint)
  const inviteRepColumn = useMemo(
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

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      currView === "registered" ? MarketRepData : InviteData,
    );
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

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto overflow-y-visible">
      <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
        <h2 className="text-lg font-semibold">Market Rep</h2>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
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
          <select
            onChange={handleExport}
            className="bg-gray-100 outline-none text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
          >
            <option value="" disabled selected>
              Export As
            </option>
            <option value="csv">Export to CSV</option>
            <option value="excel">Export to Excel</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#9847FE] text-white px-4 py-2 text-sm cursor-pointer rounded-md"
          >
            + invite a Market Rep
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

      <CSVLink
        id="csvDownload"
        data={currView === "registered" ? MarketRepData : InviteData}
        filename="MyProducts.csv"
        className="hidden"
      />
      {/* table */}
      <div className="overflow-x-auto">
        <AddMarketModal
          businessId={businessData?.data?.id}
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

        {!isLoading && (currView === "registered" ? MarketRepData : InviteData).length === 0 ? (
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
              No Market Representatives Found
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-md">
              {activeFilters.length > 0
                ? "No market representatives match the selected date filters. Try adjusting your filters."
                : currView === "registered"
                  ? "There are no registered market representatives at the moment."
                  : currView === "pending"
                    ? "There are no pending market rep invites."
                    : currView === "rejected"
                      ? "There are no expired market rep invites."
                      : "There are no market rep invites."}
            </p>
            {activeFilters.length > 0 && (
              <button
                onClick={clearDateFilters}
                className="mt-4 px-4 py-2 bg-[#9847FE] text-white rounded-lg text-sm hover:bg-[#8537ee] transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <CustomTable
            actions={actions}
            loading={isLoading}
            columns={currView === "registered" ? columns : inviteRepColumn}
            data={currView === "registered" ? MarketRepData : InviteData}
          />
        )}
        {((currView === "registered" ? MarketRepData : InviteData)?.length > 0 && totalPages > 1) && (
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
      </div>
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
                ? "Suspend Admin"
                : "Unsuspend Admin"}
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
        title="Delete Market Representative"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone and will permanently remove the market representative from the system.`}
        confirmText="Delete Market Rep"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteIsPending}
      />
    </div>
  );
};

export default NewlyAddedUsers;