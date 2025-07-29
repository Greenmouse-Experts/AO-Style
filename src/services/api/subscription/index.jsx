import CaryBinApi from "../../CarybinBaseUrl";

const createSubscriptionProduct = (payload) => {
  return CaryBinApi.post(`/subscription-plan/bulk-create`, payload, {});
};

const updateSubscription = (payload, id) => {
  return CaryBinApi.patch(`/subscription-plan/${id}/bulk-update`, payload);
};

const deleteSubscription = (payload) => {
  return CaryBinApi.delete(`/subscription-plan/${payload.id}`);
};

const getSubscription = (params, id) => {
  return CaryBinApi.get(`/subscription-plan/fetch-all`, {
    params,
  });
};

const getUserSubscription = (params, role) => {
  return CaryBinApi.get(`/subscription-plan/fetch?role=${role}`, {
    params,
  });
};

const verifySubPayment = (payload) => {
  return CaryBinApi.post(`/subscription/verify/${payload?.id}`);
};

const createSubPayment = (payload) => {
  return CaryBinApi.post(`/subscription/create`, payload);
};

const SubscriptionService = {
  createSubPayment,
  getUserSubscription,
  createSubscriptionProduct,
  getSubscription,
  updateSubscription,
  deleteSubscription,
  verifySubPayment,
};

export default SubscriptionService;
