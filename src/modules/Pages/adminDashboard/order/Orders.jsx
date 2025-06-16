import { useState, useRef, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import OrdersSummary from "../components/OrdersSummary";
import { Link } from "react-router-dom";

const OrdersTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const data = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    customerName: [
      "Samuel Johnson",
      "Francis Doe",
      "Christian Dior",
      "Janet Adebayo",
    ][i % 4],
    orderDate: "12 Aug 2022 - 12:25 am",
    product: "Red Fabric",
    trackingId: `9348f7${i % 3}`,
    orderTotal: "₦25,000.00",
    action: "View Order",
    status: ["In Progress", "Pending", "Completed"][i % 3],
  }));

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

  const columns = [
    {
      label: "Customer Name",
      key: "customerName",
      render: (_, row) => (
        <div className="flex items-center">
          <input type="checkbox" className="mr-2" />
          {row.customerName}
        </div>
      ),
    },
    { label: "Order Date", key: "orderDate" },
    { label: "Product", key: "product" },
    { label: "Tracking ID", key: "trackingId" },
    { label: "Order Total", key: "orderTotal" },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
        <Link to={`/admin/orders-details`}>
          <button className="text-purple-500 text-sm hover:underline">
            {row.action}
          </button>
        </Link>
      ),
    },
    {
      label: "Status",
      key: "status",
      render: (status) => (
        <span
          className={`text-sm ${
            status === "In Progress"
              ? "text-blue-500"
              : status === "Pending"
              ? "text-yellow-500"
              : "text-green-500"
          }`}
        >
          {status}
        </span>
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  console.log(filteredData.length);

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

  return (
    <>
      <OrdersSummary />
      <div className="bg-white p-6 rounded-xl overflow-x-auto">
        <div className="flex flex-wrap justify-between items-center pb-3 gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <h2 className="text-lg font-semibold">Customer Orders</h2>
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
        <ReusableTable columns={columns} data={currentItems} />
        <div className="flex justify-between items-center mt-4">
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
        </div>
      </div>
    </>
  );
};

export default OrdersTable;
