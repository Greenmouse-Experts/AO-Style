import { useState, useRef, useEffect } from "react";
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

const OrdersTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeReviewModal, setActiveReviewModal] = useState(null);
  const nav = useNavigate();
  const { isPending: ordersLoading, data: ordersResponse } = useGetOrder();
  const columns = [
    {
      label: "Customer",
      key: "customer",
      render: (_, row) => (
        <div className="flex items-center">
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
    // {
    //   label: "Action",
    //   key: "action",
    //   render: (_, row) => (
    //     <div className="relative">
    //       <button
    //         data-theme="nord"
    //         onClick={() => toggleDropdown(row.id)}
    //         className="btn btn-circle btn-ghost"
    //       >
    //         <MenuIcon className="label" />
    //       </button>
    //       {openDropdown === row.id && (
    //         <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-10 border border-gray-200">
    //           <Link
    //             onClick={(e) => {
    //               console.log(row);
    //             }}
    //             to={`/admin/orders/order-details/${row.id}`}
    //             // to={`/admin/orders/order-details/${row.id}`}
    //             className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
    //           >
    //             View Details
    //           </Link>
    //           {row.payment?.purchase?.items &&
    //             row.payment.purchase.items.length > 0 && (
    //               <button
    //                 onClick={() => {
    //                   setActiveReviewModal(
    //                     row.payment.purchase.items[0].product_id,
    //                   );
    //                   setOpenDropdown(null);
    //                 }}
    //                 className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
    //               >
    //                 View Reviews
    //               </button>
    //             )}
    //         </div>
    //       )}
    //     </div>
    //   ),
    // },
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
  const order_query = useQuery({
    queryKey: ["order_data"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/orders/fetch");
      return resp.data;
    },
  });
  useEffect(() => {
    if (order_query.data) {
      console.log("orders_now", order_query.data);
    }
  }, [order_query.isFetching]);

  const data = order_query?.data?.data || [];

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

  const filteredData = data.filter((order) => {
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
  });

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

  if (order_query.isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }
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
          </div>
        </div>
        {order_query.isFetching ? (
          <div className="p-2 text-lg ">loading orders...</div>
        ) : (
          <>
            {
              <CustomTable
                columns={columns}
                data={currentItems || []}
                actions={actions}
              />
            }
            {/* <ReusableTable
              columns={columns}
              data={currentItems}
              loading={order_query.isPending}
            />*/}

            {/* <CustomTable columns={columns} data={currentItems} />*/}
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
    </>
  );
};

export default OrdersTable;
