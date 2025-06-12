import CaryBinApi from '../../CarybinBaseUrl';


const signinUser = (payload) => {
  return CaryBinApi.post(`/auth/login`, payload);
};

const forgotPassword = (payload) => {
  return CaryBinApi.post(`/auth/request-password-reset`, payload);
};


export const GetUser = () => {
  return CaryBinApi.get("/auth/view-profile");
};

const AuthService = {
signinUser,
GetUser,
forgotPassword
};

export default AuthService;
