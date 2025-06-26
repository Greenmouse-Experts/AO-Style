import CaryBinApi from "../../CarybinBaseUrl";

const createFabricProduct = (payload, business_id) => {
  return CaryBinApi.post(`/fabric/create`, payload, {
    headers: {
      "Business-id": business_id,
    },
  });
};

const FabricService = {
  createFabricProduct,
};

export default FabricService;
