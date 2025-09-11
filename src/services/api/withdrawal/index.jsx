import CaryBinApi from "../../CarybinBaseUrl";

const getWithdrawal = (params) => {
  return CaryBinApi.get(`/withdraw/fetch`, {
    params,
  });
};

const getAllWithdrawals = (params) => {
  return CaryBinApi.get(`/withdraw/fetch-all`, {
    params,
  });
};

const createWithdrawal = (payload) => {
  return CaryBinApi.post(`/withdraw/request`, payload);
};

const initiateTransfer = (payload) => {
  return CaryBinApi.post(`/withdraw/initiate`, payload);
};

const finalizeTransfer = (payload) => {
  return CaryBinApi.post(`/withdraw/finalize-transfer`, payload);
};

const verifyTransfer = (payload) => {
  return CaryBinApi.post(`/withdraw/verify-transfer`, payload);
};

const WithdrawalService = {
  createWithdrawal,
  getWithdrawal,
  getAllWithdrawals,
  initiateTransfer,
  finalizeTransfer,
  verifyTransfer,
};

export default WithdrawalService;
