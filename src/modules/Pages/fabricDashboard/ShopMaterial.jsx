import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Filters from "./components/Filters";
import HeaderCard from "./components/HeaderCard";
import { Link } from "react-router-dom";
import { FaFilter } from "react-icons/fa";
import useGetMarketPlaces from "../../../hooks/dashboard/useGetMarketPlaces";

const marketplaces = [
  {
    id: 1,
    name: "Onitsha Main Market",
    location: "Anambra",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image5_lqdp3e.png",
  },
  {
    id: 2,
    name: "Balogun Market",
    location: "Lagos",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212981/AoStyle/image5_z4up8a.png",
  },
  {
    id: 3,
    name: "Kanti Kwari Market",
    location: "Kano",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212978/AoStyle/image4_uevqus.png",
  },
  {
    id: 4,
    name: "Wuse Market",
    location: "Abuja",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212981/AoStyle/image5_z4up8a.png",
  },
  {
    id: 5,
    name: "Gbagi Market",
    location: "Oyo",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image5_lqdp3e.png",
  },
  {
    id: 6,
    name: "Aba Market",
    location: "Abia",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image_monnw6.png",
  },
  {
    id: 7,
    name: "Oja Oba Market",
    location: "Osun",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image5_lqdp3e.png",
  },
  {
    id: 8,
    name: "Kurmi Market",
    location: "Kano",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212978/AoStyle/image3_lvscja.png",
  },
  {
    id: 9,
    name: "Idumota Market",
    location: "Lagos",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212972/AoStyle/image3_s8h6zh.png",
  },
  {
    id: 10,
    name: "Ogbete Market",
    location: "Enugu",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212971/AoStyle/image4_japi5p.png",
  },
];

const products = [
  {
    name: "Green Agbada",
    price: 8000,
    category: "Agbada",
    color: "Green",
    size: "L",
    marketplace: "Balogun",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334130/AoStyle/image10_wtqzuf.png",
  },
  {
    name: "Black Female Jacket",
    price: 101000,
    category: "Jackets",
    color: "Black",
    size: "M",
    marketplace: "Onitsha Main Market",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334119/AoStyle/image_mn945e.png",
  },
  {
    name: "Pink 3 Piece Suit",
    price: 100000,
    category: "Suits",
    color: "Pink",
    size: "XL",
    marketplace: "Kanti Kwari Market",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334128/AoStyle/image8_gozvhx.png",
  },
  {
    name: "Green Stripe Cap",
    price: 30000,
    category: "Caps",
    color: "Green",
    size: "S",
    marketplace: "Aba Main Market",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334124/AoStyle/image5_uky9a9.png",
  },
  {
    name: "Black Agbada",
    price: 70000,
    category: "Agbada",
    color: "Black",
    size: "XXL",
    marketplace: "Modern Market",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334119/AoStyle/image2_holvqx.png",
  },
  {
    name: "Brown Kaftan Design",
    price: 80000,
    category: "Kaftan",
    color: "Brown",
    size: "M",
    marketplace: "Ariaria Market",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334125/AoStyle/image7_cheqnl.png",
  },
  {
    name: "Black Kaftan Design",
    price: 90000,
    category: "Kaftan",
    color: "Brown",
    size: "M",
    marketplace: "Ariaria Market",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png",
  },
];

