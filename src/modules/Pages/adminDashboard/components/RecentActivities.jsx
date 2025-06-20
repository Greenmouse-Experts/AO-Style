import { useState, useEffect } from "react";
import { FaEllipsisH } from "react-icons/fa";
import { Link } from "react-router-dom";
import ReusableTable from "./ReusableTable";

const RecentActivitiesTable = (dataVal) => {
  console.log("dataVal", dataVal?.dataVal?.recentOrders);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dummy Recent Orders Data
  const data = Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    customerName: [
      "Red Ankara Fabric",
      "Red Ankara Fabric",
      "Red Ankara Fabric",
      "Red Ankara Fabric",
    ][i % 4],
    orderDate: "12 Aug 2022 - 12:25 am",
    location: "Jabi, Abuja",
    trackingId: `9348f7${i % 3}`,
    orderTotal: "₦25,000.00",
    action: "View Order",
    status: ["Ongoing", "Cancelled", "Completed"][i % 3],
  }));

  // Table Columns
  const columns = [
    {
      label: "Product Name",
      key: "customerName",
    },
    { label: "Order Date", key: "orderDate" },
    { label: "Location", key: "location" },
    {
      label: "Status",
      key: "status",
      render: (_, row) => (
        <span
          className={`px-3 py-1 text-sm capitalize rounded-md ${
            row?.status === "Completed"
              ? "bg-green-100 text-green-600"
              : row?.status === "Ongoing"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {row?.status}
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
        </div>
      ),
    },
  ];

  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(".dropdown-menu")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  // Pagination Logic
  const filteredData = data.filter((order) =>
    Object.values(order).some(
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
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to page 1 when items per page changes
  };
  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto mt-6">
      <div className="flex flex-wrap justify-between items-center pb-3gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
          />
          <select className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-auto">
            <option>Filter</option>
          </select>
          <select className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-auto">
            <option>Bulk Action</option>
          </select>
        </div>
      </div>
      {dataVal?.dataVal?.recentOrders?.length ? (
        <ReusableTable
          columns={columns}
          data={dataVal?.dataVal?.recentOrders}
        />
      ) : (
        <p className="text-gray-500 text-sm text-center mt-8">
          No recent order
        </p>
      )}
      {/* <div className="flex justify-between items-center mt-4">
        <div className="flex items-center">
          <p className="text-sm text-gray-600">Items per page: </p>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="py-2 px-3 border border-gray-200 ml-2 rounded-md outline-none text-sm w-auto"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
          <p className="text-sm text-gray-600 ml-4">
            {indexOfFirstItem + 1}-
            {indexOfLastItem > filteredData.length
              ? filteredData.length
              : indexOfLastItem}{" "}
            of {filteredData.length} items
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-gray-200"
          >
            ◀
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-gray-200"
          >
            ▶
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default RecentActivitiesTable;
