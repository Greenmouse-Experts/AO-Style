import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Filters from "./components/Filters";
import HeaderCard from "./components/HeaderCard";
import { Link } from "react-router-dom";
import { FaFilter } from "react-icons/fa";
import useGetMarketPlaces from "../../../hooks/dashboard/useGetMarketPlaces";
import useGetTrendingProduct from "../../../hooks/dashboard/useGetTrendingProduct";

import { motion } from "framer-motion";
import LoaderComponent from "../../../components/BeatLoader";
import useProductGeneral from "../../../hooks/dashboard/useGetProductGeneral";
import useQueryParams from "../../../hooks/useQueryParams";
import Slider from "react-slick";
import { settings } from "../../Home/components/MarketplaceSection";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";

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
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default for large screens

  const { data: getMarketPlacePublicData, isPending } = useGetMarketPlaces({
    "pagination[limit]": 10000,
  });

  const marketPlacePublic = getMarketPlacePublicData?.data;

  const maxIndex = useMemo(
    () => marketPlacePublic?.length - itemsPerPage,
    [marketPlacePublic],
  );

  console.log(marketPlacePublic);

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

  // Ensure nextSlide stops at last full slide
  const nextSlide = () => {
    setIndex((prevIndex) =>
      prevIndex + itemsPerPage > maxIndex ? maxIndex : prevIndex + itemsPerPage,
    );
  };

  // Ensure prevSlide stops at the start
  const prevSlide = () => {
    setIndex((prevIndex) =>
      prevIndex - itemsPerPage < 0 ? 0 : prevIndex - itemsPerPage,
    );
  };

  // Auto-scroll (stops at the last complete slide)
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) =>
        prevIndex + itemsPerPage > maxIndex ? 0 : prevIndex + itemsPerPage,
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

  const { data: getTrendingData, isPending: trendingisPending } =
    useGetTrendingProduct({});

  const trendingProducts = getTrendingData?.data || [];

  const [queryMin, setQueryMin] = useState(0);

  const debouncedMin = useDebounce(queryMin ?? "", 1000);

  const [debounceMin, setDebounceMin] = useState("");

  const [queryMax, setQueryMax] = useState(200000);

  const debouncedMax = useDebounce(queryMax ?? "", 1000);

  const [debounceMax, setDebounceMax] = useState("");

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    setDebounceMin(debouncedMin || undefined);
    updateQueryParams({
      "pagination[page]": 1,
    });
  }, [debouncedMin]);

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    setDebounceMax(debouncedMax || undefined);
    updateQueryParams({
      "pagination[page]": 1,
    });
  }, [debouncedMax]);

  const { data: getProductData, isPending: productIsPending } =
    useProductGeneral(
      {
        ...queryParams,
        status: "PUBLISHED",
        min_price: debounceMin,
        max_price: debounceMax,
      },
      "FABRIC",
    );

  const totalPages = Math.ceil(
    getProductData?.count / (queryParams["pagination[limit]"] ?? 10),
  );

  console.log(getProductData?.data?.length);

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
                    ? "w-1/5 h-full p-2"
                    : "w-14 h-14 p-2 rounded-md flex items-center justify-center cursor-pointer"
                }`}
          onClick={(e) => {
            if (!isSidebarOpen) {
              setIsSidebarOpen(true);
            }
          }}
        >
          {isSidebarOpen ? (
            <>
              <button
                className="absolute top-4 right-4 text-black"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!isSidebarOpen) {
                    setIsSidebarOpen(true);
                  }
                }}
              >
                ✖
              </button>

              {/* Filters */}
              <Filters
                filters={filters}
                updateQueryParams={updateQueryParams}
                setFilters={setFilters}
                queryMin={queryMin}
                setQueryMin={setQueryMin}
                queryMax={queryMax}
                setQueryMax={setQueryMax}
                getMarketPlacePublicData={getMarketPlacePublicData}
              />
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
          className={`flex-1  overflow-auto p-1 md:p-4 transition-all duration-300  -mt-4`}
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
              <Filters
                filters={filters}
                updateQueryParams={updateQueryParams}
                setFilters={setFilters}
                setQueryMin={setQueryMin}
                queryMin={queryMin}
                queryMax={queryMax}
                setQueryMax={setQueryMax}
                getMarketPlacePublicData={getMarketPlacePublicData}
              />
            </div>
          </div>

          {/* Marketplace Carousel */}
          {isPending ? (
            <></>
          ) : (
            <div className="relative w-full  mt-10 items-center">
              <Slider {...settings}>
                {marketPlacePublic?.map((market) => (
                  <button
                    onClick={() => {
                      updateQueryParams({
                        market_id: market.id,
                      });
                    }}
                    key={market.id}
                    className="px-2 text-center"
                  >
                    <img
                      src={market?.multimedia_url}
                      alt={market.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-48 md:h-48 rounded-full object-cover mx-auto"
                    />
                    <h3
                      className="font-medium mt-6 mb-2 truncate"
                      title={market.name}
                    >
                      {market.name}
                    </h3>
                    <p className="text-[#2B21E5] text-sm flex items-center justify-center font-light">
                      <MapPin size={14} className="mr-1" /> {market.state}
                    </p>
                  </button>
                ))}
              </Slider>
            </div>
          )}

          {/* Filtered Products */}
          {productIsPending ? (
            <div className="mt-20">
              <LoaderComponent />
            </div>
          ) : (
            <div className="grid grid-cols-2 mt-20 mb-5 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {getProductData?.data?.map((product, index) => (
                <Link
                  to={`/shop-details/${product?.fabric?.id}`}
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
                    <h3 className="font-medium text-left uppercase mt-4 mb-3">
                      {product?.name?.length > 20
                        ? product.name.slice(0, 20) + "..."
                        : product?.name}
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

          {!productIsPending && !getProductData?.data?.length ? (
            <div classNamee="flex items-center justify-center w-full border-2 border-red-800 border-solid">
              <p className="text-sm text-gray-600 text-center">
                Product not found{" "}
              </p>
            </div>
          ) : (
            <></>
          )}

          {getProductData?.data?.length > 0 ? (
            <>
              <div className="flex justify-between px-4 items-center mt-10">
                <div className="flex items-center">
                  <p className="text-sm text-gray-600">Items per page: </p>
                  <select
                    value={queryParams["pagination[limit]"] || 10}
                    onChange={(e) =>
                      updateQueryParams({
                        "pagination[limit]": +e.target.value,
                      })
                    }
                    className="py-2 px-3 border border-gray-200 ml-2 rounded-md outline-none text-sm w-auto"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      updateQueryParams({
                        "pagination[page]":
                          +queryParams["pagination[page]"] - 1,
                      });
                    }}
                    disabled={(queryParams["pagination[page]"] ?? 1) == 1}
                    className="px-3 py-1 rounded-md bg-gray-200"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => {
                      updateQueryParams({
                        "pagination[page]":
                          +queryParams["pagination[page]"] + 1,
                      });
                    }}
                    disabled={
                      (queryParams["pagination[page]"] ?? 1) == totalPages
                    }
                    className="px-3 py-1 rounded-md bg-gray-200"
                  >
                    ▶
                  </button>
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}
