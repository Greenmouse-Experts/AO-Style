import React, { useState } from "react";
import ReusableTable from "./components/ReusableTable";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const orders = [
    { id: "01", orderId: "ORD-123RFWJ2", customer: "Funmi Daniels", measurement: "View Measurement", amount: "N 50,000", dueDate: "10 Days Left", status: "Ongoing" },
    { id: "02", orderId: "ORD-123RFWJ2", customer: "Funmi Daniels", measurement: "View Measurement", amount: "N 50,000", dueDate: "10 Days Left", status: "Ongoing" },
    { id: "03", orderId: "ORD-123RFWJ2", customer: "Funmi Daniels", measurement: "View Measurement", amount: "N 50,000", dueDate: "10 Days Left", status: "Completed" },
    { id: "04", orderId: "ORD-123RFWJ2", customer: "Funmi Daniels", measurement: "View Measurement", amount: "N 50,000", dueDate: "10 Days Left", status: "Ongoing" },
    { id: "05", orderId: "ORD-123RFWJ2", customer: "Funmi Daniels", measurement: "View Measurement", amount: "N 50,000", dueDate: "10 Days Left", status: "Cancelled" },
    { id: "06", orderId: "ORD-123RFWJ2", customer: "Funmi Daniels", measurement: "View Measurement", amount: "N 50,000", dueDate: "10 Days Left", status: "Ongoing" },
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
        { label: "Customer Name", key: "customer" },
        { label: "Body Measurement", key: "measurement", render: (text) => <Link to="#" className="text-blue-500 hover:underline">{text}</Link> },
        { label: "Amount", key: "amount" },
        { label: "Due Date", key: "dueDate" },
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
                            <Link to="/tailor/orders/orders-details">
                                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">View Details</button>
                            </Link>
                            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Cancel Order</button>
                            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Track Order</button>
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
                    <Link to="/tailor" className="text-blue-500 hover:underline">Dashboard</Link> &gt; Orders
                </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
                {/* Filters & Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
                    {/* Order Filters */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
                        {["all", "ongoing", "completed", "cancelled"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`font-medium capitalize px-3 py-1 ${filter === tab ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}
                            >
                                {tab} Orders
                            </button>
                        ))}
                    </div>

                    {/* Search & Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full sm:w-[200px] pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">Export As ▼</button>
                        <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">Sort: Newest First ▼</button>
                    </div>
                </div>

                {/* Table Section */}
                <ReusableTable columns={columns} data={filteredOrders} />
            </div>
        </div>
    );
};

export default OrderPage;
