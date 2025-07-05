import ReusableTable from "./ReusableTable";
import { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";

const OrdersTable = () => {
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

  const columns = [
    { label: "#", key: "id" },
    { label: "Order ID", key: "orderID" },
    { label: "Order Date", key: "orderDate" },
    { label: "Fabric Vendor", key: "vendor" },
    { label: "Tailor/Fashion Designer", key: "tailor" },
    { label: "Delivery Date", key: "deliveryDate" },
    {
      label: "Status",
      key: "status",
      render: (value) => (
        <span
          className={`px-3 py-1 text-sm font-light rounded-md ${
            value === "Ongoing"
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
    {
      label: "Action",
      key: "action",
      render: (_, row) => <ActionMenu row={row} />,
    },
  ];

  return <ReusableTable columns={columns} data={orders} />;
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
