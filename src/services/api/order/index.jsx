import CaryBinApi from "../../CarybinBaseUrl";

const getAllOrder = (params) => {
  return CaryBinApi.get(`/orders`, {
    params,
  });
};

const getVendorOrder = (params) => {
  return CaryBinApi.get(`/orders/vendor/all`, {
    params,
  });
};

const getSingleOrder = (id) => {
  return CaryBinApi.get(`/orders/${id}`);
};

const OrderService = {
  getAllOrder,
  getSingleOrder,
  getVendorOrder,
};

export default OrderService;
