import { useState, useRef, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import AddCustomerModal from "../components/AddCustomerModal";
import { FaEllipsisH } from "react-icons/fa";

const CustomersTable = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Dummy Customer Data
    const data = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        profile: `https://randomuser.me/api/portraits/thumb/men/${i}.jpg`,
        name: `Customer ${i + 1}`,
        userId: `CUS-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        phone: `+234 80${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: `customer${i + 1}@email.com`,
        location: `Location ${i + 1}`,
        dateJoined: `22/5/${2020 + (i % 15)}`
    }));

    // Table Columns
    const columns = [
        { label: "Profile", key: "profile", render: (_, row) => <img src={row.profile} alt="profile" className="w-8 h-8 rounded-full" /> },
        { label: "User ID", key: "userId" },
        { label: "Phone Number", key: "phone" },
        { label: "Email Address", key: "email" },
        { label: "Location", key: "location" },
        { label: "Date Joined", key: "dateJoined" },
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
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10">
                            <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">View Details</button>
                            <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">Edit User</button>
                            <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full">Remove User</button>
                        </div>
                    )}
                </div>
            ),
        },
    ];

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

    // Pagination Logic
    const filteredData = data.filter((customer) =>
        Object.values(customer).some((value) =>
            typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="bg-white p-6 rounded-xl overflow-x-auto">
            <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">

                    <h2 className="text-lg font-semibold">Customers</h2>
                </div>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                    <input
                        type="text"
                        placeholder="Search customers..."
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
                    <button onClick={() => setIsModalOpen(true)} className="bg-[#9847FE] text-white px-4 py-2 text-sm rounded-md">
                        + Add New Customer
                    </button>
                </div>
            </div>
            {/* Table */}
            <AddCustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <ReusableTable columns={columns} data={currentItems} />

            {/* Pagination */}
            <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded-md ${currentPage === i + 1 ? "bg-[#9847FE] text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CustomersTable;