import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import Breadcrumb from "./components/Breadcrumb";

const product = {
    name: "Luxury Embellished Lace Fabrics",
    price: "₦12,000",
    image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
    images: [
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png",
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png",
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image3_dqzhpz.png"
    ],
    tags: ["Red", "Silk", "New"],
    reviews: 5
};

const relatedProducts = [
    { id: 1, name: "Plaid Colourful Fabric", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png" },
    { id: 2, name: "Yellow Cashmere", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png" },
    { id: 3, name: "100% Cotton Material", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png" },
    { id: 4, name: "Red Ankara Fabric", price: "₦12,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png" },
];

export default function ShopDetails() {
    const [mainImage, setMainImage] = useState(product.image);

    return (
        <>
            <Breadcrumb
                title="Shop Details"
                subtitle="Enjoy a wide selection of Materials & Designs"
                backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741604351/AoStyle/image_ugfmjr.jpg"
            />
            <section className="Resizer section px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex">
                        <div className="flex flex-col space-y-2 mr-4">
                            {product.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt="Thumbnail"
                                    className="w-38 h-38 object-cover rounded cursor-pointer border border-gray-200 hover:border-purple-600"
                                    onClick={() => setMainImage(img)}
                                />
                            ))}
                        </div>
                        <img src={mainImage} alt={product.name} className="w-full h-auto object-cover rounded-md" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold">{product.name}</h1>
                        <div className="flex items-center space-x-2 text-yellow-500 mt-2">
                            {Array.from({ length: 5 }, (_, i) => (
                                <span key={i}>{i < product.reviews ? "★" : "☆"}</span>
                            ))}
                            <span className="text-gray-500">({product.reviews} Reviews)</span>
                        </div>
                        <p className="text-purple-600 text-xl font-bold mt-2">{product.price} <span className="text-gray-500 text-sm">per yard</span></p>
                        <div className="mt-4">
                            <h3 className="font-medium">Tags</h3>
                            <div className="flex space-x-2 mt-1">
                                {product.tags.map(tag => (
                                    <span key={tag} className="border rounded-full px-3 py-1 text-sm">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-medium">Quantity (Yards)</h3>
                            <div className="flex items-center border rounded-md w-max mt-2">
                                <button className="px-3 py-1 border-r">-</button>
                                <span className="px-4">1</span>
                                <button className="px-3 py-1 border-l">+</button>
                            </div>
                        </div>
                        <button className="flex items-center bg-purple-600 text-white px-6 py-2 rounded mt-6">
                            <ShoppingCart size={18} className="mr-2" /> Add To Cart
                        </button>
                    </div>
                </div>
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">You might also like</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map(product => (
                            <div key={product.id} className="text-center">
                                <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-md" />
                                <h4 className="mt-2 font-medium">{product.name}</h4>
                                <p className="text-purple-600">{product.price} per yard</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
} 
