import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function SignInAsCustomer() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center Resizer">
            <div className="w-full flex overflow-hidden">
                {/* Left Section - Image & Text */}
                <div className="hidden md:flex w-1/2 relative">
                    <img
                        src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744099132/AoStyle/image_1_lfxhm5.jpg"
                        alt="Sign In"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-0 p-8 text-white w-full">
                        <h2 className="text-xl font-medium">
                            Earn Money by onboarding Fabric Vendors and Fashion Designers!
                        </h2>
                        <p className="text-sm mt-2">
                            Welcome to OAStyles, a platform that simplifies tailoring processes;  <br />
                            from buying materials to finding a tailor for you.
                        </p>
                    </div>
                </div>

                {/* Right Section - Sign In Form */}
                <div className="w-full md:w-1/2 p-4 sm:p-8">
                    <div className=" mb-6">
                        <Link to="/">
                            <img
                                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
                                alt="OA Styles"
                                className="h-20 w-auto mx-auto"
                            />
                        </Link>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Become a Market Rep</h2>
                    <p className="text-gray-500 text-sm mt-1">Fill the form become a Market rep on OAStyles</p>

                    <form className="mt-6 space-y-3">
                        <label className="block text-black">Full Name</label>
                        <input type="text" placeholder="Full Name" className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg" required />

                        <label className="block text-black">Email Address</label>
                        <input type="email" placeholder="Email Address" className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg" required />

                        <label className="block text-black">Phone Number</label>
                        <input type="tel" placeholder="Phone Number" className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg" required />

                        <label className="block text-black">Years of Experience in Sales </label>
                        <select
                                className="w-full p-4 border border-[#CCCCCC] text-gray-500 outline-none  mb-3 rounded-lg"
                                required
                            >
                                <option value="">Choose your years of experience</option>
                                <option value="area1">Area 1</option>
                                <option value="area2">Area 2</option>
                                <option value="area3">Area 3</option>
                        </select>

                        <label className="block text-black">Address</label>
                        <input type="text" placeholder="Enter your home address" className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg" required />

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

                        <button className="w-full bg-gradient cursor-pointer text-white py-4 rounded-lg font-normal" type="submit">
                            Sign Up As A Market Rep
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
