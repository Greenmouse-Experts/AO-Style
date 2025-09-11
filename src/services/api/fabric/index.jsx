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

  const businessId = params?.id;
  const queryParams = {
    business_id: businessId,
    type: "FABRIC",
    ...params,
  };

  // Remove id from query params since we're using business_id
  delete queryParams.id;

  console.log("🔧 FABRIC SERVICE: Business ID:", businessId);
  console.log("🔧 FABRIC SERVICE: Query Params:", queryParams);
  console.log("🔧 FABRIC SERVICE: URL: /product-general/fetch");
  console.log(
    "🔧 FABRIC SERVICE: Using business_id and type as query parameters",
  );

  return CaryBinApi.get(`/product-general/fetch`, {
    params: queryParams,
  })
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
