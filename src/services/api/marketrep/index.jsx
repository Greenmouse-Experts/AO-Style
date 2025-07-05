import CaryBinApi from "../../CarybinBaseUrl";

export const GetMarketRep = (params) => {
  return CaryBinApi.get(`/contact/invites/${params.id}`, {
    params,
  });
};

export const GetMarketRepVendor = (params, role) => {
  return CaryBinApi.get(`/auth/vendors?role=${role}`, {
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

const addMarketRepFabric = (payload) => {
  return CaryBinApi.post(`/auth/register-vendor`, payload);
};

const MarketRepService = {
  GetMarketRep,
  addMarketRep,
  getInviteInfo,
  approveMarketRep,
  addMarketRepFabric,
  GetMarketRepVendor,
};

export default MarketRepService;
