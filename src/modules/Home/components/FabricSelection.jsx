import { useState } from "react";
import { Filter, SortDesc } from "lucide-react";
import Breadcrumb from "./Breadcrumb";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useQueryParams from "../../../hooks/useQueryParams";
import useProductGeneral from "../../../hooks/dashboard/useGetProductGeneral";
import LoaderComponent from "../../../components/BeatLoader";
import { motion } from "framer-motion";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import Select from "react-select";
import useProductCategoryGeneral from "../../../hooks/dashboard/useGetProductPublic";
import useGetMarketPlaces from "../../../hooks/dashboard/useGetMarketPlaces";
import { formatNumberWithCommas } from "../../../lib/helper";

const colors = [
  "Purple",
  "Black",
  "Red",
  "Orange",
  "Navy",
  "White",
  "Brown",
  "Green",
  "Yellow",
  "Grey",
  "Pink",
  "Blue",
];

export default function FabricSelection() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get style and measurement data from location state or localStorage
  const styleData =
    location?.state?.styleData ||
    JSON.parse(localStorage.getItem("selected_style") || "null");
  const measurementData =
    location?.state?.measurementData ||
    JSON.parse(localStorage.getItem("measurement_data") || "[]");

  const [searchTerm, setSearchTerm] = useState("");
  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("");
  const [colorVal, setColorVal] = useState("");

  const { queryParams, updateQueryParams, clearAllFilters } = useQueryParams({
    "pagination[limit]": 12,
    "pagination[page]": 1,
  });

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const debouncedSearchTerm = useDebounce(queryParams?.q ?? "", 1000);
  const debounceMin = useDebounce(minPrice ?? "", 1000);
  const debounceMax = useDebounce(maxPrice ?? "", 1000);

  const [debounceSearch, setDebounceSearch] = useState("");

  useUpdatedEffect(() => {
    setDebounceSearch(debouncedSearchTerm.trim() || undefined);
  }, [debouncedSearchTerm]);

  useUpdatedEffect(() => {
    updateQueryParams({
      min_price: debounceMin || undefined,
    });
  }, [debounceMin]);

  useUpdatedEffect(() => {
    updateQueryParams({
      max_price: debounceMax || undefined,
    });
  }, [debounceMax]);

  const { data: getProductData, isPending: productIsPending } =
    useProductGeneral(
      {
        ...queryParams,
        status: "PUBLISHED",
        min_price: debounceMin,
        max_price: debounceMax,
        q: debounceSearch,
      },
      "FABRIC",
    );

  const isShowMoreBtn = getProductData?.count == getProductData?.data?.length;

  const { data: getFabricProductGeneralData, isPending } =
    useProductCategoryGeneral({
      "pagination[limit]": 10,
      "pagination[page]": 1,
      type: "fabric",
    });

  const categoryFabricList = getFabricProductGeneralData?.data
    ? getFabricProductGeneralData?.data?.map((c) => ({
        label: c.name,
        value: c.id,
      }))
    : [];

  const totalPages = Math.ceil(
    getProductData?.count / (queryParams["pagination[limit]"] ?? 10),
  );

  const { data: getMarketPlacePublicData } = useGetMarketPlaces({
    "pagination[limit]": 10000,
  });

  const marketList = getMarketPlacePublicData?.data
    ? getMarketPlacePublicData?.data?.map((c) => ({
        label: c.name,
        value: c.id,
      }))
    : [];

  const [selectedColor, setSelectedColor] = useState("");

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    updateQueryParams({
      color: color.toLowerCase(),
    });
  };

  const handleFabricSelect = (fabric) => {
    // Navigate to fabric details with style and measurement data
    navigate(`/shop-details/${fabric?.fabric?.id}`, {
      state: {
        fabricData: fabric,
        styleData: styleData,
        measurementData: measurementData,
        fromStyleFirst: true,
      },
    });
  };

  const handleExploreMarketplace = () => {
    // Store style and measurement data in localStorage for marketplace navigation
    localStorage.setItem("selected_style", JSON.stringify(styleData));
    localStorage.setItem("measurement_data", JSON.stringify(measurementData));
    navigate("/shop");
  };

  return (
    <>
      <Breadcrumb
        title="Fabric Selection"
        subtitle="Select a fabric for your style"
        just="Fabric Selection"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741604351/AoStyle/image_ugfmjr.jpg"
      />
      <section className="Resizer section px-4">
        {/* Style Information Section */}
        {styleData && (
          <div className="bg-[#FFF2FF] p-4 rounded-lg mb-6">
            <h2 className="text-sm font-medium text-gray-500 mb-4">STYLE</h2>
            <div className="flex">
              <div className="flex-shrink-0">
                <img
                  src={styleData?.style?.photos?.[0] || styleData?.image}
                  alt="selected style"
                  className="w-20 h-20 rounded object-cover"
                />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-medium">{styleData?.name}</h3>
                <p className="mt-1 text-sm">
                  X {measurementData?.length || 1}{" "}
                  {(measurementData?.length || 1) > 1
                    ? "Measurements"
                    : "Measurement"}
                </p>
                <p className="mt-1 text-[#2B21E5] text-sm">
                  N {formatNumberWithCommas(styleData?.price || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="bg-white p-6 border border-gray-300 rounded-md md:h-[70vh] md:sticky md:top-24 overflow-y-scroll">
            <h3 className="font-semibold mb-2">CATEGORY</h3>
            <Select
              options={[{ label: "All", value: "" }, ...categoryFabricList]}
              name="category_id"
              value={[{ label: "All", value: "" }, ...categoryFabricList]?.find(
                (opt) => opt.value === product,
              )}
              onChange={(selectedOption) => {
                if (selectedOption?.value == "") {
                  updateQueryParams({
                    category_id: undefined,
                  });
                } else {
                  updateQueryParams({
                    category_id: selectedOption?.value,
                  });
                }
                setProduct(selectedOption?.value);
              }}
              className="basic-single"
              classNamePrefix="select"
              isClearable={true}
              isSearchable={true}
              placeholder="Select category..."
            />

            <div className="mt-6">
              <h3 className="font-semibold mb-2">MARKET</h3>
              <Select
                options={[{ label: "All", value: "" }, ...marketList]}
                name="market_id"
                value={[{ label: "All", value: "" }, ...marketList]?.find(
                  (opt) => opt.value === market,
                )}
                onChange={(selectedOption) => {
                  if (selectedOption?.value == "") {
                    updateQueryParams({
                      market_id: undefined,
                    });
                  } else {
                    updateQueryParams({
                      market_id: selectedOption?.value,
                    });
                  }
                  setMarket(selectedOption?.value);
                }}
                className="basic-single"
                classNamePrefix="select"
                isClearable={true}
                isSearchable={true}
                placeholder="Select market..."
              />
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-4">PRICE RANGE</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    placeholder="₦0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    placeholder="₦200,000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-4">COLOR</h3>
              <div className="grid grid-cols-3 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                      selectedColor === color
                        ? "bg-purple-500 text-white border-purple-500"
                        : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={clearAllFilters}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">
            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search fabrics..."
                  value={queryParams?.q || ""}
                  onChange={(e) =>
                    updateQueryParams({
                      q: e.target.value || undefined,
                    })
                  }
                  className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Explore by Market Place Button */}
              <button
                onClick={handleExploreMarketplace}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                Explore by Market Place
              </button>
            </div>

            {/* Product Grid */}
            {productIsPending ? (
              <LoaderComponent />
            ) : getProductData?.data?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {getProductData?.data?.map((product, index) => (
                  <motion.div
                    key={product.id}
                    onClick={() => handleFabricSelect(product)}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={product?.fabric?.photos?.[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product?.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-600">
                          ₦{formatNumberWithCommas(product?.price || 0)}
                        </span>
                        <span className="text-sm text-gray-500">per unit</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500">No fabrics match your filters.</p>
              </div>
            )}

            {/* Load More Button */}
            {getProductData?.data?.length > 0 && !isShowMoreBtn && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() =>
                    updateQueryParams({
                      "pagination[limit]":
                        (queryParams["pagination[limit]"] ?? 12) + 12,
                    })
                  }
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                  Load More Products
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() =>
                    updateQueryParams({
                      "pagination[page]": Math.max(
                        1,
                        (queryParams["pagination[page]"] ?? 1) - 1,
                      ),
                    })
                  }
                  disabled={(queryParams["pagination[page]"] ?? 1) <= 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="px-3 py-1">
                  Page {queryParams["pagination[page]"] ?? 1} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    updateQueryParams({
                      "pagination[page]": Math.min(
                        totalPages,
                        (queryParams["pagination[page]"] ?? 1) + 1,
                      ),
                    })
                  }
                  disabled={
                    (queryParams["pagination[page]"] ?? 1) >= totalPages
                  }
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </section>
    </>
  );
}
