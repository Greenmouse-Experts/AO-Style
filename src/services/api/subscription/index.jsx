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
const switchSubscriptionPlan = (payload) => {
  return CaryBinApi.post(`/subscription/upgrade/${payload.subscription_id}`, {
    new_plan_price_id: payload.new_plan_price_id,
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
  switchSubscriptionPlan,
};

export default SubscriptionService;
