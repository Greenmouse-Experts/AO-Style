import CaryBinApi from "../../CarybinBaseUrl";

const getMyPayment = (params) => {
  return CaryBinApi.get(`/payment/my-payments`, {
    params,
  });
};

const PaymentService = {
  getMyPayment,
};

export default PaymentService;
