import React, { useState } from "react";
import ReusableTable from "./components/ReusableTable";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const orders = [
    { id: "01", orderId: "ORD-123RFWJ2", customer: "Funmi Daniels", product: "Ankara, Silk X2...", amount: "N 50,000", location: "Lekki, Lagos", orderDate: "24-02-25", status: "Ongoing" },
    { id: "02", orderId: "ORD-123RFWJ2", customer: "Funmi Daniels", product: "Ankara, Silk X2...", amount: "N 50,000", location: "Lekki, Lagos", orderDate: "24-02-25", status: "Ongoing" },
    { id: "03", orderId: "ORD-123RFWJ2", customer: "Funmi Daniels", product: "Ankara, Silk X2...", amount: "N 50,000", location: "Lekki, Lagos", orderDate: "24-02-25", status: "Ongoing" },
    { id: "04", orderId: "ORD-123RFWJ2", customer: "Funmi Daniels", product: "Ankara, Silk X2...", amount: "N 50,000", location: "Lekki, Lagos", orderDate: "24-02-25", status: "Ongoing" },
    { id: "05", orderId: "ORD-123RFWJ2", customer: "Funmi Daniels", product: "Ankara, Silk X2...", amount: "N 50,000", location: "Lekki, Lagos", orderDate: "24-02-25", status: "Ongoing" },
    { id: "06", orderId: "ORD-123RFWJ2", customer: "Funmi Daniels", product: "Ankara, Silk X2...", amount: "N 50,000", location: "Lekki, Lagos", orderDate: "24-02-25", status: "Ongoing" },
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
        { label: "Product", key: "product" },
        { label: "Amount", key: "amount" },
        { label: "Location", key: "location" },
        { label: "Order Date", key: "orderDate" },
        {
            label: "Status",
            key: "status",
            render: (status) => (
                <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
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
                            <Link to="/fabric/orders/orders-details">
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
                    <Link to="/fabric" className="text-blue-500 hover:underline">Dashboard</Link> &gt; Orders
                </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
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
                <ReusableTable columns={columns} data={filteredOrders} />
            </div>
        </div>
    );
};

export default OrderPage;