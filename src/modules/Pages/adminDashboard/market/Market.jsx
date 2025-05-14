import { useState, useRef, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import { FaEllipsisH, FaBars, FaTh, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

const MarketsTable = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const dropdownRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newMarket, setNewMarket] = useState({
        marketName: "",
        marketState: "",
    });
    const [activeTab, setActiveTab] = useState("table");

    const data = Array.from({ length: 200 }, (_, i) => ({
        id: i + 1,
        marketName: `Onitsha Main Market`,
        marketLocation: "Anambra State",
        totalFabrics: "12002 Fabrics",
        dateAdded: "01/04/25",
    }));

    const handleDropdownToggle = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const nigerianStates = [
        "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
        "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
        "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
        "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
        "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
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

    const columns = [
        { label: "S/N", key: "id" },
        { label: "Market Name", key: "marketName" },
        { label: "Market Location", key: "marketLocation" },
        { label: "Total Fabrics", key: "totalFabrics" },
        { label: "Date Added", key: "dateAdded" },
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
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewMarket({
            marketName: "",
            marketState: "",
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMarket((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        console.log("New Market Data:", newMarket);
        closeModal();
    };

    return (
        <div className="bg-white p-6 rounded-xl overflow-x-auto">
            <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <h2 className="text-lg font-semibold">Markets</h2>
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
                    <button
                        onClick={openModal}
                        className="bg-gradient text-white px-6 py-3 text-sm rounded-md whitespace-nowrap cursor-pointer"
                    >
                        + Add a New Market
                    </button>
                </div>
            </div>

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
                                        <button
                                            to={`.`}
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            View Details
                                        </button>
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
                                <h3 className="text-[#1E293B] font-medium">{item.marketName}</h3>
                                <div className="flex items-center justify-center space-x-2 mt-1">
                                    <FaMapMarkerAlt className="text-[#9847FE]" size={14} />
                                    <span className="text-gray-600 text-sm">{item.marketLocation}</span>
                                </div>
                                <p className="text-gray-500 text-sm mt-1">{item.totalFabrics}</p>
                                <div className="flex items-center justify-center space-x-2 mt-1">
                                    <FaCalendarAlt className="text-[#9847FE]" size={14} />
                                    <span className="text-gray-600 text-sm">{item.dateAdded}</span>
                                </div>
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

            {isModalOpen && (
                <div
                    className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-lg p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-end">
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <h3 className="text-lg font-semibold mb-4 -mt-7">Add Marketplace</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Market Image</label>
                                <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-gray-400 mb-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                    <p className="text-sm text-gray-500">Upload Picture of Market</p>
                                    <input
                                        type="file"
                                        name="marketImage"
                                        className="hidden"
                                        onChange={(e) => console.log("File selected:", e.target.files[0])}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Market Name</label>
                                <input
                                    type="text"
                                    name="marketName"
                                    value={newMarket.marketName}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-lg text-sm"
                                    placeholder="Enter the market name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Market State</label>
                                <select
                                    name="marketState"
                                    value={newMarket.marketState}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-lg text-sm text-gray-500"
                                >
                                    <option value="" disabled>
                                        Choose the state the market is in
                                    </option>
                                    {nigerianStates.map((state) => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            className="mt-6 w-full bg-gradient text-white px-4 py-3 text-sm rounded-md"
                        >
                            Add Marketplace
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketsTable;