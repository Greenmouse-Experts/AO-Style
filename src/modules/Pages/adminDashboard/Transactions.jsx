import { useState } from "react";
import ReusableTable from "./components/ReusableTable";
import TransactionPayment from "./components/TransactionPayment";
import RegisterChart from "./components/RegisterChart";
import SalesSummaryChart from "./components/SalesSummaryChart";

const PaymentTransactionTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [activeTab, setActiveTab] = useState("All Transactions");

    const data = [
        { id: 1, transactionID: "TRX215465789123", date: "12 Aug 2025 - 12:25 am", userName: "Chukka Uzo", userType: "Customer", amount: "₦25,000.00", transactionType: "Payment", status: "In-Progress" },
        { id: 2, transactionID: "TRX215465789123", date: "12 Aug 2025 - 12:25 am", userName: "Chukka Uzo", userType: "Tailor", amount: "₦25,000.00", transactionType: "Refund", status: "In-Progress" },
        { id: 3, transactionID: "TRX215465789123", date: "12 Aug 2025 - 12:25 am", userName: "Chukka Uzo", userType: "Vendors", amount: "₦25,000.00", transactionType: "Payment", status: "Completed" },
        { id: 4, transactionID: "TRX215465789123", date: "12 Aug 2025 - 12:25 am", userName: "Chukka Uzo", userType: "Sales Rep", amount: "₦25,000.00", transactionType: "Payout", status: "In-Progress" },
        { id: 5, transactionID: "TRX215465789123", date: "12 Aug 2025 - 12:25 am", userName: "Chukka Uzo", userType: "Logistics", amount: "₦25,000.00", transactionType: "Payment", status: "Completed" },
    ];

    const tabs = ["All Transactions", "In-Progress", "Completed"];

    const columns = [
        { label: "Transaction ID", key: "transactionID", className: "text-gray-500 font-medium text-sm py-4" },
        { label: "Date and Time", key: "date", className: "text-gray-500 font-medium text-sm py-4" },
        { label: "User Name", key: "userName", className: "text-gray-500 font-medium text-sm py-4" },
        { label: "User Type", key: "userType", className: "text-gray-500 font-medium text-sm py-4" },
        { label: "Amount", key: "amount", className: "text-gray-500 font-medium text-sm py-4" },
        { label: "Transaction Type", key: "transactionType", className: "text-gray-500 font-medium text-sm py-4" },
        {
            label: "Status",
            key: "status",
            className: "text-gray-500 font-medium text-sm py-4",
            render: (status) => (
                <span
                    className={`px-2 py-1 text-sm rounded-full font-medium ${
                        status === "In-Progress"
                            ? "bg-blue-100 text-blue-500"
                            : "bg-green-100 text-green-500"
                    }`}
                >
                    {status}
                </span>
            ),
        },
        // {
        //     label: "Action",
        //     key: "action",
        //     className: "text-gray-500 font-medium text-sm py-4",
        //     render: () => (
        //         <span className="text-gray-500">...</span>
        //     ),
        // },
    ];

    const filteredData = data.filter((transaction) => {
        const matchesSearch = Object.values(transaction).some(
            (value) =>
                typeof value === "string" &&
                value.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesTab =
            activeTab === "All Transactions" || transaction.status === activeTab;
        return matchesSearch && matchesTab;
    });

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
        <>
            <TransactionPayment />
            <div className="bg-white p-6 rounded-xl overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">All Transactions</h2>
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                        <input
                            type="text"
                            placeholder="Search ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
                        />
                        <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
                            Filter ▾
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
                            Report ▾
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
                            Bulk Action ▾
                        </button>
                    </div>
                </div>
                <div className="flex border-b border-gray-200 mb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`px-4 py-2 text-sm font-medium ${
                                activeTab === tab
                                    ? "text-purple-600 border-b-2 border-purple-600"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                            onClick={() => {
                                setActiveTab(tab);
                                setCurrentPage(1);
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <ReusableTable
                    columns={columns}
                    data={currentItems}
                    rowClassName="border-none text-gray-700 text-sm"
                    cellClassName="py-4"
                />
                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-600">
                            {indexOfFirstItem + 1}-
                            {indexOfLastItem > filteredData.length
                                ? filteredData.length
                                : indexOfLastItem}{" "}
                            of {filteredData.length} items
                        </p>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-auto"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-md bg-gray-200 text-gray-600 disabled:opacity-50"
                        >
                            ◀
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-md bg-gray-200 text-gray-600 disabled:opacity-50"
                        >
                            ▶
                        </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                            <div className="lg:col-span-2 flex flex-col">
                                <RegisterChart />
                            </div>
                            <div className="lg:col-span-1">
                                <SalesSummaryChart />
                            </div>
                        </div>
        </>
    );
};

export default PaymentTransactionTable;