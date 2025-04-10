import { useState, useRef, useEffect } from "react";
import ReusableTable from "./components/ReusableTable";
import SubAdminModal from "./components/SubAdminModal";
import { FaEllipsisH } from "react-icons/fa";

const CustomersTable = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Dummy Sub-Admins Data
    const data = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        profile: `https://randomuser.me/api/portraits/thumb/men/${i % 10}.jpg`,
        name: `Admin ${i + 1}`,
        role: [
            "Vendor Manager",
            "Tailor Manager",
            "Delivery Manager",
            "Customer Support",
            "Payment & Finance",
            "Marketing & Promotions",
            "Content & Moderation",
        ][i % 7],
        phone: `+234 80${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: `admin${i + 1}@email.com`,
        location: `Location ${i + 1}`,
        dateJoined: `22/5/${2021 + (i % 5)}`
    }));

    // Table Columns
    const columns = [
        { label: "Profile", key: "profile", render: (_, row) => <img src={row.profile} alt="profile" className="w-8 h-8 rounded-full" /> },
        { label: "Admin Role", key: "role" },
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
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10 shadow-lg">
                            <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">View Details</button>
                            <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">Edit Admin</button>
                            <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full">Remove Admin</button>
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
        <div className="bg-white p-6 rounded-xl overflow-x-auto">
            <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">

                    <h2 className="text-lg font-semibold">Employees/Admin</h2>
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
                        + Add a New Admin
                    </button>
                </div>
            </div>
            {/* Table */}
            <SubAdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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
    );
};

export default CustomersTable;