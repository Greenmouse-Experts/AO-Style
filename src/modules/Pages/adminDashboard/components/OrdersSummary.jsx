import React from 'react';
import { ShoppingBag, ShoppingCart } from 'lucide-react';

const OrderSummaryCard = ({ icon, data }) => {
  return (
    <div className="flex-1 min-w-[280px] p-4 bg-white rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-[#FFCC9129] p-2 rounded-md">
          {icon}
        </div>
        <span className="ml-auto text-sm text-gray-500">This Week ▼</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
        {data.map((item, index) => (
          <div key={index}>
            <div className={item.label === 'Abandoned Cart' ? 'text-red-600' : ''}>{item.label}</div>
            <div className="text-lg font-semibold">
              {item.value}
              {item.percentage && (
                <span
                  className={`text-xs ml-1 ${item.percentage.includes('+') ? 'text-green-600' : 'text-red-600'}`}
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
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Orders Summary</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          + Create a New Order
        </button>
      </div>
      <div className="flex flex-wrap gap-4">
        <OrderSummaryCard
          icon={<ShoppingBag className="text-black" />}
          data={[
            { label: 'All Orders', value: 450 },
            { label: 'Pending', value: 5 },
            { label: 'Completed', value: 320 },
          ]}
        />
        <OrderSummaryCard
          icon={<ShoppingBag className="text-black" />}
          data={[
            { label: 'Canceled', value: 30, percentage: '-20%' },
            { label: 'Returned', value: 20 },
            { label: 'Failed', value: 5 },
          ]}
        />
        <OrderSummaryCard
          icon={<ShoppingCart className="text-black" />}
          data={[
            { label: 'Abandoned Cart', value: '20%', percentage: '+0.00%' },
            { label: 'Customers', value: 30 },
            { label: '', value: '' },
          ]}
        />
      </div>
    </div>
  );
};

export default OrdersSummary;
