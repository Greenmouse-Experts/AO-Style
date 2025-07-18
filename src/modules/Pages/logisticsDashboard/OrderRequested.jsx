import { useState, useRef, useEffect } from "react";
import ReusableTable from "../logisticsDashboard/components/ReusableTable";
import { FaTimes, FaCheck, FaMapMarkerAlt, FaEllipsisH } from "react-icons/fa";
import { Link } from "react-router-dom";

const OrderRequests = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Order Data
  const data = [
    {
      id: "01",
      orderId: "FWERIO1234FNK",
      orderDate: "15 - 02 - 25",
      deliveryDate: "19 - 02 - 25",
      pickup: "Lekki, Lagos",
      destination: "Ogba, Ikeja",
      price: "N 7000",
    },
    {
      id: "02",
      orderId: "FWERIO1234FNK",
      orderDate: "15 - 02 - 25",
      deliveryDate: "19 - 02 - 25",
      pickup: "Lekki, Lagos",
      destination: "Ogba, Ikeja",
      price: "N 7000",
    },
    {
      id: "03",
      orderId: "FWERIO1234FNK",
      orderDate: "15 - 02 - 25",
      deliveryDate: "19 - 02 - 25",
      pickup: "Lekki, Lagos",
      destination: "Ogba, Ikeja",
      price: "N 7000",
    },
    {
      id: "04",
      orderId: "FWERIO1234FNK",
      orderDate: "15 - 02 - 25",
      deliveryDate: "19 - 02 - 25",
      pickup: "Lekki, Lagos",
      destination: "Ogba, Ikeja",
      price: "N 7000",
    },
    {
      id: "05",
      orderId: "FWERIO1234FNK",
      orderDate: "15 - 02 - 25",
      deliveryDate: "19 - 02 - 25",
      pickup: "Lekki, Lagos",
      destination: "Ogba, Ikeja",
      price: "N 7000",
    },
    {
      id: "06",
      orderId: "FWERIO1234FNK",
      orderDate: "15 - 02 - 25",
      deliveryDate: "19 - 02 - 25",
      pickup: "Lekki, Lagos",
      destination: "Ogba, Ikeja",
      price: "N 7000",
    },
  ];

  // Table Columns
  const columns = [
    { label: "#", key: "id" },
    { label: "Order ID", key: "orderId" },
    { label: "Order Date", key: "orderDate" },
    { label: "Delivery Date", key: "deliveryDate" },
    {
      label: "Location",
      key: "location",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <FaMapMarkerAlt className="text-red-500" />
          <span>{row.pickup}</span>
          <span className="text-gray-400 px-1">--------</span>
          <FaMapMarkerAlt className="text-green-500" />
          <span>{row.destination}</span>
        </div>
      ),
    },
    { label: "Price", key: "price" },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
        <div className="relative flex gap-2" ref={dropdownRef}>
          <button className="bg-red-100 text-red-500 px-3 py-1 rounded-md">
            <FaTimes />
          </button>
          <button className="bg-green-100 text-green-500 px-3 py-1 rounded-md">
            <FaCheck />
          </button>
          <button
            className="bg-gray-100 text-gray-500 px-3 py-1 rounded-md"
            onClick={() => toggleDropdown(row.id)}
          >
            <FaEllipsisH />
          </button>
          {openDropdown === row.id && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-md z-10">
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

  // Filtering the data based on search input
  const filteredData = data.filter((order) =>
    Object.values(order).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle dropdown
  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

  return (
    <>
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-2xl font-medium mb-3">Orders Requests</h1>
        <p className="text-gray-500">
          <Link to="/logistics" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Orders Requests
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
          <h2 className="text-lg font-semibold">Order Requests</h2>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 py-2 px-3 border border-gray-200 rounded-md outline-none text-sm"
            />
            <button className="w-full sm:w-auto bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md">
              Export As ▾
            </button>
            <button className="w-full sm:w-auto bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md">
              Sort: Newest First ▾
            </button>
          </div>
        </div>

        {/* Table */}
        <ReusableTable columns={columns} data={filteredData} />
      </div>
    </>
  );
};

export default OrderRequests;
