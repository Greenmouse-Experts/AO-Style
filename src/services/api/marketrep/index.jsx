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

const approveMarketRep = (payload) => {
  return CaryBinApi.patch(`/auth/users/approve`, payload);
};

const MarketRepService = {
  GetMarketRep,
  addMarketRep,
  getInviteInfo,
  approveMarketRep,
};

export default MarketRepService;
