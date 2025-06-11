import CaryBinApi from '../../CarybinBaseUrl';


export const updatePassword = (payload) => {
  return CaryBinApi.post("/auth/update-password", payload);
};

const SettingsService = {
updatePassword,
};

export default SettingsService;
