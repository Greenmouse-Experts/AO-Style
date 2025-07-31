import CaryBinApi from "../../CarybinBaseUrl";

const signinUser = (payload) => {
  return CaryBinApi.post(`/auth/login`, payload);
};

const registerUser = (payload) => {
  return CaryBinApi.post(`/auth/register`, payload);
};

const resendCode = (payload) => {
  return CaryBinApi.post(`/auth/resend-email`, payload);
};

const googleSignin = (payload) => {
  return CaryBinApi.post(`/auth/sso`, payload);
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

const acceptInvite = (payload) => {
  return CaryBinApi.post(`/contact/accept-invite`, payload);
};

const refreshToken = (payload) => {
  return CaryBinApi.post(`/auth/refresh-token`, payload);
};
const getKycStatus = (payload) => {
  return CaryBinApi.get(`/onboard/kyc`, payload);
};

const AuthService = {
  googleSignin,
  signinUser,
  GetUser,
  forgotPassword,
  registerUser,
  verifyEmail,
  changePassword,
  resendCode,
  acceptInvite,
  refreshToken,
  getKycStatus,
};

export default AuthService;