export default function ShopMaterials() {
  const [index, setIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Default for large screens

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(2); // Mobile: 2 per slide
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(3); // Tablet: 3 per slide
      } else {
        setItemsPerPage(5); // Desktop: 5 per slide (for spacing)
      }
    };

    updateItemsPerPage(); // Call on mount
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const { data: getMarketPlacePublicData, isPending } = useGetMarketPlaces({
    "pagination[limit]": 10000,
  });

  const marketPlacePublic = getMarketPlacePublicData?.data;

  const maxIndex = useMemo(
    () => marketPlacePublic?.length - itemsPerPage,
    [marketPlacePublic]
  );

  // Ensure nextSlide stops at last full slide
  const nextSlide = () => {
    setIndex((prevIndex) =>
      prevIndex + itemsPerPage > maxIndex ? maxIndex : prevIndex + itemsPerPage
    );
  };

  // Ensure prevSlide stops at the start
  const prevSlide = () => {
    setIndex((prevIndex) =>
      prevIndex - itemsPerPage < 0 ? 0 : prevIndex - itemsPerPage
    );
  };

  // Auto-scroll (stops at the last complete slide)
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) =>
        prevIndex + itemsPerPage > maxIndex ? 0 : prevIndex + itemsPerPage
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [maxIndex, itemsPerPage]);

  const [filters, setFilters] = useState({
    category: "",
    price: [0, 200000],
    color: "",
    size: "",
    marketplace: "",
  });

  const filteredProducts = products.filter((product) => {
    return (
      (!filters.category || product.category === filters.category) &&
      product.price >= filters.price[0] &&
      product.price <= filters.price[1] &&
      (!filters.color || product.color === filters.color) &&
      (!filters.size || product.size === filters.size) &&
      (!filters.marketplace || product.marketplace === filters.marketplace)
    );
  });

  return (
    <>
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-2xl font-medium mt-2 mb-3">Shop Materials</h1>
        <p className="text-gray-500">
          <Link to="/customer">Dashboard</Link> &gt; Shop Materials
        </p>
      </div>
      <div className="flex h-screen">
        <div
          className={`hidden md:block bg-white fixed md:relative left-0 transition-all duration-300 overflow-hidden
                ${
                  isSidebarOpen
                    ? "w-1/5 h-screen p-2"
                    : "w-14 h-14 p-2 rounded-md flex items-center justify-center cursor-pointer"
                }`}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <>
              <button
                className="absolute top-4 right-4 text-black"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSidebarOpen(false);
                }}
              >
                ✖
              </button>

              {/* Filters */}
              <Filters filters={filters} setFilters={setFilters} />
            </>
          ) : (
            /* Filter Button - Only on Desktop */
            <button className="bg-gradient text-white p-3 rounded-full">
              <FaFilter size={15} />
            </button>
          )}
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 overflow-auto p-4 transition-all duration-300  -mt-4`}
        >
          <HeaderCard />

          {/* Mobile Filters Button */}
          <div className="md:hidden">
            <button
              className="w-full bg-gradient mt-5 text-white p-4 rounded-md mb-6 outline-none"
              onClick={() =>
                document
                  .getElementById("mobile-filters")
                  .classList.toggle("hidden")
              }
            >
              Show Filters
            </button>
            <div id="mobile-filters" className="hidden">
              <Filters filters={filters} setFilters={setFilters} />
            </div>
          </div>

          {/* Marketplace Carousel */}
          <div className="relative flex items-center justify-center overflow-hidden">
            <button
              className="absolute left-0 p-2 bg-white shadow-md rounded-full z-10"
              onClick={prevSlide}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="w-full overflow-hidden">
              <div
                className="flex space-x-4 transition-transform duration-300 mt-10"
                style={{
                  transform: `translateX(-${
                    (index / marketplaces.length) * 100
                  }%)`,
                }}
              >
                {marketPlacePublic?.map((market) => (
                  <Link
                    to={`/inner-marketplace`}
                    state={{ info: market }}
                    key={market.id}
                    className="flex-shrink-0 px-2"
                    style={{ width: `${100 / itemsPerPage}%` }}
                  >
                    <img
                      src={market?.multimedia_url}
                      alt={market.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-38 md:h-38 rounded-full object-cover mx-auto"
                    />
                    <h3
                      className="font-medium mt-6 mb-2 truncate"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                        display: "block",
                      }}
                      title={market.name}
                    >
                      {market.name}
                    </h3>
                    <p className="text-[#2B21E5] text-sm flex items-center justify-center font-light">
                      <MapPin size={14} className="mr-1" /> {market.state}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <button
              className="absolute right-0 p-2 bg-white shadow-md rounded-full z-10"
              onClick={nextSlide}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Filtered Products */}
          <h2 className="text-lg font-semibold mt-8 mb-5">Trending Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <div key={index} className="">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full object-cover rounded-md"
                  />
                  <h3 className="font-medium text-left mt-4 mb-3">
                    {product.name}
                  </h3>
                  <p className="text-[#2B21E5] text-left font-light">
                    ₦{product.price.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p>No products match the selected filters.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
