import CaryBinApi from "../../CarybinBaseUrl";

const createFabricProduct = (payload) => {
  return CaryBinApi.post(`/fabric/create`, payload);
};

const FabricService = {
  createFabricProduct,
};

export default FabricService;
