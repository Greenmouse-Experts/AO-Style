import CaryBinApi from "../../CarybinBaseUrl";

const updatePassword = (payload) => {
  return CaryBinApi.post("/auth/update-password", payload);
};

const updatePersonalInfo = (payload) => {
  return CaryBinApi.post("/auth/save-profile-info", payload);
};

const SettingsService = {
  updatePassword,
  updatePersonalInfo,
};

export default SettingsService;
