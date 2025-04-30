import React, { useState, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import { Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, ShoppingBag, Shirt, Wallet, } from "lucide-react";

const catalogData = [
    { id: "1", thumbnail: "https://randomuser.me/api/portraits/thumb/men/1.jpg", styleName: "D4 Agbada", category: "Agbada", sewingTime: "7 Days", price: "₦105,000", status: "Active" },
    { id: "2", thumbnail: "https://randomuser.me/api/portraits/thumb/men/2.jpg", styleName: "D4 Agbada", category: "Agbada", sewingTime: "7 Days", price: "₦105,000", status: "Active" },
    { id: "3", thumbnail: "https://randomuser.me/api/portraits/thumb/men/3.jpg", styleName: "D4 Agbada", category: "Agbada", sewingTime: "7 Days", price: "₦105,000", status: "Unpublished" },
    { id: "4", thumbnail: "https://randomuser.me/api/portraits/thumb/men/4.jpg", styleName: "D4 Agbada", category: "Agbada", sewingTime: "7 Days", price: "₦105,000", status: "Published" },
];

const ordersData = [
    { id: "1", orderId: "EWREI12324NH", customer: "Frank Samuel", styleName: "Native Agbada", status: "Active", date: "12/06/25", total: "₦105,000" },
    { id: "2", orderId: "EWREI12324NH", customer: "Frank Samuel", styleName: "Native Agbada", status: "Completed", date: "12/06/25", total: "₦105,000" },
    { id: "3", orderId: "EWREI12324NH", customer: "Frank Samuel", styleName: "Native Agbada", status: "Cancelled", date: "12/06/25", total: "₦105,000" },
    { id: "4", orderId: "EWREI12324NH", customer: "Frank Samuel", styleName: "Native Agbada", status: "Ongoing", date: "12/06/25", total: "₦105,000" },
];

const ViewCustomer = () => {
    const [catalogFilter, setCatalogFilter] = useState("all");
    const [ordersFilter, setOrdersFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [openDropdown, setOpenDropdown] = useState(null);
    const [catalogPage, setCatalogPage] = useState(1);
    const [ordersPage, setOrdersPage] = useState(1);
    const itemsPerPage = 4;

    // Filter Catalog Data
    const filteredCatalog = catalogData.filter(item => {
        if (catalogFilter === "all") return true;
        if (catalogFilter === "published") return item.status === "Published";
        if (catalogFilter === "unpublished") return item.status === "Unpublished";
        return true;
    });

    // Filter Orders Data
    const filteredOrders = ordersData.filter(order =>
        (ordersFilter === "all" || order.status.toLowerCase() === ordersFilter) &&
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const catalogColumns = [
        { label: "S/N", key: "id" },
        {
            label: "Thumbnail Image ",
            key: "thumbnail",
            render: (thumbnail) => <img src={thumbnail} alt="style" className="w-15 h-15 rounded-md" />
        },
        { label: "Style Name", key: "styleName" },
        { label: "Categories", key: "category" },
        { label: "Sewing Time", key: "sewingTime" },
        { label: "Price", key: "price" },
        {
            label: "Status ",
            key: "status",
            render: (status) => (
                <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                    {status}
                </span>
            )
        },
        {
            label: "Action",
            key: "action",
            render: (_, row) => (
                <div className="relative">
                    <button
                        onClick={() => setOpenDropdown(openDropdown === `catalog-${row.id}` ? null : `catalog-${row.id}`)}
                        className="px-2 py-1 cursor-pointer rounded-md text-gray-600"
                    >
                        •••
                    </button>
                    {openDropdown === `catalog-${row.id}` && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
                            <Link to={`/tailor/catalog/${row.id}`}>
                                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                                    View Details
                                </button>
                            </Link>
                            <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                                Edit Style
                            </button>
                        </div>
                    )}
                </div>
            )
        },
    ];

    const ordersColumns = [
        { label: "S/N", key: "id" },
        { label: "ORDER ID", key: "orderId" },
        { label: "CUSTOMER", key: "customer" },
        { label: "STYLE NAME", key: "styleName" },
        {
            label: "STATUS",
            key: "status",
            render: (status) => (
                <span className={`px-3 py-1 text-sm rounded-full ${status === "Ongoing" ? "bg-yellow-100 text-yellow-700" :
                    status === "Cancelled" ? "bg-red-100 text-red-700" :
                        status === "Completed" ? "bg-green-100 text-green-700" :
                            "bg-green-100 text-green-700"
                    }`}>
                    {status}
                </span>
            )
        },
        { label: "DATE", key: "date" },
        { label: "TOTAL", key: "total" },
        {
            label: "ACTION",
            key: "action",
            render: (_, row) => (
                <div className="relative">
                    <button
                        onClick={() => setOpenDropdown(openDropdown === `order-${row.id}` ? null : `order-${row.id}`)}
                        className="px-2 py-1 cursor-pointer rounded-md text-gray-600"
                    >
                        •••
                    </button>
                    {openDropdown === `order-${row.id}` && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
                            <Link to={`/customer/orders/orders-details/${row.id}`}>
                                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                                    View Details
                                </button>
                            </Link>
                            <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                                Cancel Order
                            </button>
                        </div>
                    )}
                </div>
            )
        },
    ];

    const customerColumns = [
        {
            label: "FULL NAME", key: "fullName", render: (_, row) => (
                <div className="flex items-center gap-3">
                    <img src={row.profile} alt="profile" className="w-10 h-10 rounded-full" />
                    <span>{row.fullName}</span>
                </div>
            )
        },
        {
            label: "KYC", key: "kyc", render: (kyc) => (
                <span className="text-purple-600 cursor-pointer hover:underline">{kyc}</span>
            )
        },
        { label: "EMAIL ADDRESS", key: "email" },
        { label: "PHONE NUMBER", key: "phone" },
        { label: "ADDRESS", key: "address" },
        { label: "DATE JOINED", key: "dateJoined" },
        {
            label: "ACTION", key: "action", render: (_, row) => (
                <div className="relative">
                    <button
                        onClick={() => setOpenDropdown(openDropdown === `customer-${row.id}` ? null : `customer-${row.id}`)}
                        className="px-2 py-1 cursor-pointer rounded-md text-gray-600"
                    >
                        •••
                    </button>
                    {openDropdown === `customer-${row.id}` && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
                            <Link to={`/admin/view-customers/${row.id}`}>
                                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                                    View Details
                                </button>
                            </Link>
                            <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                                Edit User
                            </button>
                        </div>
                    )}
                </div>
            )
        }
    ];

    const customerData = [
        {
            id: "1",
            fullName: "Emeka Okafor",
            profile: "https://randomuser.me/api/portraits/thumb/men/1.jpg",
            kyc: "See KYC",
            email: "testmail@gmail.com",
            phone: "+234 803 456 7890",
            address: "12, Allen Avenue, Ikeja, Lagos",
            dateJoined: "22/5/2025"
        }
    ];

    // Pagination for Catalog
    const catalogTotalPages = Math.ceil(filteredCatalog.length / itemsPerPage);
    const catalogStartIndex = (catalogPage - 1) * itemsPerPage;
    const catalogCurrentItems = filteredCatalog.slice(catalogStartIndex, catalogStartIndex + itemsPerPage);

    // Pagination for Orders
    const ordersTotalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const ordersStartIndex = (ordersPage - 1) * itemsPerPage;
    const ordersCurrentItems = filteredOrders.slice(ordersStartIndex, ordersStartIndex + itemsPerPage);

    // Reset page when filter changes
    useEffect(() => {
        setCatalogPage(1);
    }, [catalogFilter]);

    useEffect(() => {
        setOrdersPage(1);
    }, [ordersFilter]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-menu')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="">
            {/* Customer Info Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-800">
                        View Tailor/Designer: <span className="text-purple-600 font-medium">Cabel Akon</span>
                    </h2>
                    <p className="text-sm font-medium text-gray-600">
                        KYC: <span className="text-green-600 font-medium">Approved</span>
                    </p>
                </div>
                <div className="bg-white rounded-lg">
                    <ReusableTable columns={customerColumns} data={customerData} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Orders Card */}
                <div className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="41" viewBox="0 0 42 41" fill="none">
                            <rect x="0.785156" y="0.308594" width="40.2838" height="40.2838" rx="8.95195" fill="#FFCC91" fill-opacity="0.16" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M25.1351 29.309H17.3508C14.4915 29.309 12.2979 28.2762 12.9209 24.1194L13.6465 18.4861C14.0305 16.412 15.3535 15.6182 16.5144 15.6182H26.0057C27.1836 15.6182 28.4298 16.4717 28.8736 18.4861L29.5991 24.1194C30.1283 27.8067 27.9945 29.309 25.1351 29.309Z" stroke="#130F26" stroke-width="1.67849" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M25.264 15.4135C25.264 13.1885 23.4602 11.3848 21.2352 11.3848V11.3848C20.1638 11.3803 19.1347 11.8027 18.3755 12.5587C17.6162 13.3148 17.1894 14.3421 17.1895 15.4135V15.4135" stroke="#130F26" stroke-width="1.67849" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M24.0008 19.6123H23.9582" stroke="#130F26" stroke-width="1.67849" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M18.5633 19.6123H18.5207" stroke="#130F26" stroke-width="1.67849" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <button className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-md">
                            This Week ▼
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase mb-3 mt-4">All Orders</p>
                            <p className="text-lg font-semibold text-gray-800">450 <span className="text-red-500 text-sm font-normal">-20%</span></p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase mb-3 mt-4">Pending</p>
                            <p className="text-lg font-semibold text-gray-800">5</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase mb-3 mt-4">Completed</p>
                            <p className="text-lg font-semibold text-gray-800">320</p>
                        </div>
                    </div>
                </div>

                {/* Catalog Card */}
                <div className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="41" height="41" viewBox="0 0 41 41" fill="none">
                            <rect x="0.126953" y="0.308594" width="40.2838" height="40.2838" rx="8.95195" fill="#91A0FF" fill-opacity="0.25" />
                            <path d="M22.5846 10C22.5846 10 21.4894 10.3846 19.7692 10.3846C18.049 10.3846 16.9538 10 16.9538 10C16.7808 10.0001 16.609 10.0293 16.4457 10.0865L9 12.6923L9.79952 16.9231L12.1495 17.1885C12.4373 17.221 12.7023 17.3606 12.8919 17.5796C13.0816 17.7985 13.1819 18.0807 13.1731 18.3702L12.8462 30H26.6923L26.3654 18.3702C26.3565 18.0807 26.4569 17.7985 26.6465 17.5796C26.8361 17.3606 27.1012 17.221 27.3889 17.1885L29.7389 16.9231L30.5385 12.6923L23.0928 10.0865C22.9295 10.0293 22.7577 10.0001 22.5846 10Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M23.4864 10.2236C23.2684 11.0429 22.7858 11.7673 22.1136 12.284C21.4414 12.8007 20.6174 13.0808 19.7696 13.0808C18.9217 13.0808 18.0977 12.8007 17.4255 12.284C16.7533 11.7673 16.2707 11.0429 16.0527 10.2236" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <button className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-md">
                            This Week ▼
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase mb-3 mt-4">All Styles</p>
                            <p className="text-lg font-semibold text-gray-800">15</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase mb-3 mt-4">Published</p>
                            <p className="text-lg font-semibold text-gray-800">13</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase mb-3 mt-4">Unpublished</p>
                            <p className="text-lg font-semibold text-gray-800">2</p>
                        </div>
                    </div>
                </div>

                {/* Wallet Card */}
                <div className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="41" height="41" viewBox="0 0 41 41" fill="none">
                            <rect x="0.46875" y="0.308594" width="40.2838" height="40.2838" rx="8.95195" fill="#A5FF91" fill-opacity="0.3" />
                            <path d="M30 17V14.4C30 13.075 29.12 12 28.036 12H11.964C10.879 12 10 13.075 10 14.4V25.6C10 26.925 10.88 28 11.964 28H28.036C29.121 28 30 26.925 30 25.6V23M29 20H29.01M25.6 17H30.4C30.8243 17 31.2313 17.1686 31.5314 17.4686C31.8314 17.7687 32 18.1757 32 18.6V21.4C32 21.8243 31.8314 22.2313 31.5314 22.5314C31.2313 22.8314 30.8243 23 30.4 23H25.6C25.1757 23 24.7687 22.8314 24.4686 22.5314C24.1686 22.2313 24 21.8243 24 21.4V18.6C24 18.1757 24.1686 17.7687 24.4686 17.4686C24.7687 17.1686 25.1757 17 25.6 17Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <button className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-md">
                            This Week ▼
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase mb-3 mt-4">Total Earned</p>
                            <p className="text-lg font-semibold text-gray-800">₦350K</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase mb-3 mt-4">Available Balance</p>
                            <p className="text-lg font-semibold text-gray-800">₦42K</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tailor/Designer Catalog */}
            <div className="bg-white p-6 rounded-lg mb-6">
                <h2 className="font-medium text-gray-800 mb-4">Tailor/Designer Catalog</h2>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
                        {['all', 'published', 'unpublished'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setCatalogFilter(tab)}
                                className={`font-medium capitalize px-3 py-1 ${catalogFilter === tab ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}
                            >
                                {tab} Styles
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full sm:w-[200px] pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md text-sm">Export As ▼</button>
                        <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">Sort: Newest First ▼</button>
                    </div>
                </div>
                <ReusableTable columns={catalogColumns} data={catalogCurrentItems} />
                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-600">Showing 1 to {catalogCurrentItems.length} of {filteredCatalog.length} entries</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCatalogPage(page => Math.max(page - 1, 1))}
                            disabled={catalogPage === 1}
                            className="p-2 bg-gray-200 rounded-full"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {[...Array(catalogTotalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCatalogPage(i + 1)}
                                className={`px-3 py-1 rounded-full ${catalogPage === i + 1 ? "bg-purple-600 text-white" : "bg-gray-200"}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCatalogPage(page => Math.min(page + 1, catalogTotalPages))}
                            disabled={catalogPage === catalogTotalPages}
                            className="p-2 bg-gray-200 rounded-full"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Handled */}
            <div className="bg-white p-6 rounded-lg">
                <h2 className="font-medium text-gray-800 mb-4">Orders Handled</h2>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
                        {['all', 'ongoing', 'completed', 'cancelled'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setOrdersFilter(tab)}
                                className={`font-medium capitalize px-3 py-1 ${ordersFilter === tab ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}
                            >
                                {tab} Orders
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full sm:w-[200px] pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md text-sm">Export As ▼</button>
                        <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">Sort: Newest First ▼</button>
                    </div>
                </div>
                <ReusableTable columns={ordersColumns} data={ordersCurrentItems} />
                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-600">Showing 1 to {ordersCurrentItems.length} of {filteredOrders.length} entries</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setOrdersPage(page => Math.max(page - 1, 1))}
                            disabled={ordersPage === 1}
                            className="p-2 bg-gray-200 rounded-full"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {[...Array(ordersTotalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setOrdersPage(i + 1)}
                                className={`px-3 py-1 rounded-full ${ordersPage === i + 1 ? "bg-purple-600 text-white" : "bg-gray-200"}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setOrdersPage(page => Math.min(page + 1, ordersTotalPages))}
                            disabled={ordersPage === ordersTotalPages}
                            className="p-2 bg-gray-200 rounded-full"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewCustomer;