import { useState, useRef, useEffect, useMemo } from "react";
import ReusableTable from "../components/ReusableTable";
import OrdersSummary from "../components/OrdersSummary";
import { Link, useNavigate } from "react-router-dom";
import useGetOrder from "../../../../hooks/order/useGetOrder";
import Loader from "../../../../components/ui/Loader";
import { formatDateStr } from "../../../../lib/helper";
import ReviewList from "../../../../components/reviews/ReviewList";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import CustomTable from "../../../../components/CustomTable";
import { MenuIcon } from "lucide-react";
import useDebounce from "../../../../hooks/useDebounce";
import DateFilter from "../../../../components/shared/DateFilter";
import ActiveFilters from "../../../../components/shared/ActiveFilters";
import useDateFilter from "../../../../hooks/useDateFilter";
import PaginationButton from "../../../../components/PaginationButton";

const OrdersTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeReviewModal, setActiveReviewModal] = useState(null);
  const nav = useNavigate();

  // Date filter functionality
  const {
    activeFilters,
    matchesDateFilter,
    handleFiltersChange,
    removeFilter,
    clearAllFilters: clearDateFilters,
  } = useDateFilter();

  // const { isPending: ordersLoading, data: ordersResponse } = useGetOrder(); // Not needed for search
  const columns = [
    {
      label: "Customer",
      key: "customer",
      render: (_, row) => (
        <div className="flex items-center">
          <span className="text-sm">
            {row?.user?.email || `User ${row.user_id?.slice(-8)}`}
          </span>
        </div>
      ),
    },
    {
      label: "Order ID",
      key: "id",
      render: (_, row) => {
        // Use the first twelve digits of order?.payment?.id, remove hyphens, and uppercase
        const paymentId = row.payment?.id || "";
        const cleaned = paymentId.replace(/-/g, "").toUpperCase().slice(0, 12);
        return (
          <span className="font-mono text-xs text-gray-600">
            {cleaned || "N/A"}
          </span>
        );
      },
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
      label: "Status",
      key: "status",
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status === "DELIVERED"
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

  // Use React Query to fetch orders, passing `q` as the search term
  const order_query = useQuery({
    queryKey: ["order_data", { q: debouncedSearchTerm }],
    queryFn: async () => {
      // Always pass q, even if empty
      let resp = await CaryBinApi.get("/orders/fetch", {
        params: { q: debouncedSearchTerm },
      });
      console.log("This is the data gotten from orders fetch", resp);
      return resp.data;
    },
    keepPreviousData: true,
  });

  // Refetch orders when debounced search term changes
  useEffect(() => {
    console.log("This is the search term", debouncedSearchTerm);
    order_query.refetch();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (order_query.data) {
      console.log("orders_now", order_query.data);
    }
  }, [order_query.data]);

  const data = order_query?.data?.data || [];

  // Apply date filters to the data
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.filter((order) => {
      // Apply date filter based on order creation date
      const dateValue = order.created_at || order.payment?.created_at;
      return matchesDateFilter(dateValue);
    });
  }, [data, matchesDateFilter]);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actions = [
    {
      key: "view-details",
      label: "View Details",
      action: (item) => {
        return nav(`/admin/orders/order-details/${item.id}`);
      },
    },
    {
      key: "review",
      label: "See Reviews",
      action: (item) => {
        setActiveReviewModal(item.payment.purchase.items[0].product_id);
        setOpenDropdown(null);
      },
    },
    // {
    //   key: "delete-vendor",
    //   label: "Delete",
    //   action: (item) => {
    //     handleDeleteUser(item);
    //   },
    // },
  ];
  return (
    <>
      {/* <OrdersSummary />*/}
      <div className="bg-white p-2 rounded-xl overflow-x-auto">
        <div className="flex flex-wrap justify-between items-center pb-3 gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <h2 className="text-lg font-semibold">Customer Orders</h2>
            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              Search: Order ID • Email • Product • Transaction ID
            </div>
            {searchTerm && (
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {filteredData.length} result
                {filteredData.length !== 1 ? "s" : ""} for "{searchTerm}"
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
            <DateFilter
              onFiltersChange={handleFiltersChange}
              activeFilters={activeFilters}
              onClearAll={clearDateFilters}
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Order ID, Email, or Product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 px-3 pr-16 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {order_query.isFetching && searchTerm && (
                  <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                )}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        <ActiveFilters
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
          onClearAll={clearDateFilters}
        />

        {order_query.isFetching && !searchTerm ? (
          <div className="p-2 text-lg ">loading orders...</div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Orders Found
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-md">
              {searchTerm
                ? `No orders match your search "${searchTerm}"`
                : activeFilters.length > 0
                  ? "No orders match the selected date filters. Try adjusting your filters."
                  : "There are no customer orders at the moment."}
            </p>
            {(searchTerm || activeFilters.length > 0) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  clearDateFilters();
                }}
                className="mt-4 px-4 py-2 bg-[#9847FE] text-white rounded-lg text-sm hover:bg-[#8537ee] transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {
              <CustomTable
                columns={columns}
                data={currentItems || []}
                actions={actions}
              />
            }
          </>
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
          {totalPages > 1 && (
            <div className="flex gap-1">
              <PaginationButton
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-200"
              >
                ◀ Previous
              </PaginationButton>
              <PaginationButton
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-200"
              >
                Next ▶
              </PaginationButton>
            </div>
          )}
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
    </>
  );
};

export default OrdersTable;
