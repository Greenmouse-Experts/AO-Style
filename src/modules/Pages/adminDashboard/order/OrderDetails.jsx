import React from 'react';
import OrderStatusTimeline from '../components/SummaryDetails';
import OrderDetailsContent from '../components/OrderDetailsContent';

const OrderDetailsPage = () => {
    return (
        <>
            <div>
                <h2 className="text-lg font-medium text-gray-800">Order Details</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 flex flex-col">
                    <OrderDetailsContent />
                </div>
                <div className="lg:col-span-1">
                    <OrderStatusTimeline />
                </div>
            </div>
        </>
    );
};

export default OrderDetailsPage;