import React, { useState } from "react";
import ReusableTable from "../components/ReusableTable";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const orders = [
    { id: "01", orderId: "QWER123DFDG324R", date: "15-02-25", vendor: "Sandra Fabrics", designer: "Jude Stitches", delivery: "21-05-25", status: "Ongoing" },
    { id: "02", orderId: "QWER123DFDG324R", date: "15-02-25", vendor: "Sandra Fabrics", designer: "Hamzat Stitches", delivery: "21-05-25", status: "Ongoing" },
    { id: "03", orderId: "QWER123DFDG324R", date: "15-02-25", vendor: "Sandra Fabrics", designer: "Jude Stitches", delivery: "21-05-25", status: "Ongoing" },
    { id: "04", orderId: "QWER123DFDG324R", date: "15-02-25", vendor: "Sandra Fabrics", designer: "Jude Stitches", delivery: "21-05-25", status: "Cancelled" },
    { id: "05", orderId: "QWER123DFDG324R", date: "15-02-25", vendor: "Sandra Fabrics", designer: "Jude Stitches", delivery: "21-05-25", status: "Ongoing" },
    { id: "06", orderId: "QWER123DFDG324R", date: "15-02-25", vendor: "Sandra Fabrics", designer: "Jude Stitches", delivery: "21-05-25", status: "Completed" },
];

const ViewCustomer = () => {
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
                <span className={`px-3 py-1 text-sm rounded-full ${status === "Ongoing"
                    ? "bg-yellow-100 text-yellow-700"
                    : status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}>
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
        <div>
            {/* Customer Info Section */}
            <div className="rounded-lg mb-6 flex justify-between items-center">
                <h2 className="text-lg font-medium">View Customer : <span className="text-purple-600 font-medium">Chukka Uzo</span></h2>
                <p className="text-sm font-medium text-gray-600">KYC: <span className="text-green-600 font-medium">Approved</span></p>
            </div>
            <div className="bg-white rounded-lg mb-6">
                <table className="w-full text-sm  border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 font-medium text-gray-700 rounded-lg mb-4 p-4">
                            <th className="text-left p-4">Full Name</th>
                            <th className="text-left p-4">KYC</th>
                            <th className="text-left p-4">Email Address</th>
                            <th className="text-left p-4">Phone Number</th>
                            <th className="text-left p-4">Address</th>
                            <th className="text-left p-4">Total Orders</th>
                            <th className="text-left p-4">Date Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-4">Emeka Okafor</td>
                            <td className="p-4 text-purple-600 cursor-pointer">See KYC</td>
                            <td className="p-4">testmail@gmail.com</td>
                            <td className="p-4">+234 803 456 7890</td>
                            <td className="p-4">12, Allen Avenue, Ikeja, Lagos</td>
                            <td className="p-4">72</td>
                            <td className="p-4">22/5/2009</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-white p-4 rounded-lg">
                {/* Filters & Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
                        {['all', 'ongoing', 'completed', 'cancelled'].map((tab) => (
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

export default ViewCustomer;
