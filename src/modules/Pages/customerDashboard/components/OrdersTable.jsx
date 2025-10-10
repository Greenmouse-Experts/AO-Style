import { useMemo, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
// import useGetCustomerRecentOrdersStat from "../../../../hooks/analytics/useGetCustomerRecentOrders";
import { formatDateStr, formatNumberWithCommas } from "../../../../lib/helper";
import ReusableTable from "../../adminDashboard/components/ReusableTable";

const OrdersTable = (customerRecentOrderStat) => {
  const [orders] = useState([
    {
      id: "01",
      orderID: "QWER123DFDG324R",
      orderDate: "15 - 02 - 25",
      vendor: "Sandra Fabrics",
      tailor: "Jude Stitches",
      deliveryDate: "21 - 05 - 25",
      status: "Ongoing",
    },
    {
      id: "02",
      orderID: "QWER123DFDG324R",
      orderDate: "15 - 02 - 25",
      vendor: "Sandra Fabrics",
      tailor: "-",
      deliveryDate: "21 - 05 - 25",
      status: "Ongoing",
    },
    {
      id: "03",
      orderID: "QWER123DFDG324R",
      orderDate: "15 - 02 - 25",
      vendor: "Sandra Fabrics",
      tailor: "Jude Stitches",
      deliveryDate: "21 - 05 - 25",
      status: "Ongoing",
    },
    {
      id: "04",
      orderID: "QWER123DFDG324R",
      orderDate: "15 - 02 - 25",
      vendor: "Sandra Fabrics",
      tailor: "Jude Stitches",
      deliveryDate: "21 - 05 - 25",
      status: "Cancelled",
    },
    {
      id: "05",
      orderID: "QWER123DFDG324R",
      orderDate: "15 - 02 - 25",
      vendor: "Sandra Fabrics",
      tailor: "Jude Stitches",
      deliveryDate: "21 - 05 - 25",
      status: "Ongoing",
    },
    {
      id: "06",
      orderID: "QWER123DFDG324R",
      orderDate: "15 - 02 - 25",
      vendor: "Sandra Fabrics",
      tailor: "Jude Stitches",
      deliveryDate: "21 - 05 - 25",
      status: "Completed",
    },
  ]);

  const recentOrderData = useMemo(
    () =>
      customerRecentOrderStat?.customerRecentOrderStat?.data
        ? customerRecentOrderStat?.customerRecentOrderStat?.data.map(
            (details) => {
              return {
                ...details,
                transactionId: `${details?.payment?.id?.replace(/-/g, "").slice(0, 12).toUpperCase() ?? ""}`,
                amount: `${formatNumberWithCommas(
                  details?.payment?.amount ?? 0,
                )}`,
                status: `${details?.payment?.payment_status}`,
                dateAdded: `${
                  details?.created_at
                    ? (() => {
                        try {
                          const dateObj = new Date(details.created_at);
                          const opts = {
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Africa/Lagos",
                          };
                          // en-GB gives day/month/year order; remove any comma between date and time
                          return dateObj
                            .toLocaleString("en-GB", opts)
                            .replace(",", "");
                        } catch (err) {
                          // Fallback to existing formatting if something goes wrong
                          return formatDateStr(
                            details?.created_at.split(".").shift(),
                            "D/M/YYYY h:mm A",
                          );
                        }
                      })()
                    : ""
                }`,
              };
            },
          )
        : [],
    [customerRecentOrderStat?.customerRecentOrderStat?.data],
  );

  const columns = useMemo(
    () => [
      { key: "transactionId", label: "Order ID" },

      // { key: "category", label: "Category" },
      { key: "amount", label: "Amount" },
      {
        label: "Date",
        key: "dateAdded",
      },

      {
        label: "Status",
        key: "status",
        render: (value) => (
          <span
            className={`px-3 py-1 text-sm font-light rounded-md ${
              value === "PENDING"
                ? "bg-yellow-100 text-yellow-600"
                : value === "Cancelled"
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
            }`}
          >
            {value}
          </span>
        ),
      },
    ],
    [],
  );

  return <ReusableTable columns={columns} data={recentOrderData} />;
};

const ActionMenu = ({ row }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-3 rounded-full hover:bg-gray-200"
      >
        <FaEllipsisV />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white shadow-md rounded-md">
          <button className="block px-4 py-2 text-sm hover:bg-gray-100 w-full">
            View Details
          </button>
          <button className="block px-4 py-2 text-sm hover:bg-gray-100 w-full">
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
