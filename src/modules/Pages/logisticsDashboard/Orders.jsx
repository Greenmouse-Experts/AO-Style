import { useState, useRef, useEffect } from "react";
import ReusableTable from "../logisticsDashboard/components/ReusableTable";
import { FaMapMarkerAlt, FaEllipsisH } from "react-icons/fa";
import { Link } from "react-router-dom";

const OrderRequests = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");

    // Order Data
    const data = [
        { id: "01", orderId: "FWERIO1234FNK", orderDate: "15 - 02 - 25", deliveryDate: "19 - 02 - 25", pickup: "Lekki, Lagos", destination: "Ogba, Ikeja", price: "N 7000", status: "Ongoing" },
        { id: "02", orderId: "FWERIO1234FNK", orderDate: "15 - 02 - 25", deliveryDate: "19 - 02 - 25", pickup: "Lekki, Lagos", destination: "Ogba, Ikeja", price: "N 7000", status: "Ongoing" },
        { id: "03", orderId: "FWERIO1234FNK", orderDate: "15 - 02 - 25", deliveryDate: "19 - 02 - 25", pickup: "Lekki, Lagos", destination: "Ogba, Ikeja", price: "N 7000", status: "Ongoing" },
        { id: "04", orderId: "FWERIO1234FNK", orderDate: "15 - 02 - 25", deliveryDate: "19 - 02 - 25", pickup: "Lekki, Lagos", destination: "Ogba, Ikeja", price: "N 7000", status: "Cancelled" },
        { id: "05", orderId: "FWERIO1234FNK", orderDate: "15 - 02 - 25", deliveryDate: "19 - 02 - 25", pickup: "Lekki, Lagos", destination: "Ogba, Ikeja", price: "N 7000", status: "Cancelled" },
        { id: "06", orderId: "FWERIO1234FNK", orderDate: "15 - 02 - 25", deliveryDate: "19 - 02 - 25", pickup: "Lekki, Lagos", destination: "Ogba, Ikeja", price: "N 7000", status: "Completed" },
    ];

    // Action Menu Component
    const ActionMenu = ({ row }) => {
        const [open, setOpen] = useState(false);
        const dropdownRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        return (
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setOpen(!open)} className="p-3 rounded-full hover:bg-gray-200">
                    <FaEllipsisH />
                </button>

                {open && (
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-md z-10 shadow-md">
                        <button className="block px-4 py-2 text-sm hover:bg-gray-100 w-full">View Details</button>
                        <button className="block px-4 py-2 text-sm hover:bg-gray-100 w-full">Cancel Order</button>
                    </div>
                )}
            </div>
        );
    };

    // Table Columns
    const columns = [
        { label: "#", key: "id" },
        { label: "Order ID", key: "orderId" },
        { label: "Order Date", key: "orderDate" },
        { label: "Delivery Date", key: "deliveryDate" },
        {
            label: "Location",
            key: "location",
            render: (_, row) => (
                <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-green-500" />
                    <span>{row.destination}</span>
                </div>
            ),
        },
        { label: "Price", key: "price" },
        {
            label: "Status",
            key: "status",
            render: (value) => (
                <span className={`px-3 py-1 text-sm font-light rounded-md ${value === "Ongoing" ? "bg-yellow-100 text-yellow-600" : value === "Cancelled" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
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

    // Filtering the data based on search input and filter status
    const filteredData = data.filter((order) => {
        if (filter !== "all" && order.status.toLowerCase() !== filter) return false;
        return Object.values(order).some((value) => typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return (
        <>
            <div className="bg-white px-6 py-4 mb-6">
                <h1 className="text-2xl font-medium mb-3">Orders</h1>
                <p className="text-gray-500">
                    <Link to="/logistics" className="text-blue-500 hover:underline">
                        Dashboard
                    </Link>{" "}
                    &gt; Orders
                </p>
            </div>
            <div className="bg-white p-6 rounded-xl">
                {/* Filters & Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
                    {/* Order Filters */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
                        {["all", "ongoing", "completed", "cancelled"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`font-medium capitalize px-3 py-1 ${filter === tab ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"
                                    }`}
                            >
                                {tab} Orders
                            </button>
                        ))}
                    </div>

                    {/* Search & Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 py-2 px-3 border border-gray-200 rounded-md outline-none text-sm"
                        />
                        <button className="w-full sm:w-auto bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md">
                            Export As ▾
                        </button>
                        <button className="w-full sm:w-auto bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md">
                            Sort: Newest First ▾
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <ReusableTable columns={columns} data={filteredData} />
            </div>

        </>
    );
};

export default OrderRequests;
