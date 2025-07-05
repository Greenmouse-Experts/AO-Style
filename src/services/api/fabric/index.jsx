import CaryBinApi from "../../CarybinBaseUrl";

const createFabricProduct = (payload, business_id) => {
  return CaryBinApi.post(`/fabric/create`, payload, {
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

const updateFabricProduct = (payload) => {
  return CaryBinApi.patch(`/fabric/${payload.id}`, payload, {
    headers: {
      "Business-id": payload.business_id,
    },
  });
};

const deleteFabricProduct = (payload) => {
  console.log(payload);
  return CaryBinApi.delete(`/fabric/${payload.id}`, {
    headers: {
      "Business-id": payload.business_id,
    },
    data: payload, // Pass payload in the data field for DELETE requests
  });
};

const FabricService = {
  createFabricProduct,
  getFabricProduct,
  updateFabricProduct,
  deleteFabricProduct,
};

export default FabricService;
