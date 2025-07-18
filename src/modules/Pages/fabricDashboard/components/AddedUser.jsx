import { useState, useRef, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import { FaEllipsisH } from "react-icons/fa";
import AddedUser from "../../../../modules/Pages/tailorDashboard/components/AddedUser";

const NewOrders = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Order Data
  const data = [
    {
      id: "01",
      productName: "Red Ankara Fabric",
      orderDate: "15 - 02 - 25",
      location: "Jabi, Abuja",
      status: "Ongoing",
    },
    {
      id: "02",
      productName: "Red Ankara Fabric",
      orderDate: "15 - 02 - 25",
      location: "Jabi, Abuja",
      status: "Ongoing",
    },
    {
      id: "03",
      productName: "Red Ankara Fabric",
      orderDate: "15 - 02 - 25",
      location: "Jabi, Abuja",
      status: "Ongoing",
    },
    {
      id: "04",
      productName: "Red Ankara Fabric",
      orderDate: "15 - 02 - 25",
      location: "Jabi, Abuja",
      status: "Cancelled",
    },
    {
      id: "05",
      productName: "Red Ankara Fabric",
      orderDate: "15 - 02 - 25",
      location: "Jabi, Abuja",
      status: "Ongoing",
    },
    {
      id: "06",
      productName: "Red Ankara Fabric",
      orderDate: "15 - 02 - 25",
      location: "Jabi, Abuja",
      status: "Completed",
    },
  ];

  // Table Columns
  const columns = [
    { label: "#", key: "id" },
    { label: "Product Name", key: "productName" },
    { label: "Order Date", key: "orderDate" },
    { label: "Location", key: "location" },
    {
      label: "Status",
      key: "status",
      render: (_, row) => (
        <span
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            row.status === "Ongoing"
              ? "bg-yellow-100 text-yellow-700"
              : row.status === "Cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
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
            className="text-gray-500 px-3 py-1 rounded-md"
            onClick={() => toggleDropdown(row.id)}
          >
            <FaEllipsisH />
          </button>

          {openDropdown === row.id && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
              <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                View Details
              </button>
              <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                Edit Order
              </button>
              <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full">
                Cancel Order
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const filteredData = data.filter((order) =>
    Object.values(order).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
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

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
        <h2 className="text-lg font-semibold">Order Requests</h2>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          {/* <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
          /> */}
          {/* <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Export As ▾
          </button>
          <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Sort: Newest First ▾
          </button> */}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <AddedUser />
        {/* <ReusableTable columns={columns} data={filteredData} /> */}
      </div>
    </div>
  );
};

export default NewOrders;
