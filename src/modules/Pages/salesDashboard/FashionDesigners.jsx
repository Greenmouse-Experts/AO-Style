import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { FaEllipsisH } from "react-icons/fa";
import ReusableTable from "../salesDashboard/components/ReusableTable";

const vendors = [
    { id: 1, name: "Daniel Ambode", businessName: "Daneil Enterprise", marketplace: "Balogun Market", date: "12-02-25", email: "testmail@gmail.com", status: "Approved" },
    { id: 2, name: "Daniel Ambode", businessName: "Daneil Enterprise", marketplace: "Balogun Market", date: "12-02-25", email: "testmail@gmail.com", status: "Pending" },
    { id: 3, name: "Daniel Ambode", businessName: "Daneil Enterprise", marketplace: "Balogun Market", date: "12-02-25", email: "testmail@gmail.com", status: "Approved" },
    { id: 4, name: "Daniel Ambode", businessName: "Daniel Enterprise", marketplace: "Balogun Market", date: "12-02-25", email: "testmail@gmail.com", status: "Declined" },
    { id: 5, name: "Daniel Ambode", businessName: "Daneil Enterprise", marketplace: "Balogun Market", date: "12-02-25", email: "testmail@gmail.com", status: "Pending" },
    { id: 6, name: "Daniel Ambode", businessName: "Daneil Enterprise", marketplace: "Balogun Market", date: "12-02-25", email: "testmail@gmail.com", status: "Approved" },
];

export default function FabricVendorPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("All Fashion Designers");
    const dropdownRef = useRef(null);
    const [openDropdown, setOpenDropdown] = useState(null);

    const columns = [
        { key: "id", label: "#" },
        { key: "name", label: "Name" },
        { key: "businessName", label: "Business Name" },
        { key: "marketplace", label: "Marketplace" },
        { key: "date", label: "Date Added" },
        { key: "email", label: "Email" },
        {
            key: "status",
            label: "Status",
            render: (value) => (
                <span className={`px-3 py-1 text-sm font-light rounded-md ${value === "Pending" ? "bg-yellow-100 text-yellow-600" : value === "Declined" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {value}
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
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10">
                            <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">View Fashion Designersr</button>
                            <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">Edit  Fashion Designersr</button>
                            <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full">Remove Fashion Designersr</button>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    const filteredVendors = vendors.filter((vendor) => {
        if (filter !== "All Fashion Designers" && vendor.status !== filter) return false;
        return vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const toggleDropdown = (rowId) => {
        setOpenDropdown(openDropdown === rowId ? null : rowId);
    };

    return (
        <div>
            <div className="bg-white px-4 sm:px-6 py-4 mb-6 relative">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                    <h1 className="text-xl sm:text-2xl font-medium">Fashion Designers</h1>
                    <Link to="/sales/add-fashion-designers" className="w-full sm:w-auto">
                        <button className="bg-gradient text-white px-6 sm:px-8 py-3 sm:py-3 cursor-pointer rounded-md hover:bg-purple-600 transition w-full sm:w-auto">
                            All Fashion Designers
                        </button>
                    </Link>
                </div>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">
                    <Link to="/sales" className="text-blue-500 hover:underline">Dashboard</Link> &gt; Fashion Designers
                </p>
            </div>


            {/* Filter & Search Section */}
            <div className="bg-white p-4 rounded-lg">
                <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap space-x-6 text-gray-600 text-sm font-medium">
                        {["All Fashion Designers", "Approved", "Pending", "Declined"].map((tab) => (
                            <button key={tab} onClick={() => setFilter(tab)} className={`font-medium ${filter === tab ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Search & Sorting */}
                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search"
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="px-4 py-2 bg-gray-200 rounded-md">Export As ▼</button>
                        <button className="px-4 py-2 bg-gray-200 rounded-md">Sort: Newest First ▼</button>
                    </div>
                </div>

                {/* Vendors Table */}
                <ReusableTable columns={columns} data={filteredVendors || []} />
            </div>
        </div>
    );
}
