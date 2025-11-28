import CaryBinApi from "../../CarybinBaseUrl";

const searchProducts = (params) => {
  const queryParams = new URLSearchParams();
  
  if (params.q) queryParams.append("q", params.q);
  if (params.category) queryParams.append("category", params.category);
  if (params.color) queryParams.append("color", params.color);
  if (params.price) queryParams.append("price", params.price);
  
  return CaryBinApi.get(`/market-place/products?${queryParams.toString()}`);
};

const MarketplaceService = {
  searchProducts,
};

export default MarketplaceService;

