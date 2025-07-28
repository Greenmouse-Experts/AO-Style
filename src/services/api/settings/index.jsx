import CaryBinApi from "../../CarybinBaseUrl";

const updatePassword = (payload) => {
  return CaryBinApi.post("/auth/update-password", payload);
};

const sendKyc = (payload) => {
  return CaryBinApi.post("/onboard/kyc", payload);
};

const getBusinessInfo = () => {
  return CaryBinApi.get(`/onboard/fetch-platform-details`);
};

const getBusinessDetails = () => {
  return CaryBinApi.get(`/onboard/fetch-business-details`);
};

const getAdminBusinessInfo = () => {
  return CaryBinApi.get(`/onboard/fetch-admin-business-details`);
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

const getKycInfo = (payload) => {
  return CaryBinApi.get("/onboard/kyc", payload);
};

const SettingsService = {
  getAdminBusinessInfo,
  updatePassword,
  getBusinessInfo,
  updatePersonalInfo,
  resolveAccount,
  saveWithdrawal,
  getBusinessDetails,
  getFetchBank,
  sendKyc,
  getKycInfo,
};

export default SettingsService;
