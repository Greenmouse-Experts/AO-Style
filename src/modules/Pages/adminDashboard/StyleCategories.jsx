import { useState, useRef, useEffect } from "react";
import ReusableTable from "./components/ReusableTable";
import { FaEllipsisH } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { BsFilter } from "react-icons/bs";

const StyleCategoriesTable = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const data = Array.from({ length: 200 }, (_, i) => ({
        id: i + 1,
        styleName: `Style Category ${i + 1}`,
        totalFabrics: `${Math.floor(Math.random() * 1000) + 1} Fabrics`,
        dateAdded: "01/04/25",
    }));

    const columns = [
        { label: "S/N", key: "id" },
        { label: "Style Name", key: "styleName" },
        { label: "Total Fabrics", key: "totalFabrics" },
        { label: "Date Added", key: "dateAdded" },
        {
            label: "Action",
            key: "action",
            render: (_, row) => (
                <div className="relative">
                    <button className="p-2 text-gray-600">
                        <FaEllipsisH />
                    </button>
                </div>
            ),
        },
    ];

    const filteredData = data.filter((style) =>
        Object.values(style).some((value) =>
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

    return (
        <div className="bg-white p-6 rounded-xl overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Style Categories</h2>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                    <input
                        type="text"
                        placeholder="Search style categories..."
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
                    <button className="bg-[#9847FE] text-white px-4 py-2 text-sm rounded-md">
                    + Add a New Style Category
                    </button>
                </div>
            </div>
            <ReusableTable columns={columns} data={currentItems} />
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-1">
                    <button onClick={handlePreviousPage} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-gray-200">&#9664;</button>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md bg-gray-200">&#9654;</button>
                </div>
            </div>
        </div>
    );
};

export default StyleCategoriesTable;
