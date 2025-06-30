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

  return (
    <section className="Resizer just px-4">
      <h2 className="text-2xl font-medium mb-8">Top Trending Fabrics</h2>

      {isPending ? (
        <>
          <LoaderComponent />
        </>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {trendingProducts?.map((product, index) => (
            <Link to={`/shop-details`} key={product.id}>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.img
                  src={product?.fabric?.photos[0]}
                  alt={product.name}
                  className="w-full h-56 object-cover rounded-md"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <h3 className="font-medium text-left mt-4 mb-3">
                  {product?.name}
                </h3>
                <p className="text-[#2B21E5] text-left font-light">
                  {product.price}{" "}
                  <span className="text-[#8A8A8A] font-medium">per unit</span>
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
