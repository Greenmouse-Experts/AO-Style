import { useState } from "react";
import { Eye, EyeOff, Upload } from "lucide-react";
import { Link } from "react-router-dom";

export default function AddFabricVendorPage() {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        profilePic: null,
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle file upload
    const handleFileChange = (e) => {
        setFormData({ ...formData, profilePic: e.target.files[0] });
    };

    return (
        <div className="">
            <div className="bg-white px-6 py-4 mb-6 relative">
                <h1 className="text-2xl font-medium mb-3">Add Product</h1>
                <p className="text-gray-500"><Link to="/fabric" className="text-blue-500 hover:underline">Dashboard</Link> &gt; My Product &gt; Add Product</p>
            </div>

            {/* Tabs Section */}
            <div className="mt-6 bg-white p-4 rounded-md">
                <div className="flex pb-2 text-sm font-medium">
                    {["Personal Info", "Business Info", "KYC"].map((tab, index) => (
                        <button
                            key={index}
                            onClick={() => setStep(index + 1)}
                            className={`w-1/3 text-center pb-2 ${step === index + 1 ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Form Sections */}
                {step === 1 && (
                    <div className="p-4">
                        <label className="block text-gray-600 font-medium mb-4">Profile Picture</label>
                        <div className="border border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center">
                            <Upload size={30} className="text-gray-400" />
                            <input type="file" className="hidden" id="file-upload" onChange={handleFileChange} />
                            <label htmlFor="file-upload" className="cursor-pointer text-gray-500 mt-2">
                                {formData.profilePic ? formData.profilePic.name : "Upload profile picture"}
                            </label>
                        </div>

                        {/* Full Name & Email */}
                        <div className="mt-4 flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-1/2">
                                <label className="block text-gray-600 font-medium mb-4">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter the vendor full name"
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                />
                            </div>
                            <div className="w-full sm:w-1/2">
                                <label className="block text-gray-600 font-medium mb-4">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter the vendor email address"
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Password & Confirm Password */}
                        <div className="mt-4 flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-1/2 relative">
                                <label className="block text-gray-600 font-medium mb-4">Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter the vendor password"
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-10 text-gray-400">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="w-full sm:w-1/2 relative">
                                <label className="block text-gray-600 font-medium mb-4">Confirm Password</label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter the vendor password"
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-10 text-gray-400">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button onClick={() => setStep(2)} className="mt-6 w-full bg-[#A14DF6] text-white py-3 cursor-pointer rounded-md">
                            Proceed to Business Info
                        </button>
                    </div>
                )}


                {/* Business Info Section */}
                {step === 2 && (
                    <div className="p-4">
                        <h2 className="text-lg font-medium mb-4">Business Information</h2>

                        {/* Business Name & Registration Number */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full">
                                <label className="block text-gray-600 font-medium mb-4">Business Name</label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    placeholder="Enter the vendor business name"
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-600 font-medium mb-4">Business Registration Number (Optional)</label>
                                <input
                                    type="text"
                                    name="businessRegNumber"
                                    value={formData.businessRegNumber}
                                    onChange={handleChange}
                                    placeholder="Enter your business registration number"
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Phone Number & Market Location */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <div className="w-full relative">
                                <label className="block text-gray-600 font-medium mb-4">Phone Number</label>
                                <div className="flex items-center border border-gray-300 rounded-md">
                                    <span className="p-4 bg-gray-100 border-r border-gray-300">🇳🇬</span>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
                                        className="w-full p-4 outline-none rounded-lg"
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-600 font-medium mb-4">Market Location</label>
                                <select
                                    name="marketLocation"
                                    value={formData.marketLocation}
                                    onChange={handleChange}
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                >
                                    <option value="">Choose your marketplace</option>
                                    <option value="Lagos">Lagos</option>
                                    <option value="Abuja">Abuja</option>
                                    <option value="Kano">Kano</option>
                                </select>
                            </div>
                        </div>

                        {/* Business Address */}
                        <div className="mt-4">
                            <label className="block text-gray-600 font-medium mb-4">Business Address</label>
                            <input
                                type="text"
                                name="businessAddress"
                                value={formData.businessAddress}
                                onChange={handleChange}
                                placeholder="Enter your business address"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>

                        {/* City & State Dropdowns */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <div className="w-full">
                                <label className="block text-gray-600 font-medium mb-4">City</label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                >
                                    <option value="">Choose the city</option>
                                    <option value="Lagos">Lagos</option>
                                    <option value="Abuja">Abuja</option>
                                    <option value="Kano">Kano</option>
                                </select>
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-600 font-medium mb-4">State</label>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                >
                                    <option value="">Choose the state</option>
                                    <option value="Lagos">Lagos</option>
                                    <option value="Abuja">Abuja</option>
                                    <option value="Kano">Kano</option>
                                </select>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6">
                            <button onClick={() => setStep(1)} className="bg-gray-300 text-gray-700 px-6 py-3 rounded-md">
                                Back
                            </button>
                            <button onClick={() => setStep(3)} className="bg-gradient text-white px-6 py-3 rounded-md">
                                Proceed to KYC
                            </button>
                        </div>
                    </div>
                )}



                {/* KYC Section */}
                {step === 3 && (
                    <div className="p-4">
                        <h2 className="text-lg font-medium mb-4">KYC Verification</h2>

                        {/* ID Upload */}
                        <div className="mb-4">
                            <label className="block text-gray-600 font-medium mb-4">National ID / Driver’s License / Passport</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg flex flex-col items-center">
                                    <input type="file" name="idFront" onChange={handleFileChange} className="hidden" id="idFront" />
                                    <label htmlFor="idFront" className="cursor-pointer flex flex-col items-center space-y-2 text-gray-500">
                                        <span>⬆️</span> <span>Upload Front</span>
                                    </label>
                                </div>
                                <div className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg flex flex-col items-center">
                                    <input type="file" name="idBack" onChange={handleFileChange} className="hidden" id="idBack" />
                                    <label htmlFor="idBack" className="cursor-pointer flex flex-col items-center space-y-2 text-gray-500">
                                        <span>⬆️</span> <span>Upload Back</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Utility Bill Upload */}
                        <div className="mb-4">
                            <label className="block text-gray-600 font-medium mb-4">Utility Bill (Proof of Address)</label>
                            <div className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg flex flex-col items-center">
                                <input type="file" name="utilityBill" onChange={handleFileChange} className="hidden" id="utilityBill" />
                                <label htmlFor="utilityBill" className="cursor-pointer flex flex-col items-center space-y-2 text-gray-500">
                                    <span>⬆️</span> <span>Upload Utility Bill</span>
                                </label>
                            </div>
                        </div>

                        {/* BVN Input */}
                        <div className="mb-4">
                            <label className="block text-gray-600 font-medium mb-4">BVN</label>
                            <input
                                type="text"
                                name="bvn"
                                value={formData.bvn}
                                onChange={handleChange}
                                placeholder="Enter your BVN"
                                className="w-full p-3 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                            <button onClick={() => setStep(2)} className="bg-gray-300 text-gray-700 px-6 py-3 rounded-md w-full sm:w-auto">
                                Back
                            </button>
                            <button className="bg-gradient text-white px-6 py-3 rounded-md w-full sm:w-auto">
                                Submit & Proceed
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
