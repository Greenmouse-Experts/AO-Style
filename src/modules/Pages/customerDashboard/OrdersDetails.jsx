import { useState } from "react";
import { CheckCircle, Circle, Phone, MessageSquare, Mail, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const orderSteps = [
    "Order Placed",
    "Fabric Delivery",
    "Tailoring",
    "Out for Delivery",
    "Delivered",
];

const statusMessages = {
    "Order Placed": "Your order has been placed, awaiting fabric from vendor.",
    "Fabric Delivery": "Fabric has been delivered, preparing for tailoring.",
    "Tailoring": "Your order is being tailored.",
    "Out for Delivery": "Your order is out for delivery.",
    "Delivered": "Your order has been delivered successfully!",
};

const OrderDetails = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [activeTab, setActiveTab] = useState("style");

    return (
        <div className="">
            <div className="bg-white px-6 py-4 mb-6">
                <h1 className="text-lg font-medium mb-3">Orders Details : <span className="text-gray-600">QWER123DFDG324R</span></h1>
                <p className="text-gray-500">
                    <Link to="/customer" className="text-blue-500 hover:underline">Dashboard</Link> &gt; Orders
                </p>
            </div>

            <h5 className="text-lg font-meduim text-[#A14DF6] mb-4">ORDER PROGRESS</h5>
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 relative space-y-4 md:space-y-0">
                {orderSteps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center w-full relative">
                        {index > 0 && (
                            <div
                                className={`absolute top-3 left-0 right-0 h-1 ${index <= currentStep ? "bg-[#EC8B20]" : "bg-gray-300"
                                    }`}
                            ></div>
                        )}
                        <button
                            className={`z-10 w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all ${index <= currentStep
                                ? "bg-[#EC8B20] border-[#EC8B20] text-white"
                                : "bg-gray-200 border-gray-400 text-gray-600"
                                }`}
                            onClick={() => setCurrentStep(index)}
                        >
                            {index <= currentStep ? <CheckCircle size={20} /> : <Circle size={20} />}
                        </button>
                        <span
                            className={`mt-2 text-sm font-medium ${index <= currentStep ? "text-black" : "text-gray-400"
                                }`}
                        >
                            {step}
                        </span>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-white leading-loose rounded-md mt-2 flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
                <span>
                    Order Status: {statusMessages[orderSteps[currentStep]]}
                    <span className={`ml-2 px-2 py-1 rounded ${orderSteps[currentStep] === "Delivered"
                        ? "text-green-700 bg-green-100"
                        : "text-yellow-700 bg-yellow-100"
                        }`}>
                        {orderSteps[currentStep] === "Delivered" ? "Completed" : "Ongoing"}
                    </span>
                </span>
                {/* <div className="space-x-2">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded-md"
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                    >
                        Previous
                    </button>
                    <button
                        className="px-4 py-2 bg-[#249B32] text-white rounded-md"
                        disabled={currentStep === orderSteps.length - 1}
                        onClick={() => setCurrentStep((prev) => Math.min(prev + 1, orderSteps.length - 1))}
                    >
                        {currentStep === orderSteps.length - 1 ? "Completed" : "Next"}
                    </button>
                </div> */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-6 rounded-md md:col-span-2">
                    <h5 className="text-lg font-meduim text-dark border-b border-[#D9D9D9] pb-3 mb-3">Order Details</h5>
                    <div className="flex justify-between items-center">
                        {[
                            { key: "style", label: "Style" },
                            { key: "fabric", label: "Fabric" },
                            { key: "measurement", label: "Measurement" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                className={`px-4 py-1 text-base font-normal ${activeTab === tab.key ? "text-[#A14DF6]" : "text-gray-500"
                                    }`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-md">
                        {activeTab === "style" && (
                            <div>

                                <div className="bg-white p-6 grid grid-cols-3 gap-4 items-center">
                                    <div className="flex items-center gap-4">
                                        <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170600/AoStyle/image_bwjfib.jpg" alt="Ankara Gown" className="w-24 h-24 rounded-md" />
                                        <div>
                                            <p className="font-semibold">Ankara Gown</p>
                                            <p className="text-gray-500">x 1 Piece</p>
                                            <p className="text-blue-600">N 24,000</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170603/AoStyle/image1_s3s2sd.jpg" alt="Luxury Embellished Lace" className="w-24 h-24 rounded-md mb-2" />
                                        <div>
                                            <p className="font-semibold">Luxury Embellished Lace</p>
                                            <p className="text-gray-500">x 2 Yards</p>
                                            <p className="text-blue-600">N 102,000</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <FileText size={24} className="text-gray-600" />
                                    </div>
                                </div>
                                <div className="mt-6 p-4">
                                    <div className="flex justify-between items-center pb-2">
                                        <span className="text-gray-600 font-medium">Subtotal :</span>
                                        <span className="font-semibold">N 126,000</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 mt-2">
                                        <span className="text-gray-600 font-medium">Delivery Fee :</span>
                                        <span className="font-semibold">N 120,000</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 mt-2">
                                        <span className="text-gray-600 font-medium">Discount :</span>
                                        <span className="font-semibold">N 0</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-gray-600 font-medium text-lg">Order Total :</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-lg">N 11,440,000</span>
                                            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">Paid</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "fabric" && (
                            <div>
                                <div className="flex items-center gap-4 mt-5">
                                        <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742170603/AoStyle/image1_s3s2sd.jpg" alt="Luxury Embellished Lace" className="w-24 h-24 rounded-md mb-2" />
                                        <div>
                                            <p className="font-semibold">Luxury Embellished Lace</p>
                                            <p className="text-gray-500">x 2 Yards</p>
                                            <p className="text-blue-600">N 102,000</p>
                                        </div>
                                    </div>
                            </div>
                        )}

                        {activeTab === "measurement" && (
                            <div>
                                <div className=" mt-5">
                                <p className="font-light leading-loose">Shoulder: 16 inches</p>
                                <p className="font-light leading-loose">Chest: 38 inches</p>
                                <p className="font-light leading-loose">Waist: 32 inches</p>
                                <p className="font-light leading-loose">Hips: 40 inches</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="bg-white p-4 rounded-md">
                        <h5 className="text-lg font-medium leading-loose border-b border-[#D9D9D9] pb-3 mb-3">Delivery Details</h5>
                        <p className="font-medium mb-2">Shipping Address:</p>
                        <p className="text-gray-600">No 7, Street Name, Estate Name, Lagos, Nigeria</p>
                        <p className="ont-medium mb-2 mt-2">Delivery Date:</p>
                        <p className="text-gray-600">12-03-2025</p>
                    </div>
                    <div className="bg-white p-4 rounded-md">
                        <h5 className="text-lg font-medium leading-loose border-b border-[#D9D9D9] pb-3 mb-3">Order Support</h5>
                        <p className="font-medium mb-4">Need help?</p>
                        <div className="flex space-x-6 mt-2">
                            <Phone className="text-purple-500" size={24} />
                            <MessageSquare className="text-purple-500" size={24} />
                            <Mail className="text-purple-500" size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;