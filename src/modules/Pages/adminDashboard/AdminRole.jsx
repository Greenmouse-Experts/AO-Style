import { useState, useRef, useEffect } from "react";
import ReusableTable from "./components/ReusableTable";
import { FaEllipsisH } from "react-icons/fa";

const CustomersTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dummy Sub-Admins Data
  const data = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    profile: `https://randomuser.me/api/portraits/thumb/men/${i % 10}.jpg`,
    name: `Admin ${i + 1}`,
    role: [
      "Vendor Manager",
      "Tailor Manager",
      "Delivery Manager",
      "Customer Support",
      "Payment & Finance",
      "Marketing & Promotions",
      "Content & Moderation",
    ][i % 7],
    phone: `+234 80${Math.floor(10000000 + Math.random() * 90000000)}`,
    email: `admin${i + 1}@email.com`,
    location: `Location ${i + 1}`,
    dateJoined: `01/04/25`,
  }));

  // Table Columns
  const columns = [
    { label: "S/N", key: "id" },
    { label: "Admin Role Name", key: "name" },
    { label: "Roles Assigned", key: "role" },
    { label: "Date Added", key: "dateJoined" },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
        <div className="relative" ref={dropdownRef}>
          <button
            className="bg-gray-100 text-gray-500 px-3 py-1 rounded-md"
            onClick={() => toggleDropdown(row.id)}
          >
            <FaEllipsisH />
          </button>
          {openDropdown === row.id && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10 shadow-lg">
              <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                View Details
              </button>
              <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                Edit Admin
              </button>
              <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full">
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

  const filteredData = data.filter((market) =>
    Object.values(market).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
    setItemsPerPage(Number(e.target.value)); // Update items per page
    setCurrentPage(1); // Reset to the first page whenever the items per page is changed
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

  const handleSave = () => {
    console.log("New Role Data:", newRole);
    onClose();
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
                    />
                    Logistics
                  </label>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                handleSave();
                setIsModalOpen(false);
              }}
              className="mt-6 w-full bg-gradient text-white px-6 py-3 text-sm rounded-md"
            >
              Add Admin Role
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersTable;
