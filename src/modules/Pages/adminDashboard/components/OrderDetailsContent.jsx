import React, { useState, useRef, useEffect } from 'react';
import ReusableTable from './ReusableTable';
import { Link } from 'react-router-dom';

const OrderDetailsPage = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [activeTab, setActiveTab] = useState(3);

    const statuses = [
        {
            label: 'Order Placed',
            status: 'completed',
            details: 'Order placed on 12 Aug 2025 - 12:25 am',
        },
        {
            label: 'Fabric Delivery',
            status: 'completed',
            details: 'Fabric delivered on 15 Aug 2025 - 9:00 am',
        },
        {
            label: 'Tailoring',
            status: 'completed',
            details: 'Tailoring completed on 20 Aug 2025 - 3:00 pm',
        },
        {
            label: 'Out for Delivery',
            status: 'current',
            details: 'Out for delivery on 22 Aug 2025 - 10:00 am',
        },
        {
            label: 'Delivered',
            status: 'pending',
            details: 'Not yet delivered',
        },
    ];

    const getProgressWidth = () => {
        const completedCount = statuses.filter(s => s.status === 'completed').length;
        return (completedCount / statuses.length) * 100;
    };

    // Order Details Table Data
    const orderDetailsData = [
        { id: 1, orderId: 'ORD123SDW', customerName: 'Chukka Uzo', amount: '250,000', orderStatus: 'In-Progress', paymentStatus: 'Paid' },
    ];

    const orderDetailsColumns = [
        { label: 'S/N', key: 'id' },
        { label: 'Order ID', key: 'orderId' },
        { label: 'Customer Name', key: 'customerName' },
        { label: 'Amount', key: 'amount' },
        {
            label: 'Order Status',
            key: 'orderStatus',
            render: (status) => <span className="text-blue-500">{status}</span>,
        },
        {
            label: 'Payment Status',
            key: 'paymentStatus',
            render: (status) => <span className={status === 'Paid' ? 'text-green-500' : 'text-gray-400'}>{status}</span>,
        },
    ];

    // Financial Summary Table Data
    const financialSummaryData = [
        { id: 1, item: 'Fabric Cost', amount: 'N200,000', paymentStatus: 'Paid', action: '' },
        { id: 2, item: 'Fabric Delivery Fee', amount: 'N2,000', paymentStatus: 'Paid', action: '' },
        { id: 3, item: 'Tailoring Fee', amount: 'N120,000', paymentStatus: 'Paid', action: '' },
        { id: 4, item: 'Tailoring Delivery Fee', amount: 'N9,000', paymentStatus: 'Paid', action: '' },
        { id: 5, item: 'Total Paid', amount: 'N420,000', paymentStatus: 'Paid', action: '' },
        { id: 6, item: 'Platform Commission (10%)', amount: 'N2,100', paymentStatus: 'Paid', action: '' },
        { id: 7, item: 'Tailor Payout', amount: 'N188,000', paymentStatus: 'Pending Payout', action: '' },
        { id: 8, item: 'Fabric Vendor Payout', amount: 'N188,000', paymentStatus: 'Pending Payout', action: '' },
    ];

    const financialSummaryColumns = [
        { label: 'S/N', key: 'id' },
        { label: 'Item', key: 'item' },
        { label: 'Amount', key: 'amount' },
        {
            label: 'Payment Status',
            key: 'paymentStatus',
            render: (status) => (
                <span className={status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}>{status}</span>
            ),
        },
        {
            label: 'Action',
            key: 'action',
            render: () => (
                <button className="text-purple-500 text-sm hover:underline">View</button>
            ),
        },
    ];

    // Uploaded Images Table Data
    const uploadedImagesData = [
        { id: 1, uploadedBy: 'Tailor/Designer', image: 'Image Placeholder', uploadedOn: '09-06-2025' },
        { id: 2, uploadedBy: 'Logistic Agent', image: 'Image Placeholder', uploadedOn: '09-06-2025' },
    ];

    const uploadedImagesColumns = [
        { label: 'S/N', key: 'id' },
        { label: 'Uploaded By', key: 'uploadedBy' },
        {
            label: 'Image',
            key: 'image',
            render: () => <div className="w-12 h-12 bg-green-300 rounded-md"></div>,
        },
        { label: 'Uploaded On', key: 'uploadedOn' },
    ];

    // Pagination Logic
    const filteredOrderDetails = orderDetailsData.filter((order) =>
        Object.values(order).some((value) =>
            typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    const filteredFinancialSummary = financialSummaryData.filter((item) =>
        Object.values(item).some((value) =>
            typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    const filteredUploadedImages = uploadedImagesData.filter((item) =>
        Object.values(item).some((value) =>
            typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrderDetails = filteredOrderDetails.slice(indexOfFirstItem, indexOfLastItem);
    const currentFinancialSummary = filteredFinancialSummary.slice(indexOfFirstItem, indexOfLastItem);
    const currentUploadedImages = filteredUploadedImages.slice(indexOfFirstItem, indexOfLastItem);

    const totalOrderDetailsPages = Math.ceil(filteredOrderDetails.length / itemsPerPage);
    const totalFinancialSummaryPages = Math.ceil(filteredFinancialSummary.length / itemsPerPage);
    const totalUploadedImagesPages = Math.ceil(filteredUploadedImages.length / itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < Math.max(totalOrderDetailsPages, totalFinancialSummaryPages, totalUploadedImagesPages)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const toggleDropdown = (rowId) => {
        setOpenDropdown(openDropdown === rowId ? null : rowId);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="">
            <div className="bg-white p-6 rounded-lg mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h2>
                <div className="relative mb-4">
                    <div className="flex items-center justify-between">
                        {statuses.map((status, index) => (
                            <div
                                key={index}
                                className="flex-1 flex flex-col items-center cursor-pointer z-10"
                                onClick={() => setActiveTab(index)}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white mb-2 transition-all duration-300 ${status.status === 'completed'
                                            ? 'bg-[#DF7D12]'
                                            : status.status === 'current'
                                                ? 'bg-[#DF7D12]'
                                                : 'bg-gray-300'
                                        } ${activeTab === index ? 'ring-2 ring-offset-2 ring-[#DF7D12]' : ''}`}
                                >
                                    ✔
                                </div>
                                <p
                                    className={`text-sm transition-all duration-300 ${activeTab === index ? 'text-gray-800 font-semibold' : 'text-gray-600'
                                        }`}
                                >
                                    {status.label}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="absolute top-4 left-0 w-full h-1">
                        <div
                            className="h-1 bg-[#DF7D12] transition-all duration-300"
                            style={{ width: `${getProgressWidth()}%` }}
                        ></div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">{statuses[activeTab].label}</h3>
                    <p className="text-sm text-gray-600">{statuses[activeTab].details}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-800">Order Details</h2>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-64"
                    />
                </div>
                <ReusableTable columns={orderDetailsColumns} data={currentOrderDetails} />
                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center">
                        <p className="text-sm text-gray-600">Items per page: </p>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="py-2 px-3 border border-gray-200 ml-2 rounded-md outline-none text-sm w-auto"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                        <p className="text-sm text-gray-600 ml-4">
                            {indexOfFirstItem + 1}-{indexOfLastItem > filteredOrderDetails.length ? filteredOrderDetails.length : indexOfLastItem} of {filteredOrderDetails.length} items
                        </p>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={handlePreviousPage} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-gray-200">
                            ◀
                        </button>
                        <button onClick={handleNextPage} disabled={currentPage === totalOrderDetailsPages} className="px-3 py-1 rounded-md bg-gray-200">
                            ▶
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg mt-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Financial Summary</h2>
                <ReusableTable columns={financialSummaryColumns} data={currentFinancialSummary} />
                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center">
                        <p className="text-sm text-gray-600">Items per page: </p>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="py-2 px-3 border border-gray-200 ml-2 rounded-md outline-none text-sm w-auto"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                        <p className="text-sm text-gray-600 ml-4">
                            {indexOfFirstItem + 1}-{indexOfLastItem > filteredFinancialSummary.length ? filteredFinancialSummary.length : indexOfLastItem} of {filteredFinancialSummary.length} items
                        </p>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={handlePreviousPage} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-gray-200">
                            ◀
                        </button>
                        <button onClick={handleNextPage} disabled={currentPage === totalFinancialSummaryPages} className="px-3 py-1 rounded-md bg-gray-200">
                            ▶
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-white p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Uploaded Images</h2>
                <ReusableTable columns={uploadedImagesColumns} data={currentUploadedImages} />
                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center">
                        <p className="text-sm text-gray-600">Items per page: </p>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="py-2 px-3 border border-gray-200 ml-2 rounded-md outline-none text-sm w-auto"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                        <p className="text-sm text-gray-600 ml-4">
                            {indexOfFirstItem + 1}-{indexOfLastItem > filteredUploadedImages.length ? filteredUploadedImages.length : indexOfLastItem} of {filteredUploadedImages.length} items
                        </p>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={handlePreviousPage} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-gray-200">
                            ◀
                        </button>
                        <button onClick={handleNextPage} disabled={currentPage === totalUploadedImagesPages} className="px-3 py-1 rounded-md bg-gray-200">
                            ▶
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;