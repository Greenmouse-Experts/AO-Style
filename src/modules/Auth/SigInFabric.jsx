import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import HowDidYouHearAboutUs from "../Auth/components/HowDidYouHearAboutUs";

export default function SignInAsCustomer() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState(1);

    const personalImage = "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741617621/AoStyle/image_2_ezzekx.png";
    const businessImage = "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741617621/AoStyle/image_2_ezzekx.png";

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full flex overflow-hidden h-screen">
                {/* Left Section - Image & Text */}
                <div className="hidden md:flex w-1/2 relative h-full">
                    <img
                        src={step === 1 ? personalImage : businessImage}
                        alt="Sign In"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-0 p-8 text-white w-full">
                        <h2 className="text-xl font-medium">
                            Join Our Marketplace – Sell Fabrics & Materials <br /> to Thousands of Customers!
                        </h2>
                        <p className="text-sm mt-2">
                            Welcome to OAStyles, a platform that simplifies tailoring processes;  <br />
                            from buying materials to finding a tailor for you.
                        </p>
                    </div>
                </div>

                {/* Right Section - Sign In Form */}
                <div className="w-full md:w-1/2 p-4 sm:p-8 overflow-y-auto">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-6">
                            <Link to="/">
                                <img
                                    src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
                                    alt="OA Styles"
                                    className="h-20 w-auto mx-auto"
                                />
                            </Link>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Sign Up As A <span className="text-[#2B21E5]">Fabric Vendor</span>
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Fill the form below to create an account instantly</p>

                        {/* Tabs Navigation */}
                        <div className="flex mt-4 border-b border-[#D86BC3]">
                            <button
                                className={`flex-1 pb-2 text-center ${step === 1 ? 'border-b-4 border-[#D86BC3] font-medium' : 'text-gray-500'}`}
                                onClick={() => setStep(1)}
                            >
                                Personal Details
                            </button>
                            <button
                                className={`flex-1 pb-2 text-center ${step === 2 ? 'border-b-4 border-[#D86BC3] font-medium' : 'text-gray-500'}`}
                                onClick={() => setStep(2)}
                            >
                                Business Details
                            </button>
                        </div>

                        <form className="mt-6 space-y-4">
                            {step === 1 ? (
                                <>
                                    <label className="block text-black">Full Name</label>
                                    <input type="text" placeholder="Full Name" className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg" required />

                                    <label className="block text-black">Email Address</label>
                                    <input type="email" placeholder="Email Address" className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg" required />

                                    <label className="block text-black">Phone Number</label>
                                    <input type="tel" placeholder="Phone Number" className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg" required />

                                    <label className="block text-black">Alternative Phone Number <small className="text-[#CCCCCC]">(Optional)</small></label>
                                    <input type="tel" placeholder="Alternative Phone Number" className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg"/>

                                    <label className="block text-black">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-5 text-gray-500"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>

                                    <label className="block text-black">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm Password"
                                            className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-5 text-gray-500"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>

                                    <div><HowDidYouHearAboutUs /></div>

                                    <button
                                        type="button"
                                        className="w-full bg-gradient text-white py-4 rounded-lg font-medium cursor-pointer mt-4"
                                        onClick={() => setStep(2)}
                                    >
                                        Proceed to Business Details
                                    </button>
                                </>
                            ) : (
                                <>
                                    <label className="block text-gray-700">Business Name</label>
                                    <input type="text" placeholder="Business Name" className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg" required />

                                    <label className="block text-gray-700 mb-3">Business Type</label>
                                    <select
                                        className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg text-gray-500"
                                        required
                                    >
                                        <option value="" disabled selected>Select your business type</option>
                                        <option value="sole-proprietorship">Sole Proprietorship</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="llc">Limited Liability Company (LLC)</option>
                                        <option value="corporation">Corporation (C Corp & S Corp)</option>
                                        <option value="nonprofit">Nonprofit Organization</option>
                                        <option value="franchise">Franchise</option>
                                    </select>

                                    <label className="block text-gray-700">Business Address</label>
                                    <input type="text" placeholder="Enter your business address" className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg" required />

                                    <label className="block text-gray-700">Business Registration Number (Optional)</label>
                                    <input type="text" placeholder="Enter your business registration number" className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg" />

                                    <button
                                        type="button"
                                        className="text-purple-600 font-semibold mt-3 cursor-pointer"
                                        onClick={() => setStep(1)}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient text-white py-4 rounded-lg font-medium cursor-pointer"
                                    >
                                        Sign Up As A Fabric Vendor
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
