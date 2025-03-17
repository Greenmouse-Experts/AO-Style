import React, { useState } from "react";
import ReusableTable from "./components/ReusableTable";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const orders = [
    { id: "01", orderId: "QWER123DFDG324R", date: "15-02-25", vendor: "Sandra Fabrics", designer: "Jude Stitches", delivery: "21-05-25", status: "Ongoing" },
    { id: "02", orderId: "QWER123DFDG324R", date: "15-02-25", vendor: "Sandra Fabrics", designer: "-", delivery: "21-05-25", status: "Ongoing" },
    { id: "03", orderId: "QWER123DFDG324R", date: "15-02-25", vendor: "Sandra Fabrics", designer: "Jude Stitches", delivery: "21-05-25", status: "Ongoing" },
    { id: "04", orderId: "QWER123DFDG324R", date: "15-02-25", vendor: "Sandra Fabrics", designer: "Jude Stitches", delivery: "21-05-25", status: "Cancelled" },
    { id: "05", orderId: "QWER123DFDG324R", date: "15-02-25", vendor: "Sandra Fabrics", designer: "Jude Stitches", delivery: "21-05-25", status: "Ongoing" },
    { id: "06", orderId: "QWER123DFDG324R", date: "15-02-25", vendor: "Sandra Fabrics", designer: "Jude Stitches", delivery: "21-05-25", status: "Completed" },
];

const OrderPage = () => {
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [openDropdown, setOpenDropdown] = useState(null);

    const filteredOrders = orders.filter(order =>
        (filter === "all" || order.status.toLowerCase() === filter) &&
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { label: "#", key: "id" },
        { label: "Order ID", key: "orderId" },
        { label: "Order Date", key: "date" },
        { label: "Fabric Vendor", key: "vendor" },
        { label: "Tailor/Fashion Designer", key: "designer" },
        { label: "Delivery Date", key: "delivery" },
        {
            label: "Status",
            key: "status",
            render: (status) => (
                <span
                    className={`px-3 py-1 text-sm rounded-full ${status === "Ongoing"
                        ? "bg-yellow-100 text-yellow-700"
                        : status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                >
                    {status}
                </span>
            ),
        },
        {
            label: "Action", key: "action", render: (_, row) => (
                <div className="relative">
                    <button onClick={() => setOpenDropdown(openDropdown === row.id ? null : row.id)} className="px-2 py-1 cursor-pointer rounded-md">•••</button>
                    {openDropdown === row.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
                            <Link to="/customer/orders/orders-details">
                                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">View Details</button>
                            </Link>
                            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Cancel Order</button>
                        </div>
                    )}
                </div>
            )
        },
    ];

    return (
        <div className="">
            <div className="bg-white px-6 py-4 mb-6">
                <h1 className="text-2xl font-medium mb-3">Orders</h1>
                <p className="text-gray-500">
                    <Link to="/customer" className="text-blue-500 hover:underline">Dashboard</Link> &gt; Orders
                </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
                <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
                    <div className="flex flex-wrap space-x-6 text-gray-600 text-sm font-medium">
                        {["all", "ongoing", "completed", "cancelled"].map((tab) => (
                            <button key={tab} onClick={() => setFilter(tab)}
                                className={`font-medium capitalize ${filter === tab ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}>{tab} Orders</button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search"
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="px-4 py-2 bg-gray-200 rounded-md">Export As ▼</button>
                        <button className="px-4 py-2 bg-gray-200 rounded-md">Sort: Newest First ▼</button>
                    </div>
                </div>
                <ReusableTable columns={columns} data={filteredOrders} />
            </div>
        </div>
    );
};

export default OrderPage;