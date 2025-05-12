import { useState, useRef, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import { FaEllipsisH } from "react-icons/fa";
import AddMarketModal from "./AddMarketModal";
import { Link } from "react-router-dom";


const NewlyAddedUsers = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // User Data
    const data = [
        { id: "01", name: "Daniel Abudahbi", userType: "Vendor", dateAdded: "24-02-25", status: "Approved" },
        { id: "02", name: "Daniel Abudahbi", userType: "Vendor", dateAdded: "24-02-25", status: "Pending" },
        { id: "03", name: "Daniel Abudahbi", userType: "Tailor/Designer", dateAdded: "24-02-25", status: "Approved" },
        { id: "04", name: "Daniel Abudahbi", userType: "Vendor", dateAdded: "24-02-25", status: "Declined" },
        { id: "05", name: "Daniel Abudahbi", userType: "Tailor/Designer", dateAdded: "24-02-25", status: "Approved" },
        { id: "06", name: "Daniel Abudahbi", userType: "Vendor", dateAdded: "24-02-25", status: "Approved" },
    ];

    // Table Columns
    const columns = [
        { label: "#", key: "id" },
        { label: "Name", key: "name" },
        { label: "User Type", key: "userType" },
        { label: "Date Added", key: "dateAdded" },
        {
            label: "Status",
            key: "status",
            render: (_, row) => (
                <span className={`px-3 py-1 text-sm rounded-md ${row.status === "Approved" ? "bg-green-100 text-green-600" :
                        row.status === "Pending" ? "bg-yellow-100 text-yellow-600" :
                            "bg-red-100 text-red-600"
                    }`}>
                    {row.status}
                </span>
            ),
        },
        {
            label: "Action",
            key: "action",
            render: (_, row) => (
                <div className="relative">
                    <button
                        className="bg-gray-100 text-gray-500 px-3 py-1 rounded-md"
                        onClick={() => toggleDropdown(row.id)}
                    >
                        <FaEllipsisH />
                    </button>
                    {openDropdown === row.id && (
                        <div className="dropdown-menu absolute right-0 mt-2 w-50 bg-white rounded-md z-10 border-gray-200">
                            <Link
                                to={`/admin/tailors/view-tailor`}
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center"
                            >
                                View Market Rep 
                            </Link>
                            <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center">
                                Edit User
                            </button>
                            <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full text-center">
                                Remove User
                            </button>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    const filteredData = data.filter((order) =>
        Object.values(order).some((value) =>
            typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
        )
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

    return (
        <div className="bg-white p-6 rounded-xl overflow-x-auto">
            <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
                <h2 className="text-lg font-semibold">Recent Activities</h2>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search orders..."
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
                    <button onClick={() => setIsModalOpen(true)} className="bg-[#9847FE] text-white px-4 py-2 text-sm cursor-pointer rounded-md">
                        + Add a Market Rep
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <AddMarketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                <ReusableTable columns={columns} data={filteredData} />
            </div>
        </div>

    );
};

export default NewlyAddedUsers;
