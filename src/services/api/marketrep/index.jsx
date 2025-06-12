import CaryBinApi from "../../CarybinBaseUrl";

export const GetMarketRep = (params) => {
  return CaryBinApi.get(`/contact/invites/${params.id}`, params);
};

const addMarketRep = (payload) => {
  return CaryBinApi.post(`/contact/invite`, payload);
};

const MarketRepService = {
GetMarketRep,
addMarketRep
};

export default MarketRepService;

