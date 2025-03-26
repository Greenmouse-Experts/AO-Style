import React, { useState, useRef } from "react";
import ReusableTable from "./components/ReusableTable";
import { Search } from "lucide-react";
import { FaEllipsisH } from "react-icons/fa";
import { Link } from "react-router-dom";

const products = [
    { id: "01", name: "Red Ankara Material", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image1_ghkqjm.png", category: "Ankara", price: "N 7000/per yard", qty: 120, stockStatus: "In-Stock", status: "Published" },
    { id: "02", name: "Red Ankara Material", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image4_dkiyz7.png", category: "Silk", price: "N 7000/per yard", qty: 120, stockStatus: "In-Stock", status: "Published" },
    { id: "03", name: "Red Ankara Material", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png", category: "Chiffon", price: "N 7000/per yard", qty: 120, stockStatus: "Out Of Stock", status: "Published" },
    { id: "04", name: "Red Ankara Material", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image1_ghkqjm.png", category: "Ankara", price: "N 7000/per yard", qty: 120, stockStatus: "In-Stock", status: "Cancelled" },
    { id: "05", name: "Red Ankara Material", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image4_dkiyz7.png", category: "Silk", price: "N 7000/per yard", qty: 120, stockStatus: "In-Stock", status: "Pending" },
    { id: "06", name: "Red Ankara Material", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image1_ghkqjm.png", category: "Ankara", price: "N 7000/per yard", qty: 120, stockStatus: "In-Stock", status: "Published" },
];

const ProductPage = () => {
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const filteredProducts = products.filter(product =>
        (filter === "all" || product.status.toLowerCase() === filter) &&
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { label: "#", key: "id" },
        { label: "Product Name", key: "name" },
        { label: "Image", key: "image", render: (image) => <img src={image} alt="product" className="w-10 h-10 rounded" /> },
        { label: "Category", key: "category" },
        { label: "Price", key: "price" },
        { label: "Qty", key: "qty" },
        {
            label: "Stock Status", key: "stockStatus", render: (status) => (
                <span className={status === "Out Of Stock" ? "text-red-500" : "text-gray-700"}>{status}</span>
            )
        },
        {
            label: "Status", key: "status", render: (status) => (
                <span className={`px-3 py-1 text-sm rounded-full ${status === "Published" ? "bg-green-100 text-green-700" :
                    status === "Cancelled" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"}`}>{status}</span>
            )
        },
        {
            label: "Action",
            key: "action",
            render: (_, row) => (
                <div className="relative" ref={dropdownRef}>
                    <button
                        className="text-gray-500 px-3 py-1 rounded-md"
                        onClick={() => toggleDropdown(row.id)}
                    >
                        <FaEllipsisH />
                    </button>
                    {openDropdown === row.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10">
                            <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">Edit Product</button>
                            <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full">Remove Product</button>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="bg-white px-4 sm:px-6 py-4 mb-6 relative">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                    <h1 className="text-xl sm:text-2xl font-medium">My Products</h1>
                    <Link to="/fabric/product/add-product" className="w-full sm:w-auto">
                        <button className="bg-gradient text-white px-6 sm:px-8 py-3 sm:py-3 cursor-pointer rounded-md hover:bg-purple-600 transition w-full sm:w-auto">
                        + Add New Product
                        </button>
                    </Link>
                </div>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">
                    <Link to="/sales" className="text-blue-500 hover:underline">Dashboard</Link> &gt; My Products
                </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
                    {/* Product Filters */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
                        {["all", "published", "unpublished"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`font-medium capitalize px-3 py-1 ${filter === tab ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}
                            >
                                {tab} Products
                            </button>
                        ))}
                    </div>
                    {/* Search Bar */}
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search"
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none w-full sm:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
                            Export As ▾
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
                            Sort: Newest First ▾
                        </button>
                    </div>
                </div>
                {/* Table Section */}
                <ReusableTable columns={columns} data={filteredProducts} />
            </div>
        </>
    );
};

export default ProductPage;