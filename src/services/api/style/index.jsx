import CaryBinApi from "../../CarybinBaseUrl";

const createStyleProduct = (payload, business_id) => {
  return CaryBinApi.post(`/style/create`, payload, {
    headers: {
      "Business-id": business_id,
    },
  });
};

const createAdminStyleProduct = (payload) => {
  return CaryBinApi.post(`/manage-style/create`, payload, {});
};

const updateStyleProduct = (payload) => {
  return CaryBinApi.patch(`/style/${payload.id}`, payload, {
    headers: {
      "Business-id": payload.business_id,
    },
  });
};

const updateAdminStyleProduct = (payload) => {
  return CaryBinApi.patch(`/manage-style/${payload.id}`, payload, {});
};

const deleteStyleProduct = (payload) => {
  return CaryBinApi.delete(`/style/${payload.id}`, {
    headers: {
      "Business-id": payload.business_id,
    },
    data: payload,
  });
};

const deleteAdminStyleProduct = (payload) => {
  return CaryBinApi.delete(`/manage-style/${payload.id}`, {
    data: payload,
  });
};

const getManageStyleProduct = (params) => {
  console.log("🎨 STYLE SERVICE: Starting getManageStyleProduct API call");
  console.log("🎨 STYLE SERVICE: Original Params:", params);

  const businessId = params?.id;
  const queryParams = {
    business_id: businessId,
    type: "STYLE",
    ...params,
  };

  // Remove id from query params since we're using business_id
  delete queryParams.id;

  console.log("🎨 STYLE SERVICE: Business ID:", businessId);
  console.log("🎨 STYLE SERVICE: Query Params:", queryParams);
  console.log("🎨 STYLE SERVICE: URL: /product-general/fetch");
  console.log(
    "🎨 STYLE SERVICE: Using business_id and type as query parameters",
  );

  return CaryBinApi.get(`/product-general/fetch`, {
    params: queryParams,
  })
    .then((response) => {
      console.log("🎨 STYLE SERVICE: API Response received:", response);
      console.log("🎨 STYLE SERVICE: Response status:", response.status);
      console.log("🎨 STYLE SERVICE: Response data:", response.data);
      return response;
    })
    .catch((error) => {
      console.error("🎨 STYLE SERVICE: API Error:", error);
      console.error("🎨 STYLE SERVICE: Error response:", error.response);
      console.error("🎨 STYLE SERVICE: Error message:", error.message);
      throw error;
    });
};

const StyleService = {
  createStyleProduct,
  updateStyleProduct,
  deleteStyleProduct,
  updateAdminStyleProduct,
  deleteAdminStyleProduct,
  createAdminStyleProduct,
  getManageStyleProduct,
};

export default StyleService;
