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
import useProductCategoryGeneral from "../../../hooks/dashboard/useGetProductPublic";
import useQueryParams from "../../../hooks/useQueryParams";
import StylesFilters from "./components/StylesFilters";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import useDebounce from "../../../hooks/useDebounce";

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

export default function ShopStyles() {
  const [index, setIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default for large screens

  const [selectedCategory, setSelectedCategory] = useState("1");

  const { data: getMarketPlacePublicData, isPending } = useGetMarketPlaces({
    "pagination[limit]": 10000,
  });

  const marketPlacePublic = getMarketPlacePublicData?.data;

  const maxIndex = useMemo(
    () => marketPlacePublic?.length - itemsPerPage,
    [marketPlacePublic],
  );

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

  const { data: getStyleProductGeneralData } = useProductCategoryGeneral({
    "pagination[limit]": 10000,
    "pagination[page]": 1,
    type: "style",
  });

  const [queryMin, setQueryMin] = useState(0);

  const debouncedMin = useDebounce(queryMin ?? "", 1000);

  const [debounceMin, setDebounceMin] = useState("");

  const [queryMax, setQueryMax] = useState(200000);

  const debouncedMax = useDebounce(queryMax ?? "", 1000);

  const [debounceMax, setDebounceMax] = useState("");

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

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { data: getStyleProductData, isPending: productIsPending } =
    useProductGeneral(
      {
        ...queryParams,
        category_id: selectedCategory == "1" ? undefined : selectedCategory,
        status: "PUBLISHED",
        min_price: debounceMin,
        max_price: debounceMax,
      },
      "STYLE",
    );

  const styleData = getStyleProductGeneralData?.data;

  const totalPages = Math.ceil(
    getStyleProductData?.count / (queryParams["pagination[limit]"] ?? 10),
  );

  return (
    <>
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-2xl font-medium mt-2 mb-3">Shop Styles</h1>
        <p className="text-gray-500">
          <Link to="/customer">Dashboard</Link> &gt; Shop Styles
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
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
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

              <StylesFilters
                filters={filters}
                updateQueryParams={updateQueryParams}
                setFilters={setFilters}
                queryMin={queryMin}
                setQueryMin={setQueryMin}
                queryMax={queryMax}
                setQueryMax={setQueryMax}
              />
            </>
          ) : (
            <button className="bg-gradient text-white p-3 rounded-full">
              <FaFilter size={15} />
            </button>
          )}
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 overflow-auto p-1 md:p-4 transition-all duration-300  -mt-4`}
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
              <StylesFilters
                filters={filters}
                updateQueryParams={updateQueryParams}
                setFilters={setFilters}
                queryMin={queryMin}
                setQueryMin={setQueryMin}
                queryMax={queryMax}
                setQueryMax={setQueryMax}
              />
            </div>
          </div>

          {/* Marketplace Carousel */}
          <div className="flex space-x-4 overflow-x-auto mt-10 px-4">
            <div className="flex space-x-4 mb-8 overflow-x-auto px-4 whitespace-nowrap">
              {styleData
                ? [
                    {
                      id: "1",
                      name: "All Products",
                      type: "style",
                    },
                    ...styleData,
                  ].map((category) => (
                    <button
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                      }}
                      title={category.name}
                      key={category.name}
                      onClick={() => setSelectedCategory(category?.id)}
                      className={`px-4 py-2 truncate overflow-hidden whitespace-nowrap max-w-[120px] rounded-md shrink-0 text-sm ${
                        selectedCategory === category?.id
                          ? "text-[#AB52EE] border-b-2 border-[#AB52EE] font-medium"
                          : "text-[#4B4A4A] font-light"
                      }`}
                    >
                      {category?.name}
                    </button>
                  ))
                : null}
            </div>
          </div>

          {/* Filtered Products */}
          {/* <h2 className="text-lg font-semibold mt-8 mb-5">Trending Products</h2> */}
          {trendingisPending || productIsPending ? (
            <>
              <LoaderComponent />
            </>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
              {getStyleProductData?.data?.map((product) => (
                <Link
                  state={{ info: product }}
                  to={`/aostyle-details`}
                  key={product.id}
                  className=""
                >
                  <div className="w-full h-[200px] bg-gray-50 rounded-md flex items-center justify-center overflow-hidden">
                    <img
                      src={product?.style?.photos[0]}
                      alt={product.name}
                      className="w-full h-full object-contain rounded-md"
                      style={{ maxHeight: "100%", maxWidth: "100%" }}
                    />
                  </div>
                  <h3 className="font-medium text-left uppercase mt-4 mb-3">
                    {product?.name?.length > 20
                      ? product.name.slice(0, 20) + "..."
                      : product?.name}
                  </h3>
                  <p className="text-[#2B21E5]  text-left font-bold">
                    ₦{product?.price}{" "}
                    <span className="text-[#8A8A8A] font-medium">per yard</span>
                  </p>
                </Link>
              ))}
            </div>
          )}

          {getStyleProductData?.data?.length > 0 ? (
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
