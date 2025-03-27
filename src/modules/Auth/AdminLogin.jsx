import { Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function SignInCustomer() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient">
            <div className="max-w-lg w-full bg-white rounded-lg p-8">
                <div className="flex justify-center mb-6">
                    <Link to="/">
                        <img
                            src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
                            alt="OAStyles Logo"
                            className="h-20"
                        />
                    </Link>
                </div>
                <h2 className="text-2xl font-medium text-center text-black mb-4">Admin Login</h2>
                <p className="text-gray-500 text-center text-sm mb-6">Enter your credentials to access your account</p>

                <form className="space-y-4">
                    <label className="block text-gray-700">Email Address</label>
                    <input type="email" placeholder="Enter your email address" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" required />

                    <label className="block text-gray-700">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10" required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-5 text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <button type="submit" className="w-full cursor-pointer bg-purple-600 text-white py-4  mt-5 rounded-lg font-semibold">Login</button>
                </form>
            </div>
        </div>
    );
}
