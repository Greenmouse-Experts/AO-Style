import { useState, useRef, useEffect } from "react";
import ReusableTable from "./components/ReusableTable";
import { FaEllipsisH } from "react-icons/fa";
import AdminRoleService from "../../../services/api/adminRole";
import { formatDateStr } from "../../../lib/helper";

const CustomersTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [adminRoles, setAdminRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRoleId, setEditRoleId] = useState(null);
  const [editRole, setEditRole] = useState({ roleName: "", assignedRoles: [] });
  const [editLoading, setEditLoading] = useState(false);
  const [editPosting, setEditPosting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch admin roles from API
  const fetchAdminRoles = async () => {
    setLoading(true);
    try {
      const res = await AdminRoleService.getAdminRoles();
      setAdminRoles(res?.data?.data || []);
    } catch (err) {
      // Optionally handle error
      setAdminRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminRoles();
  }, []);

  // Table Columns
  const columns = [
    { label: "S/N", key: "sn" },
    { label: "Admin Role Name", key: "title" },
    {
      label: "Roles Assigned",
      key: "role",
      render: (_, row) => (Array.isArray(row.role) ? row.role.join(", ") : ""),
    },
    {
      label: "Date Added",
      key: "createdAt",
      render: (_, row) => (row.createdAt ? formatDateStr(row.createdAt) : "-"),
    },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
        <div className="relative" ref={dropdownRef}>
          <button
            className="bg-gray-100 text-gray-500 px-3 py-1 rounded-md"
            onClick={() => toggleDropdown(row._id)}
          >
            <FaEllipsisH />
          </button>
          {openDropdown === row._id && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10 shadow-lg">
              <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                View Details
              </button>
              <button
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                onClick={async () => {
                  setEditRoleId(row._id);
                  setEditModalOpen(true);
                  setEditLoading(true);
                  try {
                    const res = await AdminRoleService.getAdminRoleById(
                      row._id
                    );
                    const data = res?.data?.data;
                    setEditRole({
                      roleName: data?.title || "",
                      assignedRoles: Array.isArray(data?.role)
                        ? data.role.map((r) => {
                            switch (r) {
                              case "fabric-vendor":
                                return "Fabric Vendor Dashboard";
                              case "customer":
                                return "Customer Dashboard";
                              case "fashion-designer":
                                return "Tailor/Designer Dashboard";
                              case "market-representative":
                                return "Market Rep Dashboard";
                              case "logistics-agent":
                                return "Logistics";
                              default:
                                return r;
                            }
                          })
                        : [],
                    });
                  } catch (err) {
                    setEditRole({ roleName: "", assignedRoles: [] });
                  } finally {
                    setEditLoading(false);
                  }
                }}
              >
                Edit Admin
              </button>
              <button
                className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full"
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this admin role?"
                    )
                  ) {
                    setDeletingId(row._id);
                    try {
                      await AdminRoleService.deleteAdminRole(row._id);
                      fetchAdminRoles();
                    } catch (err) {
                      // Optionally handle error
                    } finally {
                      setDeletingId(null);
                      setOpenDropdown(null);
                    }
                  }
                }}
                disabled={deletingId === row._id}
              >
                {deletingId === row._id ? "Removing..." : "Remove Admin"}
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

  // Filtered and paginated data
  const filteredData = adminRoles.filter((role, idx) => {
    // Add S/N for table
    role.sn = idx + 1;
    return (
      Object.values(role).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (Array.isArray(role.role) &&
        role.role.some((r) =>
          r.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRole((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setNewRole((prev) => ({
      ...prev,
      assignedRoles: checked
        ? [...prev.assignedRoles, value]
        : prev.assignedRoles.filter((role) => role !== value),
    }));
  };

  // POST new admin role
  const handleSave = async () => {
    setPosting(true);
    try {
      await AdminRoleService.createAdminRole({
        title: newRole.roleName,
        role: newRole.assignedRoles.map((r) => {
          // Map UI values to API values
          switch (r) {
            case "Fabric Vendor Dashboard":
              return "fabric-vendor";
            case "Customer Dashboard":
              return "customer";
            case "Tailor/Designer Dashboard":
              return "fashion-designer";
            case "Market Rep Dashboard":
              return "market-representative";
            case "Logistics":
              return "logistics-agent";
            default:
              return r;
          }
        }),
      });
      setIsModalOpen(false);
      fetchAdminRoles();
    } catch (err) {
      // Optionally handle error
    } finally {
      setPosting(false);
    }
  };

  // Edit modal handlers
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditRole((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setEditRole((prev) => ({
      ...prev,
      assignedRoles: checked
        ? [...prev.assignedRoles, value]
        : prev.assignedRoles.filter((role) => role !== value),
    }));
  };
  const handleEditSave = async () => {
    setEditPosting(true);
    try {
      await AdminRoleService.updateAdminRole(editRoleId, {
        title: editRole.roleName,
        role: editRole.assignedRoles.map((r) => {
          switch (r) {
            case "Fabric Vendor Dashboard":
              return "fabric-vendor";
            case "Customer Dashboard":
              return "customer";
            case "Tailor/Designer Dashboard":
              return "fashion-designer";
            case "Market Rep Dashboard":
              return "market-representative";
            case "Logistics":
              return "logistics-agent";
            default:
              return r;
          }
        }),
      });
      setEditModalOpen(false);
      fetchAdminRoles();
    } catch (err) {
      // Optionally handle error
    } finally {
      setEditPosting(false);
    }
  };

  return (
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            className="bg-[#9847FE] text-white px-4 py-2 text-sm rounded-md"
          >
            + Add New Role
          </button>
        </div>
      </div>
      <ReusableTable columns={columns} data={currentItems} />
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-auto"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
          <span className="text-sm text-gray-600">
            {indexOfFirstItem + 1}-
            {indexOfLastItem > filteredData.length
              ? filteredData.length
              : indexOfLastItem}{" "}
            of {filteredData.length} items
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md bg-gray-200 disabled:opacity-50"
          >
            ◀
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md bg-gray-200 disabled:opacity-50"
          >
            ▶
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                disabled={posting}
              >
                ×
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-6 -mt-7">
              Add New Admin Roles
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Admin Role Name
                </label>
                <input
                  type="text"
                  name="roleName"
                  value={newRole.roleName}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  placeholder="Enter the admin role name"
                  disabled={posting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Roles Assigned
                </label>
                <div className="space-y-4">
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      value="Fabric Vendor Dashboard"
                      checked={newRole.assignedRoles.includes(
                        "Fabric Vendor Dashboard"
                      )}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                      disabled={posting}
                    />
                    Fabric Vendor Dashboard
                  </label>
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      value="Customer Dashboard"
                      checked={newRole.assignedRoles.includes(
                        "Customer Dashboard"
                      )}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                      disabled={posting}
                    />
                    Customer Dashboard
                  </label>
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      value="Tailor/Designer Dashboard"
                      checked={newRole.assignedRoles.includes(
                        "Tailor/Designer Dashboard"
                      )}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                      disabled={posting}
                    />
                    Tailor/Designer Dashboard
                  </label>
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      value="Market Rep Dashboard"
                      checked={newRole.assignedRoles.includes(
                        "Market Rep Dashboard"
                      )}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                      disabled={posting}
                    />
                    Market Rep Dashboard
                  </label>
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      value="Logistics"
                      checked={newRole.assignedRoles.includes("Logistics")}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                      disabled={posting}
                    />
                    Logistics
                  </label>
                </div>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="mt-6 w-full bg-gradient text-white px-6 py-3 text-sm rounded-md"
              disabled={posting}
            >
              {posting ? "Adding..." : "Add Admin Role"}
            </button>
          </div>
        </div>
      )}
      {/* Edit Admin Modal */}
      {editModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
          onClick={() => setEditModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                disabled={editPosting}
              >
                ×
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-6 -mt-7">
              Edit Admin Role
            </h3>
            {editLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Admin Role Name
                  </label>
                  <input
                    type="text"
                    name="roleName"
                    value={editRole.roleName}
                    onChange={handleEditInputChange}
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                    placeholder="Enter the admin role name"
                    disabled={editPosting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Roles Assigned
                  </label>
                  <div className="space-y-4">
                    <label className="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        value="Fabric Vendor Dashboard"
                        checked={editRole.assignedRoles.includes(
                          "Fabric Vendor Dashboard"
                        )}
                        onChange={handleEditCheckboxChange}
                        className="mr-2"
                        disabled={editPosting}
                      />
                      Fabric Vendor Dashboard
                    </label>
                    <label className="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        value="Customer Dashboard"
                        checked={editRole.assignedRoles.includes(
                          "Customer Dashboard"
                        )}
                        onChange={handleEditCheckboxChange}
                        className="mr-2"
                        disabled={editPosting}
                      />
                      Customer Dashboard
                    </label>
                    <label className="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        value="Tailor/Designer Dashboard"
                        checked={editRole.assignedRoles.includes(
                          "Tailor/Designer Dashboard"
                        )}
                        onChange={handleEditCheckboxChange}
                        className="mr-2"
                        disabled={editPosting}
                      />
                      Tailor/Designer Dashboard
                    </label>
                    <label className="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        value="Market Rep Dashboard"
                        checked={editRole.assignedRoles.includes(
                          "Market Rep Dashboard"
                        )}
                        onChange={handleEditCheckboxChange}
                        className="mr-2"
                        disabled={editPosting}
                      />
                      Market Rep Dashboard
                    </label>
                    <label className="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        value="Logistics"
                        checked={editRole.assignedRoles.includes("Logistics")}
                        onChange={handleEditCheckboxChange}
                        className="mr-2"
                        disabled={editPosting}
                      />
                      Logistics
                    </label>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleEditSave}
              className="mt-6 w-full bg-gradient text-white px-6 py-3 text-sm rounded-md"
              disabled={editPosting || editLoading}
            >
              {editPosting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersTable;
