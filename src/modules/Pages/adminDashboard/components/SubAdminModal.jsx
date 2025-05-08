import React from 'react';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SubAdminModal = ({ isOpen, onClose }) => {
    const [newAdmin, setNewAdmin] = useState({
        adminName: "",
        adminEmail: "",
        password: "",
        phone: "",
        adminRole: "",
    });

    useEffect(() => {
        if (!isOpen) {
            setNewAdmin({
                adminName: "",
                adminEmail: "",
                password: "",
                phone: "",
                adminRole: "",
            });
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAdmin((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        console.log("New Admin Data:", newAdmin);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-LG p-6 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Add a New Admin</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-4">Admin Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">Admin Name</label>
                            <input
                                type="text"
                                name="adminName"
                                value={newAdmin.adminName}
                                onChange={handleInputChange}
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                placeholder="Enter the admin name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">Admin Email</label>
                            <input
                                type="email"
                                name="adminEmail"
                                value={newAdmin.adminEmail}
                                onChange={handleInputChange}
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                placeholder="Enter the admin email"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={newAdmin.password}
                                onChange={handleInputChange}
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                placeholder="Enter the password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">Phone</label>
                            <div className="flex items-center border border-gray-300 rounded-md">
                                <select
                                    name="countryCode"
                                    value="+234"
                                    onChange={handleInputChange}
                                    className="p-4 border-r border-gray-300 rounded-l-md text-sm bg-gradient text-white"
                                    disabled
                                >
                                    <option value="+234">+234</option>
                                    <option value="+1">+1</option>
                                    <option value="+44">+44</option>
                                    <option value="+91">+91</option>
                                    <option value="+81">+81</option>
                                    <option value="+33">+33</option>
                                </select>
                                <input
                                    type="text"
                                    name="phone"
                                    value={newAdmin.phone}
                                    onChange={handleInputChange}
                                    className="w-full p-4 rounded-r-md outline-none text-sm"
                                    placeholder="8023456789"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">Admin Role</label>
                            <select
                                name="adminRole"
                                value={newAdmin.adminRole}
                                onChange={handleInputChange}
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            >
                                <option value="">Select a role</option>
                                <option value="Vendor Manager">Vendor Manager</option>
                                <option value="Tailor Manager">Tailor Manager</option>
                                <option value="Delivery Manager">Delivery Manager</option>
                                <option value="Customer Support">Customer Support</option>
                                <option value="Payment & Finance">Payment & Finance</option>
                                <option value="Marketing & Promotions">Marketing & Promotions</option>
                                <option value="Content & Moderation">Content & Moderation</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-between mt-6 space-x-4">
                        <Link>
                            <button
                                onClick={onClose}
                                className="w-full bg-purple-400 text-white px-4 py-2 rounded-md text-sm font-light"
                            >
                                Cancel
                            </button>
                        </Link>
                        <Link to="/admin/roles">
                            <button
                                onClick={handleSave}
                                className="w-full bg-gradient text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Add Admin
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubAdminModal;
