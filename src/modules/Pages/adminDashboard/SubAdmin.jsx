import { useState, useRef, useEffect, useMemo } from "react";
import ReusableTable from "./components/ReusableTable";
import SubAdminModal from "./components/SubAdminModal";
import { FaEllipsisH, FaBars, FaTh, FaPhone, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import useQueryParams from "../../../hooks/useQueryParams";
import useGetAdminRoles from "../../../hooks/admin/useGetAdminRoles";
import useGetAllUsersByRole from "../../../hooks/admin/useGetAllUserByRole";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import Loader from "../../../components/ui/Loader";
import { formatDateStr } from "../../../lib/helper";
import useDeleteSubAdmin from "../../../hooks/admin/useDeleteSubAdmin";
import useSuspendOwner from "../../../hooks/admin/useSuspendOwner";

const CustomersTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [reason, setReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("table");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { data: getAllAdminData, isPending } = useGetAllUsersByRole({
    ...queryParams,
    role: "owner-administrator",
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

  const SubAdminData = useMemo(
    () =>
      getAllAdminData?.data
        ? getAllAdminData?.data.map((details) => {
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
            };
          })
        : [],
    [getAllAdminData?.data]
  );

  console.log(getAllAdminData?.data);

  const [newCategory, setNewCategory] = useState();

  const { isPending: suspendIsPending, suspendOwnerMutate } = useSuspendOwner();

  // Table Columns
  const columns = [
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
    // { label: "Location", key: "location" },
    { label: "Date Joined", key: "dateJoined" },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
        <div className="relative z-[9999]">
          <button
            className="bg-gray-100  cursor-pointer cursor-pointer text-gray-500 px-3 py-1 rounded-md"
            onClick={() => toggleDropdown(row.id)}
          >
            <FaEllipsisH />
          </button>
          {openDropdown === row.id && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10 shadow-lg">
              <button className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center">
                View Details
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setNewCategory(row);
                  setOpenDropdown(null);
                }}
                className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center"
              >
                Edit Admin
              </button>

              {/* <button
                onClick={() => {
                  setSuspendModalOpen(true);
                  setNewCategory(row);
                  setOpenDropdown(null);
                }}
                className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center"
              >
                {"Suspend Admin"}
              </button> */}

              <button
                onClick={() => {
                  setNewCategory(row);
                  setIsAddModalOpen(true);
                  setOpenDropdown(null);
                }}
                className="block cursor-pointer px-4 py-2 text-red-500 hover:bg-red-100 w-full text-center"
              >
                Remove Admin
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

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
    getAllAdminData?.count / (queryParams["pagination[limit]"] ?? 10)
  );

  const { isPending: deleteIsPending, deleteSubAdminMutate } =
    useDeleteSubAdmin();

  return (
    <>
      <div className="bg-white p-6 rounded-xl overflow-x-auto">
        <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <h2 className="text-lg font-semibold">Employees/Admin</h2>
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
              placeholder="Search subadmin..."
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
            <Link to="/admin/roles">
              <button className="bg-gradient cursor-pointer text-white px-4 py-3 text-sm rounded-md">
                + Add New Role
              </button>
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#9847FE] cursor-pointer text-white px-4 py-2 text-sm rounded-md"
            >
              + Add a New Admin
            </button>
          </div>
        </div>
        <SubAdminModal
          isOpen={isModalOpen}
          newCategory={newCategory}
          onClose={() => {
            setIsModalOpen(false);
            setNewCategory(null);
          }}
        />

        {activeTab === "table" ? (
          <>
            <ReusableTable
              columns={columns}
              loading={isPending}
              data={SubAdminData}
            />
          </>
        ) : isPending ? (
          <div className=" flex !w-full items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SubAdminData?.map((item) => (
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
                    <div className="absolute cursor-pointer right-0 mt-2 w-32 bg-white rounded-md z-10 border border-gray-200">
                      <Link
                        to={`#`}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        View Details
                      </Link>
                      <button
                        className="block px-4 cursor-pointer py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => console.log("Edit user", item.id)}
                      >
                        Edit User
                      </button>
                      <button
                        className="block px-4 cursor-pointer py-2 text-red-500 hover:bg-red-100 w-full text-left"
                        onClick={() => console.log("Remove user", item.id)}
                      >
                        Remove User
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-center mx-auto">
                  {item?.profile?.profile_picture ? (
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
                  <h3 className="text-[#1E293B] font-medium mb-1">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">{item.userId}</p>
                  <div className="flex items-center justify-center space-x-2 mt-1">
                    <FaPhone className="text-[#9847FE]" size={14} />
                    <span className="text-gray-600 text-sm">{item.phone}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 mt-1">
                    <FaEnvelope className="text-[#9847FE]" size={14} />
                    <span className="text-[#9847FE] text-sm">{item.email}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{item.location}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {item.dateJoined}
                  </p>
                  <button className="bg-[#9847FE] text-white mt-3 px-4 py-2 text-sm rounded-md">
                    Send a Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {SubAdminData?.length > 0 && (
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
      </div>

      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
          onClick={() => {
            setIsAddModalOpen(false);
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
                }}
                className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-4 -mt-7">
              {"Delete Admin"}
            </h3>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                deleteSubAdminMutate(
                  {
                    id: newCategory?.id,
                  },
                  {
                    onSuccess: () => {
                      setIsAddModalOpen(false);
                      setNewCategory(null);
                    },
                  }
                );
              }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Are you sure you want to delete {newCategory?.name}
              </label>
              <div className="flex w-full justify-end gap-4 mt-6">
                <button
                  className="mt-6 cursor-pointer w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 text-sm rounded-md"
                  //   className="bg-gray-300 hover:bg-gray-400 text-gray-800 w-full rounded-md"
                  onClick={() => {
                    setIsAddModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteIsPending}
                  className="mt-6 cursor-pointer w-full bg-gradient text-white px-4 py-3 text-sm rounded-md"
                >
                  {deleteIsPending ? "Please wait..." : "Delete Admin"}
                </button>
              </div>
            </form>
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
                }}
                className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-4 -mt-7">
              {"Suspend Admin"}
            </h3>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                suspendOwnerMutate(
                  {
                    user_id: newCategory?.id,
                    suspension_reason: reason,
                  },
                  {
                    onSuccess: () => {
                      setSuspendModalOpen(false);
                      setNewCategory(null);
                    },
                  }
                );
              }}
            >
              <div>
                <label className="block text-black mb-2">
                  Reasons for suspending
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
                disabled={suspendIsPending}
                className="w-full bg-gradient cursor-pointer text-white py-4 rounded-lg font-normal"
                type="submit"
              >
                {suspendIsPending ? "Please wait..." : "Suspend"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomersTable;
