import { useState } from "react";
import { Filter, SortDesc } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { Link } from "react-router-dom";

const categories = ["Male", "Female"];

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

export default function ShopPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState(initialProducts);

  const filteredProducts = products.filter(product =>
    (!selectedCategory || product.category === selectedCategory) &&
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoadMore = () => {
    const moreProducts = [
      { id: 9, name: "New Ankara Fabric", price: "₦15,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png" },
      { id: 10, name: "Silk Material", price: "₦18,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png" },
      { id: 11, name: "Lace Fabric", price: "₦20,000", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png" },
    ];
    setProducts(prev => [...prev, ...moreProducts]);
  };

  return (
    <>
      <Breadcrumb
        title="Shop"
        subtitle="Enjoy a wide selection of Materials & Designs"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741604351/AoStyle/image_ugfmjr.jpg"
      />
      <section className="Resizer section px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="bg-white p-6 border border-gray-300 rounded-md">
            <h3 className="font-semibold mb-2">CATEGORY</h3>
            {categories.map(category => (
              <div key={category} className="flex items-center mb-2">
                <input type="checkbox" className="mr-2" /> {category}
              </div>
            ))}
            <h3 className="font-semibold mt-4 mb-2">MARKET</h3>
            <input type="text" placeholder="Choose Market Place" className="w-full border p-2 rounded" />
            <h3 className="font-semibold mt-4 mb-2">PRICE</h3>
            <input type="range" className="w-full" />
            <h3 className="font-semibold mt-4 mb-2">COLOUR</h3>
            <input type="text" placeholder="Choose Colour" className="w-full border p-2 rounded" />
          </aside>

          {/* Product Display */}
          <div className="col-span-3">
            <div className="flex justify-between bg-purple-600 text-white p-4 rounded">
              <button>Explore by Market Place</button>
              <button className="flex items-center space-x-1">
                <SortDesc size={16} /> <span>Sort by: Popularity</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {filteredProducts.map((product) => (
                <Link key={product.id} className="text-center" to={`/inner-marketplace`}>
                  <img src={product.image} alt={product.name} className="w-full h-56 object-cover rounded-md" />
                  <h3 className="font-medium text-left mt-4 mb-3">{product.name}</h3>
                  <p className="text-[#2B21E5] text-left font-light">
                    {product.price} <span className="text-[#8A8A8A] font-medium">per yard</span>
                  </p>
                </Link>
              ))}
            </div>

            <div className="text-center mt-6">
              <button
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 cursor-pointer rounded"
                onClick={handleLoadMore}
              >
                Explore All Markets
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
