import useVendorTopProduct from "../../../../hooks/analytics/useGetVendorTopProduct";

const products = [
  {
    name: "Blue Lace",
    purchases: 10,
    price: 200,
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image3_thyolr.png",
    progress: 20,
  },
  {
    name: "Red Ankara",
    purchases: 10,
    price: 100,
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image4_dkiyz7.png",
    progress: 30,
  },
  {
    name: "Silk Material",
    purchases: 10,
    price: 10000,
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image1_ghkqjm.png",
    progress: 40,
  },
  {
    name: "Yellow Cashmere Fabric",
    purchases: 10,
    price: 9300000,
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png",
    progress: 25,
  },
  {
    name: "Red Ankara",
    purchases: 10,
    price: 100000,
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image4_dkiyz7.png",
    progress: 30,
  },
  {
    name: "Silk Material",
    purchases: 10,
    price: 500000,
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image1_ghkqjm.png",
    progress: 40,
  },
];

export default function TopSellingProducts() {
  const {
    isPending,
    isLoading,
    isError,
    data: vendorTopProduct,
  } = useVendorTopProduct();

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Top Selling Products</h3>
        {/* <button className="bg-gray-100 text-gray-600 px-4 py-1 rounded-lg text-sm">
          Monthly ⌄
        </button> */}
      </div>
      {vendorTopProduct?.data?.length ? (
        <></>
      ) : (
        <p className="flex items-center justify-center text-center my-auto h-[30vh] text-sm md:text-sm">
          No top selling product.
        </p>
      )}
      {/* {products.map((item, index) => (
        <div key={index} className="flex items-center gap-4 mb-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 rounded-md object-cover"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-gray-500">{item.purchases} Purchases</p>
            <div className="relative w-full h-1 bg-purple-200 rounded-full mt-2">
              <div
                className="absolute h-1 rounded-full bg-purple-500"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
          <p className="text-sm font-semibold">
            N {item?.price?.toLocaleString()}
          </p>
        </div>
      ))} */}
    </div>
  );
}
