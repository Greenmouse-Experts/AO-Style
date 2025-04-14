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
                    <Link to="/tailor" className="text-blue-500 hover:underline">Dashboard</Link> &gt; Orders &gt; Order Details
                </p>
            </div>
            <div className="space-y-6">
                {/* Order Details and Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Order Details */}
                    <div className="bg-white p-6 rounded-lg md:col-span-2">
                        <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">Order Details</h5>
                        <div className="grid grid-cols-3 gap-6 border-b border-gray-200 pb-6 mb-6">
                            {/* Style Info */}
                            <div className="flex gap-4">
                                <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170600/AoStyle/image_bwjfib.jpg" alt="Ankara Gown" className="w-20 h-20 rounded-md object-cover" />
                                <div>
                                    <p className="font-meduim">Ankara Gown</p>
                                    <p className="text-gray-500 text-sm">x 1 Piece</p>
                                    <p className="text-blue-600 text-sm">N 24,000</p>
                                </div>
                            </div>

                            {/* Fabric Info */}
                            <div className="flex gap-4">
                                <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png" alt="Fabric" className="w-20 h-20 rounded-md object-cover" />
                                <div>
                                    <p className="font-meduim">Luxury Embellished Lace</p>
                                    <p className="text-gray-500 text-sm">x 2 Yards</p>
                                </div>
                            </div>

                            {/* Measurements */}
                            <div className="flex items-center">
                                <a href="#" className="text-blue-700 underline text-sm">See measurement</a>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">
                                Order Total: <span className="font-bold">N 11,440,000</span>
                                <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">Pending</span>
                            </span>
                        </div>
                    </div>

                    {/* Order Status */}
                    <div className="bg-white p-6 rounded-lg">
                        <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">Order Status</h5>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-700 mb-3">FABRIC</p>
                                <label className="flex items-center gap-2 mb-4">
                                    <span className="text-sm  w-full">Mark as Received</span>
                                    <input type="checkbox" className="accent-purple-500 float-end w-full" />
                                </label>
                            </div>

                            <div>
                                <p className="text-gray-700 mb-3">TAILORING</p>
                                <label className="flex items-center gap-2 mb-4">
                                    <span className="text-sm  w-full">Mark as Completed</span>
                                    <input type="checkbox" className="accent-purple-500 float-end w-full" />
                                </label>
                            </div>
                            <div>
                                <p className="text-gray-700 mb-3">OUT FOR DELIVERY</p>
                                <label className="flex items-center gap-2 mb-4">
                                    <span className="text-sm w-full">Mark as Sent</span>
                                    <input type="checkbox" className="accent-purple-500 float-end w-full" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery & Support */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Delivery Details */}
                    <div className="bg-white p-6 rounded-lg">
                        <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">Delivery Details</h5>
                        <p className="text-gray-700 mb-3"><span className="font-semibold">Shipping Address:</span> No 7, Street name, Estate name, Lagos, Nigeria</p>
                        <p className="text-gray-700 mb-3"><span className="font-semibold">Delivery Date:</span> 12-03-2025 (10 days left)</p>
                        <p className="text-gray-700"><span className="font-semibold">Delivery Method:</span> Logistics</p>
                    </div>

                    {/* Order Support */}
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

                {/* Customer & Vendor */}
                <div className="bg-white p-6 rounded-lg">
                    <h5 className="text-lg font-medium border-b border-gray-200 pb-3 mb-6">Customer & Vendor</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-gray-500 text-sm mb-2">Customer Name</p>
                            <p className="font-semibold">Chukka Uzo</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm mb-2">Fabric Vendor Name</p>
                            <p className="font-semibold">Daniel Amaka</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm mb-2">Delivery Method</p>
                            <p className="font-semibold">Logistics</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
