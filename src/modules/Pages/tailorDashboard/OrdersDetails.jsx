import { useState } from "react";
import { Phone, MessageSquare, Mail, } from "lucide-react";
import { Link } from "react-router-dom";

const OrderDetails = () => {
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <div className="">
            <div className="bg-white rounded-lg px-6 py-4 mb-6">
                <h1 className="text-xl font-semibold mb-4">Order Details : <span className="text-gray-600">QWER123DFDG324R</span></h1>
                <p className="text-gray-500 text-sm">
                    <Link to="/customer" className="text-blue-500 hover:underline">Dashboard</Link> &gt; Orders &gt; Order Details
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg md:col-span-2">
                    <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">Order Details</h5>
                    <div className="flex items-center gap-4 border-b border-gray-200 pb-3 mb-6">
                        <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170600/AoStyle/image_bwjfib.jpg" alt="Ankara Gown" className="w-24 h-24 rounded-md" />
                        <div>
                            <p className="font-semibold">Ankara Gown</p>
                            <p className="text-gray-500">x 1 Piece</p>
                            <p className="text-blue-600">N 24,000</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Order Total: <span className="font-bold">N 11,440,000</span> <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">Pending</span></span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg">
                    <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">Order Status</h5>
                    <div className="space-y-3">
                        <label className="flex items-center gap-2"><input type="checkbox" className="accent-purple-500" /> Mark as Received</label>
                        <label className="flex items-center gap-2"><input type="checkbox" className="accent-purple-500" /> Mark as Completed</label>
                        <label className="flex items-center gap-2"><input type="checkbox" className="accent-purple-500" /> Mark as Sent</label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-6 rounded-lg">
                    <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">Delivery Details</h5>
                    <p className="text-gray-700 mb-3"><span className="font-semibold">Shipping Address:</span> No 7, Street Name, Estate Name, Lagos, Nigeria</p>
                    <p className="mt-2 text-gray-700 mb-3"><span className="font-semibold">Delivery Date:</span> 12-03-2025 (10 days left)</p>
                    <p className="mt-2 text-gray-700 mb-3"><span className="font-semibold">Delivery Method:</span> Logistics</p>
                </div>
                <div className="bg-white p-6 rounded-lg">
                    <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">Order Support</h5>
                    <p className="text-gray-700 mb-6">Need help?</p>
                    <div className="flex space-x-4">
                        <Phone className="text-purple-500 bg-purple-100 p-2 rounded-full" size={32} />
                        <MessageSquare className="text-purple-500 bg-purple-100 p-2 rounded-full" size={32} />
                        <Mail className="text-purple-500 bg-purple-100 p-2 rounded-full" size={32} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg mt-6">
                <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">Customer & Vendor</h5>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-gray-500 text-sm mb-3">Customer Name</p>
                        <p className="font-semibold">Chukka Uzo</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm mb-3">Fabric Vendor Name</p>
                        <p className="font-semibold">Daniel Amaka</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm mb-3">Delivery Method</p>
                        <p className="font-semibold">Logistics</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
