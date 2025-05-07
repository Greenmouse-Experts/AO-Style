import { useState, useRef, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import OrdersSummary from "../components/OrdersSummary";
import { FaEllipsisH } from "react-icons/fa";

const OrdersTable = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const data = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        orderNumber: `ORD-${1000 + i}`,
        customerName: `Customer ${i + 1}`,
        totalAmount: `₦${(Math.random() * 1000).toFixed(2)}`,
        dateOrdered: `02/04/25`,
        status: i % 2 === 0 ? "Completed" : "Pending",
    }));

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

    const columns = [
        { label: "S/N", key: "id" },
        { label: "Order Number", key: "orderNumber" },
        { label: "Customer Name", key: "customerName" },
        { label: "Total Amount", key: "totalAmount" },
        { label: "Date Ordered", key: "dateOrdered" },
        {
            label: "Status",
            key: "status",
            render: (status) => (
                <span
                    className={`px-3 py-1 text-sm rounded-full ${status === "Ongoing"
                        ? "bg-yellow-100 text-yellow-700"
                        : status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                        }`}
                >
                    {status}
                </span>
            ),
        },

        {
            label: "Action",
            key: "action",
            render: (_, row) => (
                <div className="relative" ref={dropdownRef}>
                    <button
                        className="bg-gray-100 text-gray-500 px-3 py-1 rounded-md"
                        onClick={() => toggleDropdown(row.id)}
                    >
                        <FaEllipsisH />
                    </button>
                    {openDropdown === row.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10 shadow-lg">
                            <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">View Details</button>
                            <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">Edit Market</button>
                            <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full">Remove Market</button>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    const filteredData = data.filter((market) =>
        Object.values(market).some((value) =>
            typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
        setItemsPerPage(Number(e.target.value)); // Update items per page
        setCurrentPage(1); // Reset to the first page whenever the items per page is changed
    };

    return (
        <>
            <OrdersSummary />
            <div className="bg-white p-6 rounded-xl overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Orders</h2>
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                        <input
                            type="text"
                            placeholder="Search market..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
                        />
                        <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
                            Export As ▾
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
                            Sort: Newest First ▾
                        </button>
                        {/* <button className="bg-[#9847FE] text-white px-4 py-2 text-sm rounded-md">
                        + Add New Order
                    </button> */}
                    </div>
                </div>
                <ReusableTable columns={columns} data={currentItems} />
                <div className="flex justify-between items-center mt-4">
                    <div className="flex">
                        <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="py-2 px-3 border border-gray-200 ml-4 rounded-md outline-none text-sm w-auto"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={handlePreviousPage} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-gray-200">&#9664;</button>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md bg-gray-200">&#9654;</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrdersTable;
