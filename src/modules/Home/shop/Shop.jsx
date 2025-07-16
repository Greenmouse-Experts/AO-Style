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
import Select from "react-select";

import { useCartStore } from "../../../store/carybinUserCartStore";
import useProductCategoryGeneral from "../../../hooks/dashboard/useGetProductPublic";
import useGetMarketPlaces from "../../../hooks/dashboard/useGetMarketPlaces";

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

  const [queryMin, setQueryMin] = useState(0);

  const debouncedMin = useDebounce(queryMin ?? "", 1000);

  const [debounceMin, setDebounceMin] = useState("");

  const [queryMax, setQueryMax] = useState(200000);

  const debouncedMax = useDebounce(queryMin ?? "", 1000);

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

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    setDebounceSearch(debouncedSearchTerm.trim() || undefined);
    setPage(1);
  }, [debouncedSearchTerm]);

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { data: getProductData, isPending: productIsPending } =
    useProductGeneral(
      {
        ...queryParams,
        status: "PUBLISHED",
        min_price: debounceMin,
        max_price: debounceMax,
        q: debounceSearch,
      },
      "FABRIC"
    );

  const isShowMoreBtn = getProductData?.count == getProductData?.data?.length;

  const Cartid = localStorage.getItem("cart_id");

  const item = useCartStore.getState().getItemByCartId(Cartid);

  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("");

  const [colorVal, setColorVal] = useState("");

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
    getProductData?.count / (queryParams["pagination[limit]"] ?? 10)
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
            md:h-[70vh] md:sticky md:top-24 overflow-y-scroll"
          >
            <h3 className="font-semibold mb-2">CATEGORY</h3>
            <Select
              options={[{ label: "All", value: "" }, ...categoryFabricList]}
              name="category_id"
              value={[{ label: "All", value: "" }, ...categoryFabricList]?.find(
                (opt) => opt.value === product
              )}
              onChange={(selectedOption) => {
                // console.log(selectedOption?.value);
                if (selectedOption?.value == "") {
                  updateQueryParams({
                    category_id: undefined,
                  });
                } else {
                  updateQueryParams({
                    category_id: selectedOption?.value,
                  });
                }

                setProduct(selectedOption.value);
                // updateQueryParams({
                //   color: color?.toLowerCase(),
                // });

                // setFieldValue("category_id", selectedOption.value);
              }}
              required
              placeholder="select"
              className="w-full  p-[1px] border border-gray-300 text-gray-600 outline-none rounded"
              styles={{
                control: (base, state) => ({
                  ...base,
                  border: "none",
                  boxShadow: "none",
                  outline: "none",
                  backgroundColor: "#fff",
                  "&:hover": {
                    border: "none",
                  },
                }),
                indicatorSeparator: () => ({
                  display: "none",
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />{" "}
            <h3 className="font-semibold mt-4 mb-2">MARKET</h3>
            <Select
              options={[{ label: "All", value: "" }, ...marketList]}
              name="market_id"
              value={[{ label: "All", value: "" }, ...marketList]?.find(
                (opt) => opt.value === market
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
                setMarket(selectedOption.value);
                // updateQueryParams({
                //   color: color?.toLowerCase(),
                // });

                // setFieldValue("category_id", selectedOption.value);
              }}
              required
              placeholder="select"
              className="w-full p-[1px] border border-gray-300 text-gray-600 outline-none rounded"
              styles={{
                control: (base, state) => ({
                  ...base,
                  border: "none",
                  boxShadow: "none",
                  outline: "none",
                  backgroundColor: "#fff",
                  "&:hover": {
                    border: "none",
                  },
                }),
                indicatorSeparator: () => ({
                  display: "none",
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />{" "}
            <h3 className="font-semibold mt-4 mb-2">PRICE</h3>
            <div className="flex justify-between text-xs sm:text-sm">
              <span>₦{queryMin.toLocaleString()}</span>
              <span>₦{queryMax.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              value={queryMin}
              onChange={(e) => {
                setQueryMin(parseInt(e.target.value ?? undefined));
              }}
              className="w-full mb-3"
            />
            <input
              type="range"
              min={queryMin}
              max="200000"
              value={queryMax}
              onChange={(e) => {
                setQueryMax(parseInt(e.target.value ?? undefined));
              }}
              className="w-full mb-3"
            />
            <h3 className="font-semibold mt-4 mb-2">COLOUR</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {colors.map((color, index) => (
                <button
                  key={index}
                  className={`p-5 rounded border-2  transition ${
                    colorVal === color ? " border-gray-300" : "border-white"
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  onClick={() => {
                    if (colorVal === color) {
                      updateQueryParams({ color: undefined });
                      setColorVal("");
                    } else {
                      updateQueryParams({ color: color.toLowerCase() });
                      setColorVal(color);
                    }
                  }}
                ></button>
              ))}
            </div>
          </aside>

          {/* Product Display */}
          <div className="col-span-3">
            <div className="flex justify-between bg-purple-600 text-white p-4 rounded">
              <button>Explore by Market Place</button>
              {/* <button className="flex items-center space-x-1">
                <SortDesc size={16} /> <span>Sort by: Popularity</span>
              </button> */}
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

            {/* {getProductData?.data?.length ? (
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
            )} */}
          </div>
        </div>
      </section>
    </>
  );
}
