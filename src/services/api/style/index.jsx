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

const StyleService = {
  createStyleProduct,
  updateStyleProduct,
  deleteStyleProduct,
  updateAdminStyleProduct,
  deleteAdminStyleProduct,
  createAdminStyleProduct,
};

export default StyleService;
