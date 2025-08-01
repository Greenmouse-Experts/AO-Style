import CaryBinApi from "../../CarybinBaseUrl";

const getWithdrawal = (params) => {
  return CaryBinApi.get(`/withdraw/fetch`, {
    params,
  });
};

const createWithdrawal = (payload) => {
  return CaryBinApi.post(`/withdraw/request`, payload);
};

// const editProduct = (payload) => {
//   return CaryBinApi.patch(`/product-category/${payload.id}`, payload);
// };

// const deleteProduct = (payload) => {
//   return CaryBinApi.delete(`/product-category/${payload.id}`, payload);
// };

const WithdrawalService = {
  createWithdrawal,
  getWithdrawal,
};

export default WithdrawalService;
