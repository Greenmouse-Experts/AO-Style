import { useState, useRef, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import { FaEllipsisH } from "react-icons/fa";
import useGetAllMarketRepVendors from "../../../../hooks/marketRep/useGetAllMarketRepVendors";

const NewlyAddedUsers = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all vendors data from API (fabric vendors + fashion designers)
  const { data: vendorsData, isLoading, isError } = useGetAllMarketRepVendors();

  // Transform API data to match table structure
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, "-");
  };

  const getUserType = (role) => {
    if (role?.name === "Fabric Vendor") return "Vendor";
    if (role?.name?.includes("Fashion") || role?.name?.includes("Tailor"))
      return "Tailor/Designer";
    return role?.name || "Unknown";
  };

  const getStatus = () => {
    // Since the API doesn't include status, we'll show "Approved" for all
    // You can modify this logic based on your business rules
    return "Approved";
  };

  const transformedData =
    vendorsData?.data?.map((user, index) => ({
      id: String(index + 1).padStart(2, "0"),
      name: user.name,
      userType: getUserType(user.role),
      dateAdded: formatDate(user.created_at),
      status: getStatus(),
      originalData: user, // Keep original data for actions
    })) || [];

  // Table Columns
  const columns = [
    { label: "#", key: "id" },
    { label: "Name", key: "name" },
    { label: "User Type", key: "userType" },
    { label: "Date Added", key: "dateAdded" },
    {
      label: "Status",
      key: "status",
      render: (_, row) => (
        <span
          className={`px-3 py-1 text-sm rounded-md ${
            row.status === "Approved"
              ? "bg-green-100 text-green-600"
              : row.status === "Pending"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-red-100 text-red-600"
          }`}
        >
          {row.status}
        </span>
      ),
    },
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
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10">
              <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                View Details
              </button>
              <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                Edit User
              </button>
              <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full">
                Remove User
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const filteredData = transformedData.filter((user) =>
    Object.values(user).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  // Toggle dropdown function
  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

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

  if (isError) {
    return (
      <div className="bg-white p-6 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Newly Added Users</h2>
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load users data</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
        <h2 className="text-lg font-semibold">Newly Added Users</h2>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
          />
          <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Export As ▾
          </button>
          <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Sort: Newest First ▾
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading users...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && filteredData.length > 0 && (
        <div className="overflow-x-auto">
          <ReusableTable columns={columns} data={filteredData} />
        </div>
      )}
    </div>
  );
};

export default NewlyAddedUsers;
