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

// Market Rep Product Creation APIs
const createMarketRepFabric = (payload) => {
  return CaryBinApi.post(`/market-rep-fabric/create`, payload);
};

const createMarketRepStyle = (payload) => {
  return CaryBinApi.post(`/market-rep-style/create`, payload);
};

const getMarketRepFabricById = (id) => {
  return CaryBinApi.get(`/market-rep-fabric/${id}`);
};

const getMarketRepStyleById = (id) => {
  return CaryBinApi.get(`/market-rep-style/${id}`);
};

const getMarketRepProducts = (params) => {
  return CaryBinApi.get(`/product-general/fetch-vendor-products`, {
    params,
  });
};

// Product update and delete endpoints
const updateMarketRepFabric = (id, payload, vendorId) => {
  return CaryBinApi.patch(`/market-rep-fabric/${id}`, payload, {
    params: { vendor_id: vendorId },
  })
    .then((response) => {
      console.log("🔧 FABRIC UPDATE SUCCESS:", response);
      return response;
    })
    .catch((error) => {
      console.error("🔧 FABRIC UPDATE ERROR:", error);
      console.error("  - error response:", error.response);
      console.error("  - error config:", error.config);
      throw error;
    });
};

const deleteMarketRepFabric = (id) => {
  return CaryBinApi.delete(`/fabric/${id}`);
};

const updateMarketRepStyle = (id, payload, vendorId) => {
  console.log("🔧 API STYLE UPDATE:");
  console.log("  - endpoint: /market-rep-style/" + id);
  console.log("  - payload:", payload);
  console.log("  - vendorId:", vendorId);
  console.log("  - params:", { vendor_id: vendorId });

  return CaryBinApi.patch(`/market-rep-style/${id}`, payload, {
    params: { vendor_id: vendorId },
  })
    .then((response) => {
      console.log("🔧 STYLE UPDATE SUCCESS:", response);
      return response;
    })
    .catch((error) => {
      console.error("🔧 STYLE UPDATE ERROR:", error);
      console.error("  - error response:", error.response);
      console.error("  - error config:", error.config);
      throw error;
    });
};

const deleteMarketRepStyle = (id) => {
  return CaryBinApi.delete(`/style/${id}`);
};

const MarketRepService = {
  GetMarketRep,
  addMarketRep,
  getInviteInfo,
  approveMarketRep,
  addMarketRepFabric,
  GetMarketRepVendor,
  createMarketRepFabric,
  createMarketRepStyle,
  getMarketRepFabricById,
  getMarketRepStyleById,
  getMarketRepProducts,
  updateMarketRepFabric,
  deleteMarketRepFabric,
  updateMarketRepStyle,
  deleteMarketRepStyle,
};

export default MarketRepService;
