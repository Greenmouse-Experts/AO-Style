import { useState } from "react";
import { Search, Filter, SortDesc, X } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { Link } from "react-router-dom";

const categories = [
    "All Styles", "Male Styles", "Female Styles", "Bubu"
];

const initialProducts = [
    {
        id: 1,
        name: "Brown Kaftan Design ",
        price: "₦12,000",
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334130/AoStyle/image10_wtqzuf.png",
        category: "Agbada"
    },
    {
        id: 2,
        name: "Green Agbada ",
        price: "₦12,000",
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334119/AoStyle/image_mn945e.png",
        category: "Agbada"
    },
    {
        id: 3,
        name: "Black Female Jacket",
        price: "₦12,000",
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334124/AoStyle/image5_uky9a9.png",
        category: "Agbada"
    },
    {
        id: 4,
        name: "Green Stripe Cap",
        price: "₦12,000",
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334125/AoStyle/image7_cheqnl.png",
        category: "Suits"
    },
    {
        id: 5,
        name: "Pink 3 Piece Suit ",
        price: "₦12,000",
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334119/AoStyle/image2_holvqx.png",
        category: "Suits"
    },
    {
        id: 6,
        name: "Black Agbada ",
        price: "₦12,000",
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334128/AoStyle/image8_gozvhx.png",
        category: "Suits"
    },
    {
        id: 7,
        name: "Black Agbada ",
        price: "₦12,000",
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334125/AoStyle/image6_fmsmje.png",
        category: "Hats & Caps"
    },
    {
        id: 8,
        name: "Green Stripe Cap",
        price: "₦12,000",
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334120/AoStyle/image3_nrjkse.png",
        category: "Hats & Caps"
    },
];

export default function MarketplaceSection() {
    const [products, setProducts] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Styles");
    const [sortBy, setSortBy] = useState("Default");
    const [showFilter, setShowFilter] = useState(false);
    const [priceRange, setPriceRange] = useState([5000, 20000]);

    const toggleFilter = () => setShowFilter(!showFilter);

    const handleLoadMore = () => {
        const moreProducts = [
            { id: 9, name: "New Ankara Fabric", price: "₦15,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334130/AoStyle/image10_wtqzuf.png" },
            { id: 10, name: "Silk Material", price: "₦18,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334125/AoStyle/image7_cheqnl.png" },
            { id: 11, name: "Lace Fabric", price: "₦20,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334125/AoStyle/image6_fmsmje.png" },
        ];
        setProducts((prev) => [...prev, ...moreProducts]);
    };

    // Filter by search term, category, and price range
    const filteredProducts = products.filter((product) => {
        const productPrice = parseInt(product.price.replace("₦", "").replace(",", ""));
        return (
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCategory === "All Styles" || product.category === selectedCategory) &&
            productPrice >= priceRange[0] && productPrice <= priceRange[1]
        );
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === "Price: Low to High") return parseInt(a.price.replace("₦", "")) - parseInt(b.price.replace("₦", ""));
        if (sortBy === "Price: High to Low") return parseInt(b.price.replace("₦", "")) - parseInt(a.price.replace("₦", ""));
        return 0;
    });

    return (
        <>
            <Breadcrumb
                title="OAStyles"
                subtitle="Products"
                just="> OAStyles"
                backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1743712882/AoStyle/image_lslmok.png"
            />
            <section className="Resizer section px-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center text-left mb-6">
                    <div>
                        <h2 className="text-2xl font-medium max-w-md leading-relaxed">Get Access to the best Tailors and a range of Designs for your next outfit</h2>
                        <p className="text-[#4B4A4A] mt-4 max-w-md font-light leading-loose mb-6">
                            A virtual marketplace that offers access to tailors and fashion designers around the country.
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
                            <input 
                                type="range" 
                                min="5000" 
                                max="20000" 
                                step="1000"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                className="w-full"
                            />
                            <button className="mt-4 w-full bg-[#AB52EE] text-white py-2 rounded">Apply Filters</button>
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sortedProducts.map((product) => (
                        <Link
                            to={`/aostyle-details`} 
                            key={product.id}
                            className="text-center"
                        >
                            <img src={product.image} alt={product.name} className="w-full object-cover rounded-md" />
                            <h3 className="font-medium text-left mt-4 mb-3">{product.name}</h3>
                            <p className="text-[#2B21E5] text-left font-light">{product.price} <span className="text-[#8A8A8A] font-medium">per unit</span></p>
                        </Link>
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
