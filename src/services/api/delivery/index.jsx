import CaryBinApi from "../../CarybinBaseUrl";

const getDeliverySettings = () => {
  return CaryBinApi.get(`/delivery-setting`);
};

const getDeliveryFee = async () => {
  console.log("🚚 DeliveryService: Making API call to /delivery");
  try {
    const response = await CaryBinApi.get(`/delivery`);
    console.log("🚚 DeliveryService: API Response received:", response);
    console.log("🚚 DeliveryService: Status Code:", response.status);
    console.log("🚚 DeliveryService: Response Data:", response.data);
    console.log(
      "🚚 DeliveryService: Delivery Fee Value:",
      response.data?.data?.delivery_fee,
    );
    return response;
  } catch (error) {
    console.error("🚚 DeliveryService: API Error:", error);
    console.error("🚚 DeliveryService: Error Response:", error.response?.data);
    console.error("🚚 DeliveryService: Error Status:", error.response?.status);
    throw error;
  }
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
