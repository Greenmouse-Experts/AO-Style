import { useState } from "react";
import { Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import useGetMarketFabric from "../../../hooks/dashboard/useGetMarketFabrics";
import useProductCategoryGeneral from "../../../hooks/dashboard/useGetProductPublic";
import LoaderComponent from "../../../components/BeatLoader";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";

export default function MarketplacePage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState(undefined);
  const [genderFilter, setGenderFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const location = useLocation();

  const marketDetails = location?.state?.info;

  const [page, setPage] = useState(10);

  const [queryString, setQueryString] = useState("");

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  const [debounceSearch, setDebounceSearch] = useState("");

  // Fetch fabric categories
  const { data: fabricCategories, isPending: categoriesLoading } =
    useProductCategoryGeneral({
      type: "fabric",
    });

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    setDebounceSearch(debouncedSearchTerm.trim() || undefined);
    setPage(1);
  }, [debouncedSearchTerm]);

  // Build query params object, only including gender_suitability if a gender is selected
  const queryParams = {
    "pagination[limit]": 10,
    "pagination[page]": 1,
    id: marketDetails?.id,
    ...(typeFilter && { material_type: typeFilter }),
    ...(priceFilter && { price: priceFilter }),
    ...(colorFilter && { color: colorFilter }),
    ...(genderFilter && { gender_suitability: genderFilter.toLocaleLowerCase() }),
    ...(categoryFilter && { category_id: categoryFilter }),
    ...(debounceSearch && { q: debounceSearch }),
  };

  const { data: getMarketPlaceFabricData, isPending } = useGetMarketFabric(queryParams);

  const isShowMoreBtn =
    getMarketPlaceFabricData?.data?.length == getMarketPlaceFabricData?.count;

  console.log("This is the market place fabric data", getMarketPlaceFabricData);
  console.log("Fabric categories data:", fabricCategories);

  const handleClearFilters = () => {
    setTypeFilter("");
    setColorFilter("");
    setPriceFilter("");
    setGenderFilter("");
    setCategoryFilter("");
    setQueryString("");
  };

  return (
    <>
      <Breadcrumb
        title="Shop"
        subtitle="Marketplace "
        just={marketDetails?.name}
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741604351/AoStyle/image_ugfmjr.jpg"
      />

      <main className="Resizer section px-4">
        <div className="">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center text-left">
            <div>
              <h2 className="text-2xl font-medium max-w-md leading-relaxed ">
                Welcome to {marketDetails?.name}
              </h2>
              <p className="text-[#4B4A4A] mt-4 max-w-md font-light leading-loose mb-6">
                Buy materials from {marketDetails?.name} from the comfort of
                your home
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center text-left mb-16 space-y-4 md:space-y-0 md:space-x-4">
          {/* Gender Filter */}
          <div className="flex-1">
            <select
              value={genderFilter}
              className="w-full border border-gray-300 rounded-md text-gray-400 pl-4 pr-10 py-2 focus:outline-none text-sm"
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="">All Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>

          {/* Categories Filter */}
          <div className="flex-1">
            <select
              value={categoryFilter}
              className="w-full border border-gray-300 rounded-md text-gray-400 pl-4 pr-10 py-2 focus:outline-none text-sm"
              onChange={(e) => setCategoryFilter(e.target.value)}
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading ? "Loading categories..." : "All Categories"}
              </option>
              {fabricCategories?.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="flex-1">
            <select
              value={priceFilter}
              className="border border-gray-300 rounded-md text-gray-400 pl-4 pr-10 py-2 focus:outline-none text-sm w-full"
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="">Price</option>
              <option value="below_10k">Below ₦10,000</option>
              <option value="between_10k_15k">₦10,001 - ₦15,000</option>
              <option value="above_15k">Above ₦15,000</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex-1">
            <button
              onClick={handleClearFilters}
              className="w-full border border-gray-300 rounded-md text-gray-500 pl-4 pr-10 py-2 hover:bg-gray-50 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>

          {/* Search input on the right */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by keyword"
              className="w-full border border-gray-300 rounded-md pl-4 pr-10 py-2 focus:outline-none"
              value={queryString}
              onChange={(evt) =>
                setQueryString(evt.target.value ? evt.target.value : undefined)
              }
            />
            <Search
              size={18}
              className="absolute right-3 top-3 text-gray-400"
            />
          </div>
        </div>

        <section>
          {isPending ? (
            <LoaderComponent />
          ) : getMarketPlaceFabricData?.data?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {getMarketPlaceFabricData?.data?.map((product) => {
                const isOutOfStock = product?.quantity <= 15;
                const ProductWrapper = isOutOfStock ? "div" : Link;
                const wrapperProps = isOutOfStock
                  ? { className: "cursor-not-allowed" }
                  : { to: `/shop-details/${product?.id}` };
                return (
                  <ProductWrapper {...wrapperProps} key={product.id}>
                    <div className="text-center relative">
                      <div className="relative">
                        <img
                          src={product?.photos[0]}
                          alt={product.name}
                          className={`w-full h-66 object-cover rounded-md ${
                            isOutOfStock ? "opacity-70" : ""
                          }`}
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] bg-black/20 rounded-md">
                            <div className="text-center">
                              <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                                OUT OF STOCK
                              </div>
                              <p className="text-white text-xs mt-2 font-medium">
                                Currently Unavailable
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <h3
                        className={`font-medium text-left mt-4 mb-2 text-sm ${
                          isOutOfStock ? "text-gray-400" : ""
                        }`}
                      >
                        {product?.product?.name}
                      </h3>
                      <p
                        className={`text-left text-sm ${
                          isOutOfStock ? "text-gray-400" : "text-[#2B21E5]"
                        }`}
                      >
                        ₦{product?.product?.price.toLocaleString()}{" "}
                        <span className="text-gray-500">per yard</span>
                      </p>
                    </div>
                  </ProductWrapper>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">No products match your filters.</p>
            </div>
          )}
          {getMarketPlaceFabricData?.data?.length ? (
            isShowMoreBtn ? (
              <></>
            ) : (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => {
                    setPage((prev) => prev + 10);
                  }}
                  className="bg-gradient  text-white px-6 py-3 cursor-pointer"
                >
                  Load More
                </button>
              </div>
            )
          ) : (
            <></>
          )}
        </section>
      </main>
    </>
  );
}
