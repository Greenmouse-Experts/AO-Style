import { useState, useRef, useEffect } from "react";
import ReusableTable from "./components/ReusableTable";
import SubAdminModal from "./components/SubAdminModal";
import { FaEllipsisH, FaBars, FaTh, FaPhone, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";

const CustomersTable = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [activeTab, setActiveTab] = useState("table");

    const handleDropdownToggle = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

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
                        <div className="relative">
                            <button
                                className="bg-gray-100 text-gray-500 px-3 py-1 rounded-md"
                                onClick={() => toggleDropdown(row.id)}
                            >
                                <FaEllipsisH />
                            </button>
                            {openDropdown === row.id && (
                                <div className="dropdown-menu absolute right-0 mt-2 w-50 bg-white rounded-md z-10 border-gray-200">
                                    <button
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center"
                                    >
                                        View Details
                                    </button>
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
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div className="bg-white p-6 rounded-xl overflow-x-auto">
            <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <h2 className="text-lg font-semibold">Employees/Admin</h2>
                </div>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                    <div className="flex items-center space-x-2 border border-gray-200 rounded-md p-1">
                        <button
                            className={`p-2 rounded ${activeTab === "table" ? "text-[#9847FE]" : "text-gray-600"}`}
                            onClick={() => setActiveTab("table")}
                        >
                            <FaBars size={16} />
                        </button>
                        <button
                            className={`p-2 rounded ${activeTab === "grid" ? "text-[#9847FE]" : "text-gray-600"}`}
                            onClick={() => setActiveTab("grid")}
                        >
                            <FaTh size={16} />
                        </button>
                    </div>
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
            <SubAdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {activeTab === "table" ? (
                <>
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
                            <button onClick={handlePreviousPage} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-gray-200">◀</button>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md bg-gray-200">▶</button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentItems.map((item) => (
                        <div
                                                    key={item.id}
                                                    className="relative bg-white rounded-lg p-4 border border-gray-100 flex justify-between"
                                                >
                                                    <div className="absolute top-3 right-3">
                                                        <button
                                                            className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md"
                                                            onClick={() => handleDropdownToggle(item.id)}
                                                        >
                                                            <FaEllipsisH size={14} />
                                                        </button>
                        
                                                        {openDropdown === item.id && (
                                                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md z-10 border border-gray-200">
                                                                <Link
                                                                    to={`.`}
                                                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                                                >
                                                                    View Details
                                                                </Link>
                                                                <button
                                                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                                                    onClick={() => console.log("Edit user", item.id)}
                                                                >
                                                                    Edit User
                                                                </button>
                                                                <button
                                                                    className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full text-left"
                                                                    onClick={() => console.log("Remove user", item.id)}
                                                                >
                                                                    Remove User
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                        
                                                    <div className="text-center mx-auto">
                                                        <img
                                                            src={item.profile}
                                                            alt={item.name}
                                                            className="mx-auto w-16 h-16 rounded-full mb-3"
                                                        />
                                                        <h3 className="text-[#1E293B] font-medium mb-1">{item.name}</h3>
                                                        <p className="text-gray-500 text-sm mb-2">{item.userId}</p>
                                                        <div className="flex items-center justify-center space-x-2 mt-1">
                                                            <FaPhone className="text-[#9847FE]" size={14} />
                                                            <span className="text-gray-600 text-sm">{item.phone}</span>
                                                        </div>
                                                        <div className="flex items-center justify-center space-x-2 mt-1">
                                                            <FaEnvelope className="text-[#9847FE]" size={14} />
                                                            <span className="text-[#9847FE] text-sm">{item.email}</span>
                                                        </div>
                                                        <p className="text-gray-500 text-sm mt-1">{item.location}</p>
                                                        <p className="text-gray-500 text-sm mt-1">{item.dateJoined}</p>
                                                        <button className="bg-[#9847FE] text-white mt-3 px-4 py-2 text-sm rounded-md">
                                                Send a Message
                                                </button>
                                                    </div>
                                                </div>
                                               
                    ))}
                </div>
            )}

            {activeTab === "grid" && (
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
                        <button onClick={handlePreviousPage} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-gray-200">◀</button>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md bg-gray-200">▶</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersTable;