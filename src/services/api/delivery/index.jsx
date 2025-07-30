import CaryBinApi from "../../CarybinBaseUrl";

const getDeliverySettings = () => {
  return CaryBinApi.get(`/delivery-setting`);
};

const getDeliveryFee = () => {
  return CaryBinApi.get(`/delivery`);
};

const addDelivery = (payload) => {
  return CaryBinApi.post(`/delivery-setting`, payload);
};

const updateDelivery = (payload) => {
  return CaryBinApi.put(`/delivery-setting/${payload.id}`, payload);
};

const DeliveryService = {
  getDeliverySettings,
  addDelivery,
  updateDelivery,
  getDeliveryFee,
};

export default DeliveryService;
