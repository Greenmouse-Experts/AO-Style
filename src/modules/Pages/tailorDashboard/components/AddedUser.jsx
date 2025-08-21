import { useState, useRef, useEffect, useMemo } from "react";
import ReusableTable from "../components/ReusableTable";
import { FaEllipsisH } from "react-icons/fa";
import useGetVendorRecentOrder from "../../../../hooks/analytics/useGetVendorRecentOrder";
import { formatDateStr, formatNumberWithCommas } from "../../../../lib/helper";
import { Link } from "react-router-dom";

const NewOrders = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    isPending,
    isLoading,
    isError,
    data: vendorRecentOrder,
  } = useGetVendorRecentOrder();

  // Table Columns
  const columns = useMemo(
    () => [
      //   { label: "Order ID", key: "orderId" },
      { label: "Product", key: "product" },
      // { label: "Order Description", key: "description" },

      { label: "Price", key: "price" },
      { label: "Order Date", key: "dateAdded" },

      {
        label: "Action",
        key: "action",
        render: (_, row) => (
          <div className="relative">
            <button
              className="text-gray-500 px-3 py-1 rounded-md"
              onClick={() => toggleDropdown(row.id)}
            >
              <FaEllipsisH />
            </button>

            {openDropdown === row.id && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
                <Link to={`/fabric/orders/orders-details?id=${row.order_id}`}>
                  <button className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                    View Details
                  </button>
                </Link>

                {/* <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                  Edit Order
                </button>
                <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full">
                  Cancel Order
                </button> */}
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown],
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

  const recentOrderData = useMemo(
    () =>
      vendorRecentOrder?.data
        ? vendorRecentOrder?.data.slice(0, 3).map((details) => {
            return {
              ...details,
              orderId: `${details?.order?.id}`,
              price: `${formatNumberWithCommas(
                details?.order?.total_amount ?? 0,
              )}`,
              description:
                details?.product?.description?.length > 20
                  ? `${details?.product?.description.slice(0, 20)}...`
                  : details?.product?.description,
              product:
                details?.product?.name?.length > 15
                  ? `${details?.product?.name.slice(0, 15)}...`
                  : details?.product?.name,
              amount: `${formatNumberWithCommas(
                details?.payment?.amount ?? 0,
              )}`,

              status: `${details?.payment?.payment_status}`,
              dateAdded: `${
                details?.created_at
                  ? formatDateStr(
                      details?.created_at.split(".").shift(),
                      "D/M/YYYY h:mm A",
                    )
                  : ""
              }`,
            };
          })
        : [],
    [vendorRecentOrder?.data],
  );

  console.log(vendorRecentOrder?.data);

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
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
        {recentOrderData?.length ? (
          <ReusableTable columns={columns} data={recentOrderData} />
        ) : (
          <>
            <p className="flex-1 text-center text-sm md:text-sm">
              No recent found.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default NewOrders;
