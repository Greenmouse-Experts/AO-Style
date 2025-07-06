import CaryBinApi from "../../CarybinBaseUrl";

const createFabricProduct = (payload, business_id) => {
  return CaryBinApi.post(`/fabric/create`, payload, {
    headers: {
      "Business-id": business_id,
    },
  });
};

const createAdminFabricProduct = (payload) => {
  return CaryBinApi.post(`/manage-fabric/create`, payload, {});
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
};

export default FabricService;
