import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ title, subtitle, just, backgroundImage }) => {
    return (
        <div
            className="bg-cover bg-center h-92 flex items-center justify-center text-white"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="Resizer Push">
                <div className=" text-white">
                    <h1 className="text-4xl font-semibold mb-2">{title}</h1>
                    <div className="">
                        <span>{subtitle}</span>
                        <span className="mx-2">{just}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const allProducts = [
    {
        id: 1,
        name: "Plaid Colourful Fabric",
        type: "Plaid",
        color: "Multicolour",
        price: 12000,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png",
    },
    {
        id: 2,
        name: "Yellow Cashmere",
        type: "Cashmere",
        color: "Yellow",
        price: 12000,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png",
    },
    {
        id: 3,
        name: "100% Cotton Material",
        type: "Cotton",
        color: "Cream",
        price: 12000,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png",
    },
    {
        id: 4,
        name: "Red Ankara Fabric",
        type: "Ankara",
        color: "Red",
        price: 12000,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
    },
    {
        id: 5,
        name: "Red Ankara Fabric",
        type: "Ankara",
        color: "Red",
        price: 12000,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
    },
    {
        id: 6,
        name: "Plaid Colourful Fabric",
        type: "Plaid",
        color: "Multicolour",
        price: 12000,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png",
    },
    {
        id: 7,
        name: "Yellow Cashmere",
        type: "Cashmere",
        color: "Yellow",
        price: 12000,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png",
    },
    {
        id: 8,
        name: "100% Cotton Material",
        type: "Cotton",
        color: "Cream",
        price: 12000,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png",
    },
    {
        id: 9,
        name: "Plaid Colourful Fabric",
        type: "Plaid",
        color: "Multicolour",
        price: 12000,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png",
    },
    {
        id: 10,
        name: "Red Ankara Fabric",
        type: "Ankara",
        color: "Red",
        price: 12000,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
    },
];


export default function MarketplacePage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [colorFilter, setColorFilter] = useState("");
    const [priceFilter, setPriceFilter] = useState("");

    const filteredProducts = allProducts.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter ? product.type === typeFilter : true;
        const matchesColor = colorFilter ? product.color === colorFilter : true;
        const matchesPrice =
            priceFilter === "low"
                ? product.price <= 10000
                : priceFilter === "mid"
                    ? product.price > 10000 && product.price <= 15000
                    : priceFilter === "high"
                        ? product.price > 15000
                        : true;

        return matchesSearch && matchesType && matchesColor && matchesPrice;
    });

    return (
        <>
            <Breadcrumb
                title="Shop"
                subtitle="Home > Marketplace > "
                just="Onitsha Main Market"
                backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741604351/AoStyle/image_ugfmjr.jpg"
            />

            <main className="Resizer section px-4">
                <div className="">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center text-left">
                        <div>
                            <h2 className="text-2xl font-medium max-w-md leading-relaxed ">Welcome to Onitsha Main Market</h2>
                            <p className="text-[#4B4A4A] mt-4 max-w-md font-light leading-loose mb-6">
                                Buy materials from Onitsha Main Market from the comfort of your home
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center text-left mb-16 space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                        <select
                            className="w-full border border-gray-300 rounded-md text-gray-400 pl-4 pr-10 py-2 focus:outline-none text-sm "
                            onChange={(e) => {
                                setTypeFilter("");
                                setColorFilter("");
                                setPriceFilter("");
                                setSearch("");
                            }}
                        >
                            <option>All Materials</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <select
                            className=" border border-gray-300 rounded-md text-gray-400 pl-4 pr-10 py-2 focus:outline-none text-sm w-full"
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">Material Type</option>
                            <option value="Plaid">Plaid</option>
                            <option value="Cashmere">Cashmere</option>
                            <option value="Cotton">Cotton</option>
                            <option value="Ankara">Ankara</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <select
                            className="border border-gray-300 rounded-md text-gray-400 pl-4 pr-10 py-2 focus:outline-none text-sm w-full"
                            onChange={(e) => setPriceFilter(e.target.value)}
                        >
                            <option value="">Price</option>
                            <option value="low">Below ₦10,000</option>
                            <option value="mid">₦10,001 - ₦15,000</option>
                            <option value="high">Above ₦15,000</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <select
                            className="border border-gray-300 rounded-md text-gray-400 pl-4 pr-10 py-2 focus:outline-none text-sm w-full"
                            onChange={(e) => setColorFilter(e.target.value)}
                        >
                            <option value="">Colour</option>
                            <option value="Red">Red</option>
                            <option value="Yellow">Yellow</option>
                            <option value="Multicolour">Multicolour</option>
                            <option value="Cream">Cream</option>
                        </select>
                    </div>

                    {/* Search input on the right */}
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Search by keyword"
                            className="w-full border border-gray-300 rounded-md pl-4 pr-10 py-2 focus:outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search size={18} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                </div>

                <section>
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {filteredProducts.map((product, index) => (
                                <Link to={`/shop-details`} key={product.id}>
                                    <motion.div
                                        className="text-center"
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <motion.img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-66 object-cover rounded-md"
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                        <h3 className="font-medium text-left mt-4 mb-2 text-sm">{product.name}</h3>
                                        <p className="text-[#2B21E5] text-left text-sm">
                                            ₦{product.price.toLocaleString()} <span className="text-gray-500">per units</span>
                                        </p>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-500">No products match your filters.</p>
                        </div>
                    )}

                    {filteredProducts.length > 0 && (
                        <div className="mt-10 flex justify-center">
                            <button className="bg-gradient text-white px-6 py-3 cursor-pointer">
                                Load More
                            </button>
                        </div>
                    )}
                </section>

            </main>
        </>
    );
}
