import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import HowDidYouHearAboutUs from "../Auth/components/HowDidYouHearAboutUs";

export default function SignUpAsLogisticsAgent() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agentType, setAgentType] = useState("individual"); // "individual" or "organization"

    return (
        <div className="min-h-screen flex items-center justify-center Resizer">
            <div className="w-full flex overflow-hidden">
                {/* Left Section - Image & Text */}
                <div className="hidden md:flex w-1/2 relative">
                    <img
                        src='https://res.cloudinary.com/diqa0sakr/image/upload/v1743763031/image_ov4nhd.jpg'
                        alt="Sign In"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-0 p-8 text-white w-full">
                        <h2 className="text-xl font-medium">
                            Earn More with Every Delivery – Join Our  <br /> Logistics Network Today!
                        </h2>
                        <p className="text-sm mt-2">
                            Welcome to OAStyles, a platform that simplifies tailoring <br /> processes; from buying materials to finding a tailor for you  
                        </p>
                    </div>
                </div>

                {/* Right Section - Sign Up Form */}
                <div className="w-full md:w-1/2 p-4 sm:p-8">
                    <div className="mb-4">
                        <Link to="/">
                            <img
                                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
                                alt="OA Styles"
                                className="h-20 w-auto mx-auto"
                            />
                        </Link>
                    </div>
                    <div className="mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            Sign Up As A <span className="text-[#2B21E5]">Logistics Agent</span>
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Fill the form become a delivery agent for customers
                        </p>
                    </div>

                    {/* Agent Type Tabs */}
                    <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-200">
                        <button
                            className={`flex-1 py-3 text-center font-medium ${agentType === "individual" ? "bg-gradient text-white" : "bg-gray-100 text-gray-700"}`}
                            onClick={() => setAgentType("individual")}
                        >
                            As Individual Agent
                        </button>
                        <button
                            className={`flex-1 py-3 text-center font-medium ${agentType === "organization" ? "bg-gradient text-white" : "bg-gray-100 text-gray-700"}`}
                            onClick={() => setAgentType("organization")}
                        >
                            As Organisation
                        </button>
                    </div>

                    <form className="space-y-4">
                        <div>
                            <label className="block text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="Enter your phone number"
                                className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                placeholder="Enter your home address"
                                className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg"
                                required
                            />
                        </div>

                        {agentType === "organization" && (
                            <div>
                                <label className="block text-gray-700 mb-1">Organization Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your organization name"
                                    className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg"
                                    required
                                />
                            </div>
                        )}

                        {/* <div>
                            <label className="block text-gray-700 mb-1">Service Areas</label>
                            <select
                                className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg"
                                required
                            >
                                <option value="">Choose your service area</option>
                                <option value="area1">Area 1</option>
                                <option value="area2">Area 2</option>
                                <option value="area3">Area 3</option>
                            </select>
                        </div> */}

                        <div>
                            <label className="block text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-5 text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re enter your password"
                                    className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-5 text-gray-500"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <HowDidYouHearAboutUs />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient text-white py-3 rounded-lg font-medium mt-4 transition-colors"
                        >
                            Sign Up As A Logistics Agent
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}