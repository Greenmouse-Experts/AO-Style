import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import HowDidYouHearAboutUs from "../Auth/components/HowDidYouHearAboutUs";

export default function SignInAsCustomer() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Left Section - Banner */}
            <div className="hidden md:flex w-1/2 relative">
                <img
                    src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741611518/AoStyle/image_1_m2fv4b.png"
                    alt="Sign In"
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-0 p-8 text-white w-full">
                    <h2 className="text-xl font-medium">
                        Connecting customers to Material Vendors
                        <br /> and the best Tailors/Fashion Designers
                    </h2>
                    <p className="text-sm mt-2">
                        Welcome to OAStyles, a platform that simplifies tailoring processes;  <br />
                        from buying materials to finding a tailor for you.
                    </p>
                </div>
            </div>

            {/* Right Section - Scrollable Form */}
            <div className="w-full md:w-1/2 h-full overflow-y-auto p-4 sm:p-8">
                <div className="max-w-2xl mx-auto">
                    <Link to="/">
                        <img
                            src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
                            alt="OA Styles"
                            className="h-20 w-auto mx-auto"
                        />
                    </Link>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Sign Up As A <span className="text-[#2B21E5]">Customer</span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Fill the form below to create an account instantly</p>

                    <form className="mt-6 space-y-3">
                        <label className="block text-black">Full Name</label>
                        <input type="text" placeholder="Full Name" className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg" required />

                        <label className="block text-black">Email Address</label>
                        <input type="email" placeholder="Email Address" className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg" required />

                        <label className="block text-black">Phone Number</label>
                        <input type="tel" placeholder="Phone Number" className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg" required />

                        <label className="block text-black">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg pr-10"
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
                                className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-5 text-gray-500"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        <HowDidYouHearAboutUs />

                        <button className="w-full bg-gradient cursor-pointer text-white py-4 rounded-lg font-normal mt-4" type="submit">
                            Sign Up As A Customer
                        </button>
                    </form>

                    <p className="text-center text-gray-600 text-sm mt-4">
                        Already have an account? <Link to="/login" className="text-purple-600">Login</Link>
                    </p>

                    <div className="flex items-center mt-4">
                        <hr className="flex-grow border-gray-300" />
                        <span className="px-3 text-gray-500">Or</span>
                        <hr className="flex-grow border-gray-300" />
                    </div>

                    <button className="w-full mt-4 flex items-center justify-center border border-[#CCCCCC] hover:bg-gradient-to-r from-purple-500 to-pink-50 hover:text-white p-4 rounded-lg">
                        <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="h-5 mr-2" />
                        Sign Up with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
