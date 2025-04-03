import React from 'react';

const SubAdminModal = ({ isOpen, onClose }) => {

    return (
        isOpen && (
            <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-lg w-[90%] sm:w-[400px]">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-[#CCCCCC] outline-none pb-3 mb-4">
                        <h2 className="text-lg font-semibold">Add a New Admin</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-black">
                            ✕
                        </button>
                    </div>

                    {/* Form */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm text-gray-600">Admin Information</label>
                            <input type="text" className="w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg" placeholder="Admin Name" />
                            <input type="email" className="w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg" placeholder="Admin Email" />
                            <input type="password" className="w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg" placeholder="Password" />
                        </div>
                        {/* Phone Number */}
                        <div className="flex gap-2">
                            <div className="flex items-center p-0 px-3 border border-[#CCCCCC] rounded-lg">
                                🇳🇬 +234
                            </div>
                            <input type="tel" className="flex-1 px-3 w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg" placeholder="8023456789" />
                        </div>


                        {/* Buttons */}
                        <div className="flex justify-between pt-4">
                            <button onClick={onClose} className="border px-4 py-2 rounded-md text-gray-600">
                                Cancel
                            </button>
                            <button className="bg-gradient text-white px-4 py-2 rounded-md">
                                Add Admin
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default SubAdminModal;
