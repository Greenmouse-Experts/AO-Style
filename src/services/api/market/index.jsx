import CaryBinApi from "../../CarybinBaseUrl";

const getAllMarket = (params) => {
  return CaryBinApi.get(`/market-place`, {
    params,
  });
};

const createMarket = (payload) => {
  return CaryBinApi.post(`/market-place`, payload);
};

const editMarket = (payload) => {
  return CaryBinApi.patch(`/market-place/${payload.id}`, payload);
};

const deleteMarket = (payload) => {
  return CaryBinApi.delete(`/market-place/${payload.id}`, payload);
};

const MarketService = {
  getAllMarket,
  deleteMarket,
  createMarket,
  editMarket,
};

export default MarketService;
