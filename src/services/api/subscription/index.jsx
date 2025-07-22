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

const SubscriptionService = {
  createSubscriptionProduct,
  getSubscription,
  updateSubscription,
  deleteSubscription,
};

export default SubscriptionService;
