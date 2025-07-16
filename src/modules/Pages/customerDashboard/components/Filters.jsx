import { useState } from "react";
import useProductCategoryGeneral from "../../../../hooks/dashboard/useGetProductPublic";
import Select from "react-select";
import useGetMarketPlaces from "../../../../hooks/dashboard/useGetMarketPlaces";

export default function Filters({
  filters,
  setFilters,
  updateQueryParams,
  getMarketPlacePublicData,
  setQueryMin,
  queryMin,

  setQueryMax,
  queryMax,
}) {
  const categories = [
    "Agbada",
    "Kaftan",
    "Bubu",
    "Hats and Caps",
    "Suits",
    "Jumpsuits",
    "Dress Gowns",
    "Fabrics",
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

  const sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

  const marketplaces = [
    "Onitsha Main Market",
    "Balogun Market",
    "Kanti Kwari Market",
    "Wuse Market",
    "Gbagi Market",
    "Aba Market",
    "Oja Oba Market",
    "Kurmi Market",
    "Idumota Market",
    "Ogbete Market",
  ];

  const { data: getFabricProductGeneralData, isPending } =
    useProductCategoryGeneral({
      "pagination[limit]": 10000,
      "pagination[page]": 1,
      type: "fabric",
    });

  console.log(getFabricProductGeneralData?.data);

  const categoryFabricList = getFabricProductGeneralData?.data
    ? getFabricProductGeneralData?.data?.map((c) => ({
        label: c.name,
        value: c.id,
      }))
    : [];

  const marketList = getMarketPlacePublicData?.data
    ? getMarketPlacePublicData?.data?.map((c) => ({
        label: c.name,
        value: c.id,
      }))
    : [];

  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("");

  const [colorVal, setColorVal] = useState("");

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg w-full">
      <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5">
        Filter
      </h2>

      {/* Categories */}
      <div className="mb-3 sm:mb-4">
        <h3 className="font-medium mb-2 sm:mb-3">Categories</h3>
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
        {/* <select
          className="w-full p-2 sm:p-3 border border-gray-300 text-gray-600 outline-none rounded"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Products</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select> */}
      </div>

      {/* Price Range */}
      <div className="mb-3 sm:mb-4">
        <h3 className="font-medium mb-2 sm:mb-3">Price</h3>
        <div className="flex justify-between text-xs sm:text-sm">
          <span>₦{queryMin?.toLocaleString()}</span>
          <span>₦{queryMax?.toLocaleString()}</span>
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
      </div>

      {/* Colors */}
      <div className="mb-3 sm:mb-4">
        <h3 className="font-medium mb-2 sm:mb-3">Colors</h3>
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
      </div>

      {/* Sizes */}
      {/* <div className="mb-3 sm:mb-4">
        <h3 className="font-medium mb-2 sm:mb-3">Size</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {sizes.map((size, index) => (
            <button
              key={index}
              className={`p-3 sm:p-4 rounded text-sm sm:text-base transition ${
                filters.size === size
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() =>
                setFilters({
                  ...filters,
                  size: filters.size === size ? "" : size,
                })
              }
            >
              {size}
            </button>
          ))}
        </div>
      </div> */}

      {/* Marketplace */}
      <div className="mb-3 sm:mb-4">
        <h3 className="font-medium mb-2 sm:mb-3">Marketplace</h3>
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
      </div>
    </div>
  );
}
