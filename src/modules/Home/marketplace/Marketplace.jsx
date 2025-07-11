import { useMemo, useState } from "react";
import { Search, MapPin } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { Link } from "react-router-dom";
import useGetMarketPlaces from "../../../hooks/dashboard/useGetMarketPlaces";
import LoaderComponent from "../../../components/BeatLoader";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";

const initialMarkets = [
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
    name: "Gbagi Market",
    location: "Oyo",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image5_lqdp3e.png",
  },
  {
    id: 5,
    name: "Aba Market",
    location: "Abia",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image_monnw6.png",
  },
];

export default function MarketplaceSection() {
  const [markets, setMarkets] = useState(initialMarkets);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(10);

  const [queryString, setQueryString] = useState("");

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  const [debounceSearch, setDebounceSearch] = useState("");

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    setDebounceSearch(debouncedSearchTerm.trim() || undefined);
  }, [debouncedSearchTerm]);

  const { data: getMarketPlacePublicData, isPending } = useGetMarketPlaces({
    "pagination[limit]": page,
    "pagination[page]": 1,
    q: debounceSearch,
  });

  const marketPlacePublic = getMarketPlacePublicData?.data;

  const isShowMoreBtn =
    getMarketPlacePublicData?.count == marketPlacePublic?.length;

  return (
    <>
      <Breadcrumb
        title="Marketplace"
        subtitle="Access fabric markets all around the country from your home"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741604351/AoStyle/image_ugfmjr.jpg"
      />
      <section className="Resizer section px-4">
        <div className="flex flex-col md:flex-col md:items-start lg:flex-row lg:justify-between lg:items-center text-left mb-6">
          <div>
            <h2 className="text-2xl font-medium lg:max-w-lg md:max-w-auto  leading-relaxed ">
              Access fabric markets all around the country from your home
            </h2>
            <p className="text-[#4B4A4A] mt-4 lg:max-w-lg md:max-w-auto  font-light leading-loose mb-6">
              A virtual marketplace that offers high-quality fabric from various
              parts of the country.
            </p>
          </div>
          <div className="relative w-full md:max-w-auto lg:max-w-md">
            <input
              type="text"
              placeholder="Search by keyword"
              className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2 focus:outline-none"
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

        {/* Marketplace Grid */}
        {isPending ? (
          <LoaderComponent />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8">
            {marketPlacePublic?.map((market) => (
              <Link
                to={`/inner-marketplace`}
                key={market.id}
                state={{ info: market }}
                className="transition-transform transform hover:scale-105 duration-300"
              >
                <div className="text-center">
                  <img
                    src={market?.multimedia_url}
                    alt={market.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-48 md:h-48 rounded-full object-cover mx-auto"
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
                    <MapPin size={14} className="mr-1" /> {market?.state}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {marketPlacePublic?.length ? (
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
      </section>
    </>
  );
}
