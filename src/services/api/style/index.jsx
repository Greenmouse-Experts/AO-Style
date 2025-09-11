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

  // Remove id from params since access token handles authentication
  const { id, ...cleanParams } = params || {};

  console.log("🎨 STYLE SERVICE: Clean Params (no id):", cleanParams);
  console.log("🎨 STYLE SERVICE: URL: /manage-style");
  console.log("🎨 STYLE SERVICE: Access token will handle authentication");

  return CaryBinApi.get(`/manage-style`)
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
