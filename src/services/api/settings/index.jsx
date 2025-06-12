import CaryBinApi from "../../CarybinBaseUrl";

const updatePassword = (payload) => {
  return CaryBinApi.post("/auth/update-password", payload);
};

export const getBusinessInfo = () => {
  return CaryBinApi.get(`/onboard/fetch-platform-details`);
};

const updatePersonalInfo = (payload) => {
  return CaryBinApi.post("/auth/save-profile-info", payload);
};



const SettingsService = {
updatePassword,
getBusinessInfo,
updatePersonalInfo
};

export default SettingsService;
