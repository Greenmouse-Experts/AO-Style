import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Facebook, Twitter, Instagram, Star, Music2 } from "lucide-react";
import CheckModal from "../components/CheckModal";

const product = {
    name: "Luxury Embellished Lace Fabrics",
    price: "₦12,000",
    image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
    images: [
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png",
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png",
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png"
    ],
    tags: ["Red", "Silk", "New"],
    colors: ["#c11c28", "#3b82f6", "#22c55e", "#facc15", "#a855f7"],
    reviews: 5
};

const Breadcrumb = ({ title, subtitle, just, backgroundImage }) => {
    return (
        <div
            className="bg-cover bg-center h-92 flex items-center justify-center text-white"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="Resizer Push">
                <div className="text-white px-4">
                    <h1 className="text-3xl md:text-4xl font-semibold mb-2">{title}</h1>
                    <div className="text-sm md:text-base">
                        <span>{subtitle}</span>
                        <span className="mx-2">{just}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const relatedProducts = [
    { id: 1, name: "Plaid Colourful Fabric", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png" },
    { id: 2, name: "Yellow Cashmere", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png" },
    { id: 3, name: "100% Cotton Material", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png" },
    { id: 4, name: "Red Ankara Fabric", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png" }
];

export default function ShopDetails() {
    const [mainImage, setMainImage] = useState(product.image);
    const [tab, setTab] = useState("details");
    const [quantity, setQuantity] = useState(1);
    const ratingStats = [2, 3, 0, 0, 0];

    const incrementQty = () => setQuantity(prev => prev + 1);
    const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const handleAddToCart = () => {
        setIsSuccessModalOpen(true);

        setTimeout(() => {
            setIsSuccessModalOpen(false);
            setIsModalOpen(true);
        }, 2500);
    };



    return (
        <>
            <Breadcrumb
                title="Shop Details"
                subtitle="Home > Shop > "
                just="Shop Details >  Enjoy a wide selection of Materials & Designs"
                backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741604351/AoStyle/image_ugfmjr.jpg"
            />
            <section className="Resizer section px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Image Section - Optimized for mobile */}
                    <div className="flex flex-col md:flex-row">
                        <div className="flex md:flex-col md:space-y-3 md:mr-4 mb-4 md:mb-0 overflow-x-auto md:overflow-x-visible space-x-2 md:space-x-0">
                            {product.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt="Thumbnail"
                                    className="w-20 h-20 md:w-auto md:h-38 object-cover rounded cursor-pointer border border-gray-200 hover:border-purple-600 flex-shrink-0"
                                    onClick={() => setMainImage(img)}
                                />
                            ))}
                        </div>
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="w-full h-auto object-cover rounded-md mt-2 md:mt-0"
                        />
                    </div>

                    {/* Details Section */}
                    <div>
                        <h1 className="text-2xl md:text-4xl font-medium text-gray-800 leading-loose mt-4 md:mt-0">
                            {product.name}
                        </h1>
                        <div className="flex items-center space-x-2 md:space-x-5 text-yellow-400">
                            {Array.from({ length: 5 }, (_, i) => (
                                <span key={i} className="text-base md:text-lg">{i < product.reviews ? "★" : "☆"}</span>
                            ))}
                            <span className="text-xs md:text-sm text-gray-500">({product.reviews} Reviews)</span>
                        </div>
                        <p className="text-lg md:text-xl font-medium text-purple-600 mb-4 mt-4">{product.price} <span className="text-gray-500 text-sm">per yard</span></p>

                        {/* Tags */}
                        <div className="mt-4">
                            <h3 className="font-medium mb-2 md:mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2 mt-2 md:mt-4 mb-4">
                                {product.tags.map(tag => (
                                    <span key={tag} className="px-4 md:px-8 py-1.5 md:py-2 rounded-full border border-gray-300 text-xs md:text-sm">{tag}</span>
                                ))}
                            </div>
                        </div>

                        {/* Available Colours */}
                        <div className="mt-4 md:mt-6">
                            <h3 className="font-medium mb-2 md:mb-4">Available Colours</h3>
                            <div className="flex flex-wrap gap-3 md:space-x-4 mt-2 md:mt-4">
                                {product.colors.map((color, index) => (
                                    <span
                                        key={index}
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full cursor-pointer"
                                        style={{ backgroundColor: color }}
                                    ></span>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="mt-4 md:mt-6">
                            <h3 className="font-medium text-sm text-black mb-2 md:mb-4">Quantity (Yards)</h3>
                            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden w-max">
                                <button
                                    onClick={decrementQty}
                                    className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-light text-lg"
                                >
                                    -
                                </button>
                                <span className="px-4 md:px-5 py-1.5 md:py-2 text-base text-gray-800 bg-white">
                                    {quantity}
                                </span>
                                <button
                                    onClick={incrementQty}
                                    className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <CheckModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            className="w-full md:w-auto flex items-center justify-center bg-gradient text-white px-6 md:px-8 py-2.5 md:py-3 cursor-pointer font-light mt-4 md:mt-6 transition-colors duration-200"
                        >
                            <ShoppingCart size={18} className="mr-2" /> Add To Cart
                        </button>
                        {isSuccessModalOpen && (
                            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
                                <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-sm animate-fade-in-up">
                                    <h2 className="text-lg font-semibold text-green-600 mb-1">Success!</h2>
                                    <p className="text-gray-700">Product added to cart successfully.</p>

                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => {
                                                setIsSuccessModalOpen(false);
                                                setIsModalOpen(true);
                                            }}
                                            className="px-4 py-2 bg-gradient text-white rounded hover:bg-purple-700 transition"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Social Links */}
                        <div className="flex flex-wrap gap-4 md:space-x-6 text-gray-600 mt-6 md:mt-10 text-sm md:text-base items-center">
                            <a href="#" className="flex items-center space-x-1 md:space-x-2 hover:text-purple-600 transition-colors">
                                <Facebook size={14} className="md:w-4 md:h-4" />
                                <span>Facebook</span>
                            </a>
                            <a href="#" className="flex items-center space-x-1 md:space-x-2 hover:text-purple-600 transition-colors">
                                <Twitter size={14} className="md:w-4 md:h-4" />
                                <span>Twitter</span>
                            </a>
                            <a href="#" className="flex items-center space-x-1 md:space-x-2 hover:text-purple-600 transition-colors">
                                <Music2 size={14} className="md:w-4 md:h-4" />
                                <span>TikTok</span>
                            </a>
                            <a href="#" className="flex items-center space-x-1 md:space-x-2 hover:text-purple-600 transition-colors">
                                <Instagram size={14} className="md:w-4 md:h-4" />
                                <span>Instagram</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-8 md:mt-12 border-b border-purple-600 overflow-x-auto">
                    <div className="flex min-w-max">
                        <button
                            className={`mr-4 md:mr-6 pb-2 border-b-2 text-sm md:text-base whitespace-nowrap ${tab === "details" ? "border-purple-600 text-purple-600" : "border-transparent"}`}
                            onClick={() => setTab("details")}
                        >
                            Product Details
                        </button>
                        <button
                            className={`pb-2 border-b-2 text-sm md:text-base whitespace-nowrap ${tab === "reviews" ? "border-purple-600 text-purple-600" : "border-transparent"}`}
                            onClick={() => setTab("reviews")}
                        >
                            Reviews
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="mt-4 md:mt-6 text-sm text-gray-700 leading-loose">
                    {tab === "details" ? (
                        <p className="text-xs md:text-sm leading-loose">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. i officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
                        </p>
                    ) : (
                        <div className="flex flex-col md:flex-row md:gap-10 mt-4 md:mt-10">
                            {/* Left Summary */}
                            <div className="w-full md:w-64 p-4 border border-[#CCCCCC] outline-none rounded-md bg-gray-50 mb-6 md:mb-0">
                                <div className="text-center">
                                    <p className="text-lg md:text-xl font-semibold">4.5/5</p>
                                    <div className="flex justify-center text-yellow-500 mt-1">
                                        {Array(4).fill(0).map((_, i) => (
                                            <Star key={i} size={14} className="md:w-4 md:h-4" fill="currentColor" stroke="none" />
                                        ))}
                                        <Star size={14} className="md:w-4 md:h-4" />
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-600 mt-1">5 Ratings</p>
                                </div>

                                {/* Ratings Breakdown */}
                                <div className="mt-4 md:mt-6 space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-700">
                                    {ratingStats.map((count, i) => (
                                        <div key={i} className="flex items-center space-x-2">
                                            <span className="w-4">{5 - i}★</span>
                                            <div className="w-full h-1.5 md:h-2 bg-gray-200 rounded">
                                                <div
                                                    className="h-1.5 md:h-2 bg-yellow-400 rounded"
                                                    style={{ width: `${(count / 5) * 100}%` }}
                                                />
                                            </div>
                                            <span className="w-6 text-right text-gray-500">({count})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews List */}
                            <div className="flex-1 space-y-4 md:space-y-6">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex gap-3 md:gap-4">
                                        <img
                                            src={`https://randomuser.me/api/portraits/men/${i + 1}.jpg`}
                                            alt="User"
                                            className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="text-xs md:text-sm text-gray-700">
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                            </p>
                                            <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2 text-xs md:text-sm font-medium text-gray-800">
                                                <span>{["Chukka Uzo", "French Tolu", "Princess Olukoya", "Sandra Bullock", "John Wick"][i]}</span>
                                                <span className="text-gray-400">·</span>
                                                <span className="text-yellow-500 flex items-center gap-1">
                                                    4.5/5 <Star size={12} className="md:w-3.5 md:h-3.5" fill="currentColor" stroke="none" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Related Products */}
                <div className="mt-8 md:mt-12">
                    <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">You might also like</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                        {relatedProducts.map(product => (
                            <div key={product.id} className="">
                                <img src={product.image} alt={product.name} className="w-full h-auto object-cover rounded-md" />
                                <h4 className="mt-2 md:mt-4 mb-1 md:mb-3 font-medium text-sm md:text-base">{product.name}</h4>
                                <p className="text-purple-600 text-sm md:text-base">{product.price} per yard</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}