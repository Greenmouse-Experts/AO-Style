import { useState } from "react";
import { FaEye, FaEyeSlash, FaArrowUp, FaArrowDown } from "react-icons/fa";

const WalletPage = () => {
    const [showBalance, setShowBalance] = useState(true);

    return (
        <div className="bg-white p-6 rounded-xl max-w-md mx-auto">
            {/* Wallet Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Wallet</h2>
                <button className="bg-gray-100 px-3 py-1 rounded-md text-gray-700 text-sm">
                    Monthly ▾
                </button>
            </div>

            {/* Balance Card */}
            <div className="bg-[#9847FE] text-white p-6 h-28 rounded-lg relative">
                <p className="text-sm mb-3">TOTAL BALANCE</p>
                <h1 className="text-3xl font-bold">
                    {showBalance ? "N 120,000" : "******"}
                </h1>
                <button
                    className="absolute top-6 right-6 text-white text-xl"
                    onClick={() => setShowBalance(!showBalance)}
                >
                    {showBalance ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>

            {/* Income & Withdrawal */}
            <div className="flex justify-between mt-6">
                <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-4 rounded-full">
                        <FaArrowUp className="text-green-500" />
                    </div>
                    <div>
                        <p className="text-green-600 text-sm">INCOME</p>
                        <p className="font-semibold">N 100,000</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-red-100 p-4 rounded-full">
                        <FaArrowDown className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-red-600 text-sm">Withdrawal</p>
                        <p className="font-semibold">N 20,000</p>
                    </div>
                </div>
            </div>

            {/* Withdraw Button */}
            <div className="mt-6 text-center">
                <button className="border border-purple-600 w-full text-purple-600 px-6 py-4 rounded-lg font-light cursor-pointer">
                    Withdraw
                </button>
            </div>

            {/* Recent Transactions */}
            <div className="mt-6">
                <p className="text-gray-500 text-sm">RECENT</p>
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mt-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-100 p-4 rounded-full">
                            <FaArrowUp className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm">Payment for Vendor reg..</p>
                            <p className="text-xs text-gray-500">12 - 02 - 25</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-green-600">+ N 200,000</p>
                        <p className="text-xs text-green-500">Successful</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
