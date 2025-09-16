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
  console.log("🔧 MARKET REP PRODUCTS: Starting API call");
  console.log("🔧 MARKET REP PRODUCTS: Request params:", params);
  console.log(
    "🔧 MARKET REP PRODUCTS: URL: /product-general/fetch-vendor-products",
  );

  return CaryBinApi.get(`/product-general/fetch-vendor-products`, {
    params,
  })
    .then((response) => {
      console.log("🔧 MARKET REP PRODUCTS: Full API Response received");
      console.log("🔧 MARKET REP PRODUCTS: Response status:", response.status);
      console.log(
        "🔧 MARKET REP PRODUCTS: Response headers:",
        response.headers,
      );
      console.log("🔧 MARKET REP PRODUCTS: Response config:", response.config);
      console.log(
        "🔧 MARKET REP PRODUCTS: Full response data:",
        JSON.stringify(response.data, null, 2),
      );
      console.log("🔧 MARKET REP PRODUCTS: Data structure:", {
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        keys: response.data ? Object.keys(response.data) : null,
        length: response.data?.length || "N/A",
      });

      if (response.data?.data) {
        console.log(
          "🔧 MARKET REP PRODUCTS: Nested data array:",
          JSON.stringify(response.data.data, null, 2),
        );
        console.log(
          "🔧 MARKET REP PRODUCTS: Number of products:",
          response.data.data.length,
        );
      }

      return response;
    })
    .catch((error) => {
      console.error("🔧 MARKET REP PRODUCTS: API Error occurred");
      console.error("🔧 MARKET REP PRODUCTS: Error message:", error.message);
      console.error("🔧 MARKET REP PRODUCTS: Error response:", error.response);
      console.error("🔧 MARKET REP PRODUCTS: Error config:", error.config);
      console.error("🔧 MARKET REP PRODUCTS: Full error object:", error);
      throw error;
    });
};

// Product update and delete endpoints
const updateMarketRepFabric = (id, payload, vendorId) => {
  console.log("🔧 API FABRIC UPDATE:");
  console.log("  - endpoint: /market-rep-fabric/" + id);
  console.log("  - payload:", payload);
  console.log("  - vendorId:", vendorId);
  console.log("  - params:", { vendor_id: vendorId });

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
