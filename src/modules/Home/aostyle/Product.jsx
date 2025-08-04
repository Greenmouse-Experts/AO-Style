import { useState } from "react";
import { Search, Filter, SortDesc, X } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { Link } from "react-router-dom";
import useProductCategoryGeneral from "../../../hooks/dashboard/useGetProductPublic";
import useProductGeneral from "../../../hooks/dashboard/useGetProductGeneral";
import LoaderComponent from "../../../components/BeatLoader";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";

const categories = ["All Styles", "Male Styles", "Female Styles", "Bubu"];

const initialProducts = [
  {
    id: 1,
    name: "Brown Kaftan Design ",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334130/AoStyle/image10_wtqzuf.png",
    category: "Agbada",
  },
  {
    id: 2,
    name: "Green Agbada ",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334119/AoStyle/image_mn945e.png",
    category: "Agbada",
  },
  {
    id: 3,
    name: "Black Female Jacket",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334124/AoStyle/image5_uky9a9.png",
    category: "Agbada",
  },
  {
    id: 4,
    name: "Green Stripe Cap",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334125/AoStyle/image7_cheqnl.png",
    category: "Suits",
  },
  {
    id: 5,
    name: "Pink 3 Piece Suit ",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334119/AoStyle/image2_holvqx.png",
    category: "Suits",
  },
  {
    id: 6,
    name: "Black Agbada ",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334128/AoStyle/image8_gozvhx.png",
    category: "Suits",
  },
  {
    id: 7,
    name: "Black Agbada ",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334125/AoStyle/image6_fmsmje.png",
    category: "Hats & Caps",
  },
  {
    id: 8,
    name: "Green Stripe Cap",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334120/AoStyle/image3_nrjkse.png",
    category: "Hats & Caps",
  },
];

export default function MarketplaceSection() {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("1");
  const [sortBy, setSortBy] = useState("Default");
  const [showFilter, setShowFilter] = useState(false);
  const [priceRange, setPriceRange] = useState([5000, 20000]);

  const toggleFilter = () => setShowFilter(!showFilter);

  const handleLoadMore = () => {
    const moreProducts = [
      {
        id: 9,
        name: "New Ankara Fabric",
        price: "₦15,000",
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334130/AoStyle/image10_wtqzuf.png",
      },
      {
        id: 10,
        name: "Silk Material",
        price: "₦18,000",
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334125/AoStyle/image7_cheqnl.png",
      },
      {
        id: 11,
        name: "Lace Fabric",
        price: "₦20,000",
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741334125/AoStyle/image6_fmsmje.png",
      },
    ];
    setProducts((prev) => [...prev, ...moreProducts]);
  };

  // Filter by search term, category, and price range
  const filteredProducts = products.filter((product) => {
    const productPrice = parseInt(
      product.price.replace("₦", "").replace(",", ""),
    );
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "All Styles" ||
        product.category === selectedCategory) &&
      productPrice >= priceRange[0] &&
      productPrice <= priceRange[1]
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "Price: Low to High")
      return (
        parseInt(a.price.replace("₦", "")) - parseInt(b.price.replace("₦", ""))
      );
    if (sortBy === "Price: High to Low")
      return (
        parseInt(b.price.replace("₦", "")) - parseInt(a.price.replace("₦", ""))
      );
    return 0;
  });

  const [page, setPage] = useState(10);

  const [queryString, setQueryString] = useState("");

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  const [debounceSearch, setDebounceSearch] = useState("");

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    setDebounceSearch(debouncedSearchTerm.trim() || undefined);
    setPage(1);
  }, [debouncedSearchTerm]);

  const { data: getStyleProductGeneralData, isPending } =
    useProductCategoryGeneral({
      "pagination[limit]": page,
      "pagination[page]": 1,
      type: "style",
    });

  const { data: getStyleProductData, isPending: productIsPending } =
    useProductGeneral(
      {
        "pagination[limit]": 10,
        "pagination[page]": 1,
        category_id: selectedCategory == "1" ? undefined : selectedCategory,
        q: debounceSearch,
        status: "PUBLISHED",
      },
      "STYLE",
    );

  const styleData = getStyleProductGeneralData?.data;

  const isShowMoreBtn = styleData?.length == getStyleProductGeneralData?.count;

  return (
    <>
      <Breadcrumb
        title="Carybin"
        subtitle="Products"
        just="> Carybin"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1743712882/AoStyle/image_lslmok.png"
      />
      <section className="Resizer section px-4">
        <div className="flex flex-col md:flex-col md:items-start lg:flex-row lg:justify-between lg:items-center text-left mb-6">
          <div>
            <h2 className="text-2xl font-medium lg:max-w-md md:max-w-auto leading-relaxed">
              Get Access to the best Tailors and a range of Designs for your
              next outfit
            </h2>
            <p className="text-[#4B4A4A] mt-4 lg:max-w-lg md:max-w-auto font-light leading-loose mb-6">
              A virtual marketplace that offers access to tailors and fashion
              designers around the country.
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

        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4 overflow-x-auto  px-4 w-[1000px] whitespace-nowrap">
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
          <div className="flex space-x-4">
            <select
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 text-[#8A8A8A] p-2 rounded"
            >
              <option value="Default">
                <SortDesc size={16} /> Sort By
              </option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
            {/* <button
              onClick={toggleFilter}
              className="flex items-center space-x-2 text-gray-600"
            >
              <Filter size={16} /> <span>Filter Results</span>
            </button> */}
          </div>
        </div>

        {showFilter && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-80">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Filter Options</h3>
                <button onClick={toggleFilter}>
                  <X size={20} />
                </button>
              </div>
              <label className="block mb-2">Price Range</label>
              <input
                type="range"
                min="5000"
                max="20000"
                step="1000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className="w-full"
              />
              <button className="mt-4 w-full bg-[#AB52EE] text-white py-2 rounded">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {productIsPending ? (
          <LoaderComponent />
        ) : getStyleProductData?.data?.length > 0 ? (
          <div className="grid mt-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
            {getStyleProductData?.data?.map((product) => (
              <Link
                to={`/aostyle-details`}
                state={{ info: product }}
                key={product.id}
                className=""
                onClick={() => {
                  console.o;
                }}
              >
                <img
                  src={product?.style?.photos[0]}
                  alt={product.name}
                  className="w-full h-[200px] object-cover rounded-md"
                />
                <h3 className="font-medium text-left uppercase mt-4 mb-3">
                  {product?.name?.length > 20
                    ? product.name.slice(0, 20) + "..."
                    : product?.name}
                </h3>
                <p className="text-[#2B21E5]  text-left font-bold">
                  ₦{product?.price}{" "}
                  <span className="text-[#8A8A8A] font-medium">per unit</span>
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <>
            {" "}
            <div className="text-center py-20">
              <p className="text-gray-500">No products match your filters.</p>
            </div>
          </>
        )}

        {/* Load More Button */}

        {getStyleProductData?.data?.length ? (
          isShowMoreBtn ? (
            <></>
          ) : (
            <div className="flex justify-center mt-16">
              <button
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 cursor-pointer"
                onClick={() => {
                  setPage((prev) => prev + 10);
                }}
              >
                Load More Products
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
