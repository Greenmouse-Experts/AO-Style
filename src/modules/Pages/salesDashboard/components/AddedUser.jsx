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

  console.log("This is the newly added users", vendorsData)

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
    // {
    //   label: "Status",
    //   key: "status",
    //   render: (_, row) => (
    //     <span
    //       className={`px-3 py-1 text-sm rounded-md ${
    //         row.status === "Approved"
    //           ? "bg-green-100 text-green-600"
    //           : row.status === "Pending"
    //             ? "bg-yellow-100 text-yellow-600"
    //             : "bg-red-100 text-red-600"
    //       }`}
    //     >
    //       {row.status}
    //     </span>
    //   ),
    // },
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
        <div className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unable to Load Users
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              We encountered an issue while loading your users. Please check your connection and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gradient text-white rounded-md hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
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
        <div className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No Users Match Your Search" : "No Users Added Yet"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              {searchTerm
                ? "Try adjusting your search terms or clear the search to see all users."
                : "Start by adding fabric vendors or fashion designers to see them listed here."}
            </p>
            {!searchTerm && (
              <div className="flex gap-3">
                <a
                  href="/sales/add-fabric-vendors"
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                >
                  Add Fabric Vendor
                </a>
                <a
                  href="/sales/add-fashion-designers"
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                >
                  Add Fashion Designer
                </a>
              </div>
            )}
          </div>
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
