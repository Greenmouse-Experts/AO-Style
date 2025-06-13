import React, { useState, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import SalesCards from "../components/SalesCards";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Shirt,
  Wallet,
} from "lucide-react";

const catalogData = [
  {
    id: "1",
    thumbnail: "https://randomuser.me/api/portraits/thumb/men/1.jpg",
    styleName: "D4 Agbada",
    category: "Agbada",
    sewingTime: "7 Days",
    price: "₦105,000",
    status: "Active",
  },
  {
    id: "2",
    thumbnail: "https://randomuser.me/api/portraits/thumb/men/2.jpg",
    styleName: "D4 Agbada",
    category: "Agbada",
    sewingTime: "7 Days",
    price: "₦105,000",
    status: "Active",
  },
  {
    id: "3",
    thumbnail: "https://randomuser.me/api/portraits/thumb/men/3.jpg",
    styleName: "D4 Agbada",
    category: "Agbada",
    sewingTime: "7 Days",
    price: "₦105,000",
    status: "Unpublished",
  },
  {
    id: "4",
    thumbnail: "https://randomuser.me/api/portraits/thumb/men/4.jpg",
    styleName: "D4 Agbada",
    category: "Agbada",
    sewingTime: "7 Days",
    price: "₦105,000",
    status: "Published",
  },
];

const ordersData = [
  {
    id: "1",
    orderId: "EWREI12324NH",
    customer: "Frank Samuel",
    styleName: "Native Agbada",
    status: "Active",
    date: "12/06/25",
    total: "₦105,000",
  },
  {
    id: "2",
    orderId: "EWREI12324NH",
    customer: "Frank Samuel",
    styleName: "Native Agbada",
    status: "Completed",
    date: "12/06/25",
    total: "₦105,000",
  },
  {
    id: "3",
    orderId: "EWREI12324NH",
    customer: "Frank Samuel",
    styleName: "Native Agbada",
    status: "Cancelled",
    date: "12/06/25",
    total: "₦105,000",
  },
  {
    id: "4",
    orderId: "EWREI12324NH",
    customer: "Frank Samuel",
    styleName: "Native Agbada",
    status: "Ongoing",
    date: "12/06/25",
    total: "₦105,000",
  },
];

