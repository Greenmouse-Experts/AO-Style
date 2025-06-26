import CaryBinApi from "../../CarybinBaseUrl";

const createStyleProduct = (payload, business_id) => {
  return CaryBinApi.post(`/style/create`, payload, {
    headers: {
      "Business-id": business_id,
    },
  });
};

const updateStyleProduct = (payload) => {
  return CaryBinApi.patch(`/style/${payload.id}`, payload, {
    headers: {
      "Business-id": payload.business_id,
    },
  });
};

const deleteStyleProduct = (payload) => {
  return CaryBinApi.delete(`/style/${payload.id}`, {
    headers: {
      "Business-id": payload.business_id,
    },
    data: payload, // Pass payload in the data field for DELETE requests
  });
};

const FabricService = {
  createStyleProduct,
  updateStyleProduct,
  deleteStyleProduct,
};

export default FabricService;
