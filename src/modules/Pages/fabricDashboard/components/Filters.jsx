export default function Filters({ filters, setFilters }) {
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

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg w-full">
      <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5">
        Filter
      </h2>

      {/* Categories */}
      <div className="mb-3 sm:mb-4">
        <h3 className="font-medium mb-2 sm:mb-3">Categories</h3>
        <select
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
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-3 sm:mb-4">
        <h3 className="font-medium mb-2 sm:mb-3">Price</h3>
        <div className="flex justify-between text-xs sm:text-sm">
          <span>₦{filters?.price[0]?.toLocaleString()}</span>
          <span>₦{filters?.price[1]?.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="0"
          max="200000"
          value={filters.price[0]}
          onChange={(e) =>
            setFilters({
              ...filters,
              price: [parseInt(e.target.value), filters.price[1]],
            })
          }
          className="w-full mb-3"
        />
        <input
          type="range"
          min={filters.price[0]}
          max="200000"
          value={filters.price[1]}
          onChange={(e) =>
            setFilters({
              ...filters,
              price: [filters.price[0], parseInt(e.target.value)],
            })
          }
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
              className={`p-5 rounded border-[#BEBCBD] transition ${
                filters.color === color ? "border-white" : "border-gray-300"
              }`}
              style={{ backgroundColor: color.toLowerCase() }}
              onClick={() =>
                setFilters({
                  ...filters,
                  color: filters.color === color ? "" : color,
                })
              }
            ></button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-3 sm:mb-4">
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
      </div>

      {/* Marketplace */}
      <div className="mb-3 sm:mb-4">
        <h3 className="font-medium mb-2 sm:mb-3">Marketplace</h3>
        <select
          className="w-full p-2 sm:p-3 border border-gray-300 text-gray-600 outline-none rounded"
          value={filters.marketplace}
          onChange={(e) =>
            setFilters({ ...filters, marketplace: e.target.value })
          }
        >
          <option value="">All Marketplaces</option>
          {marketplaces.map((market, index) => (
            <option key={index} value={market}>
              {market}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