const ViewCustomer = () => {
  const [catalogFilter, setCatalogFilter] = useState("all");
  const [ordersFilter, setOrdersFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [catalogPage, setCatalogPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const itemsPerPage = 4;

  // Filter Catalog Data
  const filteredCatalog = catalogData.filter((item) => {
    if (catalogFilter === "all") return true;
    if (catalogFilter === "published") return item.status === "Published";
    if (catalogFilter === "unpublished") return item.status === "Unpublished";
    return true;
  });

  // Filter Orders Data
  const filteredOrders = ordersData.filter(
    (order) =>
      (ordersFilter === "all" || order.status.toLowerCase() === ordersFilter) &&
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const catalogColumns = [
    { label: "S/N", key: "id" },
    {
      label: "Thumbnail Image ",
      key: "thumbnail",
      render: (thumbnail) => (
        <img src={thumbnail} alt="style" className="w-15 h-15 rounded-md" />
      ),
    },
    { label: "Style Name", key: "styleName" },
    { label: "Categories", key: "category" },
    { label: "Sewing Time", key: "sewingTime" },
    { label: "Price", key: "price" },
    {
      label: "Status ",
      key: "status",
      render: (status) => (
        <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
          {status}
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
        <div className="relative">
          <button
            onClick={() =>
              setOpenDropdown(
                openDropdown === `catalog-${row.id}`
                  ? null
                  : `catalog-${row.id}`
              )
            }
            className="px-2 py-1 cursor-pointer rounded-md text-gray-600"
          >
            •••
          </button>
          {openDropdown === `catalog-${row.id}` && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
              <Link to={`/tailor/catalog/${row.id}`}>
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  View Details
                </button>
              </Link>
              <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                Edit Style
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const ordersColumns = [
    { label: "S/N", key: "id" },
    { label: "ORDER ID", key: "orderId" },
    { label: "CUSTOMER", key: "customer" },
    { label: "STYLE NAME", key: "styleName" },
    {
      label: "STATUS",
      key: "status",
      render: (status) => (
        <span
          className={`px-3 py-1 text-sm rounded-full ${
            status === "Ongoing"
              ? "bg-yellow-100 text-yellow-700"
              : status === "Cancelled"
              ? "bg-red-100 text-red-700"
              : status === "Completed"
              ? "bg-green-100 text-green-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {status}
        </span>
      ),
    },
    { label: "DATE", key: "date" },
    { label: "TOTAL", key: "total" },
    {
      label: "ACTION",
      key: "action",
      render: (_, row) => (
        <div className="relative">
          <button
            onClick={() =>
              setOpenDropdown(
                openDropdown === `order-${row.id}` ? null : `order-${row.id}`
              )
            }
            className="px-2 py-1 cursor-pointer rounded-md text-gray-600"
          >
            •••
          </button>
          {openDropdown === `order-${row.id}` && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
              <Link to={`/customer/orders/orders-details/${row.id}`}>
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  View Details
                </button>
              </Link>
              <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                Cancel Order
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const customerColumns = [
    {
      label: "Full Name",
      key: "fullName",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.profile}
            alt="profile"
            className="w-10 h-10 rounded-full"
          />
          <span>{row.fullName}</span>
        </div>
      ),
    },
    {
      label: "KYC",
      key: "kyc",
      render: (kyc) => (
        <span className="text-purple-600 cursor-pointer hover:underline">
          {kyc}
        </span>
      ),
    },
    { label: "Email Address", key: "email" },
    { label: "Phone Number", key: "phone" },
    { label: "Address", key: "address" },
    { label: "Total Onboarded", key: "onboarded" },
    { label: "DATE JOINED", key: "dateJoined" },
    {
      label: "ACTION",
      key: "action",
      render: (_, row) => (
        <div className="relative">
          <button
            onClick={() =>
              setOpenDropdown(
                openDropdown === `customer-${row.id}`
                  ? null
                  : `customer-${row.id}`
              )
            }
            className="px-2 py-1 cursor-pointer rounded-md text-gray-600"
          >
            •••
          </button>
          {openDropdown === `customer-${row.id}` && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
              <Link to={`/admin/view-customers/${row.id}`}>
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  View Details
                </button>
              </Link>
              <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                Edit User
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const customerData = [
    {
      id: "1",
      fullName: "Emeka Okafor",
      profile: "https://randomuser.me/api/portraits/thumb/men/1.jpg",
      kyc: "See KYC",
      email: "testmail@gmail.com",
      phone: "+234 803 456 7890",
      address: "12, Allen Avenue, Ikeja, Lagos",
      onboarded: "240 Users",
      dateJoined: "22/5/2025",
    },
  ];

  // Pagination for Catalog
  const catalogTotalPages = Math.ceil(filteredCatalog.length / itemsPerPage);
  const catalogStartIndex = (catalogPage - 1) * itemsPerPage;
  const catalogCurrentItems = filteredCatalog.slice(
    catalogStartIndex,
    catalogStartIndex + itemsPerPage
  );

  // Pagination for Orders
  const ordersTotalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const ordersStartIndex = (ordersPage - 1) * itemsPerPage;
  const ordersCurrentItems = filteredOrders.slice(
    ordersStartIndex,
    ordersStartIndex + itemsPerPage
  );

  // Reset page when filter changes
  useEffect(() => {
    setCatalogPage(1);
  }, [catalogFilter]);

  useEffect(() => {
    setOrdersPage(1);
  }, [ordersFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-menu")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="">
        {/* Customer Info Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">
              View Market Rep :{" "}
              <span className="text-purple-600 font-medium">Hamzat Abdul</span>
            </h2>
            <p className="text-sm font-medium text-gray-600">
              KYC: <span className="text-green-600 font-medium">Approved</span>
            </p>
          </div>
          <SalesCards />
          <div className="bg-white rounded-lg">
            <ReusableTable columns={customerColumns} data={customerData} />
          </div>
        </div>

        {/* Tailor/Designer Catalog */}
        <div className="bg-white p-6 rounded-lg mb-6">
          <h2 className="font-medium text-gray-800 mb-4">
            Tailor/Designer Catalog
          </h2>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
              {["all", "published", "unpublished"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCatalogFilter(tab)}
                  className={`font-medium capitalize px-3 py-1 ${
                    catalogFilter === tab
                      ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                      : "text-gray-500"
                  }`}
                >
                  {tab} Styles
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full sm:w-[200px] pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md text-sm">
                Export As ▼
              </button>
              <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">
                Sort: Newest First ▼
              </button>
            </div>
          </div>
          <ReusableTable columns={catalogColumns} data={catalogCurrentItems} />
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing 1 to {catalogCurrentItems.length} of{" "}
              {filteredCatalog.length} entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCatalogPage((page) => Math.max(page - 1, 1))}
                disabled={catalogPage === 1}
                className="p-2 bg-gray-200 rounded-full"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(catalogTotalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCatalogPage(i + 1)}
                  className={`px-3 py-1 rounded-full ${
                    catalogPage === i + 1
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCatalogPage((page) =>
                    Math.min(page + 1, catalogTotalPages)
                  )
                }
                disabled={catalogPage === catalogTotalPages}
                className="p-2 bg-gray-200 rounded-full"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewCustomer;
