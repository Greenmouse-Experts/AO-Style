import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import useGetTrendingProduct from "../../../hooks/dashboard/useGetTrendingProduct";
import LoaderComponent from "../../../components/BeatLoader";

const products = [
  {
    id: 1,
    name: "Plaid Colourful Fabric",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png",
  },
  {
    id: 2,
    name: "Yellow Cashmere",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png",
  },
  {
    id: 3,
    name: "100% Cotton Material",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png",
  },
  {
    id: 4,
    name: "Red Ankara Fabric",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
  },
  {
    id: 5,
    name: "Red Ankara Fabric",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
  },
  {
    id: 6,
    name: "Plaid Colourful Fabric",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png",
  },
  {
    id: 7,
    name: "Yellow Cashmere",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png",
  },
  {
    id: 8,
    name: "100% Cotton Material",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png",
  },
];

export default function ProductGrid() {
  const { data: getTrendingData, isPending } = useGetTrendingProduct({});

  const trendingProducts = getTrendingData?.data || [];
console.log("These are he trending products", trendingProducts)
  // Format price with commas
  const formatPrice = (price) => {
    const numPrice = parseFloat(price || 0);
    return `₦${numPrice.toLocaleString()}`;
  };

  return (
    <section className="Resizer just px-4">
  <h2 className="text-2xl font-medium mb-8">Top Trending Fabrics</h2>
  {isPending ? (
    <>
      <LoaderComponent />
    </>
  ) : (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {trendingProducts?.map((product, index) => {
        const isOutOfStock = product?.fabric?.quantity <= 15;
        const ProductWrapper = isOutOfStock ? 'div' : Link;
        const wrapperProps = isOutOfStock 
          ? { className: "cursor-not-allowed" } 
          : { to: `/shop-details/${product?.fabric?.id}` };

        return (
          <ProductWrapper {...wrapperProps} key={product.id}>
            <motion.div
              className="text-center relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative">
                <motion.img
                  src={product?.fabric?.photos[0]}
                  alt={product.name}
                  className={`w-full h-56 object-cover rounded-md ${
                    isOutOfStock ? 'blur-sm grayscale opacity-60' : ''
                  }`}
                  whileHover={isOutOfStock ? {} : { scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm bg-opacity-40 rounded-md">
                    <div className="text-center">
                      <div className="bg-red-400 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                        OUT OF STOCK
                      </div>
                      <p className="text-white text-xs mt-2 font-medium">
                        Currently Unavailable
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <h3 className={`font-medium text-left uppercase mt-4 mb-3 ${
                isOutOfStock ? 'text-gray-400' : ''
              }`}>
                {product?.name?.length > 20
                  ? product.name.slice(0, 20) + "..."
                  : product?.name}
              </h3>
              <p className={`text-left font-bold ${
                isOutOfStock ? 'text-gray-400' : 'text-[#2B21E5]'
              }`}>
                {formatPrice(product.price)}{" "}
                <span className={isOutOfStock ? 'text-gray-400' : 'text-[#8A8A8A]'}>
                  per yard
                </span>
              </p>
              {/* {isOutOfStock && (
                <span className="inline-block mt-2 text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
                  Only {product?.fabric?.quantity} yards left
                </span>
              )} */}
            </motion.div>
          </ProductWrapper>
        );
      })}
    </div>
  )}
</section>
  );
}
