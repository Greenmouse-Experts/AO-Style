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

const getMarketRepFabricById = (id, businessId) => {
  return CaryBinApi.get(`/market-rep-fabric/${id}`, {
    headers: {
      "Business-Id": businessId,
    },
  });
};

const getMarketRepStyleById = (id, businessId) => {
  return CaryBinApi.get(`/market-rep-style/${id}`, {
    headers: {
      "Business-Id": businessId,
    },
  });
};

const getMarketRepProducts = (params) => {
  return CaryBinApi.get(`/product-general/fetch-vendor-products`, {
    params,
  });
};

const getMarketRepAnalyticsSummary = () => {
  return CaryBinApi.get(`/market-rep-analytics/summary`);
};

const getMarketRepPayments = (params) => {
  return CaryBinApi.get(`/payment/my-payments`, { params });
};

const getMarketRepProfile = () => {
  return CaryBinApi.get(`/auth/view-profile`);
};

const getPaymentDetails = (paymentId) => {
  return CaryBinApi.get(`/payment/my-payments/${paymentId}`);
};

// Product update and delete endpoints
const updateMarketRepFabric = (id, payload, vendorId, businessId) => {
  return CaryBinApi.patch(`/market-rep-fabric/${id}`, payload, {
    params: { vendor_id: vendorId },
    headers: {
      "Business-Id": businessId,
    },
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

const updateMarketRepStyle = (id, payload, vendorId, businessId) => {
  console.log("🔧 API STYLE UPDATE:");
  console.log("  - endpoint: /market-rep-style/" + id);
  console.log("  - payload:", payload);
  console.log("  - vendorId:", vendorId);
  console.log("  - businessId:", businessId);
  console.log("  - params:", { vendor_id: vendorId });
  console.log("  - headers:", { "Business-Id": businessId });

  return CaryBinApi.patch(`/market-rep-style/${id}`, payload, {
    params: { vendor_id: vendorId },
    headers: {
      "Business-Id": businessId,
    },
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
  getMarketRepAnalyticsSummary,
  getMarketRepPayments,
  getMarketRepProfile,
  getPaymentDetails,
  updateMarketRepFabric,
  deleteMarketRepFabric,
  updateMarketRepStyle,
  deleteMarketRepStyle,
};

export default MarketRepService;
