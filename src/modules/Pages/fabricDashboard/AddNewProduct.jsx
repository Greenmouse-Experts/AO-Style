import { useState } from "react";
import { Link } from "react-router-dom";

const AddProduct = () => {
    const [colorCount, setColorCount] = useState(1);
     const [tags, setTags] = useState([]);
        const [tagInput, setTagInput] = useState('');

    const increaseColorCount = () => setColorCount(colorCount + 1);
    const decreaseColorCount = () => {
        if (colorCount > 1) setColorCount(colorCount - 1);
    };

    const handleTagInput = (e) => {
        setTagInput(e.target.value);
    };

    const handleTagAdd = (e) => {
        if (e.key === 'Enter' && tagInput.trim() && tags.length < 5) {
            e.preventDefault();
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleTagRemove = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };


    return (
        <>
            <div className="bg-white px-6 py-4 mb-6 relative">
                <h1 className="text-2xl font-medium mb-3">Add Product</h1>
                <p className="text-gray-500"><Link to="/fabric" className="text-blue-500 hover:underline">Dashboard</Link> &gt; My Product &gt; Add Product</p>
            </div>
            <div className="bg-white p-6 rounded-xl overflow-x-auto">

                <h2 className="text-lg font-semibold mb-6">Add Product</h2>

                <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Fabric Name */}
                        <div>
                            <label className="block text-gray-700 mb-4">Fabric Name</label>
                            <input
                                type="text"
                                placeholder="Enter the fabric name"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>

                        {/* SKU */}
                        <div>
                            <label className="block text-gray-700 mb-4">SKU</label>
                            <input
                                type="text"
                                placeholder="Enter the unique identifier"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Market */}
                        <div>
                            <label className="block text-gray-700 mb-4">Market</label>
                            <select className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg">
                                <option>Choose market</option>
                                <option>Local Market</option>
                                <option>Online Market</option>
                            </select>
                        </div>

                        {/* Gender Suitability */}
                        <div>
                            <label className="block text-gray-700 mb-4">Gender Suitability</label>
                            <select className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg">
                                <option>Choose suitability gender</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Unisex</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Fabric Vendor */}
                        <div>
                            <label className="block text-gray-700 mb-4">Fabric Vendor</label>
                            <input
                                type="text"
                                placeholder="Enter the name of the fabric vendor"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>

                        {/* Weight per unit */}
                        <div>
                            <label className="block text-gray-700 mb-4">Weight per unit</label>
                            <input
                                type="text"
                                placeholder="Enter the weight per unit"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Location Coordinate */}
                        <div>
                            <label className="block text-gray-700 mb-4">Location Coordinate</label>
                            <input
                                type="text"
                                placeholder="Enter the coordinates of the shop"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>

                        {/* Local Name */}
                        <div>
                            <label className="block text-gray-700 mb-4">Local Name</label>
                            <input
                                type="text"
                                placeholder="Enter the name the fabric is known as locally"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Manufacturer's Name */}
                        <div>
                            <label className="block text-gray-700 mb-4">Manufacturer's Name</label>
                            <input
                                type="text"
                                placeholder="Enter the name called by the manufacturer"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>

                        {/* Material Type */}
                        <div>
                            <label className="block text-gray-700 mb-4">Material Type</label>
                            <input
                                type="text"
                                placeholder="e.g. cotton, polyester, etc"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Alternative Names */}
                        <div>
                            <label className="block text-gray-700 mb-4">Alternative Names</label>
                            <input
                                type="text"
                                placeholder="Enter the name it is called in other locations"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>

                        {/* Fabric Texture */}
                        <div>
                            <label className="block text-gray-700 mb-4">Fabric Texture</label>
                            <input
                                type="text"
                                placeholder="Enter the fabric texture"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>
                    </div>


                    {/* Feel-a-like */}
                    <div>
                        <label className="block text-gray-700 mb-4">Feel-a-like</label>
                        <input
                            type="text"
                            placeholder="Describe what it feels like"
                            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Quantity */}
                        <div>
                            <label className="block text-gray-700 mb-4">Quantity (Must be more than 10 years)</label>
                            <input
                                type="number"
                                placeholder="Enter the quantity available"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>

                        {/* Minimum yards to purchase */}
                        <div>
                            <label className="block text-gray-700 mb-4">Minimum yards to purchase</label>
                            <input
                                type="number"
                                placeholder="Enter the minimum yards for purchase"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            />
                        </div>
                    </div>


                    {/* Colors and Color Picker */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* How many colors available */}
                        <div>
                            <label className="block text-gray-700 mb-4">How many colours available?</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={colorCount}
                                    readOnly
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                />
                                <button
                                    onClick={increaseColorCount}
                                    className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    +
                                </button>
                                <button
                                    onClick={decreaseColorCount}
                                    className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    -
                                </button>
                            </div>
                        </div>

                        {/* Color Picker */}
                        <div>
                            <label className="block text-gray-700 mb-4">Pick Available Fabric Colours</label>
                            <input
                                type="color"
                                className="w-full h-14 border border-gray-300  outline-none  rounded-lg cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Price per unit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-4">Price per unit</label>
                            <div className="flex items-center">
                                <span className="p-5 bg-gray-200 rounded-l-md">₦</span>
                                <input
                                    type="number"
                                    placeholder="Enter amount per unit"
                                    className="w-full p-4 border-t border-r border-b outline-none border-gray-300 rounded-r-md"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-gray-700 mb-3">Tags (max 5)</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleTagRemove(tag)}
                                            className="ml-2 text-blue-800 hover:text-blue-900"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {tags.length < 5 && (
                                <input
                                    type="text"
                                    placeholder="Add a tag and press Enter (max 5)"
                                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                    value={tagInput}
                                    onChange={handleTagInput}
                                    onKeyDown={handleTagAdd}
                                />
                            )}
                        </div>
                    </div>

                    {/* Upload Photos */}
                    <div>
                        <label className="block text-gray-700 mb-4">Upload Photos</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['Close Up View', 'Spread Out View', 'Manufacturer\'s Label', 'Fabric\'s Name'].map((label) => (
                                <div key={label} className="w-full h-40 border border-gray-300 rounded-md flex items-center justify-center">
                                    <input type="file" className="hidden" id={label} />
                                    <label htmlFor={label} className="cursor-pointer text-gray-400">
                                        <span>{label} (click to upload)</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upload Video */}
                    <div>
                        <label className="block text-gray-700 mb-4">Upload Video</label>
                        <div className="w-full h-40 border border-gray-300 rounded-md flex items-center justify-center">
                            <input type="file" className="hidden" id="uploadVideo" />
                            <label htmlFor="uploadVideo" className="cursor-pointer text-gray-400">
                                Upload 5-second video (showing the cloth angles)
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        className="mt-6 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:opacity-90"
                    >
                        Upload Fabric
                    </button>
                </div>
            </div>
        </>
    );
};

export default AddProduct;

