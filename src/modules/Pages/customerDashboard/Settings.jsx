import { useState } from "react";
import { Link } from "react-router-dom";

const Settings = () => {
    const [activeTab, setActiveTab] = useState("personalDetails");
    const [bodyTab, setBodyTab] = useState("upperBody");

    return (
        <>
            <div className="bg-white px-6 py-4 mb-6">
                <h1 className="text-2xl font-medium mb-3">Settings</h1>
                <p className="text-gray-500">
                    <Link to="/customer" className="text-blue-500 hover:underline">Dashboard</Link> &gt; Settings
                </p>
            </div>
            <div className="flex bg-gray-100 min-h-screen">
                {/* Sidebar */}
                <div className="w-1/5 bg-white p-4 rounded-lg">
                    <ul className="space-y-4 text-gray-600">
                        <li className="font-medium text-purple-600">Profile</li>
                        <li>KYC</li>
                        <li>Bank Details</li>
                        <li>Security</li>
                        <li>Settings</li>
                        <li>Support</li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="w-4/4 bg-white p-6 rounded-lg ml-6">

                    {/* Profile Section */}
                    <div className="mt-6 flex items-center space-x-4">
                        <img
                            src="https://randomuser.me/api/portraits/women/2.jpg"
                            alt="Profile"
                            className="w-24 h-24 rounded-full"
                        />
                        <button className="border px-4 py-2 text-purple-600 rounded-lg border-purple-600">
                            Change Picture
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mt-6  flex space-x-6 text-gray-500">
                        <button
                            className={`pb-2 ${activeTab === "personalDetails" ? "border-b-2 border-purple-600 text-purple-600" : ""}`}
                            onClick={() => setActiveTab("personalDetails")}
                        >
                            Personal Details
                        </button>
                        <button
                            className={`pb-2 ${activeTab === "bodyMeasurement" ? "border-b-2 border-purple-600 text-purple-600" : ""}`}
                            onClick={() => setActiveTab("bodyMeasurement")}
                        >
                            Body Measurement
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6">
                        {activeTab === "personalDetails" && (
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 mb-4">Full Name</label>
                                    <input type="text" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" value="Chukka Uzo" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 mb-4">Phone Number</label>
                                        <input type="text" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" placeholder="0700 000 0000" required />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-4">Email</label>
                                        <input type="email" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" placeholder="Enter your email address" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-4">Address</label>
                                    <input type="text" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" placeholder="Enter full detailed address" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 mb-4">State</label>
                                        <input type="text" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" placeholder="Enter the state" required />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-4">Country</label>
                                        <input type="text" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" placeholder="Enter the country" required />
                                    </div>
                                </div>
                                <button type="submit" className="mt-4 bg-gradient text-white px-6 py-2 rounded-md">Update</button>
                            </form>
                        )}

                        {activeTab === "bodyMeasurement" && (
                            <div>
                                <div className="border-b-4 border-[#D9D9D9] flex space-x-10 text-gray-500">
                                    <button
                                        className={`pb-2 ${bodyTab === "upperBody" ? "border-b-1 border-purple-600 text-purple-600" : ""}`}
                                        onClick={() => setBodyTab("upperBody")}
                                    >
                                        Upper Body
                                    </button>
                                    <button
                                        className={`pb-2 ${bodyTab === "lowerBody" ? "border-b-1 border-purple-600 text-purple-600" : ""}`}
                                        onClick={() => setBodyTab("lowerBody")}
                                    >
                                        Lower Body
                                    </button>
                                    <button
                                        className={`pb-2 ${bodyTab === "fullBody" ? "border-b-1 border-purple-600 text-purple-600" : ""}`}
                                        onClick={() => setBodyTab("fullBody")}
                                    >
                                        Full Body
                                    </button>
                                </div>

                                {bodyTab === "upperBody" && (
                                    <form className="space-y-4 grid grid-cols-2 gap-4 mt-8">
                                        <input type="text" placeholder="Neck Circumference" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" required />
                                        <input type="text" placeholder="Shoulder Width" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" required />
                                        <input type="text" placeholder="Chest Circumference" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" required />
                                        <input type="text" placeholder="Waist Circumference" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" required />
                                        <input type="text" placeholder="Sleeve Length" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" required />
                                        <input type="text" placeholder="Bicep Circumference" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" required />
                                        <input type="text" placeholder="Wrist Circumference" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" required />
                                        <input type="text" placeholder="Shirt Length" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" required />
                                        <button type="submit" className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-md col-span-2">Update Upper Body</button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Settings;
