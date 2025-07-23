import { useEffect, useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Facebook, Twitter, Instagram, Star, Music2 } from "lucide-react";
import CheckModal from "../components/CheckModal";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import Cookies from "js-cookie";
import useSingleProductGeneral from "../../../hooks/dashboard/useeGetSingleProduct";
import useToast from "../../../hooks/useToast";
import useAddCart from "../../../hooks/cart/useAddCart";
import LoaderComponent from "../../../components/BeatLoader";
import useProductGeneral from "../../../hooks/dashboard/useGetProductGeneral";
import { useCartStore } from "../../../store/carybinUserCartStore";
import SubmitProductModal from "../components/SubmitProduct";
import { generateUniqueId } from "../../../lib/helper";

const product = {
  name: "Luxury Embellished Lace Fabrics",
  price: "₦12,000",
  image:
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
  images: [
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png",
  ],
  tags: ["Red", "Silk", "New"],
  colors: ["#c11c28", "#3b82f6", "#22c55e", "#facc15", "#a855f7"],
  reviews: 5,
};

const relatedProducts = [
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
    name: "Red Ankara Fabric",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
  },
];

export default function ShopDetails() {
  const [mainImage, setMainImage] = useState("");
  const [tab, setTab] = useState("details");
  const [quantity, setQuantity] = useState(1);

  const [selectedColor, setSelectedColor] = useState(null);

  const ratingStats = [2, 3, 0, 0, 0];

  const location = useLocation();

  const productInfo = location?.state?.info;

  const { isPending: addCartPending, addCartMutate } = useAddCart();

  const { data: getSingleProductData, isPending: productIsPending } =
    useSingleProductGeneral("FABRIC", productInfo);

  const productVal = getSingleProductData?.data;

  // useEffect(() => {
  //   setQuantity(productVal?.minimum_yards);
  // }, [productVal?.minimum_yards]);

  const incrementQty = () => {
    setQuantity((prev) => +prev + 1);
  };

  const decrementQty = () => {
    setQuantity((prev) =>
      +prev > +productVal?.minimum_yards
        ? +prev - 1
        : +productVal?.minimum_yards
    );
  };

  useEffect(() => {
    if (productVal?.minimum_yards) {
      setQuantity(+productVal.minimum_yards);
    }
  }, [productVal?.minimum_yards]);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isModalSubmitOpen, setIsModalSubmitOpen] = useState(false);

  const handleAddToCart = () => {
    setIsSuccessModalOpen(true);

    setTimeout(() => {
      setIsSuccessModalOpen(false);
      setIsModalOpen(true);
    }, 2500);
  };

  useEffect(() => {
    if (productVal) {
      setMainImage(productVal?.photos[0]);
    }
  }, [productVal]);

  const token = Cookies.get("token");

  const { toastError, toastSuccess } = useToast();
  const currentPath = location.pathname + location.search;
  const navigate = useNavigate();

  console.log(productVal?.minimum_yards);

  const { data: getProductPreferenceData, isPending: productGeneralIsPending } =
    useProductGeneral(
      {
        "pagination[limit]": 10,
        "pagination[page]": 1,
        category_id: productVal?.product?.category_id,
        status: "PUBLISHED",
      },
      "FABRIC"
    );

  // console.log(getProductPreferenceData?.data, productInfo);

  const filteredData = getProductPreferenceData?.data?.filter(
    (item) => item.fabric?.id !== productInfo
  );

  const addToCart = useCartStore((state) => state.addToCart);

  const Cartid = localStorage.getItem("cart_id");

  const item = useCartStore.getState().getItemByCartId(Cartid);

  const id = useMemo(() => generateUniqueId(), []);

  return (
    <>
      <Breadcrumb
        title="Shop"
        subtitle="Shop"
        just="Enjoy a wide selection of Materials & Designs"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741604351/AoStyle/image_ugfmjr.jpg"
      />

      {productIsPending ? (
        <div className="h-screen flex items-center">
          {" "}
          <LoaderComponent />
        </div>
      ) : (
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Section - Enhanced layout */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-gray-50 rounded-xl overflow-hidden">
                <img
                  src={mainImage}
                  alt={productVal?.product?.name}
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
                {/* Heart icon removed as requested */}
              </div>
              
              {/* Thumbnail Images */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productVal?.photos?.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img 
                        ? "border-purple-500 ring-2 ring-purple-200" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Details Section - Enhanced layout */}
            <div className="space-y-6">
              {/* Product Title and Price */}
              <div className="space-y-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {productVal?.product?.name}
                </h1>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-purple-600">
                    ₦{productVal?.product?.price?.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">per unit</span>
                </div>
              </div>

              {/* Tags Section */}
              {productVal?.product?.tags?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {productVal?.product?.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200 hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Colours */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Available Colours
                  {selectedColor && (
                    <span className="ml-2 text-xs text-purple-600 font-normal normal-case">
                      (Selected: {selectedColor})
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {productVal?.fabric_colors?.split(",").map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-4 transition-all duration-200 hover:scale-105 ${
                        selectedColor === color
                          ? "border-purple-500 ring-4 ring-purple-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Select ${color}`}
                    >
                      {selectedColor === color && (
                        <svg className="w-6 h-6 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                {!selectedColor && (
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <span className="font-medium">Please select a color</span> to add this item to your cart.
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Quantity (Yards)
                  <span className="ml-2 text-xs text-gray-500 font-normal normal-case">
                    (Min: {productVal?.minimum_yards})
                  </span>
                </h3>
                <div className="flex items-center">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={decrementQty}
                      disabled={quantity <= productVal?.minimum_yards}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title={
                        quantity <= productVal?.minimum_yards
                          ? `Minimum quantity is ${productVal?.minimum_yards} yards`
                          : "Decrease quantity"
                      }
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-6 py-3 text-lg font-semibold text-gray-900 bg-white border-x border-gray-200 min-w-[80px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQty}
                      className="p-3 hover:bg-gray-100 transition-colors"
                      title="Increase quantity"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  <div className="ml-4 text-sm text-gray-600">
                    <span className="font-medium">Total: ₦{(productVal?.product?.price * quantity)?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {/* Add to Cart Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  disabled={!selectedColor}
                  onClick={() => {
                    if (Cartid) {
                      addToCart(
                        {
                          product: {
                            id: productVal?.product_id,
                            name: productVal?.product?.name,
                            type: "FABRIC",
                            quantity: +quantity,
                            price_at_time: productVal?.product?.price,
                            image: mainImage,
                            color: selectedColor,
                          },
                        },
                        Cartid
                      );

                      toastSuccess("Item saved in the cart");

                      setIsSuccessModalOpen(true);

                      setTimeout(() => {
                        setIsSuccessModalOpen(false);
                        setIsModalSubmitOpen(true);
                      }, 2500);
                    } else {
                      addToCart(
                        {
                          product: {
                            id: productVal?.product_id,
                            name: productVal?.product?.name,
                            type: "FABRIC",
                            quantity: +quantity,
                            price_at_time: productVal?.product?.price,
                            image: mainImage,
                            color: selectedColor,
                          },
                        },
                        id
                      );

                      toastSuccess("Item saved in the cart");

                      setIsSuccessModalOpen(true);

                      setTimeout(() => {
                        setIsSuccessModalOpen(false);
                        setIsModalOpen(true);
                      }, 2500);
                    }
                  }}
                  className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    !selectedColor
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transform hover:-translate-y-0.5"
                  }`}
                >
                  <ShoppingCart size={20} />
                  <span>{addCartPending ? "Adding to Cart..." : "Add To Cart"}</span>
                </button>
                
                {/* Additional CTA buttons */}
                <div className="grid grid-cols-1 gap-3 mt-3">
                  {/* Wishlist button removed as requested */}
                  <button className="py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Share Product
                  </button>
                </div>
              </div>

              {/* Modals */}
              <CheckModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                id={id}
              />

              <SubmitProductModal
                isOpen={isModalSubmitOpen}
                onClose={() => setIsModalSubmitOpen(false)}
              />

              {/* Enhanced Success Modal */}
              {isSuccessModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md animate-fade-in-up">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Added to Cart!
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Product has been successfully added to your cart.
                      </p>
                      <button
                        onClick={() => {
                          if (item) {
                            setIsSuccessModalOpen(false);
                            setIsModalSubmitOpen(true);
                            localStorage.removeItem("cart_id");
                          } else {
                            setIsSuccessModalOpen(false);
                            setIsModalOpen(true);
                          }
                        }}
                        className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Tabs Section */}
          <div className="mt-12 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    tab === "details"
                      ? "border-b-2 border-purple-600 text-purple-600 bg-purple-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setTab("details")}
                >
                  Product Details
                </button>
                {/* Uncomment if reviews are needed */}
                {/* <button
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    tab === "reviews"
                      ? "border-b-2 border-purple-600 text-purple-600 bg-purple-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setTab("reviews")}
                >
                  Reviews
                </button> */}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {tab === "details" ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {productVal?.product?.description || "No description available for this product."}
                  </p>
                </div>
              ) : (
                /* Reviews content - keeping original structure */
                <div className="flex flex-col md:flex-row md:gap-10 mt-4 md:mt-10">
                  {/* Left Summary */}
                  <div className="w-full md:w-64 p-4 border border-[#CCCCCC] outline-none rounded-md bg-gray-50 mb-6 md:mb-0">
                    <div className="text-center">
                      <p className="text-lg md:text-xl font-semibold">4.5/5</p>
                      <div className="flex justify-center text-yellow-500 mt-1">
                        {Array(4)
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className="md:w-4 md:h-4"
                              fill="currentColor"
                              stroke="none"
                            />
                          ))}
                        <Star size={14} className="md:w-4 md:h-4" />
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        5 Ratings
                      </p>
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
                          <span className="w-6 text-right text-gray-500">
                            ({count})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="flex-1 space-y-4 md:space-y-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-3 md:gap-4">
                        <img
                          src={`https://randomuser.me/api/portraits/men/${
                            i + 1
                          }.jpg`}
                          alt="User"
                          className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs md:text-sm text-gray-700">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua.
                          </p>
                          <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2 text-xs md:text-sm font-medium text-gray-800">
                            <span>
                              {
                                [
                                  "Chukka Uzo",
                                  "French Tolu",
                                  "Princess Olukoya",
                                  "Sandra Bullock",
                                  "John Wick",
                                ][i]
                              }
                            </span>
                            <span className="text-gray-400">·</span>
                            <span className="text-yellow-500 flex items-center gap-1">
                              4.5/5{" "}
                              <Star
                                size={12}
                                className="md:w-3.5 md:h-3.5"
                                fill="currentColor"
                                stroke="none"
                              />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Related Products */}
          {filteredData?.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredData?.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    to={`/shop-details`}
                    state={{ info: product?.fabric?.id }}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      <img
                        src={product?.fabric?.photos[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-600">
                          {product.price}
                        </span>
                        <span className="text-sm text-gray-500">per unit</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
