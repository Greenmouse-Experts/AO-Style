import CaryBinApi from "../../CarybinBaseUrl";

const updatePassword = (payload) => {
  return CaryBinApi.post("/auth/update-password", payload);
};

const getBusinessInfo = () => {
  return CaryBinApi.get(`/onboard/fetch-platform-details`);
};

const getBusinessDetails = () => {
  return CaryBinApi.get(`/onboard/fetch-business-details`);
};

const updatePersonalInfo = (payload) => {
  return CaryBinApi.post("/auth/save-profile-info", payload);
};

const resolveAccount = (payload) => {
  return CaryBinApi.post("/auth/resolve-account", payload);
};

const saveWithdrawal = (payload) => {
  return CaryBinApi.post("/onboard/save-withdrawal-account", payload);
};

const getFetchBank = () => {
  return CaryBinApi.get(`/auth/fetch-banks`);
};

const SettingsService = {
  updatePassword,
  getBusinessInfo,
  updatePersonalInfo,
  resolveAccount,
  saveWithdrawal,
  getBusinessDetails,
  getFetchBank,
};

export default SettingsService;
