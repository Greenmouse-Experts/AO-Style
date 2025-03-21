import { useState } from "react";
import { Link } from "react-router-dom";

const categories = [
    "All Products", "Agbada", "Kaftan", "Bubu", "Hats & Caps", "Suits", "Jump Suits", "Dresses & Gowns", "Trousers", "Shirts"
];

const products = [
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

export default function ProductSection() {
    const [selectedCategory, setSelectedCategory] = useState("All Products");

    const filteredProducts = selectedCategory === "All Products"
        ? products
        : products.filter(product => product.category === selectedCategory);

    return (
        <section className="Resizer section">
            <div className="px-4">
            <button className="border border-purple-500 text-[#484545] px-4 py-2 rounded-full text-sm w-full md:w-auto mb-2 md:mb-0">
                Top Styles
            </button>
            </div>
            <h2 className="text-2xl font-medium mt-6 max-w-lg leading-relaxed mb-8 px-4">Get Access to the best Tailors and a range of Designs for your next outfit</h2>
            <div className="flex space-x-4 overflow-x-auto mb-10 px-4">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
                {filteredProducts.map(product => (
                    <div key={product.id} className="">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full object-cover rounded-md"
                        />
                        <h3 className="font-medium text-left mt-4 mb-3">{product.name}</h3>
                        <p className="text-[#2B21E5]  text-left font-light">{product.price}</p>
                    </div>
                ))}
            </div>
            <div className="flex justify-center mt-14">
                <Link to="/marketplace">
                    <button className="bg-gradient text-white px-10 py-3 w-full md:w-auto cursor-pointer">
                        Explore All Styles
                    </button>
                </Link>
            </div>
        </section>
    );
}
