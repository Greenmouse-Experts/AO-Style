import CaryBinApi from "../../CarybinBaseUrl";

const createFabricProduct = (payload, business_id) => {
  return CaryBinApi.post(`/fabric/create`, payload, {
    headers: {
      "Business-id": business_id,
    },
  });
};

const createAdminFabricProduct = (payload, business_id) => {
  return CaryBinApi.post(`/manage-fabric/create`, payload, {
    headers: {
      "Business-id": business_id,
    },
  });
};

const getFabricProduct = (params) => {
  return CaryBinApi.get(`/product-general`, {
    params,
    headers: {
      "Business-id": params.id,
    },
  });
};

const getAdminFabricProduct = (params) => {
  return CaryBinApi.get(`/product-general/fetch`, {
    params,
    headers: {
      "Business-id": params.id,
    },
  });
};

const getManageFabricProduct = (params) => {
  console.log("🔧 FABRIC SERVICE: Starting getManageFabricProduct API call");
  console.log("🔧 FABRIC SERVICE: Original Params:", params);

  // Remove id from params since access token handles authentication
  const { id, ...cleanParams } = params || {};

  console.log("🔧 FABRIC SERVICE: Clean Params (no id):", cleanParams);
  console.log("🔧 FABRIC SERVICE: URL: /manage-fabric");
  console.log("🔧 FABRIC SERVICE: Access token will handle authentication");

  return CaryBinApi.get(`/manage-fabric`)
    .then((response) => {
      console.log("🔧 FABRIC SERVICE: API Response received:", response);
      console.log("🔧 FABRIC SERVICE: Response status:", response.status);
      console.log("🔧 FABRIC SERVICE: Response data:", response.data);
      return response;
    })
    .catch((error) => {
      console.error("🔧 FABRIC SERVICE: API Error:", error);
      console.error("🔧 FABRIC SERVICE: Error response:", error.response);
      console.error("🔧 FABRIC SERVICE: Error message:", error.message);
      throw error;
    });
};

const updateFabricProduct = (payload) => {
  return CaryBinApi.patch(`/fabric/${payload.id}`, payload, {
    headers: {
      "Business-id": payload.business_id,
    },
  });
};

const updateAdminFabricProduct = (payload) => {
  return CaryBinApi.patch(`/manage-fabric/${payload.id}`, payload, {
    headers: {
      "Business-id": payload.business_id,
    },
  });
};

const deleteFabricProduct = (payload) => {
  return CaryBinApi.delete(`/fabric/${payload.id}`, {
    headers: {
      "Business-id": payload.business_id,
    },
    data: payload,
  });
};

const deleteAdminFabricProduct = (payload) => {
  return CaryBinApi.delete(`/manage-fabric/${payload.id}`, {
    headers: {
      "Business-id": payload.business_id,
    },
    data: payload,
  });
};

const FabricService = {
  createFabricProduct,
  getFabricProduct,
  updateFabricProduct,
  deleteFabricProduct,
  getAdminFabricProduct,
  updateAdminFabricProduct,
  deleteAdminFabricProduct,
  createAdminFabricProduct,
  getManageFabricProduct,
};

export default FabricService;
