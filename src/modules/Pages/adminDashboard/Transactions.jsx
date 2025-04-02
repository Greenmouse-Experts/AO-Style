import { useState, } from "react";
import ReusableTable from "./components/ReusableTable";

const PaymentTransactionTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const data = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        transactionID: `TX-${1000 + i}`,
        amount: `$${(Math.random() * 1000).toFixed(2)}`,
        paymentMethod: ["Credit Card", "Bank Transfer", "Cash"][i % 3],
        date: `02/04/25`,
        status: ["Completed", "Pending", "Failed"][i % 3],
    }));

    const columns = [
        { label: "Transaction ID", key: "transactionID" },
        { label: "Amount", key: "amount" },
        { label: "Payment Method", key: "paymentMethod" },
        { label: "Date", key: "date" },
        {
            label: "Status",
            key: "status",
            render: (status) => (
                <span
                    className={`px-3 py-1 text-sm rounded-full ${status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : status === "Failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                >
                    {status}
                </span>
            ),
        },
    ];

    const filteredData = data.filter((transaction) =>
        Object.values(transaction).some((value) =>
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
                <h2 className="text-lg font-semibold">Payments and Transactions</h2>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                    <input
                        type="text"
                        placeholder="Search ..."
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

export default PaymentTransactionTable;
