import CaryBinApi from "../../CarybinBaseUrl";

const signinUser = (payload) => {
  return CaryBinApi.post(`/auth/login`, payload);
};

const registerUser = (payload) => {
  return CaryBinApi.post(`/auth/register`, payload);
};

const forgotPassword = (payload) => {
  return CaryBinApi.post(`/auth/request-password-reset`, payload);
};

const changePassword = (payload) => {
  return CaryBinApi.post(`/auth/reset-password`, payload);
};

const verifyEmail = (payload) => {
  return CaryBinApi.post(`/auth/verify-email`, payload);
};

export const GetUser = () => {
  return CaryBinApi.get("/auth/view-profile");
};

const AuthService = {
  signinUser,
  GetUser,
  forgotPassword,
  registerUser,
  verifyEmail,
  changePassword,
};

export default AuthService;
