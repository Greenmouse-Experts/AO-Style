import { Link } from "react-router-dom";

export default function SignInCustomer() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F3E3FF]">
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
                <h2 className="text-2xl font-medium text-black mb-4">Verify your Email</h2>
                <p className="text-gray-500 text-sm mb-6">Enter the code that was sent to your email address to verify your email</p>

                <form className="space-y-4">
                    <label className="block text-gray-700">Verification Code</label>
                    <input type="email" placeholder="Enter verification code" className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg" />

                    <button className="w-full bg-gradient text-white py-3 rounded-lg font-semibold">Verify Email</button>
                </form>
            </div>
        </div>
    );
}
