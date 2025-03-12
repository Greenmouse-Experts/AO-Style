import { useState } from "react";
import { Search, Filter, SortDesc } from "lucide-react";
import Breadcrumb from "./components/Breadcrumb";

const categories = [
    "All Styles", "Male Styles", "Female Styles", "Bubu"
];

const initialProducts = [
    { id: 1, name: "Plaid Colourful Fabric", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png" },
    { id: 2, name: "Yellow Cashmere", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png" },
    { id: 3, name: "100% Cotton Material", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png" },
    { id: 4, name: "Red Ankara Fabric", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png" },
    { id: 5, name: "Red Ankara Fabric", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png" },
    { id: 6, name: "Plaid Colourful Fabric", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png" },
    { id: 7, name: "Yellow Cashmere", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png" },
    { id: 8, name: "100% Cotton Material", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png" },
];

export default function MarketplaceSection() {
    const [products, setProducts] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Styles");
    const [sortBy, setSortBy] = useState("Default");
    const [showFilter, setShowFilter] = useState(false);

    const toggleFilter = () => setShowFilter(!showFilter);

    const handleLoadMore = () => {
        const moreProducts = [
            { id: 9, name: "New Ankara Fabric", price: "₦15,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png" },
            { id: 10, name: "Silk Material", price: "₦18,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png" },
            { id: 11, name: "Lace Fabric", price: "₦20,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png" },
        ];
        setProducts((prev) => [...prev, ...moreProducts]);
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

      const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === "Price: Low to High") return parseInt(a.price.replace("₦", "")) - parseInt(b.price.replace("₦", ""));
        if (sortBy === "Price: High to Low") return parseInt(b.price.replace("₦", "")) - parseInt(a.price.replace("₦", ""));
        return 0;
    });

    return (
        <>
            <Breadcrumb
                title="Products"
                subtitle="Access fabric markets all around the country from your home"
                backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741735303/AoStyle/image_1_yjbeyq.jpg"
            />
            <section className="Resizer section px-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center text-left mb-6">
                    <div>
                        <h2 className="text-2xl font-medium max-w-md leading-relaxed ">Top Trending Fabrics</h2>
                        <p className="text-[#4B4A4A] mt-4 max-w-md font-light leading-loose mb-6">
                            A virtual marketplace that offers high-quality fabric from various parts of the country.
                        </p>
                    </div>
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Search by keyword"
                            className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={18} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-4 overflow-x-auto px-4">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 ${selectedCategory === category ? 'text-[#AB52EE] border-b-1 border-[#AB52EE] font-medium cursor-pointer' : 'text-[#4B4A4A] font-light cursor-pointer'}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <div className="flex space-x-4">
                        <select onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 text-[#8A8A8A] p-2 rounded">
                            <option value="Default"><SortDesc size={16} /> Sort By</option>
                            <option value="Price: Low to High">Price: Low to High</option>
                            <option value="Price: High to Low">Price: High to Low</option>
                        </select>
                        <button onClick={toggleFilter} className="flex items-center space-x-2 text-gray-600"><Filter size={16} /> <span>Filter Results</span></button>
                    </div>

                </div>

                {showFilter && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg w-80">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Filter Options</h3>
                                <button onClick={toggleFilter}><X size={20} /></button>
                            </div>
                            <label className="block mb-2">Price Range</label>
                            <input type="range" min="5000" max="20000" className="w-full" />
                            <button className="mt-4 w-full bg-[#AB52EE] text-white py-2 rounded">Apply Filters</button>
                        </div>
                    </div>
                )}
                
                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="text-center">
                            <img src={product.image} alt={product.name} className="w-full h-56 object-cover rounded-md" />
                            <h3 className="font-medium text-left mt-4 mb-3">{product.name}</h3>
                            <p className="text-[#2B21E5] text-left font-light">{product.price} <span className="text-[#8A8A8A] font-medium">per yard</span></p>
                        </div>
                    ))}
                </div>
                
                {/* Load More Button */}
                <div className="flex justify-center mt-16">
                    <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 cursor-pointer" onClick={handleLoadMore}>
                        Load More Products
                    </button>
                </div>
            </section>
        </>
    );
}

