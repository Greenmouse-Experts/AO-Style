import CaryBinApi from "../../CarybinBaseUrl";

const getAllOrder = (params) => {
  return CaryBinApi.get(`/orders`, {
    params,
  });
};

const OrderService = {
  getAllOrder,
};

export default OrderService;
