import { useState, useRef, useEffect } from "react";
import ReusableTable from "./components/ReusableTable";
import { FaEllipsisH, FaBars, FaTh, FaLayerGroup, FaCalendarAlt } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";

const FabricCategoryTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const dropdownRef = useRef(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [data, setData] = useState(
        Array.from({ length: 150 }, (_, i) => ({
            id: i + 1,
            categoryName: `Category ${i + 1}`,
            totalFabrics: Math.floor(Math.random() * 1000) + " Fabrics",
            dateAdded: `01/04/25`,
        }))
    );
    const [activeTab, setActiveTab] = useState("table");

    const toggleDropdown = (rowId) => {
        setOpenDropdown(openDropdown === rowId ? null : rowId);
    };

    const handleDropdownToggle = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
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
        { label: "Category Name", key: "categoryName" },
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

    const handleAddCategory = () => {
        if (!newCategory.trim()) return; // Prevent adding empty categories
        const newCategoryData = {
            id: data.length + 1,
            categoryName: newCategory,
            totalFabrics: "0 Fabrics",
            dateAdded: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }),
        };
        setData([...data, newCategoryData]);
        setNewCategory("");
        setIsAddModalOpen(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl overflow-x-auto">
            <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <h2 className="text-lg font-semibold">Fabric Categories</h2>
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
                        placeholder="Search fabrics categories..."
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
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-gradient text-white px-4 py-2 text-sm rounded-md"
                    >
                        + Add a Fabric Category
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
                                <h3 className="text-[#1E293B] font-medium mb-2">{item.categoryName}</h3>
                                <div className="flex items-center justify-center space-x-2 mt-2">
                                    <FaLayerGroup className="text-[#9847FE]" size={14} />
                                    <span className="text-gray-600 text-sm">{item.totalFabrics}</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2 mt-2">
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

            {/* Add Fabric Category Modal */}
            {isAddModalOpen && (
                <div
                    className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
                    onClick={() => setIsAddModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-xl p-6 w-full max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Add a Fabric Category</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">Category Name</label>
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                    placeholder="Enter the category name"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between mt-6 space-x-4">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="w-full bg-purple-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCategory}
                                className="w-full bg-gradient text-white px-4 py-4 rounded-md text-sm font-medium"
                            >
                                Add Fabric Category
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FabricCategoryTable;