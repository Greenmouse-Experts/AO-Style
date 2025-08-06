import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { Loader } from "lucide-react";
import ReusableTable from "../components/ReusableTable";

import { useRef, useState } from "react";

interface VendorDataType {
  id: string;
  name: string;
  email: string;
  phone: string;
  alternative_phone: string | null;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
  updated_at: string;
  role: { name: string; role_id: string };
  admin_role: null;
  profile: {
    bio: string | null;
    address: string;
    profile_picture: string | null;
    gender: string | null;
    date_of_birth: string | null;
    approved_by_admin: string | null;
  };
  business_contacts: [];
  location: string;
  dateJoined: string;
}
export default function ViewVendorOrders() {
  const { id } = useParams();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeReviewModal, setActiveReviewModal] = useState(null);
  const user = location?.state?.info as VendorDataType;
  const order_query = useQuery({
    queryKey: [id, "vendor_orders"],
    queryFn: async () => {
      let resp = await CaryBinApi.get(
        `/orders/fetch-vendor-orders?user_id=${id}`,
      );
      return resp.data;
    },
  });
  const columns = [
    {
      label: "Customer",
      key: "customer",
      render: (_, row) => (
        <div className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span className="text-sm">
            {row.payment?.user?.email?.split("@")[0] ||
              `User ${row.user_id?.slice(-8)}`}
          </span>
        </div>
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
      label: "Order Date",
      key: "created_at",
      render: (value) => (
        <span className="text-sm text-gray-600">{formatDateStr(value)}</span>
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
      label: "Transaction ID",
      key: "transaction_id",
      render: (_, row) => (
        <span className="font-mono text-xs text-gray-600">
          {row.payment?.transaction_id?.slice(-8) || "N/A"}
        </span>
      ),
    },
    {
      label: "Order Total",
      key: "total_amount",
      render: (_, row) => (
        <span className="font-medium text-gray-900">
          ₦{(row.total_amount || row.payment?.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
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
                onClick={(e) => {
                  console.log(row);
                }}
                to={`/admin/orders/order-details?id=${row.id}`}
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
              ? "In Progress"
              : status === "CANCELLED"
                ? "Cancelled"
                : status}
        </span>
      ),
    },
  ];
  const filteredData =
    order_query?.data?.data.filter((order) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        order.id?.toLowerCase().includes(searchLower) ||
        order.payment?.transaction_id?.toLowerCase().includes(searchLower) ||
        order.payment?.user?.email?.toLowerCase().includes(searchLower) ||
        order.payment?.purchase?.items?.[0]?.name
          ?.toLowerCase()
          .includes(searchLower) ||
        order.status?.toLowerCase().includes(searchLower)
      );
    }) || [];

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
    <div>
      {/*<>Order summary</>
      <div>Orders for {user.name}</div>*/}

      <div className="bg-white p-6 rounded-xl overflow-x-auto">
        <div className="flex flex-wrap justify-between items-center pb-3 gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <h2 className="text-lg font-semibold">{user.name} Orders</h2>
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
        {order_query.isFetching ? (
          <div className="p-2 text-lg ">loading orders...</div>
        ) : (
          <ReusableTable columns={columns} data={currentItems} />
        )}
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
    </div>
  );
}
