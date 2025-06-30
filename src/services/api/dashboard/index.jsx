import CaryBinApi from "../../CarybinBaseUrl";

const getTrendingFabric = (params) => {
  return CaryBinApi.get(`/public-fabric/trending`, {
    params,
  });
};

const getMarketPlacesPublic = (params) => {
  return CaryBinApi.get(`/market-place/public`, {
    params,
  });
};

const getMarketPlaceFabric = (params) => {
  return CaryBinApi.get(`/market-place/${params.id}/fabrics`, {
    params,
  });
};

const DashboardService = {
  getTrendingFabric,
  getMarketPlacesPublic,
  getMarketPlaceFabric,
};

export default DashboardService;
