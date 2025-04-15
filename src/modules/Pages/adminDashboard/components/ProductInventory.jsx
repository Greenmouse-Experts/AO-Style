import { ChevronDown, Folder, ShoppingCart } from "lucide-react";
import { useState } from "react";

const ProductInventoryCard = () => {
  const [timeRange, setTimeRange] = useState("First Quarter");

  return (
    <div className="space-y-4">
      {/* Product Inventory Card */}
      <div className="bg-gradient p-6 rounded-2xl text-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Folder size={24} className="bg-white p-1 rounded-md text-[#5B21B6]" />
            <h2 className="text-lg font-semibold">Product Inventory</h2>
          </div>
          <button className="flex items-center text-gray-200 hover:text-gray-100">
            {timeRange} <ChevronDown size={16} className="ml-1" />
          </button>
        </div>

        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-200 mb-4">All Products</p>
            <p className="text-2xl font-semibold">620</p>
          </div>
          <div>
            <p className="text-sm text-gray-200 mb-4">Total Sales</p>
            <p className="text-2xl font-semibold flex items-center">
              470 <span className="text-green-400 text-sm ml-2">+24%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Completed Cart Card */}
      <div className="bg-white p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={24} className="bg-yellow-100 p-1 rounded-md text-black" />
          </div>
          <button className="flex items-center text-gray-500 hover:text-gray-700">
            This Week <ChevronDown size={16} className="ml-1" />
          </button>
        </div>

        <div className="flex justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium mb-4">Completed Cart</p>
            <p className="text-2xl font-semibold flex items-center">
              20% <span className="text-gray-400 text-sm ml-2">+0.00%</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-4">Customers</p>
            <p className="text-2xl font-semibold">30</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInventoryCard;
