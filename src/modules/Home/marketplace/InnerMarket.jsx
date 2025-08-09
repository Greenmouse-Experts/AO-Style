import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import useGetMarketFabric from "../../../hooks/dashboard/useGetMarketFabrics";
import LoaderComponent from "../../../components/BeatLoader";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState(undefined);

  const location = useLocation();

  const marketDetails = location?.state?.info;

  const [page, setPage] = useState(10);

  const [queryString, setQueryString] = useState("");

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  const [debounceSearch, setDebounceSearch] = useState("");

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    setDebounceSearch(debouncedSearchTerm.trim() || undefined);
    setPage(1);
  }, [debouncedSearchTerm]);

  const { data: getMarketPlaceFabricData, isPending } = useGetMarketFabric({
    "pagination[limit]": page,
    "pagination[page]": 1,
    id: marketDetails?.id,
    material_type: typeFilter,
    price: priceFilter,
    color: colorFilter,
    q: debounceSearch,
  });

  const isShowMoreBtn =
    getMarketPlaceFabricData?.data?.length == getMarketPlaceFabricData?.count;

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
          <div className="flex-1">
            <select
              className="w-full border border-gray-300 rounded-md text-gray-400 pl-4 pr-10 py-2 focus:outline-none text-sm "
              onChange={(e) => {
                setTypeFilter("");
                setColorFilter("");
                setPriceFilter("");
                setSearch("");
              }}
            >
              <option>All Materials</option>
            </select>
          </div>
          <div className="flex-1">
            <select
              value={typeFilter}
              placeholder="Material Type"
              className=" border border-gray-300 rounded-md text-gray-400 pl-4 pr-10 py-2 focus:outline-none text-sm w-full"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Material Type</option>
              <option value="Plaid">Plaid</option>
              <option value="Cashmere">Cashmere</option>
              <option value="Cotton">Cotton</option>
              <option value="Ankara">Ankara</option>
            </select>
          </div>
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
          <div className="flex-1">
            <select
              value={colorFilter}
              className="border border-gray-300 rounded-md text-gray-400 pl-4 pr-10 py-2 focus:outline-none text-sm w-full"
              onChange={(e) => setColorFilter(e.target.value)}
            >
              <option value="">Colour</option>
              <option value="Red">Red</option>
              <option value="Yellow">Yellow</option>
              <option value="Multicolour">Multicolour</option>
              <option value="Cream">Cream</option>
            </select>
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
              {getMarketPlaceFabricData?.data?.map((product, index) => (
                <Link to={`/shop-details/${product?.id}`} key={product.id}>
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <motion.img
                      src={product?.photos[0]}
                      alt={product.name}
                      className="w-full h-66 object-cover rounded-md"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <h3 className="font-medium text-left mt-4 mb-2 text-sm">
                      {product?.product?.name}
                    </h3>
                    <p className="text-[#2B21E5] text-left text-sm">
                      ₦{product?.product?.price.toLocaleString()}{" "}
                      <span className="text-gray-500">per yard</span>
                    </p>
                  </motion.div>
                </Link>
              ))}
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
