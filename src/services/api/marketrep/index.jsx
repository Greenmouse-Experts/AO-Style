import CaryBinApi from "../../CarybinBaseUrl";

export const GetMarketRep = (params) => {
  return CaryBinApi.get(`/contact/invites/${params.id}`, {
    params,
  });
};

const getInviteInfo = (id) => {
  return CaryBinApi.get(`/contact/invite/${id}`);
};

const addMarketRep = (payload) => {
  return CaryBinApi.post(`/contact/invite`, payload);
};

const MarketRepService = {
  GetMarketRep,
  addMarketRep,
  getInviteInfo,
};

export default MarketRepService;
