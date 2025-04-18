import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Link } from "react-router-dom";
import ModalThanks from "./components/ModalThanks";

export default function StyleForm() {
    const [stylePhotos, setStylePhotos] = useState([]);

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        setStylePhotos(files);
    };
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="bg-white p-6 mb-6 rounded-lg">
                <h1 className="text-xl md:text-2xl font-medium mb-3">All Styles</h1>
                <p className="text-gray-500 text-sm">
                    <Link to="/tailor" className="text-blue-500 hover:underline">Dashboard</Link> &gt; My Catalog &gt;  Add Style
                </p>
            </div>
            <div className="bg-white p-6 rounded-lg max-w-2xl">
                <h1 className="text-lg font-semibold text-black mb-4">Submit New Style</h1>

                <div className="space-y-4">
                    <form action="">
                        <div>
                            <label className="block text-gray-700 mb-4">Style Name</label>
                            <input
                                type="text"
                                placeholder="Enter the name of style"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-4 mt-4">Style Description</label>
                            <textarea
                                placeholder="Enter the style description"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-4 mt-4">Style Category</label>
                                <select className="w-full p-4 border border-[#CCCCCC] text-gray-700  outline-none rounded-lg" required>
                                    <option value="">Choose style category</option>
                                    <option value="casual">Casual</option>
                                    <option value="formal">Formal</option>
                                    <option value="traditional">Traditional</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-4 mt-4">Gender</label>
                                <select className="w-full p-4 border border-[#CCCCCC] text-gray-700  outline-none rounded-lg" required>
                                    <option value="">Choose gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="unisex">Unisex</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-4 mt-4">Upload Style Photos</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer">
                                <UploadCloud className="mx-auto text-gray-400 mb-4" size={32} />
                                <p className="text-xs">Upload up to 5 Photos<br />(Each photo less than 5MB)</p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="mt-2 w-full"
                                    onChange={handlePhotoUpload}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-4 mt-4">Minimum Fabric Quantity Required (Yards)</label>
                                <input
                                    type="number"
                                    placeholder="Enter the minimum fabric required for this style"
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-4 mt-4">Estimated Sewing Time (days)</label>
                                <input
                                    type="number"
                                    placeholder="Enter the number of days"
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-4 mt-4">Price</label>
                            <div className="flex items-center gap-2">
                                <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none">
                                    <option>NGN</option>
                                    <option>USD</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Enter amount per unit"
                                    className="flex-1 p-4 border border-[#CCCCCC] rounded-lg px-4 py-2 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-4 mt-4">Location</label>
                            <input
                                    type="text"
                                    placeholder="Enter the location"
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                    required
                                />
                        </div>
                        <ModalThanks isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                        <button type='submit' className="bg-gradient text-white px-6 py-2 rounded w-full md:w-fit mt-4 cursor-pointer" onClick={() => setIsModalOpen(true)} >
                        Submit Style
                    </button>
                    </form>
                </div>
            </div>
        </>
    );
}
