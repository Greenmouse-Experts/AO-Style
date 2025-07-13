import CaryBinApi from "../../CarybinBaseUrl";

const createBilling = (payload) => {
  return CaryBinApi.post(`/billing/create`, payload);
};

const BillingService = {
  createBilling,
};

export default BillingService;
