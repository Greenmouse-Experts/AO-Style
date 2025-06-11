import CaryBinApi from '../../CarybinBaseUrl';


const signinUser = (payload) => {
  return CaryBinApi.post(`/auth/login`, payload);
};

export const GetUser = () => {
  return CaryBinApi.get("/auth/view-profile");
};

const AuthService = {
signinUser,
GetUser
};

export default AuthService;
