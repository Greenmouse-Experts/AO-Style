import React, { useState } from "react";
import ReusableTable from "../components/ReusableTable";
import { Link, useParams } from "react-router-dom";
import { Search } from "lucide-react";
import useGetUser from "../../../../hooks/user/useGetSingleUser";
import useGetOrder from "../../../../hooks/order/useGetOrder";
import Loader from "../../../../components/ui/Loader";
import { formatDateStr } from "../../../../lib/helper";
import ReviewList from "../../../../components/reviews/ReviewList";
import CustomBackbtn from "../../../../components/CustomBackBtn";

// Static orders removed - now using real API data

const ViewCustomer = () => {
  const { id } = useParams();

  const { isPending: getUserIsPending, data } = useGetUser(id);
  const { isPending: ordersLoading, data: ordersData } = useGetOrder();
  const [activeReviewModal, setActiveReviewModal] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Console log the admin customer orders data
  console.log("🔍 Admin ViewCustomer - Full API Response:", ordersData);
  console.log("🔍 Admin ViewCustomer - All Orders Data:", ordersData?.data);
  console.log(
    "🔍 Admin ViewCustomer - Total Orders Count:",
    ordersData?.data?.length,
  );
  console.log("🔍 Admin ViewCustomer - Customer ID:", id);

  // Process real order data
  const allOrders = ordersData?.data || [];

  // Filter orders for this specific customer
  const customerOrders = allOrders.filter((order) => order.user_id === id);

  console.log("🔍 Admin ViewCustomer - Customer Orders:", customerOrders);
  console.log(
    "🔍 Admin ViewCustomer - Customer Orders Count:",
    customerOrders.length,
  );

  if (customerOrders.length > 0) {
    console.log(
      "🔍 Admin ViewCustomer - First Customer Order:",
      customerOrders[0],
    );
    console.log(
      "🔍 Admin ViewCustomer - Payment Structure:",
      customerOrders[0]?.payment,
    );
    console.log(
      "🔍 Admin ViewCustomer - Purchase Items:",
      customerOrders[0]?.payment?.purchase?.items,
    );
  }

  const filteredOrders = customerOrders.filter((order) => {
    const statusMatch =
      filter === "all" ||
      (filter === "ongoing" &&
        ["PROCESSING", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(
          order.status,
        )) ||
      (filter === "completed" && order.status === "DELIVERED") ||
      (filter === "cancelled" && order.status === "CANCELLED");

    const searchMatch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.payment?.transaction_id
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.payment?.purchase?.items?.[0]?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

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

  const columns = [
    {
      label: "#",
      key: "index",
      render: (_, row, index) => (
        <span className="font-mono text-xs text-gray-600">
          {String(index + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      label: "Order ID",
      key: "id",
      render: (value) => (
        <span className="font-mono text-xs text-gray-600">
          {value.slice(-8)}
        </span>
      ),
    },
    {
      label: "Transaction ID",
      key: "transaction_id",
      render: (_, row) => (
        <span className="font-mono text-xs text-gray-600">
          {row.payment?.transaction_id?.slice(-8) || "N/A"}
        </span>
      ),
    },
    {
      label: "Product",
      key: "product",
      render: (_, row) => {
        const firstItem = row.payment?.purchase?.items?.[0];
        return (
          <div className="truncate max-w-32" title={firstItem?.name || "N/A"}>
            {firstItem?.name || "N/A"}
          </div>
        );
      },
    },
    {
      label: "Amount",
      key: "amount",
      render: (_, row) => (
        <span className="font-medium text-gray-900">
          ₦{(row.total_amount || row.payment?.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      label: "Date",
      key: "created_at",
      render: (value) => (
        <span className="text-sm text-gray-600">{formatDateStr(value)}</span>
      ),
    },
    {
      label: "Status",
      key: "status",
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            status === "DELIVERED"
              ? "bg-green-100 text-green-600"
              : [
                    "PROCESSING",
                    "SHIPPED",
                    "IN_TRANSIT",
                    "OUT_FOR_DELIVERY",
                  ].includes(status)
                ? "bg-blue-100 text-blue-600"
                : status === "CANCELLED"
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {status === "DELIVERED"
            ? "Completed"
            : [
                  "PROCESSING",
                  "SHIPPED",
                  "IN_TRANSIT",
                  "OUT_FOR_DELIVERY",
                ].includes(status)
              ? "Ongoing"
              : status === "CANCELLED"
                ? "Cancelled"
                : status}
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      render: (value, row) => (
        <div className="relative">
          <button
            onClick={() => toggleDropdown(row.id)}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            ⋮
          </button>
          {openDropdown === row.id && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-10 border border-gray-200">
              <Link
                to={`/admin/orders/order-details/${row.id}`}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                View Details
              </Link>
              {row.payment?.purchase?.items &&
                row.payment.purchase.items.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveReviewModal(
                        row.payment.purchase.items[0].product_id,
                      );
                      setOpenDropdown(null);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    View Reviews
                  </button>
                )}
            </div>
          )}
        </div>
      ),
    },
  ];

  if (getUserIsPending || ordersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  const customer = data?.data?.user;

  return (
    <div>
      <CustomBackbtn/>
      {/* Customer Info Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg text-gray-800">
            View Customer:{" "}
            <span className="text-purple-600">{data?.data?.user?.name}</span>
          </h2>
          {/* <p className="text-sm text-gray-600">
            KYC: <span className="text-green-600">Approved</span>
          </p> */}
        </div>
        <div className="bg-white rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-700 border-b border-gray-200">
                <th className="text-left p-4 font-medium text-gray-600">
                  Full Name{" "}
                </th>
                {/* <th className="text-left p-4 font-medium text-gray-600">KYC</th> */}
                <th className="text-left p-4 font-medium text-gray-600">
                  Email Address
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Phone Number
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Address
                </th>
                {/* <th className="text-left p-4 font-medium text-gray-600">
                  Total Orders
                </th> */}
                <th className="text-left p-4 font-medium text-gray-600">
                  Date Joined
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-gray-600">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src="https://randomuser.me/api/portraits/thumb/men/1.jpg"
                    alt="profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <span>{data?.data?.user?.name}</span>
                </td>
                {/* <td className="p-4">
                  <span className="text-purple-600 cursor-pointer hover:underline">
                    See KYC
                  </span>
                </td> */}
                <td className="p-4">{data?.data?.user?.email}</td>
                <td className="p-4">{data?.data?.user?.phone}</td>
                <td className="p-4">{data?.data?.user?.profile?.address}</td>
                {/* <td className="p-4">72</td> */}
                <td className="p-4">
                  {data?.data?.user?.created_at
                    ? formatDateStr(
                        data?.data?.user?.created_at.split(".").shift(),
                      )
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
            {["all", "ongoing", "completed", "cancelled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`font-medium capitalize px-3 py-1 ${
                  filter === tab
                    ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                    : "text-gray-500"
                }`}
              >
                {tab} Orders
              </button>
            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                className="w-full sm:w-[200px] pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">
              Export As ▼
            </button>
            <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">
              Sort: Newest First ▼
            </button>
          </div>
        </div>

        {/* Table Section */}
        <ReusableTable columns={columns} data={currentItems} />

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="py-2 px-3 border border-gray-200 ml-4 rounded-md outline-none text-sm w-auto"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
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

      {/* Review Modal */}
      {activeReviewModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-lg backdrop-brightness-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Product Reviews</h3>
                <button
                  onClick={() => setActiveReviewModal(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              <ReviewList productId={activeReviewModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCustomer;
