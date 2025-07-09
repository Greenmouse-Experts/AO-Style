import React, { useState } from "react";
import { ShoppingBag, ShoppingCart } from "lucide-react";

const AddOrderModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    orderDate: "",
    product: "",
    amount: "",
    status: "Pending",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Order submitted:", formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Add New Order</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Order Date</label>
            <input
              type="date"
              name="orderDate"
              value={formData.orderDate}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Product</label>
            <input
              type="text"
              name="product"
              value={formData.product}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
            >
              <option value="Pending">Pending</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Completed">Completed</option>
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
              className="bg-gradient text-white px-4 py-2 rounded-md text-sm font-light"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrderSummaryCard = ({ icon, data }) => {
  return (
    <div className="flex-1 min-w-[280px] p-4 bg-white rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-[#FFCC9129] p-2 rounded-md">{icon}</div>
        <span className="ml-auto text-sm text-gray-500">This Week ▼</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
        {data.map((item, index) => (
          <div key={index}>
            <div
              className={item.label === "Abandoned Cart" ? "text-red-600" : ""}
            >
              {item.label}
            </div>
            <div className="text-lg font-semibold leading-loose">
              {item.value}
              {item.percentage && (
                <span
                  className={`text-xs ml-1 ${
                    item.percentage.includes("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {item.percentage}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrdersSummary = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Orders Summary</h2>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-light cursor-pointer"
          onClick={handleOpenModal}
        >
          + Create a New Order
        </button>
      </div>
      <div className="flex flex-wrap gap-4">
        <OrderSummaryCard
          icon={<ShoppingBag className="text-black" />}
          data={[
            { label: "All Orders", value: 450 },
            { label: "Pending", value: 5 },
            { label: "Completed", value: 320 },
          ]}
        />
        <OrderSummaryCard
          icon={<ShoppingBag className="text-black" />}
          data={[
            { label: "Canceled", value: 30, percentage: "-20%" },
            { label: "Returned", value: 20 },
            { label: "Failed", value: 5 },
          ]}
        />
        <OrderSummaryCard
          icon={<ShoppingCart className="text-black" />}
          data={[
            { label: "Abandoned Cart", value: "20%", percentage: "+0.00%" },
            { label: "Customers", value: 30 },
            { label: "", value: "" },
          ]}
        />
      </div>
      <AddOrderModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default OrdersSummary;
