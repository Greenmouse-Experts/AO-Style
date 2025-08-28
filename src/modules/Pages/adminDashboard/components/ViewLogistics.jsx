import React, { useState, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import { Link, useParams } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Shirt,
  Wallet,
} from "lucide-react";
import useGetUser from "../../../../hooks/user/useGetSingleUser";
import Loader from "../../../../components/ui/Loader";
import { formatDateStr } from "../../../../lib/helper";

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

const ViewLogistics = () => {
  const { tailorId } = useParams();

  const { isPending, data } = useGetUser(tailorId);

  const userData = data?.data?.user;

  const businessData = data?.data?.business;

  console.log(businessData);

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
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()),
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
                  : `catalog-${row.id}`,
              )
            }
            className="px-2 py-1 cursor-pointer rounded-md text-gray-600"
          >
            •••
          </button>
          {openDropdown === `catalog-${row.id}` && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
              <Link
                state={{ info: row.id }}
                to={`/admin/logistics/view?tab=personal`}
              >
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
                openDropdown === `order-${row.id}` ? null : `order-${row.id}`,
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

  const customerColumns = React.useMemo(
    (val) => [
      {
        label: "FULL NAME",
        key: "fullName",
        render: (_, row) => (
          <div className="flex items-center gap-3">
            {row.profile ? (
              <img
                src={row.profile}
                alt="profile"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-white">
                {row?.fullName?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <span>{row.fullName}</span>
          </div>
        ),
      },
      {
        label: "KYC",
        key: "kyc",
        render: (kyc, row) => (
          <Link
            state={{ info: row.id }}
            to={`/admin/logistics/view?tab=personal`}
          >
            <span className="text-purple-600 cursor-pointer hover:underline">
              {kyc}
            </span>
          </Link>
        ),
      },

      { label: "EMAIL ADDRESS", key: "email" },
      { label: "PHONE NUMBER", key: "phone" },
      { label: "ADDRESS", key: "address" },
      { label: "DATE JOINED", key: "dateJoined" },
      {
        label: "ACTION",
        key: "action",
        render: (_, row) => (
          <div className="dropdown-menu">
            <button
              onClick={() =>
                setOpenDropdown(
                  openDropdown === `customer-${row.id}`
                    ? null
                    : `customer-${row.id}`,
                )
              }
              className="px-2 py-1 z-[9999] cursor-pointer rounded-md text-gray-600"
            >
              •••
            </button>
            {openDropdown === `customer-${row.id}` && (
              <div className="absolute right-2 mt-2 w-40 bg-white shadow-md rounded-md z-10">
                <Link
                  state={{ info: row.id }}
                  to={`/admin/logistics/view?tab=personal`}
                >
                  <button className="block cursor-pointer w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
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
    ],
    [openDropdown, businessData],
  );

  const customerData = React.useMemo(
    () => [
      {
        ...userData,
        ...businessData,
        id: userData?.id ?? "",
        fullName: userData?.name ?? "",
        profile: userData?.profile?.profile_picture ?? null,
        kyc: "See KYC",
        email: userData?.email ?? "",
        phone: userData?.phone ?? "",
        address: userData?.profile?.address ?? "",
        dateJoined: userData?.created_at
          ? formatDateStr(userData?.created_at.split(".").shift())
          : "",
      },
    ],
    [userData, businessData],
  );

  // Pagination for Catalog
  const catalogTotalPages = Math.ceil(filteredCatalog.length / itemsPerPage);
  const catalogStartIndex = (catalogPage - 1) * itemsPerPage;
  const catalogCurrentItems = filteredCatalog.slice(
    catalogStartIndex,
    catalogStartIndex + itemsPerPage,
  );

  // Pagination for Orders
  const ordersTotalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const ordersStartIndex = (ordersPage - 1) * itemsPerPage;
  const ordersCurrentItems = filteredOrders.slice(
    ordersStartIndex,
    ordersStartIndex + itemsPerPage,
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
      // Only close if the click is outside any dropdown or dropdown button
      if (
        !event.target.closest(".dropdown-menu") &&
        !event.target.closest(".dropdown-trigger")
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  if (isPending) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="">
      {/* Customer Info Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">
            View Logistics:{" "}
            <span className="text-purple-600 font-medium">
              {userData?.name}
            </span>
          </h2>
          {businessData?.kyc?.is_approved ? (
            <p className="text-sm font-medium text-gray-600">
              KYC: <span className="text-green-600 font-medium">Approved</span>
            </p>
          ) : (
            <></>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Users Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                +12%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Active Users
            </h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">15</p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="text-green-600 font-medium">↗ 8.2%</span>
              <span className="ml-1">vs last week</span>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                +15%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total Revenue
            </h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">₦200,000</p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="text-green-600 font-medium">↗ 15.3%</span>
              <span className="ml-1">vs last month</span>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                -3%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total Orders
            </h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">12</p>
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-500">
                <span className="text-orange-600 font-medium">↘ 3.1%</span>
                <span className="ml-1">vs last week</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Pending: 3</span>
              <span className="text-xs text-gray-500">Completed: 5</span>
            </div>
          </div>

          {/* Engagement Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-pink-50 rounded-lg">
                <svg
                  className="w-6 h-6 text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                +22%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Engagement Rate
            </h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">68.4%</p>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <span className="text-green-600 font-medium">↗ 22.1%</span>
              <span className="ml-1">vs last month</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-pink-400 h-2 rounded-full"
                style={{ width: "68.4%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg">
        <ReusableTable columns={customerColumns} data={customerData} />
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
                setCatalogPage((page) => Math.min(page + 1, catalogTotalPages))
              }
              disabled={catalogPage === catalogTotalPages}
              className="p-2 bg-gray-200 rounded-full"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Handled */}
      <div className="bg-white p-6 rounded-lg">
        <h2 className="font-medium text-gray-800 mb-4">Orders Handled</h2>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
            {["all", "ongoing", "completed", "cancelled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setOrdersFilter(tab)}
                className={`font-medium capitalize px-3 py-1 ${
                  ordersFilter === tab
                    ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                    : "text-gray-500"
                }`}
              >
                {tab} Orders
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
        <ReusableTable columns={ordersColumns} data={ordersCurrentItems} />
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            Showing 1 to {ordersCurrentItems.length} of {filteredOrders.length}{" "}
            entries
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOrdersPage((page) => Math.max(page - 1, 1))}
              disabled={ordersPage === 1}
              className="p-2 bg-gray-200 rounded-full"
            >
              <ChevronLeft size={16} />
            </button>
            {[...Array(ordersTotalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setOrdersPage(i + 1)}
                className={`px-3 py-1 rounded-full ${
                  ordersPage === i + 1
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setOrdersPage((page) => Math.min(page + 1, ordersTotalPages))
              }
              disabled={ordersPage === ordersTotalPages}
              className="p-2 bg-gray-200 rounded-full"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLogistics;
