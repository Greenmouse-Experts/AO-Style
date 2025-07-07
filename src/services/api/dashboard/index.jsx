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

const getProductCategory = (params) => {
  return CaryBinApi.get(`/product-category/public?type=${params?.type}`);
};

const getProductGeneral = (params, type) => {
  return CaryBinApi.get(`/product-general/public?type=${type}`, {
    params,
  });
};

const getSingleProduct = (type, id) => {
  return CaryBinApi.get(`/product-general/${type}/${id}?fabric_id=${id}`);
};

const DashboardService = {
  getTrendingFabric,
  getMarketPlacesPublic,
  getMarketPlaceFabric,
  getProductCategory,
  getProductGeneral,
  getSingleProduct,
};

export default DashboardService;
