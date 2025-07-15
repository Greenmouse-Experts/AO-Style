import { useState } from "react";
import { Filter, SortDesc } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { Link } from "react-router-dom";
import useQueryParams from "../../../hooks/useQueryParams";
import useProductGeneral from "../../../hooks/dashboard/useGetProductGeneral";
import LoaderComponent from "../../../components/BeatLoader";
import { motion } from "framer-motion";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import { useCartStore } from "../../../store/carybinUserCartStore";

const categories = ["Male", "Female"];

const initialProducts = [
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

export default function ShopPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState(initialProducts);

  const filteredProducts = products.filter(
    (product) =>
      (!selectedCategory || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoadMore = () => {
    const moreProducts = [
      {
        id: 9,
        name: "New Ankara Fabric",
        price: "₦15,000",
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png",
      },
      {
        id: 10,
        name: "Silk Material",
        price: "₦18,000",
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png",
      },
      {
        id: 11,
        name: "Lace Fabric",
        price: "₦20,000",
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png",
      },
    ];
    setProducts((prev) => [...prev, ...moreProducts]);
  };

  const [page, setPage] = useState(10);

  const [queryString, setQueryString] = useState("");

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  const [debounceSearch, setDebounceSearch] = useState("");

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    setDebounceSearch(debouncedSearchTerm.trim() || undefined);
    setPage(1);
  }, [debouncedSearchTerm]);

  const { data: getProductData, isPending: productIsPending } =
    useProductGeneral(
      {
        "pagination[limit]": 10000000000000000,
        "pagination[page]": 1,
        q: debounceSearch,
        status: "PUBLISHED",
      },
      "FABRIC"
    );

  const isShowMoreBtn = getProductData?.count == getProductData?.data?.length;

  const Cartid = localStorage.getItem("cart_id");

  const item = useCartStore.getState().getItemByCartId(Cartid);

  console.log(item);

  return (
    <>
      <Breadcrumb
        title="Shop"
        subtitle="Enjoy a wide selection of Materials & Designs"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741604351/AoStyle/image_ugfmjr.jpg"
      />
      <section className="Resizer section px-4">
        {item ? (
          <div className="bg-[#FFF2FF] p-4 rounded-lg mb-6">
            <h2 className="text-sm font-medium text-gray-500 mb-4">STYLE</h2>
            <div className="flex">
              <div className="flex-shrink-0">
                <img
                  src={item?.product?.style?.image}
                  alt="product"
                  className="w-20 h-20 rounded object-cover"
                />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-medium">{item?.product?.style?.name}</h3>
                <p className="mt-1 text-sm">
                  X {item?.product?.style?.measurement?.length}{" "}
                  {item?.product?.style?.measurement?.length > 1
                    ? "Pieces"
                    : "Piece"}
                </p>
                <p className="mt-1 text-[#0f0f11] text-sm">
                  N {item?.product?.style?.price_at_time?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside
            className="bg-white p-6 border border-gray-300 rounded-md 
  md:h-[50vh] md:sticky md:top-24 md:overflow-y-auto 
  scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-100"
          >
            <h3 className="font-semibold mb-2">CATEGORY</h3>
            {categories.map((category) => (
              <div key={category} className="flex items-center mb-2">
                <input type="checkbox" className="mr-2" /> {category}
              </div>
            ))}
            <h3 className="font-semibold mt-4 mb-2">MARKET</h3>
            <input
              type="text"
              placeholder="Choose Market Place"
              className="w-full border p-2 rounded"
            />
            <h3 className="font-semibold mt-4 mb-2">PRICE</h3>
            <input type="range" className="w-full" />
            <h3 className="font-semibold mt-4 mb-2">COLOUR</h3>
            <input
              type="text"
              placeholder="Choose Colour"
              className="w-full border p-2 rounded"
            />
          </aside>

          {/* Product Display */}
          <div className="col-span-3">
            <div className="flex justify-between bg-purple-600 text-white p-4 rounded">
              <button>Explore by Market Place</button>
              <button className="flex items-center space-x-1">
                <SortDesc size={16} /> <span>Sort by: Popularity</span>
              </button>
            </div>

            {productIsPending ? (
              <div className="mt-20">
                <LoaderComponent />
              </div>
            ) : (
              <div className="grid grid-cols-2 mt-10 mb-5 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {getProductData?.data?.map((product, index) => (
                  <Link
                    to={`/shop-details`}
                    state={{ info: product?.fabric?.id }}
                    key={product.id}
                  >
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
                        ₦{product.price}{" "}
                        <span className="text-[#8A8A8A] font-medium">
                          per unit
                        </span>
                      </p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}

            {getProductData?.data?.length ? (
              isShowMoreBtn ? (
                <></>
              ) : (
                <div className="flex justify-center mt-16">
                  <button
                    className="bg-gradient text-white px-6 py-3 cursor-pointer"
                    onClick={() => {
                      setPage((prev) => prev + 10);
                    }}
                  >
                    Load More Markets
                  </button>
                </div>
              )
            ) : (
              <></>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
