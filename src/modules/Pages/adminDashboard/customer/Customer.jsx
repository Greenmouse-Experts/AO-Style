import { useState, useEffect, useMemo } from "react";
import ReusableTable from "../components/ReusableTable";
import AddCustomerModal from "../components/AddCustomerModal";
import { FaEllipsisH, FaBars, FaTh } from "react-icons/fa";
import { Link } from "react-router-dom";
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

const CustomersTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("table");
  const [reason, setReason] = useState("");

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const { queryParams, updateQueryParams } = useQueryParams({
    status: "",
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { data: getAllCustomerRepData, isPending } = useGetAllUsersByRole({
    ...queryParams,
    role: "user",
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

  const CustomerData = useMemo(() => {
    if (!getAllCustomerRepData?.data) return [];

    // Remove duplicates based on unique customer ID
    const uniqueCustomers = getAllCustomerRepData.data.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );

    return uniqueCustomers.map((details) => {
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
    });
  }, [getAllCustomerRepData?.data]);

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
      {
        label: "Action",
        key: "action",
        render: (_, row) => (
          <div className="relative">
            <button
              className="bg-gray-10 cursor-pointer alert text-gray-500 px-3 py-1 rounded-md"
              onClick={() => {
                toggleDropdown(row.id);
              }}
            >
              <FaEllipsisH />
            </button>
            {openDropdown === row.id && (
              <div className="dropdown-menu absolute right-0 mt-2 w-50 bg-white rounded-md z-10 border-gray-200">
                <Link
                  to={`/admin/view-customers/${row.id}`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center"
                >
                  View User
                </Link>
                <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center">
                  Edit User
                </button>
                {row?.profile?.approved_by_admin ? (
                  <>
                    <button
                      onClick={() => {
                        setSuspendModalOpen(true);
                        setNewCategory(row);
                        setOpenDropdown(null);
                      }}
                      className="block cursor-pointer px-4 py-2 text-red-500 hover:bg-red-100 w-full text-center"
                    >
                      {"Suspend user"}
                    </button>
                  </>
                ) : (
                  <>
                    {" "}
                    <button
                      onClick={() => {
                        setSuspendModalOpen(true);
                        setNewCategory(row);
                        setOpenDropdown(null);
                      }}
                      className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center"
                    >
                      {"Unsuspend user"}
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteUser(row)}
                  className="block cursor-pointer px-4 py-2 text-red-500 hover:bg-red-100 w-full text-center"
                >
                  Delete User
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown],
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-menu")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <input
            type="text"
            placeholder="Search customers..."
            value={queryString}
            onChange={(evt) =>
              setQueryString(evt.target.value ? evt.target.value : undefined)
            }
            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
          />
          {/* <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Export As ▾
          </button> */}
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
            data={CustomerData?.map((row) => ({
              Name: row.name,
              "Phone Number": row.phone,
              "Email Address": row.email,
              Location: row.location,
              "Date Joined": row.dateJoined,
            }))}
            filename="Customers.csv"
            className="hidden"
          />{" "}
          <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Sort: Newest First ▾
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#9847FE] text-white px-4 py-2 text-sm rounded-md"
          >
            + Add New Customer
          </button>
        </div>
      </div>

      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {activeTab === "table" ? (
        <>
          <ReusableTable
            columns={columns}
            loading={isPending}
            data={CustomerData}
          />
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
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => console.log("Edit user", item.id)}
                    >
                      Edit User
                    </button>
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
                  <>
                    {" "}
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center text-xl font-medium text-white">
                      {item?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  </>
                )}
                <h3 className="text-dark-blue font-medium mb-1 mt-2">
                  {item.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{item.email}</p>
                {/* <div className="flex items-center justify-center space-x-2 mt-2">
                  <span className="text-gray-600 text-sm">
                    User ID: {item.userId}
                  </span>
                </div> */}
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
