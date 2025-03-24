import { useState } from "react";
import { Link } from "react-router-dom";

const Settings = () => {
    const [activeTab, setActiveTab] = useState("personalDetails");
    const [activeSection, setActiveSection] = useState("Profile");

    return (
        <>
            <div className="bg-white px-6 py-4 mb-6">
                <h1 className="text-2xl font-medium mb-3">Settings</h1>
                <p className="text-gray-500">
                    <Link to="/customer" className="text-blue-500 hover:underline">Dashboard</Link> &gt; Settings
                </p>
            </div>
            <div className="flex flex-col md:flex-row bg-gray-100">
                {/* Sidebar */}
                <div className="w-full md:w-1/5 bg-white md:mb-0 mb-6 h-fit p-4 rounded-lg">
                    <ul className="space-y-2 text-gray-600">
                        {["Profile", "KYC", "Bank Details", "Security", "Settings", "Support"].map((item) => (
                            <li
                                key={item}
                                className={`cursor-pointer px-4 py-3 rounded-lg transition-colors duration-300 ${activeSection === item ? "font-medium text-purple-600 bg-purple-100" : "hover:text-purple-600"
                                    }`}
                                onClick={() => setActiveSection(item)}
                            >
                                {item}
                            </li>
                        ))}
                    </ul>

                </div>

                {/* Main Content */}
                <div className="w-full md:w-4/5 bg-white p-6 rounded-lg md:ml-6">
                    {activeSection === "Profile" && (
                        <div>
                            <h2 className="text-xl font-medium mb-4">Profile</h2>
                            <div className="mt-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
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
                                    Business Details
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
                                       
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === "KYC" && <h2 className="text-xl font-medium">KYC Verification</h2>}
                    {activeSection === "Bank Details" && <h2 className="text-xl font-medium">Bank Details</h2>}
                    {activeSection === "Security" && <h2 className="text-xl font-medium">Security Settings</h2>}
                    {activeSection === "Settings" && <h2 className="text-xl font-medium">General Settings</h2>}
                    {activeSection === "Support" && <h2 className="text-xl font-medium">Support & Help</h2>}
                </div>

            </div>
        </>
    );
};

export default Settings;
