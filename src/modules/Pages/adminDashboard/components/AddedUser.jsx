import { useState, useRef, useEffect, useCallback } from "react";
import ReusableTable from "../components/ReusableTable";
import { FaEllipsisH } from "react-icons/fa";
import { Link } from "react-router-dom";
import useGetAllMarketRep from "../../../../hooks/marketRep/useGetMarketRep";
import useQueryParams from "../../../../hooks/useQueryParams";
import useGetBusinessDetails from "../../../../hooks/settings/useGetBusinessDetails";
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

const NewlyAddedUsers = () => {
  const [currView, setCurrView] = useState("approved");

  const [val, setVal] = useState("pending");

  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isPending: approoveIsPending, approveMarketRepMutate } =
    useApproveMarketRep();

  const { isPending: deleteIsPending, deleteUserMutate } = useDeleteUser();

  const [reason, setReason] = useState("");

  const { toastError } = useToast();

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [newCategory, setNewCategory] = useState();

  const { data: businessData } = useGetBusinessDetails();

  const { queryParams, updateQueryParams, clearAllFilters } = useQueryParams({
    approved: true,
    "pagination[page]": 1,
    "pagination[limit]": 10,
  });

  const { data: getAllMarketRepData, isPending } = useGetAllUsersByRole({
    ...queryParams,
    role: "market-representative",
  });

  useEffect(() => {
    updateQueryParams({
      approved: true,
    });
  }, []);

  const { data: getAllInviteData, isPending: allInviteIsPending } =
    useGetAllMarketRep({
      status: queryParams?.status,
      "pagination[page]": queryParams["pagination[page]"],
      "pagination[limit]": queryParams["pagination[limit]"],
      id: businessData?.data?.id,
    });

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const totalPages = Math.ceil(
    getAllMarketRepData?.count / (queryParams["pagination[limit]"] ?? 10),
  );

  const totalallInvitePages = Math.ceil(
    getAllInviteData?.count / (queryParams["pagination[limit]"] ?? 10),
  );

  const totalPageCount =
    currView === "invites" ? totalallInvitePages : totalPages;

  const MarketRepData = useMemo(
    () =>
      getAllMarketRepData?.data
        ? getAllMarketRepData?.data.map((details) => {
            return {
              ...details,
              name: `${details?.name}`,
              userType: `${details?.role?.name ?? ""}`,
              created_at: `${
                details?.created_at
                  ? formatDateStr(details?.created_at.split(".").shift())
                  : ""
              }`,
            };
          })
        : [],
    [getAllMarketRepData?.data],
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

  const InviteData = useMemo(
    () =>
      getAllInviteData?.data
        ? getAllInviteData?.data.map((details) => {
            return {
              ...details,
              name: `${details?.name}`,
              userType: `${details?.role?.name ?? ""}`,
              created_at: `${
                details?.created_at
                  ? formatDateStr(details?.created_at.split(".").shift())
                  : ""
              }`,
            };
          })
        : [],
    [getAllInviteData?.data],
  );

  // Toggle dropdown function
  const toggleDropdown = useCallback((rowId) => {
    setOpenDropdown((prev) => (prev === rowId ? null : rowId));
  }, []);

  // Table Columns
  const columns = useMemo(
    () => [
      { label: "Name", key: "name" },
      { label: "User Type", key: "userType" },
      { label: "Date Added", key: "created_at" },
      {
        label: "Status",
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
                : "Rejected"}
          </span>
        ),
      },
      {
        label: "Action",
        key: "action",
        render: (_, row) => (
          <div className="relative">
            <button
              className="bg-gray-100 cursor-pointer text-gray-500 px-3 py-1 rounded-md"
              onClick={() => {
                toggleDropdown(row.id);
              }}
            >
              <FaEllipsisH />
            </button>
            {openDropdown === row.id && (
              <div className="dropdown-menu absolute right-0 mt-2 w-50 bg-white rounded-md z-10 border-gray-200">
                <Link
                  to={`/admin/sales-rep/view-sales/${row.id}`}
                  onClick={() => {
                    clearAllFilters();
                  }}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center"
                >
                  View Market Rep
                </Link>

                {row.profile?.approved_by_admin !== null ? (
                  row?.profile?.approved_by_admin ? (
                    <>
                      {" "}
                      <button
                        onClick={() => {
                          setSuspendModalOpen(true);
                          setNewCategory(row);
                          setOpenDropdown(null);
                        }}
                        className="block text-red-500 hover:bg-red-100 cursor-pointer px-4 py-2  w-full text-center"
                      >
                        {"Suspend User"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSuspendModalOpen(true);
                          setNewCategory(row);
                          setOpenDropdown(null);
                        }}
                        className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center"
                      >
                        {"Unsuspend User"}
                      </button>
                    </>
                  )
                ) : (
                  <></>
                )}
                <button
                  onClick={() => handleDeleteUser(row)}
                  className="block cursor-pointer px-4 py-2 text-red-500 hover:bg-red-100 w-full text-center"
                >
                  Delete Market Rep
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [toggleDropdown, openDropdown],
  );

  const inviteRepColumn = useMemo(
    () => [
      { label: "Name", key: "name" },
      { label: "Emaill", key: "email" },
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
                : "Rejected"}
          </span>
        ),
      },
      {
        label: "Action",
        key: "action",
        render: (_, row) => (
          <div className="relative">
            <button
              className="bg-gray-100 cursor-pointer text-gray-500 px-3 py-1 rounded-md"
              onClick={() => {
                toggleDropdown(row.id);
              }}
            >
              <FaEllipsisH />
            </button>
            {openDropdown === row.id && (
              <div className="dropdown-menu absolute right-0 mt-2 w-50 bg-white rounded-md z-10 border-gray-200">
                <Link
                  to={`/admin/sales-rep/view-sales/${row.id}`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center"
                >
                  View Market Rep
                </Link>
                <button
                  onClick={() => {}}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center"
                >
                  Edit User
                </button>
                <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full text-center">
                  Remove User
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [toggleDropdown, openDropdown],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
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
          <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Export As ▾
          </button>

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
          {["approved", "pending", "rejected", "invites"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setCurrView(tab);
                if (tab == "pending") {
                  updateQueryParams({
                    ...queryParams,
                    newly_onboarded: true,
                    approved: null,
                  });
                }
                if (tab == "approved") {
                  return updateQueryParams({
                    ...queryParams,
                    newly_onboarded: null,
                    approved: true,
                  });
                }
                if (tab == "rejected") {
                  return updateQueryParams({
                    ...queryParams,
                    newly_onboarded: null,
                    approved: false,
                  });
                }
                if (tab == "invites") {
                  return updateQueryParams({
                    ...queryParams,
                    newly_onboarded: undefined,
                    approved: undefined,
                  });
                }
              }}
              className={`font-medium capitalize px-3 py-1 ${
                currView === tab
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <AddMarketModal
          businessId={businessData?.data?.id}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        <ReusableTable
          loading={isPending || allInviteIsPending}
          columns={currView == "invites" ? inviteRepColumn : columns}
          data={currView == "invites" ? InviteData : MarketRepData}
        />
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
                (queryParams["pagination[page]"] ?? 1) == totalPageCount
              }
              className="px-3 py-1 rounded-md bg-gray-200"
            >
              ▶
            </button>
          </div>
        </div>
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
