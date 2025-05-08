import { useState, useRef, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import { FaEllipsisH } from "react-icons/fa";

const AddSubscriptionModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        userType: "Fabric Vendor",
        planName: "",
        planDescription: "",
        quantity: "",
        planValidity: "",
        planValidityType: "Annually",
        planPrice: "",
        currency: "NGN",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            ...formData,
            amount: `${formData.currency} ${formData.planPrice}`,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Create Subscription Plan</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ×
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-4">User Type</label>
                        <select
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                        >
                            <option value="Fabric Vendor">Fabric Vendor</option>
                            <option value="Tailor">Tailor</option>
                            <option value="Logistic Agent">Logistic Agent</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-4">Plan Name</label>
                        <input
                            type="text"
                            name="planName"
                            value={formData.planName}
                            onChange={handleChange}
                            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-4">Plan Description</label>
                        <textarea
                            name="planDescription"
                            value={formData.planDescription}
                            onChange={handleChange}
                            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-4">Quantity (Per fabric)</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-4">Plan Validity</label>
                        <div className="flex">
                            <input
                                type="number"
                                name="planValidity"
                                value={formData.planValidity}
                                onChange={handleChange}
                                className="mt-1 p-2 w-1/2 border border-gray-300 rounded-l-md"
                                required
                            />
                            <select
                                name="planValidityType"
                                value={formData.planValidityType}
                                onChange={handleChange}
                                className="mt-1 p-2 w-1/2 border border-gray-300 rounded-r-md"
                            >
                                <option value="Annually">Annually</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-4">Plan Price</label>
                        <div className="flex">
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="mt-1 p-2 w-1/4 border border-gray-300 rounded-l-md"
                            >
                                <option value="NGN">NGN</option>
                                <option value="USD">USD</option>
                            </select>
                            <input
                                type="text"
                                name="planPrice"
                                value={formData.planPrice}
                                onChange={handleChange}
                                placeholder="20,000"
                                className="mt-1 p-2 w-3/4 border border-gray-300 rounded-r-md"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-md text-sm font-light"
                        >
                            Create Subscription Plan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SubscriptionModal = ({ isOpen, onClose, subscription, onUpdate }) => {
    const [formData, setFormData] = useState(subscription);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData.id, {
            ...formData,
            amount: `${formData.currency} ${formData.planPrice}`,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Edit Subscription Plan</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ×
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-4">User Type</label>
                        <select
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                        >
                            <option value="Fabric Vendor">Fabric Vendor</option>
                            <option value="Tailor">Tailor</option>
                            <option value="Logistic Agent">Logistic Agent</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-4">Plan Name</label>
                        <input
                            type="text"
                            name="planName"
                            value={formData.planName}
                            onChange={handleChange}
                            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-4">Plan Description</label>
                        <textarea
                            name="planDescription"
                            value={formData.planDescription}
                            onChange={handleChange}
                            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-4">Quantity (Per fabric)</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-4">Plan Validity</label>
                        <div className="flex">
                            <input
                                type="number"
                                name="planValidity"
                                value={formData.planValidity}
                                onChange={handleChange}
                                className="w-1/2 p-4 border border-[#CCCCCC] outline-none rounded-lg rounded-l-md"
                                required
                            />
                            <select
                                name="planValidityType"
                                value={formData.planValidityType}
                                onChange={handleChange}
                                className="w-1/2 p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            >
                                <option value="Annually">Annually</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-4">Plan Price</label>
                        <div className="flex">
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="p-4 w-1/4  border border-[#CCCCCC] outline-none rounded-lg rounded-l-md"
                            >
                                <option value="NGN">NGN</option>
                                <option value="USD">USD</option>
                            </select>
                            <input
                                type="text"
                                name="planPrice"
                                value={formData.planPrice}
                                onChange={handleChange}
                                placeholder="20,000"
                                className="p-4 w-3/4  border border-[#CCCCCC] outline-none rounded-lg rounded-r-md"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-4">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-light"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SubscriptionsPlansTable = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const dropdownRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);

    const [data, setData] = useState([
        { id: 1, name: "Free", userType: "Fabric Vendor", planDescription: "Allows you to upload up to 50 unique materials...", amount: "N20,000", status: "Active", quantity: "50", planValidity: "1", planValidityType: "Annually", currency: "NGN", planPrice: "20,000" },
        { id: 2, name: "Bronze", userType: "Fabric Vendor", planDescription: "Allows you to upload up to 50 unique materials...", amount: "N20,000", status: "Active", quantity: "50", planValidity: "1", planValidityType: "Annually", currency: "NGN", planPrice: "20,000" },
        { id: 3, name: "Silver", userType: "Fabric Vendor", planDescription: "Allows you to upload up to 50 unique materials...", amount: "N20,000", status: "Active", quantity: "50", planValidity: "1", planValidityType: "Annually", currency: "NGN", planPrice: "20,000" },
        { id: 4, name: "Gold", userType: "Fabric Vendor", planDescription: "Allows you to upload up to 50 unique materials...", amount: "N20,000", status: "Active", quantity: "50", planValidity: "1", planValidityType: "Annually", currency: "NGN", planPrice: "20,000" },
    ]);

    const toggleDropdown = (rowId) => {
        setOpenDropdown(openDropdown === rowId ? null : rowId);
    };

    const handleOpenAddModal = () => {
        setAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setAddModalOpen(false);
    };

    const handleOpenEditModal = (subscription) => {
        setSelectedSubscription(subscription);
        setEditModalOpen(true);
        setOpenDropdown(null);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedSubscription(null);
    };

    const handleAddSubscription = (newSubscription) => {
        setData([...data, { id: data.length + 1, ...newSubscription }]);
    };

    const handleUpdateSubscription = (id, updatedSubscription) => {
        setData(data.map((item) => (item.id === id ? { ...item, ...updatedSubscription } : item)));
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
        { label: "Name", key: "name" },
        { label: "User Type", key: "userType" },
        { label: "Plan Description", key: "planDescription" },
        { label: "Amount", key: "amount" },
        {
            label: "Status",
            key: "status",
            render: (status) => (
                <span
                    className={
                        status === "Active" ? "text-green-500 bg-green-100 px-2 py-1 rounded-full" : "text-red-500 bg-red-100 px-2 py-1 rounded-full"
                    }
                >
                    {status}
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
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10 shadow-lg">
                            <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                                View Details
                            </button>
                            <button
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                onClick={() => handleOpenEditModal(row)}
                            >
                                Edit Plan
                            </button>
                            <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full text-left">
                                Remove Plan
                            </button>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    const filteredData = data.filter((subscription) =>
        Object.values(subscription).some(
            (value) =>
                typeof value === "string" &&
                value.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Subscriptions Plans</h2>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                    <input
                        type="text"
                        placeholder="Search..."
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
                    <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-light whitespace-nowrap"
                        onClick={handleOpenAddModal}
                    >
                        + Add a New Subscription Plan
                    </button>
                </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">Created Subscription plan</p>
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
                    <p className="text-sm text-gray-600 ml-4">
                        {indexOfFirstItem + 1}-{indexOfLastItem > filteredData.length ? filteredData.length : indexOfLastItem} of {filteredData.length} items
                    </p>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md bg-gray-200"
                    >
                        ◀
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md bg-gray-200"
                    >
                        ▶
                    </button>
                </div>
            </div>
            <AddSubscriptionModal
                isOpen={addModalOpen}
                onClose={handleCloseAddModal}
                onAdd={handleAddSubscription}
            />
            {selectedSubscription && (
                <SubscriptionModal
                    isOpen={editModalOpen}
                    onClose={handleCloseEditModal}
                    subscription={selectedSubscription}
                    onUpdate={handleUpdateSubscription}
                />
            )}
        </div>
    );
};

export default SubscriptionsPlansTable;