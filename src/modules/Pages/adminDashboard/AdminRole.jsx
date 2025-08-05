import { useState, useRef, useEffect, useMemo } from "react";
import ReusableTable from "./components/ReusableTable";
import { FaEllipsisH } from "react-icons/fa";
import AdminRoleService from "../../../services/api/adminRole";
import { formatDateStr } from "../../../lib/helper";
import useGetAdminRoles from "../../../hooks/admin/useGetAdminRoles";
import useQueryParams from "../../../hooks/useQueryParams";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import { useFormik } from "formik";
import useCreateAdminRole from "../../../hooks/admin/useCreateAdminRole";
import { useModalState } from "../../../hooks/useModalState";
import useDeleteAdminRole from "../../../hooks/admin/useDeleteAdminRole";
import useToast from "../../../hooks/useToast";
import useUpdateAdminRole from "../../../hooks/admin/useUpdateAdminRole";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const roleOptions = [
  { label: "Fabric Vendor Dashboard", value: "fabric-vendor" },
  { label: "Customer Dashboard", value: "user" },
  { label: "Tailor/Designer Dashboard", value: "fashion-designer" },
  { label: "Market Rep Dashboard", value: "market-representative" },
  { label: "Logistics", value: "logistics-agent" },
];

const CustomersTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [adminRoles, setAdminRoles] = useState([]);
  const [posting, setPosting] = useState(false);

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { data, isPending, refetch } = useGetAdminRoles({
    ...queryParams,
  });

  // const { isPending: deleteIsPending, deleteAdminRoleMutate } =
  //   useDeleteAdminRole();

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const [newCategory, setNewCategory] = useState();

  const AdminRoleData = useMemo(
    () =>
      data?.data
        ? data?.data.map((details) => {
            return {
              ...details,
              name: `${details?.name}`,
              roles: ` ${
                details?.role.length > 4
                  ? [details?.role].join(" ,").substring(0, 20) + "..."
                  : [details?.role].join(" ,")
              }`,
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const delete_mutation = useMutation({
    mutationFn: async (id) => {
      let resp = await CaryBinApi.delete(`/admin-role/${id}`);
      return resp.data;
    },
    onSuccess: (res) => refetch(),
    onError: (err) => {
      console.log(err.data.message);
      toast.error(err.data.message);
    },
  });
  // Table Columns
  const columns = useMemo(
    () => [
      // { label: "S/N", key: "sn" },
      { label: "Admin Role Name", key: "title" },
      {
        label: "Roles Assigned",
        key: "role",
        render: (_, row) =>
          Array.isArray(row.role) ? row.role.join(", ") : "",
      },
      {
        label: "Date Added",
        key: "dateAdded",
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
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10 shadow-lg">
                <button className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                  View Role
                </button>
                <button
                  className="block px-4 cursor-pointer py-2 text-gray-700 hover:bg-gray-100 w-full"
                  onClick={() => {
                    setIsModalOpen(true);
                    toggleDropdown(null);

                    setNewCategory(row);
                  }}
                >
                  Edit Role
                </button>
                <button
                  className="block cursor-pointer px-4 py-2 text-red-500 hover:bg-red-100 w-full"
                  onClick={() => {
                    console.log("deleting");
                    console.log(row);
                    toast.promise(
                      async () => await delete_mutation.mutateAsync(row.id),
                      {
                        pending: "deleting",
                        success: `deleted ${row.roles}`,
                        error: "failed",
                      },
                    );
                  }}
                >
                  {"Remove Role"}
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown],
  );

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

  // Filtered and paginated data
  const filteredData = adminRoles.filter((role, idx) => {
    // Add S/N for table
    role.sn = idx + 1;
    return (
      Object.values(role).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase()),
      ) ||
      (Array.isArray(role.role) &&
        role.role.some((r) =>
          r.toLowerCase().includes(searchTerm.toLowerCase()),
        ))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const [newRole, setNewRole] = useState({
    roleName: "",
    assignedRoles: [],
  });

  useEffect(() => {
    if (!isModalOpen) {
      setNewRole({
        roleName: "",
        assignedRoles: [],
      });
    }
  }, [isModalOpen]);

  const initialValues = {
    title: newCategory?.title ?? "",
    role: newCategory?.role ?? [],
  };

  const totalPages = Math.ceil(
    data?.count / (queryParams["pagination[limit]"] ?? 10),
  );
  const { isPending: createIsPending, createAdminRoleMutate } =
    useCreateAdminRole();

  const { isOpen, closeModal, openModal } = useModalState();
  const { toastError } = useToast();

  const { isPending: updateIsPending, updateRoleMutate } = useUpdateAdminRole();

  const navigate = useNavigate();

  const {
    handleSubmit,
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
      if (!val?.role?.length) {
        return toastError("Select a role");
      }

      if (newCategory) {
        updateRoleMutate(
          { ...val, id: newCategory?.id },
          {
            onSuccess: () => {
              resetForm();
              setIsModalOpen(false);
            },
          },
        );
      } else {
        createAdminRoleMutate(val, {
          onSuccess: () => {
            resetForm();
            setIsModalOpen(false);
          },
        });
      }
    },
  });

  const handleCheckboxChange = (value) => {
    const current = values.role;
    const isSelected = current.includes(value);

    const updated = isSelected
      ? current.filter((v) => v !== value)
      : [...current, value];

    setFieldValue("role", updated);
  };

  return (
    <>
      <button
        onClick={() => {
          navigate("/admin/sub-admins");
        }}
        className="bg-gray-100 cursor-pointer text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
      >
        ◀ Back
      </button>
      <div className="bg-white p-6 rounded-xl overflow-x-auto">
        <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <h2 className="text-lg font-semibold">Admin Roles</h2>
            <span className="text-sm text-gray-500">All Admin Roles</span>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
            <input
              type="text"
              placeholder="Search..."
              value={queryString}
              onChange={(evt) =>
                setQueryString(evt.target.value ? evt.target.value : undefined)
              }
              className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
            />
            <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
              Filter
            </button>
            <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
              Bulk Action ▾
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#9847FE] text-white cursor-pointer px-4 py-2 text-sm rounded-md"
            >
              + Add New Role
            </button>
          </div>
        </div>
        <ReusableTable
          loading={isPending}
          columns={columns}
          data={AdminRoleData}
        />
        {AdminRoleData?.length > 0 && (
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

        {isModalOpen && (
          <div
            className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
            onClick={() => {
              setIsModalOpen(false);
              resetForm();

              setNewCategory(null);
            }}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                    setNewCategory(null);
                  }}
                  className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
                  disabled={posting}
                >
                  ×
                </button>
              </div>

              <h3 className="text-lg font-semibold mb-6 -mt-7">
                {newCategory ? `Edit Admin Role` : "Add New Admin Role"}
              </h3>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Admin Role Name
                    </label>
                    <input
                      type="text"
                      name={"title"}
                      required
                      value={values.title}
                      onChange={handleChange}
                      className="w-full p-4 border  border-[#CCCCCC] outline-none rounded-lg"
                      placeholder="Enter the admin role name"
                    />
                  </div>
                  <div>
                    <label className="block  text-sm font-medium text-gray-700 mb-4">
                      Roles Assigned
                    </label>
                    <div className="space-y-4">
                      {roleOptions.map(({ label, value }) => (
                        <label
                          key={value}
                          className="flex cursor-pointer items-center text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            value={value}
                            checked={values.role.includes(value)}
                            onChange={() => handleCheckboxChange(value)}
                            className="mr-2"
                          />
                          {label}
                        </label>
                      ))}{" "}
                    </div>
                  </div>
                </div>

                <button
                  disabled={createIsPending || updateIsPending}
                  type="submit"
                  className="mt-6 w-full cursor-pointer bg-gradient text-white px-6 py-3 text-sm rounded-md"
                >
                  {createIsPending || updateIsPending
                    ? "Please wait..."
                    : newCategory
                      ? "Edit Admin Role"
                      : "Add Admin Role"}
                </button>
              </form>
            </div>
          </div>
        )}

        {isOpen && (
          <div
            className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
            onClick={() => {
              closeModal();
              resetForm();
              setNewCategory(null);
            }}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    closeModal();
                    resetForm();
                    setNewCategory(null);
                  }}
                  className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <h3 className="text-lg font-semibold mb-4 -mt-7">
                {"Delete Role"}
              </h3>
              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  deleteAdminRoleMutate(
                    {
                      id: newCategory?.id,
                    },
                    {
                      onSuccess: () => {
                        closeModal();
                        setNewCategory(null);
                      },
                    },
                  );
                }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Are you sure you want to delete {newCategory?.title}
                </label>
                <div className="flex w-full justify-end gap-4 mt-6">
                  <button
                    className="mt-6 cursor-pointer w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 text-sm rounded-md"
                    //   className="bg-gray-300 hover:bg-gray-400 text-gray-800 w-full rounded-md"
                    onClick={() => {
                      closeModal();
                      setNewCategory(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={deleteIsPending}
                    type="submit"
                    className="mt-6 cursor-pointer w-full bg-gradient text-white px-4 py-3 text-sm rounded-md"
                  >
                    {deleteIsPending ? "Please wait..." : "Delete Role"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomersTable;
