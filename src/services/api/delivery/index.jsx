import CaryBinApi from "../../CarybinBaseUrl";

const getDeliverySettings = () => {
  return CaryBinApi.get(`/delivery-setting`);
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
};

export default DeliveryService;
