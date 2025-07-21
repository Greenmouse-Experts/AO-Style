import CaryBinApi from "../../CarybinBaseUrl";

const getAllOrder = (params) => {
  return CaryBinApi.get(`/orders`, {
    params,
  });
};

const getSingleOrder = (id) => {
  return CaryBinApi.get(`/orders/${id}`);
};

const OrderService = {
  getAllOrder,
  getSingleOrder,
};

export default OrderService;
