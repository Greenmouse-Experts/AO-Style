import CaryBinApi from "../../CarybinBaseUrl";

const updatePassword = (payload) => {
  return CaryBinApi.post("/auth/update-password", payload);
};

export const getBusinessInfo = () => {
  return CaryBinApi.get(`/onboard/fetch-platform-details`);
};


const SettingsService = {
updatePassword,
getBusinessInfo
};

export default SettingsService;
