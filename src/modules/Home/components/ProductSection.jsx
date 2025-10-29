import { useState } from "react";
import { Link } from "react-router-dom";
import useProductCategoryGeneral from "../../../hooks/dashboard/useGetProductPublic";
import LoaderComponent from "../../../components/BeatLoader";
import useProductGeneral from "../../../hooks/dashboard/useGetProductGeneral";

const categories = [
  "All Products",
  "Agbada",
  "Kaftan",
  "Bubu",
  "Hats & Caps",
  "Suits",
  "Jump Suits",
  "Dresses & Gowns",
  "Trousers",
  "Shirts",
];

const products = [
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

export default function ProductSection() {
  const [selectedCategory, setSelectedCategory] = useState("1");

  const filteredProducts =
    selectedCategory === "All Products"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const { data: getStyleProductGeneralData, isPending } =
    useProductCategoryGeneral({
      "pagination[limit]": 10,
      "pagination[page]": 1,
      type: "style",
    });

  const { data: getStyleProductData, isPending: productIsPending } =
    useProductGeneral(
      {
        "pagination[limit]": 10,
        "pagination[page]": 1,
        category_id: selectedCategory == "1" ? undefined : selectedCategory,
        status: "PUBLISHED",
      },
      "STYLE",
    );

  const styleData = getStyleProductGeneralData?.data;

  // Format price with commas
  const formatPrice = (price) => {
    const numPrice = parseFloat(price || 0);
    return `₦${numPrice.toLocaleString()}`;
  };

  return (
    <section className="Resizer section">
      <div className="px-4">
        <button className="border border-purple-500 text-[#484545] px-4 py-2 rounded-full text-sm w-full md:w-auto mb-2 md:mb-0">
          Top Styles
        </button>
      </div>
      <h2 className="text-2xl font-medium mt-6 max-w-lg leading-relaxed mb-8 px-4">
        Get Access to the best Tailors and a range of Designs for your next
        outfit
      </h2>
      <div className="flex space-x-4 overflow-x-auto mb-10 px-4">
        <div className="flex space-x-4 overflow-x-auto mb-10 px-4 whitespace-nowrap">
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
      {productIsPending ? (
        <LoaderComponent />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
          {getStyleProductData?.data?.map((product) => (
            <Link
              state={{ info: product }}
              to={`/aostyle-details`}
              key={product.id}
              className=""
            >
              <img
                src={product?.style?.photos[0]}
                alt={product.name}
                className="w-full rounded-md"
                style={{ objectFit: "contain", maxHeight: "250px", background: "#f8f8f8" }}
              />
              <h3 className="font-medium text-left uppercase mt-4 mb-3">
                {product?.name?.length > 20
                  ? product.name.slice(0, 20) + "..."
                  : product?.name}
              </h3>
              <p className="text-[#2B21E5]  text-left font-bold">
                {formatPrice(product?.price)}{" "}
                <span className="text-[#8A8A8A] font-medium">per unit</span>
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-14">
        <Link to="/products">
          <button className="bg-gradient text-white px-10 py-3 w-full md:w-auto cursor-pointer">
            Explore All Styles
          </button>
        </Link>
      </div>
    </section>
  );
}
